import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

import { ConnectionService } from './connection';
import { ApiService } from './api';

@Injectable()
export class ExamRulesService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private connection: ConnectionService,
    private api: ApiService
  ) {}

  getOnlineExamRules(teacherId: number, classroomId: number): Observable<{ data: any, classroomId: number }> {
    const params = new HttpParams()
      .set('teacher_id', teacherId.toString())
      .set('classroom_id', classroomId.toString());

    return this.http.get<any>(this.api.getExamRulesUrl(), { params }).pipe(
      map(response => ({
        data: response,
        classroomId
      }))
    );
  }

  getOfflineExamRules(classroomId: number): Observable<any> {
    return new Observable(observer => {
      from(this.storage.get('examRules')).subscribe((examRules: any[]) => {
        if (!examRules) {
          observer.complete();
          return;
        }

        for (const examRule of examRules) {
          if (examRule.classroomId === classroomId) {
            observer.next(examRule);
            observer.complete();
            return;
          }
        }

        observer.complete();
      });
    });
  }
}
