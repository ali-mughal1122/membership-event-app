export const SettingsEndpoints = [
  { baseUrl: "api", name: "settings/whatsapp/public", alias: "getPublicWhatsAppSettings", path: "", noToken: true, runAt: "onDemand" },
  { baseUrl: "api", name: "settings/whatsapp", alias: "getAdminWhatsAppSettings", path: "", noToken: false, runAt: "onDemand" },
  { baseUrl: "api", name: "settings/whatsapp", alias: "updateWhatsAppSettings", path: "", noToken: false, runAt: "onDemand" },
];

export const SettingsEndpointsMapping = {
  GetPublicWhatsAppSettings: 'getPublicWhatsAppSettings',
  GetAdminWhatsAppSettings: 'getAdminWhatsAppSettings',
  UpdateWhatsAppSettings: 'updateWhatsAppSettings',
};

