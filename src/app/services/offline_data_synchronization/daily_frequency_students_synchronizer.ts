import { Injectable } from '@angular/core';
import { Observable, from, concat } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from '../api';
import { AuthService } from '../auth';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DailyFrequencyStudentsSynchronizer {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: Storage,
    private auth: AuthService
  ) {}

  public sync(dailyFrequencyStudents: any[]): Observable<any> {
    return new Observable(observer => {
      if (dailyFrequencyStudents) {
        this.auth.currentUser().pipe(
          concatMap(user => {
            const requests = dailyFrequencyStudents.map(dailyFrequencyStudent => {
              return this.http.post(this.api.getDailyFrequencyStudentsUpdateOrCreateUrl(), {
                present: dailyFrequencyStudent.present,
                user_id: dailyFrequencyStudent.userId,
                classroom_id: dailyFrequencyStudent.classroomId,
                discipline_id: dailyFrequencyStudent.disciplineId,
                student_id: dailyFrequencyStudent.studentId,
                class_number: dailyFrequencyStudent.classNumber,
                frequency_date: dailyFrequencyStudent.frequencyDate,
                teacher_id: user.teacher_id
              });
            });
            return concat(...requests);
          })
        ).subscribe(
          result => observer.next(result),
          error => observer.error(error),
          () => {
            this.deleteFrequencies(dailyFrequencyStudents);
            observer.complete();
          }
        );
      } else {
        observer.complete();
      }
    });
  }

  private deleteFrequencies(dailyFrequencyStudents: any[]) {
    from(this.storage.get('dailyFrequencyStudentsToSync')).subscribe(localDailyFrequencyStudents => {
      const newDailyFrequencyStudents = localDailyFrequencyStudents.filter((localDailyFrequencyStudent: any) => {
        return !dailyFrequencyStudents.some((dailyFrequencyStudent: any) =>
          this.isSameDailyFrequencyStudent(dailyFrequencyStudent, localDailyFrequencyStudent)
        );
      });

      this.storage.set('dailyFrequencyStudentsToSync', newDailyFrequencyStudents);
    });
  }

  private isSameDailyFrequencyStudent(dfs1: any, dfs2: any) {
    return (
      dfs1.classNumber === dfs2.classNumber &&
      dfs1.classroomId === dfs2.classroomId &&
      dfs1.disciplineId === dfs2.disciplineId &&
      dfs1.frequencyDate === dfs2.frequencyDate &&
      dfs1.studentId === dfs2.studentId
    );
  }
}
