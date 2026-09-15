export const EventsEndpoints = [
  { baseUrl: "api", name: "events", alias: "getAllEvents", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "events", alias: "registerEvent", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "events", alias: "createEvent", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "events/recent-registrations", alias: "getRecentRegistrations", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "events/by-slug", alias: "getEventBySlug", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "events", alias: "getEventRegistrations", path: "", noToken: false, runAt: "onDemand" },
];

export const EventsEndpointsMapping = {
  GetAllEvents: 'getAllEvents',
  RegisterEvent: 'registerEvent',
  CreateEvent: 'createEvent',
  GetRecentRegistrations: 'getRecentRegistrations',
  GetEventBySlug: 'getEventBySlug',
  GetEventRegistrations: 'getEventRegistrations',
};
