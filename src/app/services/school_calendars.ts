import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SchoolCalendarsService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ){}

  getOnlineSchoolCalendar(unityId: number): Observable<any> {
    const request = this.http.get(this.api.getSchoolCalendarUrl(), { params: { unity_id: unityId.toString() } });
    return request.pipe(
      map((response: any) => {
        return {
          data: response,
          unityId: unityId
        };
      })
    );
  }

  getOfflineSchoolCalendar(unityId: number): Observable<any> {
    return new Observable(observer => {
      from(this.storage.get('schoolCalendars')).subscribe((schoolCalendars) => {
        if (!schoolCalendars) {
          observer.complete();
          return;
        }

        schoolCalendars.forEach((schoolCalendar: any) => {
          console.log(schoolCalendar)
          if (schoolCalendar.unityId == unityId) {
            observer.next(schoolCalendar);
            observer.complete();
          }
        });
      });
    });
  }

  getClasses(class_number: number): number[] {
    const classes = [];
    for (let i = 1; i <= class_number; i++) {
      classes.push(i);
    }
    return classes;
  }
}
