import { ExamRulesService } from './../exam_rules';
import { ClassroomsService } from './../classrooms';
import { Observable, concatMap, forkJoin, from, map } from 'rxjs';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { UnitiesService } from '../unities';

@Injectable()
export class ExamRulesPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private unities: UnitiesService,
    private storage: Storage,
    private examRules: ExamRulesService
  ){}

  persist(user: any, classrooms: any[]): Observable<any> {
    return new Observable(observer => {
      const examRulesObservables = classrooms.flatMap(classroomList =>
        classroomList.map((classroom: { id: number; }) =>
          this.examRules.getOnlineExamRules(user.teacher_id, classroom.id)
        )
      );

      forkJoin(examRulesObservables).pipe(
        concatMap((results: any) => from(this.storage.set('examRules', results)).pipe(
          map(() => results)
        ))
      ).subscribe(
        results => observer.next(results),
        error => observer.error(error),
        () => observer.complete()
      );
    });
  }
}
