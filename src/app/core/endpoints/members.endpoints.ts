export const MembersEndpoints = [
  { baseUrl: "api", name: "members", alias: "getAllMembers", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "members/pending", alias: "getPendingMembers", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "members/pending/approve", alias: "approvePendingMember", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "members/pending/reject", alias: "rejectPendingMember", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "members/my-membership", alias: "getMyMembership", path: "", noToken: false, runAt: "onDemand" },
];

export const MembersEndpointsMapping = {
  GetAllMembers: 'getAllMembers',
  GetPendingMembers: 'getPendingMembers',
  ApprovePendingMember: 'approvePendingMember',
  RejectPendingMember: 'rejectPendingMember',
  GetMyMembership: 'getMyMembership'
};
