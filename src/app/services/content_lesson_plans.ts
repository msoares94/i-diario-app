import { Injectable } from '@angular/core';
//import 'rxjs/Rx';
import { ApiService } from './api';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ContentLessonPlansService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private api: ApiService
  ){}

  getContentLessonPlans(teacherId: number){

    
    const request = this.http.get(this.api.getContentLessonPlansUrl(), { params: { teacher_id: teacherId } } );
    return request;
  }
}