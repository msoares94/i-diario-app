import { Observable } from 'rxjs';
import { ConnectionService } from './connection';
import { ApiService } from './api';
//import { Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { SchoolCalendarsService } from '../services/school_calendars';
//import 'rxjs/Rx';
import { UtilsService } from './utils';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class ClassroomsService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private connection: ConnectionService,
    private api: ApiService,
    private utilsService: UtilsService,
    private schoolCalendarsService: SchoolCalendarsService
  ){}

  getOnlineClassrooms(teacherId: number, unityId: number){
    const request = this.http.get(this.api.getTeatcherClassroomsUrl(), { params: { teacher_id: teacherId, unity_id: unityId } } );
    console.log(request)
    return request;
    
  }

  getOfflineClassrooms(unityId: number){
    return new Observable((observer: { complete: () => void; error: (arg0: string) => void; next: (arg0: any) => void; }) => {
      this.storage.get('classrooms').then((classrooms) => {
        if (!classrooms){
          observer.complete();
          return;
        }
        //var currentYear = '2023';
        var currentYear = (this.utilsService.getCurrentDate()).getFullYear();
        console.log(currentYear)
        console.log(classrooms)
        classrooms.forEach((classroom: { unityId: number; data: any[]; }) => {
          this.schoolCalendarsService.getOfflineSchoolCalendar(unityId).subscribe((schoolCalendar: any) => {
            const currentDate = new Date().toISOString().substr(0, 10);
            //const currentDate = '2023-02-04'
            console.log(currentDate)
            const hasStepOnCurrentDate = schoolCalendar.data.steps.filter((step: { start_date_for_posting: any; start_at: any; end_date_for_posting: any; end_at: any; }) => {
              const startDate = step.start_date_for_posting || step.start_at;
              const endDate = step.end_date_for_posting || step.end_at;

              return (startDate <= currentDate) && (endDate >= currentDate);
            }).length >= 1;
            console.log(hasStepOnCurrentDate)
            if (!hasStepOnCurrentDate) {
              observer.error("Data atual está fora do período de postagem de faltas. Tente novamente.")
              observer.complete();
              return;
            }
            console.log(classroom)
            if (classroom.unityId == unityId) {
              classroom.data = classroom.data.filter((value: { year: any; }) => {
                return (value.year || currentYear) == (schoolCalendar.data.year || currentYear)
              })
              observer.next(classroom);
              observer.complete();
            }
          });
        });
      });
    });
  }
}
