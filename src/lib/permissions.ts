import { ROLE_ROUTES } from "@/config/roles"

export function hasRoutePermission(
  role: string,
  pathname: string
): boolean {

  const allowedRoutes =
    ROLE_ROUTES[role as keyof typeof ROLE_ROUTES]

  if (!allowedRoutes) {
    return false
  }

  return allowedRoutes.some((route) =>
    pathname.startsWith(route)
  )
}