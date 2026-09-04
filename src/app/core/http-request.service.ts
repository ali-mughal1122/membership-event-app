import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpRequest {

  constructor(private http: HttpClient) { }

  get<T>(
    url: string,
    options?: {
      params?: HttpParams | Record<string, string | string[] | number | boolean>;
      headers?: HttpHeaders | Record<string, string | string[]>;
      responseType?: 'json' | 'blob' | 'text';
      observe?: 'body' | 'response';
    }
  ): Observable<any> {
    return this.http.get(url, options as any);
  }

  post<T>(
    url: string,
    body: any,
    options?: {
      params?: HttpParams | Record<string, string | string[] | number>;
      headers?: HttpHeaders | Record<string, string | string[]>;
      responseType?: 'json' | 'blob' | 'text';
      observe?: 'body' | 'response';
    }
  ): Observable<any> {
    return this.http.post(url, body, options as any);
  }

  put<T>(
    url: string,
    body: any,
    options?: {
      params?: HttpParams | Record<string, string | string[] | any>;
      headers?: HttpHeaders | Record<string, string | string[]>;
      responseType?: 'json' | 'blob' | 'text';
      observe?: 'body' | 'response';
    }
  ): Observable<any> {
    return this.http.put<T>(url, body, options as any);
  }

  delete<T>(
    url: string,
    options?: {
      headers?: HttpHeaders | Record<string, string | string[]>;
      responseType?: 'json' | 'blob' | 'text';
      observe?: 'body' | 'response';
    }
  ): Observable<any> {
    return this.http.delete<T>(url, options as any);
  }

  patch<T>(
    url: string,
    body: any,
    options?: {
      params?: HttpParams | Record<string, string | string[] | any>;
      headers?: HttpHeaders | Record<string, string | string[]>;
      responseType?: 'json' | 'blob' | 'text';
      observe?: 'body' | 'response';
    }
  ): Observable<any> {
    return this.http.patch<T>(url, body, options as any);
  }
}
