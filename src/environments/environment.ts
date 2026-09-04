import { AppEndpoints } from '../app/core/endpoints';

export const environment: any = {
  production: false,
  apiVer: 'api',
  api: {
    baseUrl: 'http://localhost:3500/',
    apiVersion: ''
  },
  endpoints: [...AppEndpoints]
};
