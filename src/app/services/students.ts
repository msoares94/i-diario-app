import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StudentsService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ) {}

  getStudents(classroomId: number, disciplineId: number, teacherId: number): Observable<any> {
    const request = this.http.get(this.api.getClassroomStudentsUrl(), { params: { classroom_id: classroomId, discipline_id: disciplineId, teacher_id: teacherId } });
    return request.pipe(
      map((response: any) => {
        return {
          data: response,
          classroomId: classroomId,
          disciplineId: disciplineId
        };
      })
    );
  }

  getOfflineGlobalStudents(classroomId: number): Observable<any> {
    return new Observable((observer) => {
      this.storage.get('students').then((students) => {
        if (!students) {
          observer.complete();
          return;
        }

        students.forEach((student: { classroomId: number; }) => {
          if (student.classroomId == classroomId) {
            observer.next(student);
          }
        });
        observer.complete();
      });
    });
  }

  getOfflineDisciplineStudents(classroomId: number, disciplineId: number): Observable<any> {
    return new Observable((observer) => {
      this.storage.get('students').then((students) => {
        if (!students) {
          observer.complete();
          return;
        }

        students.forEach((student: { classroomId: number; disciplineId: number; }) => {
          if (student.classroomId == classroomId && student.disciplineId == disciplineId) {
            observer.next(student);
          }
        });
        observer.complete();
      });
    });
  }
}
