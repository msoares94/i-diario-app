import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { LessonPlansService } from '../lesson_plans';
import { User } from '../../data/user.interface';

@Injectable()
export class LessonPlansPersisterService {
  constructor(
    private lessonPlans: LessonPlansService,
    private storage: Storage
  ) {}

  persist(user: User): Observable<any> {
    console.log(user.teacher_id)
    return this.lessonPlans.getLessonPlans(user.teacher_id).pipe(
      tap(lessonPlans => {
        console.log(lessonPlans)
        this.storage.set('lessonPlans', lessonPlans).then(() => {
          console.log('Lesson plans saved successfully.');
        });
      }),
      catchError(error => {
        console.error('Failed to persist lesson plans:', error);
        throw error; // Re-throwing error to propagate it downstream
      })
    );
  }
}
