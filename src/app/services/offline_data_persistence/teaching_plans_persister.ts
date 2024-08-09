import { User } from './../../data/user.interface';
import { Observable, from } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { TeachingPlansService } from './../teaching_plans';
import { Injectable } from '@angular/core';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable()
export class TeachingPlansPersisterService {
  constructor(
    private teachingPlans: TeachingPlansService,
    private storage: Storage
  ) {}

  persist(user: User): Observable<any> {
    return new Observable(observer => {
      this.teachingPlans.getTeachingPlans(user.teacher_id).pipe(
        concatMap(teachingPlans =>
          from(this.storage.set('teachingPlans', teachingPlans)).pipe(
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
