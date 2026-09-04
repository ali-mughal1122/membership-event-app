export const PlansEndpoints = [
  { baseUrl: "api", name: "plans", alias: "getAllPlans", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "plans", alias: "createPlan", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "plans", alias: "updatePlan", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "plans", alias: "deletePlan", path: "", noToken: false, runAt: "onDemand" },
];

export const PlansEndpointsMapping = {
  GetAllPlans: 'getAllPlans',
  CreatePlan: 'createPlan',
  UpdatePlan: 'updatePlan',
  DeletePlan: 'deletePlan',
};
