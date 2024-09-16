import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
//import 'rxjs/Rx';
import { StorageService } from '../storage.service';

@Injectable()
export class OfflineUnityFinder {
  constructor(
    private storage: StorageService
  ){}

  find(params: { unityId: any; }){
    return new Observable((observer) => {
      this.storage.get('unities').then((unities) => {
        console.log(unities)
        if (params.unityId) {
          unities = unities.filter((unityId: { id: any; }) => {
            return unityId.id == params.unityId
          })
        }
        observer.next(unities[0])
        observer.complete()
      })
    })
  }
}