import { DisciplinesPersisterService } from './disciplines_persister';
import { ExamRulesPersisterService } from './exam_rules_persister';
import { ClassroomsService } from './../classrooms';
import { Observable, forkJoin } from 'rxjs';
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
  ) { }

  persist(user: User, unities: any[]): Observable<any> {
    console.log(unities)
    return new Observable((observer) => {
      const classroomsObservables = unities.map((unity) => {
        // Retorna o Observable corretamente
        return this.classrooms.getOnlineClassrooms(user.teacher_id, unity.id);
      });
      
      forkJoin(classroomsObservables).pipe(
        tap((classrooms: any) => {
          console.log(classrooms)
          let classes = [
            {
              data: classrooms,
              unityId: unities[0].id
            }
          ]
          console.log(classes)
          this.storage.set('classrooms', classes);
        }),
        mergeMap((classrooms: any) =>
          forkJoin([
            this.examRulesPersister.persist(user, classrooms),
            this.disciplinesPersister.persist(user, classrooms)
          ])
        ),
        catchError((error: any) => {
          console.error(error);
          observer.error(error);
          throw error;
        })
      ).subscribe({
        next: () => {}, // Você pode tratar os valores aqui, se necessário
        error: (error: any) => observer.error(error),
        complete: () => observer.complete()
      });
    });
  }
}
