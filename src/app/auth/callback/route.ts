import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/pathx";
  if (raw.startsWith("//")) return "/pathx";
  return raw;
}

async function completeAuth(
  request: NextRequest,
): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) || "magiclink";
  const next = safeNextPath(searchParams.get("next"));

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored when called from a context that cannot set cookies.
          }
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error("auth/callback exchangeCodeForSession", error.message);
  } else if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error("auth/callback verifyOtp", error.message);
  }

  const fail = new URL("/pathx/client-sign-in", origin);
  fail.searchParams.set("error", "auth");
  if (next.startsWith("/pathx/")) fail.searchParams.set("next", next);
  return NextResponse.redirect(fail);
}

export async function GET(request: NextRequest) {
  return completeAuth(request);
}

export async function POST(request: NextRequest) {
  return completeAuth(request);
}
