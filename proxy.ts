import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./lib/auth"

// Routes that require authentication
const PROTECTED_ROUTES = ["/system", "/network", "/api/monitoring", "/api/user", "/api/wol"]

// Routes that should redirect to system if already authenticated
const PUBLIC_ONLY_ROUTES = ["/login"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  // Check if route is public only (login page)
  const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Verify token if present
  let isAuthenticated = false
  if (token) {
    const payload = await verifyJWT(token)
    isAuthenticated = !!payload
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from login page to monitor
  if (isPublicOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/system/monitor", request.url))
  }

  return NextResponse.next()
}

export const proxyConfig = {
  matcher: [
    "/",
    "/system/:path*",
    "/network/:path*",
    "/login",
    "/api/monitoring/:path*",
    "/api/user/:path*",
    "/api/wol/:path*",
  ],
}
