import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api';
import { User } from '../data/user.interface';

@Injectable({
  providedIn: 'root'
}) 
export class AuthService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ) {}

  signIn(credential: any, password: any): Observable<any> {
    return this.http.post(this.api.getLoginUrl(), { user: { credentials: credential, password: password } }).pipe(
      map(response => response),
      catchError(error => {
        return of(null); // Retorna um Observable de null em caso de erro
      })
    );
  }

  isSignedIn(): Observable<boolean> {
    this.storage.get('user').then(res => {
      console.log(res)
    })

    return from(this.storage.get('user')).pipe(
      map(result => !!result), // Mapeia o resultado para true se houver usuário, caso contrário false
      catchError(error => {
        return of(false); // Retorna um Observable de false em caso de erro
      })
    );
  }

  currentUser(): Observable<User> {
    return from(this.storage.get('user')).pipe(
      catchError(error => {
        throw 'Erro ao obter o usuário'; // Lança um erro se não puder obter o usuário
      })
    );
  }

  setCurrentUser(user: User): Observable<void> {
    return from(this.storage.set('user', user)).pipe(
      catchError(error => {
        throw 'Erro ao definir o usuário'; // Lança um erro se não puder definir o usuário
      })
    );
  }

  removeCurrentUser(): Observable<void> {
    return from(this.storage.remove('user')).pipe(
      catchError(error => {
        throw 'Erro ao remover o usuário'; // Lança um erro se não puder remover o usuário
      })
    );
  }
}
