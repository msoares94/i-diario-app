import { SchoolCalendarsService } from './../school_calendars';
import { Observable, forkJoin, from } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable()
export class SchoolCalendarsPersisterService {
  constructor(
    private storage: Storage,
    private schoolCalendars: SchoolCalendarsService
  ) {}

  persist(user: any, unities: any[]): Observable<any> {
    const schoolCalendarObservables = unities.map(unity =>
      this.schoolCalendars.getOnlineSchoolCalendar(unity.id)
    );

    return forkJoin(schoolCalendarObservables).pipe(
      concatMap(results => from(this.storage.set('schoolCalendars', results))),
      catchError(error => {
        console.error(error);
        return [];
      })
    );
  }
}
