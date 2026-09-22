export const AuthEndpoints = [
  { baseUrl: "api", name: "auth/login", alias: "login", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/register", alias: "register", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/verify-email", alias: "verifyEmail", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/resend-verification", alias: "resendVerification", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/forgot-password", alias: "forgotPassword", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/reset-password", alias: "resetPassword", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/change-password", alias: "changePassword", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/me", alias: "getMe", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "auth/profile", alias: "updateProfile", path: "", noToken: false, runAt: "onDemand" },
];

export const AuthEndpointsMapping = {
  Login: 'login',
  Register: 'register',
  VerifyEmail: 'verifyEmail',
  ResendVerification: 'resendVerification',
  ForgotPassword: 'forgotPassword',
  ResetPassword: 'resetPassword',
  ChangePassword: 'changePassword',
  GetMe: 'getMe',
  UpdateProfile: 'updateProfile',
};
