import { DailyFrequencyService } from './../daily_frequency';
import { ClassroomsService } from './../classrooms';
import { Observable, forkJoin, from, of } from 'rxjs';
import { map, concatMap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class DisciplineFrequenciesPersisterService {
  examRules: any;
  constructor(
    private classrooms: ClassroomsService,
    private storage: Storage,
    private frequencies: DailyFrequencyService
  ) {
    this.storage.get('examRules').then(res => {
      console.log(res);
      this.examRules = res;
    })
  }

  private notEmptyDailyFrequencies(dailyFrequencies: any): boolean {
    return dailyFrequencies.data && dailyFrequencies.data.daily_frequencies && dailyFrequencies.data.daily_frequencies.length > 0;
  }

  persist(user: any, disciplines: any[]): Observable<any> {
    return from(this.examRules).pipe(
      concatMap((examRule: any) => {
        console.log(examRule)
        const frequenciesObservables = disciplines.flatMap(disciplineList =>
          disciplineList.data.map((discipline: { id: number; }) => {
            
            const currentExamRule = examRule;
            console.log(currentExamRule)
            if (currentExamRule && (currentExamRule.data.exam_rule.frequency_type === "2" || currentExamRule.data.exam_rule.allow_frequency_by_discipline)) {
              return this.frequencies.getFrequencies(disciplineList.classroomId, discipline.id, user.teacher_id);
            } else {
              return of(null); // Return an observable that emits null when no frequencies are needed
            }
          })
        );

        return forkJoin(frequenciesObservables);
      }),
      concatMap((results: any[]) =>
        from(this.storage.get('frequencies')).pipe(
          map((frequencies: any) => ({ results, frequencies }))
        )
      ),
      map(({ results, frequencies }) => {
        const notEmptyResults = results.filter(this.notEmptyDailyFrequencies);
        const newFrequencies = notEmptyResults
          .flatMap((result: any) => result.data.daily_frequencies);

        if (frequencies) {
          newFrequencies.push(...frequencies.daily_frequencies);
        }

        this.storage.set('frequencies', { daily_frequencies: newFrequencies });
      }),
      catchError(error => {
        console.error(error);
        return of(null); // Return a null observable in case of error
      })
    );
  }
}
