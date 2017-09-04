import { ApiService } from './../api';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';

@Injectable()
export class DailyFrequencyStudentsSynchronizer {
  constructor(
    private http: Http,
    private api: ApiService,
    private storage: Storage
  ){

  }

  public sync(dailyFrequencyStudents){
    return new Observable((observer) => {
      if(dailyFrequencyStudents){
        let dailyFrequencyStudentObservables = []
        dailyFrequencyStudents.forEach(dailyFrequencyStudent => {
          const request = this.http.post(this.api.getDailyFrequencyStudentsUpdateOrCreateUrl(),
            {
              present: dailyFrequencyStudent.present,
              user_id: dailyFrequencyStudent.userId,
              classroom_id: dailyFrequencyStudent.classroomId,
              discipline_id: dailyFrequencyStudent.disciplineId,
              student_id: dailyFrequencyStudent.studentId,
              class_number: dailyFrequencyStudent.classNumber,
              frequency_date: dailyFrequencyStudent.frequencyDate
            }
          );

          dailyFrequencyStudentObservables.push(request)
        })

        Observable.concat(...dailyFrequencyStudentObservables).subscribe(
          (result) => {
            observer.next(result)
          },
          (error) => {
            observer.error()
          },
          () => {
            observer.complete()
          }
        )
      }else{
        observer.complete()
      }
    })
  }
}