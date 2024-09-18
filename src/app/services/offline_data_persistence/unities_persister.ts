import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { UnitiesService } from './../unities';
import { SchoolCalendarsPersisterService } from './school_calendars_persister';
import { ClassroomsPersisterService } from './classrooms_persister';
import { User } from './../../data/user.interface';
import { StorageService } from '../storage.service';

@Injectable()
export class UnitiesPersisterService {
  constructor(
    private unities: UnitiesService,
    private classroomsPersister: ClassroomsPersisterService,
    private schoolCalendarsPersister: SchoolCalendarsPersisterService,
    private storage: StorageService
  ) {
    this.storage.get('user').then(res => {
      console.log(res)
      if (res) {
        this.unities.getOnlineUnities(res.teacher_id).subscribe(res => {
          console.log(res)
          this.storage.set('unities', res)
        })
      }
    })

  }

  persist(user: User): Observable<any> {
    console.log(user)
    return this.unities.getOnlineUnities(user.teacher_id)
      .pipe(
        concatMap((unities) =>
          forkJoin([
            this.classroomsPersister.persist(user, unities),
            this.schoolCalendarsPersister.persist(user, unities)
          ]).pipe(
            concatMap(() => this.storage.set('unities', unities)!),
            catchError(error => {
              console.error(error);
              throw error; // Propaga o erro para o Observable principal
            })
          )
        )
      );
  }
}
