export const SupportEndpoints = [
  { baseUrl: "api", name: "support", alias: "createSupportConversation", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "getMySupportConversations", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "getMySupportConversation", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "replyMySupportConversation", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "getAllSupportConversations", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "getSupportConversation", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "replySupportConversation", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "updateSupportStatus", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "support", alias: "getSupportUnreadCount", path: "", noToken: false, runAt: "onDemand" },
];

export const SupportEndpointsMapping = {
  CreateSupportConversation: 'createSupportConversation',
  GetMySupportConversations: 'getMySupportConversations',
  GetMySupportConversation: 'getMySupportConversation',
  ReplyMySupportConversation: 'replyMySupportConversation',
  GetAllSupportConversations: 'getAllSupportConversations',
  GetSupportConversation: 'getSupportConversation',
  ReplySupportConversation: 'replySupportConversation',
  UpdateSupportStatus: 'updateSupportStatus',
  GetSupportUnreadCount: 'getSupportUnreadCount',
};
