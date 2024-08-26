import { DailyFrequencyService } from './../daily_frequency';
import { ClassroomsService } from './../classrooms';
import { Observable, forkJoin, from, of } from 'rxjs';
import { concatMap, map, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class GlobalFrequenciesPersisterService {
  constructor(
    private classrooms: ClassroomsService,
    private storage: Storage,
    private frequencies: DailyFrequencyService
  ) {}

  persist(user: any, classrooms: any[]): Observable<any> {
    return from(this.storage.get('examRules')).pipe(
      concatMap(examRule => {
        const frequenciesObservables = classrooms.flatMap(classroomList =>
          classroomList.map((classroom: { id: number; }) => {
            const currentExamRule = examRule.find((rule: any) => rule.classroomId === classroom.id);
            if (currentExamRule && currentExamRule.data.exam_rule.frequency_type === "1") {
              return this.frequencies.getFrequencies(classroom.id, 0, user.teacher_id);
            } else {
              return of(null); // Return an observable that emits null when no frequencies are needed
            }
          })
        );

        return forkJoin(frequenciesObservables).pipe(
          concatMap((results: any[]): Observable<any[]> =>
            from(this.storage.get('frequencies')).pipe(
              map((frequencies: any): any[] => {
                const notEmptyResults = results.filter(this.notEmptyDailyFrequencies).map((result: any) => result.data.daily_frequencies);
                let newFrequencies = [];
                if (notEmptyResults.length > 0) {
                  newFrequencies = notEmptyResults.reduce((a: any[], b: any[]) => a.concat(b), []);
                  if (frequencies && frequencies.daily_frequencies) {
                    newFrequencies = newFrequencies.concat(frequencies.daily_frequencies);
                  }
                  this.storage.set('frequencies', { daily_frequencies: newFrequencies });
                }
                return newFrequencies; // Ensure we return the new frequencies
              }),
              catchError(error => {
                console.error(error);
                return of([]); // Return an empty array on error to continue the observable chain
              })
            )
          )
        );
      }),
      catchError(error => {
        console.error(error);
        return of([]); // Return an empty array on error to continue the observable chain
      })
    );
  }

  private notEmptyDailyFrequencies(dailyFrequencies: any): boolean {
    return dailyFrequencies && dailyFrequencies.data && dailyFrequencies.data.daily_frequencies && dailyFrequencies.data.daily_frequencies.length > 0;
  }
}
