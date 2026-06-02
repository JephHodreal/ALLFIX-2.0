export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  adminRegister: '/register-admin',
  verifyEmail: '/verify-email',
  // Role dashboards
  admin: '/admin',
  customer: '/customer',
  vendor: '/vendor',
  personnel: '/personnel',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
