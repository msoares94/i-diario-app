import { User } from './../../data/user.interface';

import { Storage } from '@ionic/storage';
import { ContentRecordsService } from './../content_records';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()

export class ContentRecordsPersisterService{
  constructor(
    private contentRecordsService: ContentRecordsService,
    private storage: Storage
  ){}

  persist(user: User){
    return new Observable((observer: { next: (arg0: Promise<any>) => void; error: (arg0: any) => void; complete: () => void; }) => {
      this.contentRecordsService.getContentRecords(user.teacher_id).subscribe(
        (contentRecords: { [x: string]: any; }) => {
          observer.next(this.storage.set('contentRecords', (contentRecords['content_records']||[])));
        },
        (error: any) => {
          observer.error(error);
        },
        () => {
          observer.complete()
        }
      )
    })
  }
}