import { StudentsService } from './../students';
import { ClassroomsService } from './../classrooms';
import { Observable, forkJoin, from } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable()
export class StudentsPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private storage: Storage,
    private students: StudentsService
  ) {}

  persist(user: any, disciplines: any[]): Observable<any> {
    const studentsObservables = disciplines.flatMap((disciplineList): any =>
      disciplineList.data.map((discipline: { id: number; }) =>
        this.students.getStudents(disciplineList.classroomId, discipline.id, user.teacher_id)
      )
    );

    return forkJoin(studentsObservables).pipe(
      concatMap(results => from(this.storage.set('students', results))),
      catchError(error => {
        console.error(error);
        return [];
      })
    );
  }
}
