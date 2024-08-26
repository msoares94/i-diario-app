import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

import { OfflineUnityFinder } from './offline_data_finder/unities';
import { OfflineClassroomFinder } from './offline_data_finder/classrooms';
import { OfflineDisciplineFinder } from './offline_data_finder/disciplines';
import { StudentsService } from './students';
import { ConnectionService } from './connection';
import { ApiService } from './api';
import { DailyFrequenciesSynchronizer } from './offline_data_synchronization/daily_frequencies_synchronizer';


@Injectable()
export class DailyFrequencyService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private connection: ConnectionService,
    private api: ApiService,
    private studentsService: StudentsService,
    private offlineClassroomFinder: OfflineClassroomFinder,
    private offlineDisciplineFinder: OfflineDisciplineFinder,
    private offlineUnityFinder: OfflineUnityFinder,
    private dailyFrequenciesSynchronizer: DailyFrequenciesSynchronizer
  ) {}

  getStudents(params: any): Observable<any> {
    return this.getOfflineStudents(params);
  }

  getOnlineStudents(params: any): Observable<any> {
    return this.http.post(this.api.getDailyFrequencyUrl(), {
      user_id: params.userId,
      teacher_id: params.teacherId,
      unity_id: params.unityId,
      classroom_id: params.classroomId,
      frequency_date: params.frequencyDate,
      discipline_id: params.disciplineId,
      class_numbers: params.classNumbers
    }).pipe(
      map(response => response)
    );
  }

  getOfflineStudents(params: any): Observable<any> {
    const splitedClassNumbers = params.classNumbers.split(",");
    if (params.disciplineId) {
      return this.getOfflineStudentsDisciplineAbsence(params.classroomId, params.unityId, params.disciplineId, splitedClassNumbers, params.frequencyDate);
    } else {
      return this.getOfflineStudentsGlobalAbsence(params.classroomId, params.unityId, params.disciplineId, params.frequencyDate);
    }
  }

  private getOfflineStudentsGlobalAbsence(classroomId: number, unityId: number, disciplineId: number, frequencyDate: string): Observable<any> {
    return new Observable(observer => {
      forkJoin([
        from(this.storage.get('frequencies')),
        from(this.storage.get('dailyFrequenciesToSync')),
        this.studentsService.getOfflineGlobalStudents(classroomId),
        this.offlineClassroomFinder.find({ classroomId }),
        this.offlineUnityFinder.find({ unityId })
      ]).subscribe(results => {
        const dailyFrequencies = results[0]?.daily_frequencies || [];
        const dailyFrequenciesToSync = results[1] || [];
        const studentList = results[2] || [];
        const classroom: any = results[3] || {};
        const unity: any = results[4] || {};

        let filteredDailyFrequencies = dailyFrequencies.filter((dailyFrequency: { classroom_id: number; frequency_date: string; discipline_id: null; class_number: null; }) => {
          return (
            dailyFrequency.classroom_id === classroomId &&
            dailyFrequency.frequency_date === frequencyDate &&
            dailyFrequency.discipline_id === null &&
            dailyFrequency.class_number === null
          );
        });

        if (filteredDailyFrequencies.length === 0) {
          const newFrequencies = this.createOfflineGlobalFrequencies({
            classroomId,
            classroomDescription: classroom.description,
            unityId,
            unityDescription: unity.description,
            students: studentList,
            frequencyDate
          });

          filteredDailyFrequencies = filteredDailyFrequencies.concat(newFrequencies);
          this.saveOfflineFrequencies(dailyFrequencies, newFrequencies);
          this.saveOfflineFrequenciesToSync(dailyFrequenciesToSync, [newFrequencies]);
        }

        observer.next({ daily_frequency: filteredDailyFrequencies[0] });
        observer.complete();
      });
    });
  }

  private synchronizeDailyFrequencies(dailyFrequencies: any[]): void {
    this.dailyFrequenciesSynchronizer.sync(dailyFrequencies).subscribe();
  }

  private getOfflineStudentsDisciplineAbsence(classroomId: number, unityId: number, disciplineId: number, splitedClassNumbers: string[], frequencyDate: string): Observable<any> {
    return new Observable(observer => {
      forkJoin([
        from(this.storage.get('frequencies')),
        from(this.storage.get('dailyFrequenciesToSync')),
        this.studentsService.getOfflineDisciplineStudents(classroomId, disciplineId),
        this.offlineClassroomFinder.find({ classroomId }),
        this.offlineDisciplineFinder.find({ disciplineId }),
        this.offlineUnityFinder.find({ unityId })
      ]).subscribe(results => {
        const dailyFrequencies = results[0]?.daily_frequencies || [];
        const dailyFrequenciesToSync = results[1] || [];
        const studentList = results[2] || [];
        const classroom: any = results[3] || {};
        const discipline: any = results[4] || {};
        const unity: any = results[5] || {};

        let filteredDailyFrequencies = dailyFrequencies.filter((dailyFrequency: { classroom_id: number; discipline_id: number; class_number: any; frequency_date: string; }) => {
          return (
            dailyFrequency.classroom_id === classroomId &&
            dailyFrequency.discipline_id === disciplineId &&
            splitedClassNumbers.includes(String(dailyFrequency.class_number)) &&
            dailyFrequency.frequency_date === frequencyDate
          );
        });

        if (filteredDailyFrequencies.length === 0) {
          const newFrequencies = this.createOfflineDisciplineFrequencies({
            classroomId,
            classroomDescription: classroom.description,
            unityId,
            unityDescription: unity.description,
            disciplineId,
            disciplineDescription: discipline.description,
            students: studentList,
            frequencyDate,
            classNumbers: splitedClassNumbers
          });

          filteredDailyFrequencies = filteredDailyFrequencies.concat(newFrequencies);
          this.saveOfflineFrequencies(dailyFrequencies, newFrequencies);
          this.saveOfflineFrequenciesToSync(dailyFrequenciesToSync, newFrequencies);
        } else if (filteredDailyFrequencies.length < splitedClassNumbers.length) {
          const frequencyClasses = filteredDailyFrequencies.map((frequency: { class_number: any; }) => String(frequency.class_number));
          const missingClasses = splitedClassNumbers.filter(classNumber => !frequencyClasses.includes(classNumber));

          const newFrequencies = this.createOfflineDisciplineFrequencies({
            classroomId,
            classroomDescription: classroom.description,
            unityId,
            unityDescription: unity.description,
            disciplineId,
            disciplineDescription: discipline.description,
            students: studentList,
            frequencyDate,
            classNumbers: missingClasses
          });

          filteredDailyFrequencies = filteredDailyFrequencies.concat(newFrequencies);
          this.saveOfflineFrequencies(dailyFrequencies, newFrequencies);
          this.saveOfflineFrequenciesToSync(dailyFrequenciesToSync, newFrequencies);
        }

        filteredDailyFrequencies = filteredDailyFrequencies.sort(this.byClassNumber);

        observer.next({ daily_frequencies: filteredDailyFrequencies });
        observer.complete();
      });
    });
  }

  private saveOfflineFrequenciesToSync(dailyFrequenciesToSync: any[], newFrequencies: any[]): void {
    dailyFrequenciesToSync = dailyFrequenciesToSync.concat(newFrequencies);
    this.storage.set('dailyFrequenciesToSync', dailyFrequenciesToSync);
    if (this.connection.isOnline) {
      this.synchronizeDailyFrequencies(newFrequencies);
    }
  }

  private saveOfflineFrequencies(existingFrequencies: any[], newFrequencies: any[]): void {
    const offlineFrequencies = existingFrequencies.concat(newFrequencies);
    this.storage.set('frequencies', { daily_frequencies: offlineFrequencies });
  }

  private createOfflineGlobalFrequencies(params: any): any {
    const students = params.students.data.classroom_students.map((element: any) => {
      return {
        active: true,
        daily_frequency_id: null,
        id: null,
        present: true,
        student: { id: element.student.id, name: element.student.name },
        created_at: null,
        updated_at: null,
        sequence: element.sequence
      };
    });

    return {
      id: null,
      class_number: null,
      classroom_id: params.classroomId,
      classroom_name: params.classroomDescription,
      unity_id: params.unityId,
      unity_name: params.unityDescription,
      discipline_id: null,
      discipline_name: null,
      frequency_date: params.frequencyDate,
      students: students,
      created_at: null,
      updated_at: null
    };
  }

  private createOfflineDisciplineFrequencies(params: any): any[] {
    const students = params.students.data.classroom_students.map((element: any) => {
      return {
        active: true,
        daily_frequency_id: null,
        id: null,
        present: true,
        student: { id: element.student.id, name: element.student.name },
        created_at: null,
        updated_at: null,
        sequence: element.sequence
      };
    });

    return params.classNumbers.map((classNumber: any) => {
      return {
        id: null,
        class_number: String(classNumber),
        classroom_id: params.classroomId,
        classroom_name: params.classroomDescription,
        unity_id: params.unityId,
        unity_name: params.unityDescription,
        discipline_id: params.disciplineId,
        discipline_name: params.disciplineDescription,
        frequency_date: params.frequencyDate,
        students,
        created_at: null,
        updated_at: null
      };
    });
  }

  private byClassNumber(a: any, b: any): number {
    if (a.class_number > b.class_number) {
      return 1;
    }
    if (a.class_number < b.class_number) {
      return -1;
    }
    return 0;
  }

  getFrequencies(classroomId: number, disciplineId: number, teacherId: number): Observable<any> {
    const params = new HttpParams()
      .set('classroom_id', classroomId.toString())
      .set('discipline_id', disciplineId.toString())
      .set('teacher_id', teacherId.toString());

    return this.http.get<any>(this.api.getDailyFrequencyUrl(), { params }).pipe(
      map(response => ({
        data: response,
        classroomId,
        disciplineId,
        teacherId
      }))
    );
  }
}
