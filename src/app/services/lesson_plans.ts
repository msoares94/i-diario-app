import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
//import 'rxjs/Rx';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LessonPlansService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ){}

  getLessonPlans(teacherId: number){
    const request = this.http.get(this.api.getTeacherLessonPlansUrl(), { params: { teacher_id: teacherId } } );
    //console.log(request) 
    return request;
  }
}