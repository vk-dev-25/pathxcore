import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/pathx";
  if (raw.startsWith("//")) return "/pathx";
  return raw;
}

/**
 * PKCE code exchange (OTP emails). Magic-link hashed tokens from share emails
 * are completed in the browser on /auth/confirm so session cookies stick.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) || "magiclink";
  const next = safeNextPath(searchParams.get("next"));

  const redirectTo = new URL(next, origin);
  const response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    console.error("auth/callback exchangeCodeForSession", error.message);
  } else if (token_hash) {
    // Fallback if something still hits callback with token_hash.
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return response;
    console.error("auth/callback verifyOtp", error.message);
  }

  const fail = new URL("/pathx/client-sign-in", origin);
  fail.searchParams.set("error", "auth");
  if (next.startsWith("/pathx/")) fail.searchParams.set("next", next);
  return NextResponse.redirect(fail);
}
