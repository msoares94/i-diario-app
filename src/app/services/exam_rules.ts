import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

import { ConnectionService } from './connection';
import { ApiService } from './api';
import { StorageService } from './storage.service';

@Injectable()
export class ExamRulesService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
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

  getOfflineExamRules(classroomId: number){
    return new Observable((observer) => {
      this.storage.get('examRules').then((examRules) => {
        if (!examRules){
          observer.complete();
          return;
        }

        examRules.forEach((examRule: any) => {
          if(examRule.classroomId == classroomId){
            observer.next(examRule)
            observer.complete()
          }
        })
      })
    })
  }
}
