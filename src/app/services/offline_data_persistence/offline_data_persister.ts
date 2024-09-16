import { ConnectionService } from './../connection';
import { TeachingPlansPersisterService } from './teaching_plans_persister';
import { LessonPlansPersisterService } from './lesson_plans_persister';
import { ContentLessonPlansPersisterService } from './content_lesson_plans_persister';
import { ContentRecordsPersisterService } from './content_records_persister';
import { DisciplinesPersisterService } from './disciplines_persister';
import { SchoolCalendarsPersisterService } from './school_calendars_persister';
import { ExamRulesPersisterService } from './exam_rules_persister';
import { ClassroomsPersisterService } from './classrooms_persister';
import { UnitiesPersisterService } from './unities_persister';
import { User } from './../../data/user.interface';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { Observable, from, concat, of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable()
export class OfflineDataPersisterService {
  constructor(
    private storage: Storage,
    private unitiesPersister: UnitiesPersisterService,
    private classroomsPersister: ClassroomsPersisterService,
    private examRulesPersister: ExamRulesPersisterService,
    private schoolCalendarPersister: SchoolCalendarsPersisterService,
    private disciplinePersister: DisciplinesPersisterService,
    private lessonPlansPersister: LessonPlansPersisterService,
    private contentLessonPlansPersister: ContentLessonPlansPersisterService,
    private contentRecordsPersister: ContentRecordsPersisterService,
    private teachingPlansPersister: TeachingPlansPersisterService,
    private connectionService: ConnectionService
  ) {}

  private clearStorage(): void {
    //this.storage.remove('unities');
    this.storage.remove('classrooms');
    this.storage.remove('disciplines');
    this.storage.remove('examRules');
    this.storage.remove('schoolCalendars');
    this.storage.remove('frequencies');
    this.storage.remove('contentLessonPlans');
    this.storage.remove('contentRecords');
  }

  persist(user: User): Observable<void> {
    console.log(user)
   if (this.connectionService.isOnline) {
      this.clearStorage();
    }
 
    return concat(
      this.unitiesPersister.persist(user).pipe(catchError(() => of(void 0))),
      this.lessonPlansPersister.persist(user).pipe(catchError(() => of(void 0))),
      this.contentRecordsPersister.persist(user).pipe(catchError(() => of(void 0))),
      this.contentLessonPlansPersister.persist(user).pipe(catchError(() => of(void 0))),
      this.teachingPlansPersister.persist(user).pipe(catchError(() => of(void 0)))
    ).pipe(
      concatMap(() => of(void 0)), // Emit a single void value to complete the observable
      catchError(error => {
        console.error(error);
        return of(void 0);
      })
    );
  }
}
