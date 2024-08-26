import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UnitiesService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ) {} 

  getOnlineUnities(teacherId: number): Observable<any> {
    const request = this.http.get(this.api.getTeacherUnitiesUrl(), { params: { teacher_id: teacherId } });
    return request.pipe(
      map((response: any) => {
       // console.log(response)
        return response;
      })
    );
  }

  getOfflineUnities(teacherId: number): Observable<any> {
    return new Observable((observer) => {
      this.storage.get('unities').then((unities) => {
        if (!unities) {
          observer.complete();
          return;
        }
        observer.next(unities);
        observer.complete();
      });
    });
  }
}
