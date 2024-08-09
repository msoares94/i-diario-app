import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
//import 'rxjs/Rx';
import { StorageService } from '../storage.service';

@Injectable()
export class OfflineClassroomFinder {
  constructor(
    private storage: StorageService
  ){}

  find(params: { classroomId: any; unityId?: any; }){
    return new Observable((observer) => {
      this.storage.get('classrooms').then((allClassrooms) => {
        let classrooms = [];
        if (params.unityId) {
          classrooms = allClassrooms.filter((classroom: { unityId: any; }) => {
            return classroom.unityId == params.unityId
          })
        }

        if (params.classroomId) {
          allClassrooms.forEach((d: { data: { id: any; }[]; }) => {
            d.data.forEach((classroom: { id: any; }) => {
              if(classroom.id == params.classroomId){
                classrooms.push(classroom);
              }
            });
          });
        }

        if (classrooms.length === 1 || params.classroomId) {
          classrooms = classrooms[0]
        }

        observer.next(classrooms)
        observer.complete()
      })
    })
  }
}
