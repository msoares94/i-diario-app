import { DisciplinesPersisterService } from './disciplines_persister';
import { ExamRulesPersisterService } from './exam_rules_persister';
import { ClassroomsService } from './../classrooms';
import { Observable, forkJoin } from 'rxjs'; // Importe forkJoin daqui
import { Injectable } from '@angular/core';
import { User } from 'src/app/data/user.interface';
import { StorageService } from '../storage.service';
import { catchError, tap, mergeMap } from 'rxjs/operators';

@Injectable()
export class ClassroomsPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private examRulesPersister: ExamRulesPersisterService,
    private disciplinesPersister: DisciplinesPersisterService,
    private storage: StorageService
  ) {}

  persist(user: User, unities: any[]) {
    return new Observable((observer) => {
      const classroomsObservables = unities.map((unity) =>
        this.classrooms.getOnlineClassrooms(user.teacher_id, unity.id)
      );

      forkJoin(classroomsObservables).pipe(
        tap((classrooms: any) => {
          this.storage.set('classrooms', classrooms);
        }),
        mergeMap((classrooms: any) =>
          forkJoin([
            this.examRulesPersister.persist(user, classrooms),
            this.disciplinesPersister.persist(user, classrooms)
          ])
        )
      ).subscribe(
        () => {}, // Você pode fazer algo aqui, se necessário
        (error: any) => {
          observer.error(error);
        },
        () => {
          observer.complete();
        }
      );
    });
  }
}
