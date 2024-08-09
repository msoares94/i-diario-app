import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
////import 'rxjs/Rx';
import { StorageService } from '../storage.service';

@Injectable()
export class OfflineDisciplineFinder {
  constructor(
    private storage: StorageService
  ){}

  find(params: any){
    return new Observable((observer) => {
      this.storage.get('disciplines').then((allDisciplines) => {
        let disciplines: any[] = [];
        if (params.disciplineId) {
          allDisciplines.forEach((d: { data: any[]; }) => {
            d.data.forEach(discipline => {
              if(discipline.id == params.disciplineId){
                disciplines.push(discipline);
              }
            });
          });
        }

        if (disciplines.length === 1 || params.disciplineId) {
          disciplines = disciplines[0]
        }

        observer.next(disciplines)
        observer.complete()
      })
    })
  }
}
