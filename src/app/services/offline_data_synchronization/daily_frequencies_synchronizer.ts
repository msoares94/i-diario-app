import { ApiService } from './../api';
import { Observable, from, concat } from 'rxjs';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth';
import { map } from 'rxjs/operators';

@Injectable()
export class DailyFrequenciesSynchronizer {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: Storage,
    private auth: AuthService
  ){}

  public sync(dailyFrequencies: any[]): Observable<any> {
    console.log(dailyFrequencies)
    return new Observable(observer => {
      if (dailyFrequencies) {
        this.auth.currentUser().subscribe(user => {
          let dailyFrequencyObservables = dailyFrequencies.map(dailyFrequency => {
            return this.mountDailyFrequencyPostRequest(dailyFrequency, user.teacher_id);
          });

          concat(...dailyFrequencyObservables).subscribe(
            result => {
              observer.next(result);
            },
            error => {
              observer.error(error);
            },
            () => {
              observer.complete();
            }
          );
        });
      } else {
        observer.complete();
      }
    });
  }

  private mountDailyFrequencyPostRequest(dailyFrequency: any, teacherId: number): Observable<any> {
    return this.http.post(this.api.getDailyFrequencyUrl(), {
      unity_id: dailyFrequency.unity_id,
      classroom_id: dailyFrequency.classroom_id,
      frequency_date: dailyFrequency.frequency_date,
      discipline_id: dailyFrequency.discipline_id,
      class_number: dailyFrequency.class_number,
      teacher_id: teacherId
    }).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
