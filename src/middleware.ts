export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/applications/:path*", "/api/ai/:path*"],
};
