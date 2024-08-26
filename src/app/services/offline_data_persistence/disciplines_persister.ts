import { GlobalFrequenciesPersisterService } from './global_frequencies_persister';
import { DisciplineFrequenciesPersisterService } from './discipline_frequencies_persister';
import { StudentsPersisterService } from './students_persister';
import { DisciplinesService } from './../disciplines';
import { Observable, forkJoin, concat, from } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class DisciplinesPersisterService {
  constructor(
    private storage: Storage,
    private disciplines: DisciplinesService,
    private disciplineFrequenciesPersister: DisciplineFrequenciesPersisterService,
    private studentsPersister: StudentsPersisterService,
    private globalFrequenciesPersister: GlobalFrequenciesPersisterService
  ) {}

  persist(user: any, classrooms: any[]): Observable<any> {
    return new Observable(observer => {
      const classroomObservables = classrooms.flatMap(classroomList =>
        classroomList.map((classroom: { id: number; }) =>
          this.disciplines.getOnlineDisciplines(user.teacher_id, classroom.id)
        )
      );

      forkJoin(classroomObservables).pipe(
        concatMap(disciplines => 
          from(this.storage.set('disciplines', disciplines)).pipe(
            concatMap(() => 
              concat(
                this.globalFrequenciesPersister.persist(user, classrooms),
                this.disciplineFrequenciesPersister.persist(user, disciplines),
                this.studentsPersister.persist(user, disciplines)
              )
            )
          )
        )
      ).subscribe(
        result => observer.next(result),
        error => observer.error(error),
        () => observer.complete()
      );
    });
  }
}
