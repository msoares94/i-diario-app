import { Observable, Subject, from, forkJoin } from 'rxjs';
import { finalize, mergeMap, last } from 'rxjs/operators';

import { ConnectionService } from './connection';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DailyFrequencyStudentService {
  private trigger: Subject<any> | undefined;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService,
    private connection: ConnectionService
  ){}

  obsQueue(frequency: any): Observable<any> {
    if (!this.trigger || this.trigger.closed) {
      this.trigger = new Subject<any>();
      return this.createObservable(this.trigger, frequency);
    } else {
      const lastTrigger = this.trigger;
      const newTrigger = this.trigger = new Subject<any>();
      return lastTrigger.pipe(
        last(),
        mergeMap(() => this.createObservable(newTrigger, frequency))
      );
    }
  }

  createObservable(trigger: Subject<any>, frequency: any): Observable<any> {
    return this._updateFrequency(frequency).pipe(
      finalize(() => {
        trigger.next(frequency);
        trigger.complete();
      })
    );
  }

  updateFrequency(frequency: any): Observable<any> {
    return this.obsQueue(frequency);
  }

  private _updateFrequency(frequency: any): Observable<any> {
    return new Observable(observer => {
      forkJoin([
        from(this.storage.get('dailyFrequencyStudentsToSync')),
        from(this.storage.get('frequencies'))
      ]).subscribe(results => {
        const existingDailyFrequencyStudentsToSync = results[0] || [];
        const frequencies: any = results[1] || [];
        console.log(existingDailyFrequencyStudentsToSync)
        const dailyFrequencyStudentsToSync = existingDailyFrequencyStudentsToSync.concat(frequency);
        this.storage.set('dailyFrequencyStudentsToSync', dailyFrequencyStudentsToSync);
        this.updateLocalFrequency(frequency, frequencies);

        setTimeout(() => {
          observer.next([frequency]);
          observer.complete();
        }, 100);
      });
    });
  }

  private updateLocalFrequency(
    frequency: {
      classroomId: any;
      frequencyDate: any;
      disciplineId: any;
      classNumber: any;
      studentId: any;
      present: any;
    },
    localFrequencies: { daily_frequencies: any[] }
  ) {
    localFrequencies.daily_frequencies.forEach((localFrequency, localFrequencyIndex) => {
      if (
        localFrequency.classroom_id === frequency.classroomId &&
        localFrequency.frequency_date === frequency.frequencyDate &&
        localFrequency.discipline_id === frequency.disciplineId &&
        localFrequency.class_number === frequency.classNumber
      ) {
        const newLocalFrequency = this.clone(localFrequency);

        newLocalFrequency.students.forEach((student: { student: { id: any; }; present: any; }) => {
          if (student.student.id === frequency.studentId) {
            student.present = frequency.present;
          }
        });

        localFrequencies.daily_frequencies[localFrequencyIndex] = newLocalFrequency;

        this.storage.set('frequencies', localFrequencies);
      }
    });
  }

  private clone(object: any) {
    return JSON.parse(JSON.stringify(object));
  }
}
