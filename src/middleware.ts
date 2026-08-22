import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SIGN_IN = "/pathx/sign-in";
const CLIENT_SIGN_IN = "/pathx/client-sign-in";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isServerActionPost =
    request.method === "POST" && request.headers.has("next-action");

  if (pathname.startsWith("/pathx")) {
    const isSignIn =
      pathname === SIGN_IN ||
      pathname.startsWith(`${SIGN_IN}/`) ||
      pathname === CLIENT_SIGN_IN ||
      pathname.startsWith(`${CLIENT_SIGN_IN}/`);

    if (!isSignIn && !user) {
      // Do not redirect Server Action POSTs: that returns HTML and breaks the
      // action protocol ("An unexpected response was received from the server").
      // PathX server actions still enforce auth and return a clear error.
      if (isServerActionPost) {
        return response;
      }
      const url = request.nextUrl.clone();
      url.pathname = SIGN_IN;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (isSignIn && user) {
      const nextPath = request.nextUrl.searchParams.get("next");
      const role = (user.app_metadata as { role?: string } | null)?.role;
      const fallback = role === "client" ? "/pathx/trackers" : "/pathx";
      const url = request.nextUrl.clone();
      url.pathname =
        nextPath && nextPath.startsWith("/pathx") ? nextPath : fallback;
      url.searchParams.delete("next");
      return NextResponse.redirect(url);
    }

    // Client (magic-link) users are limited to their tracker(s). Staff pages
    // (quotes, LIMS, etc.) allow any authenticated read, so gate clients here.
    if (user && !isSignIn) {
      const role = (user.app_metadata as { role?: string } | null)?.role;
      if (role === "client") {
        const allowed =
          pathname === "/pathx/trackers" ||
          pathname.startsWith("/pathx/trackers/");
        if (!allowed) {
          const url = request.nextUrl.clone();
          url.pathname = "/pathx/trackers";
          url.search = "";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
