import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cheap first check only: is there a session cookie at all? The real check
// (is it valid, who is it) happens in lib/auth/dal.ts close to the data.
export function proxy(request: NextRequest) {
  if (request.cookies.get("nsbe_session")?.value) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/portal", "/portal/:path*"],
};
