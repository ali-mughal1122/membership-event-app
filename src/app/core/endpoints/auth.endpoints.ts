export const AuthEndpoints = [
  { baseUrl: "api", name: "auth/login", alias: "login", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/register", alias: "register", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/change-password", alias: "changePassword", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/me", alias: "getMe", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/profile", alias: "updateProfile", path: "", noToken: false, runAt: "onDemand" },
];

export const AuthEndpointsMapping = {
  Login: 'login',
  Register: 'register',
  ChangePassword: 'changePassword',
  GetMe: 'getMe',
  UpdateProfile: 'updateProfile',
};
