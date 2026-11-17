export const NewsEndpoints = [
  { baseUrl: "api", name: "news", alias: "getPublishedNews", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "news", alias: "getNewsBySlug", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "news/admin/all", alias: "getAdminNews", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "news", alias: "createNews", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "news", alias: "updateNews", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "news", alias: "deleteNews", path: "", noToken: false, runAt: "onDemand" },
];

export const NewsEndpointsMapping = {
  GetPublishedNews: 'getPublishedNews',
  GetNewsBySlug: 'getNewsBySlug',
  GetAdminNews: 'getAdminNews',
  CreateNews: 'createNews',
  UpdateNews: 'updateNews',
  DeleteNews: 'deleteNews',
};
