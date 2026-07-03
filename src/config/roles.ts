
export const ROLE_ROUTES = {
  colaborador: [
    "/dashboard",
    "/tasks",
    "/tasks/new",
    "/settings",
    "/profile",
    "/403",
  ],

  aprovador: [
    "/dashboard",
    "/tasks",
    "/tasks/new",
    "/approvals",
    "/settings",
    "/profile",
    "/403",
  ],

  admin: [
    "/dashboard",
    "/tasks",
    "/tasks/new",
    "/approvals",
    "/admin/departments",
    "/admin/users",
    "/settings",
    "/profile",
    "/403",
  ]
} as const
