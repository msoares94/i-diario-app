import { SchoolCalendarsPersisterService } from './school_calendars_persister';
import { ClassroomsPersisterService } from './classrooms_persister';
import { User } from './../../data/user.interface';
import { Observable, forkJoin } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { UnitiesService } from './../unities';
import { Injectable } from '@angular/core';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable()
export class UnitiesPersisterService {
  constructor(
    private unities: UnitiesService,
    private classroomsPersister: ClassroomsPersisterService,
    private schoolCalendarsPersister: SchoolCalendarsPersisterService,
    private storage: Storage
  ) {}

  persist(user: User): Observable<any> {
    return new Observable(observer => {
      this.unities.getOnlineUnities(user.teacher_id).pipe(
        concatMap(unities =>
          forkJoin([
            this.classroomsPersister.persist(user, unities),
            this.schoolCalendarsPersister.persist(user, unities)
          ]).pipe(
            concatMap(() => this.storage.set('unities', unities)),
            catchError(error => {
              observer.error(error);
              console.error(error);
              return [];
            })
          )
        )
      ).subscribe(
        () => observer.complete(),
        error => observer.error(error)
      );
    });
  }
}
