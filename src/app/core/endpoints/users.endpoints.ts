export const UsersEndpoints = [
  { baseUrl: "api", name: "users", alias: "getAllUsers", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "users", alias: "deleteUser", path: "", noToken: false, runAt: "onDemand" },
];

export const UsersEndpointsMapping = {
  GetAllUsers: 'getAllUsers',
  DeleteUser: 'deleteUser',
};
