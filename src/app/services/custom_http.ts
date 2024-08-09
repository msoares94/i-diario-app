import { HttpClient, HttpHeaders, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
 
import { Observable } from 'rxjs';

@Injectable()
export class CustomHttp {

  constructor(private http: HttpClient) {}

  request(url: string | HttpRequest<any>, options?: any): Observable<HttpEvent<any>> {
    return this.http.request(url, this.addAccessToken(options));
  }

  get(url: string, options?: any): Observable<any> {
    return this.http.get(url, this.addAccessToken(options));
  }

  post(url: string, body: any, options?: any): Observable<any> {
    return this.http.post(url, body, this.addAccessToken(options));
  }

  put(url: string, body: any, options?: any): Observable<any> {
    return this.http.put(url, body, this.addAccessToken(options));
  }

  delete(url: string, options?: any): Observable<any> {
    return this.http.delete(url, this.addAccessToken(options));
  }

  patch(url: string, body: any, options?: any): Observable<any> {
    return this.http.patch(url, body, this.addAccessToken(options));
  }

  head(url: string, options?: any): Observable<any> {
    return this.http.head(url, this.addAccessToken(options));
  }

  options(url: string, options?: any): Observable<any> {
    return this.http.options(url, this.addAccessToken(options));
  }

  private addAccessToken(options: { headers?: any; }) {
    if (!options) options = {};

    if (options.headers) options.headers = options.headers.set('Access-Token', '@@ACCESSTOKEN');
    else options.headers = new HttpHeaders({'Access-Token': '@@ACCESSTOKEN'}); 

    return options;
  }
}