
export const ROLE_ROUTES = {
  colaborador: [
    "/dashboard",
    "/tasks",
    "/settings",
    "/403",
  ],

  aprovador: [
    "/dashboard",
    "/tasks",
    "/approvals",
    "/settings",
    "/403",
  ],

  admin: [
    "/dashboard",
    "/tasks",
    "/approvals",
    "/admin/departments",
    "/admin/users",
    "/settings",
    "/403",
  ]
} as const
