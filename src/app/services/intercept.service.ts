import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InterceptService implements HttpInterceptor {

  constructor() { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Obtenha o token de acesso do local de armazenamento (por exemplo, localStorage)
    const accessToken = environment.YOUR_ACCESS_TOKEN;

    // Clone a solicitação original e adicione o token de acesso aos cabeçalhos
    const authReq = req.clone({
      headers: new HttpHeaders({
        'Access-Token': accessToken
      })
    });
    console.log(authReq)
    console.log(accessToken)
    // Envie a solicitação com os cabeçalhos atualizados
    return next.handle(authReq);
  }
}
