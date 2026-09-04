import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppEndpoints } from './endpoints';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsoluteUrl = /^https?:\/\//i.test(req.url);

  let fullUrl = req.url;
  let noToken = false;

  if (!isAbsoluteUrl) {
    const urlParts = req.url.split('?');
    const pathSegments = urlParts[0].replace(/^\//, '').split('/');
    const alias = pathSegments[0];
    const extraPath = pathSegments.slice(1).join('/');

    const endpoint = AppEndpoints.find(e => e.alias === alias);

    if (endpoint) {
      const envConfig: any = (environment as any)[endpoint.baseUrl];
      console.log('url', envConfig.baseUrl)
      if (envConfig) {
        const pathPart = endpoint.path ? `${endpoint.path}/` : '';
        fullUrl = `${envConfig.baseUrl}${envConfig.apiVersion || ''}${pathPart}${endpoint.name}`;
        if (extraPath) {
          fullUrl += `/${extraPath}`;
        }
        if (urlParts.length > 1) {
          fullUrl += `?${urlParts[1]}`;
        }
        noToken = endpoint.noToken === true;
      }
    }
  }

  let headers = req.headers;

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    // For absolute URLs or internal ones not marked as noToken, attach token
    // (If it's an external absolute URL we might not want to send the token, but assuming it's to our own backend here if we use absolute URLs directly)
    // Actually, to be safe, only attach token if it's our API url
    const isOurApi = fullUrl.startsWith(environment.api.baseUrl);

    if (token && !noToken && isOurApi) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const modifiedReq = req.clone({
    url: fullUrl,
    headers: headers
  });

  return next(modifiedReq);
};
