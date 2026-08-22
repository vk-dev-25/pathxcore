"use server";

import { revalidatePath } from "next/cache";

import {
  normalizeSegmentMultipliers,
  normalizeVolumeTiers,
  type PricingSettingsSnapshot,
} from "@/lib/quote-pricing";
import { slugifyCatalogSlug } from "@/lib/quotes/catalog-slug";
import { createClient } from "@/lib/supabase/server";

export type PricingAdminResult = { ok: true } | { ok: false; error: string };

export async function insertCatalogServiceAction(input: {
  name: string;
  slug: string;
  description: string;
  default_unit_price: number;
  sort_order: number;
}): Promise<PricingAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Service name is required." };

  const slug = slugifyCatalogSlug(input.slug || name);
  if (!slug) return { ok: false, error: "Could not build a valid slug." };

  if (!Number.isFinite(input.default_unit_price) || input.default_unit_price < 0) {
    return { ok: false, error: "Price must be zero or positive." };
  }

  const sortOrder = Number.isFinite(input.sort_order)
    ? Math.floor(input.sort_order)
    : 0;

  const { error } = await supabase.from("quote_catalog_services").insert({
    slug,
    name,
    description: input.description.trim() || null,
    default_unit_price: input.default_unit_price,
    sort_order: sortOrder,
    active: true,
  });

  if (error) {
    console.error(error);
    if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
      return {
        ok: false,
        error:
          "Catalog table is missing or not exposed. Run the quotes migration and reload the API schema in Supabase.",
      };
    }
    if (error.code === "23505" || error.message?.includes("unique")) {
      return {
        ok: false,
        error:
          "That slug is already used. Change the slug to something unique (e.g. add a suffix).",
      };
    }
    if (error.code === "42P01" || error.message?.includes("relation")) {
      return {
        ok: false,
        error:
          "Catalog table is missing. Run the quotes migration in Supabase.",
      };
    }
    if (error.code === "42501" || error.message?.includes("policy")) {
      return {
        ok: false,
        error:
          "Insert not allowed. Run migration 20260325000000_catalog_insert_policy.sql in Supabase.",
      };
    }
    return { ok: false, error: "Could not add service." };
  }

  revalidatePath("/pathx/admin/pricing");
  revalidatePath("/pathx/quotebuilder");
  return { ok: true };
}

export async function updatePricingSettingsAction(
  input: PricingSettingsSnapshot,
): Promise<PricingAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const volume_tiers = normalizeVolumeTiers(input.volume_tiers);
  const segment_multipliers = normalizeSegmentMultipliers(input.segment_multipliers);

  const { error } = await supabase.from("quote_pricing_settings").upsert(
    {
      id: 1,
      rush_priority_percent: input.rush_priority_percent,
      rush_2day_percent: input.rush_2day_percent,
      quote_validity_days: input.quote_validity_days,
      lab_address: input.lab_address.trim(),
      contact_email: input.contact_email.trim(),
      segment_multipliers,
      volume_tiers,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error(error);
    if (error.code === "42P01" || error.message?.includes("relation")) {
      return {
        ok: false,
        error:
          "Pricing settings table is missing. Run migration 20260324000000_quote_pricing_admin.sql in Supabase.",
      };
    }
    return { ok: false, error: "Could not save settings." };
  }

  revalidatePath("/pathx/admin/pricing");
  revalidatePath("/pathx/quotebuilder");
  return { ok: true };
}

export async function updateCatalogPricesAction(
  rows: { id: string; default_unit_price: number }[],
): Promise<PricingAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  for (const r of rows) {
    if (!r.id || !Number.isFinite(r.default_unit_price) || r.default_unit_price < 0) {
      return { ok: false, error: "Invalid catalog row." };
    }
    const { error } = await supabase
      .from("quote_catalog_services")
      .update({ default_unit_price: r.default_unit_price })
      .eq("id", r.id);
    if (error) {
      console.error(error);
      return {
        ok: false,
        error:
          error.code === "42P01" || error.message?.includes("relation")
            ? "Catalog table is missing. Run the quotes migration in Supabase."
            : "Could not update catalog prices.",
      };
    }
  }

  revalidatePath("/pathx/admin/pricing");
  revalidatePath("/pathx/quotebuilder");
  return { ok: true };
}

export type CatalogRowUpdate = {
  id: string;
  name: string;
  slug: string;
  description: string;
  default_unit_price: number;
};

/** Update name, slug, description, and base price for catalog rows (admin Save). */
export async function updateCatalogRowsAction(
  rows: CatalogRowUpdate[],
): Promise<PricingAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  for (const r of rows) {
    if (!r.id) return { ok: false, error: "Invalid catalog row." };

    const name = r.name.trim();
    if (!name) return { ok: false, error: "Every service must have a name." };

    const slug = slugifyCatalogSlug(r.slug || name);
    if (!slug) return { ok: false, error: "Could not build a valid slug for one of the services." };

    if (!Number.isFinite(r.default_unit_price) || r.default_unit_price < 0) {
      return { ok: false, error: "All catalog prices must be zero or positive." };
    }

    const { data: clash } = await supabase
      .from("quote_catalog_services")
      .select("id")
      .eq("slug", slug)
      .neq("id", r.id)
      .maybeSingle();

    if (clash) {
      return {
        ok: false,
        error: `Slug "${slug}" is already used by another service. Use a unique slug.`,
      };
    }

    const { error } = await supabase
      .from("quote_catalog_services")
      .update({
        name,
        slug,
        description: r.description.trim() || null,
        default_unit_price: r.default_unit_price,
      })
      .eq("id", r.id);

    if (error) {
      console.error(error);
      if (error.code === "23505" || error.message?.includes("unique")) {
        return {
          ok: false,
          error: "Duplicate slug. Each catalog service needs a unique slug.",
        };
      }
      return {
        ok: false,
        error:
          error.code === "42P01" || error.message?.includes("relation")
            ? "Catalog table is missing. Run the quotes migration in Supabase."
            : "Could not update catalog services.",
      };
    }
  }

  revalidatePath("/pathx/admin/pricing");
  revalidatePath("/pathx/quotebuilder");
  return { ok: true };
}

export async function deleteCatalogServiceAction(input: {
  id: string;
}): Promise<PricingAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  if (!input.id) return { ok: false, error: "Nothing to delete." };

  const { error } = await supabase.from("quote_catalog_services").delete().eq("id", input.id);

  if (error) {
    console.error(error);
    if (error.code === "42501" || error.message?.includes("policy")) {
      return {
        ok: false,
        error:
          "Delete not allowed. Run migration 20260329350000_catalog_delete_policy.sql in Supabase.",
      };
    }
    return { ok: false, error: "Could not delete service." };
  }

  revalidatePath("/pathx/admin/pricing");
  revalidatePath("/pathx/quotebuilder");
  return { ok: true };
}
