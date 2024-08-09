import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

import { ConnectionService } from './connection';
import { ApiService } from './api';

@Injectable()
export class DisciplinesService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private connection: ConnectionService,
    private api: ApiService
  ) {}

  getOnlineDisciplines(teacherId: number, classroomId: number): Observable<{ data: any, classroomId: number }> {
    const params = new HttpParams()
      .set('teacher_id', teacherId.toString())
      .set('classroom_id', classroomId.toString());

    return this.http.get<any>(this.api.getTeacherDisciplinesUrl(), { params }).pipe(
      map(response => ({
        data: response,
        classroomId
      }))
    );
  }

  getOfflineDisciplines(classroomId: number): Observable<any> {
    return new Observable(observer => {
      from(this.storage.get('disciplines')).subscribe((disciplines: any[]) => {
        if (!disciplines) {
          observer.complete();
          return;
        }

        for (const discipline of disciplines) {
          if (discipline.classroomId === classroomId) {
            observer.next(discipline);
            observer.complete();
            return;
          }
        }

        observer.complete();
      });
    });
  }
}
