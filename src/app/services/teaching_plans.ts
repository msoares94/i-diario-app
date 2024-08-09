import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
//import 'rxjs/Rx';
import { ApiService } from './api';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TeachingPlansService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService
  ){}

  getTeachingPlans(teacherId: number){
    const request = this.http.get(this.api.getTeacherTeachingPlansUrl(), { params: { teacher_id: teacherId } } );
    return request;
  }
}