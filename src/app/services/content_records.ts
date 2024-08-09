import { Observable, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { ConnectionService } from './connection';
import { AuthService } from './auth';
import { ContentRecordsSynchronizer } from './offline_data_synchronization/content_records_synchronizer';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ContentRecordsService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private api: ApiService,
    private connectionService: ConnectionService,
    private contentRecordsSynchronizer: ContentRecordsSynchronizer,
    private authService: AuthService
  ){}

  getContentRecords(teacherId: number){
    const params = new HttpParams().set('teacher_id', teacherId.toString());
    return this.http.get(this.api.getContentRecordsUrl(), { params });
  }

  updateContentRecordsToSync(contentRecordsToSync: any){
    return this.storage.set('contentRecordsToSync', contentRecordsToSync);
  }

  updateContentRecords(contentRecords: any){
    return this.storage.set('contentRecords', contentRecords);
  }

  addOrReplaceContentRecord(contentRecords: any[], contentRecord: { grade_id: any; classroom_id: any; discipline_id: any; unity_id: any; record_date: any; }){
    let index = -1;
    contentRecords.forEach((cr: { grade_id: any; classroom_id: any; discipline_id: any; unity_id: any; record_date: any; },i: number)=>{
      if(
        contentRecord.grade_id == cr.grade_id &&
        contentRecord.classroom_id == cr.classroom_id &&
        contentRecord.discipline_id == cr.discipline_id &&
        contentRecord.unity_id == cr.unity_id &&
        contentRecord.record_date == cr.record_date
       ){
        index = i;
        return;
      }
    });

    if(index>=0){
      contentRecords[index] = contentRecord;
    }else{
      contentRecords.push(contentRecord);
    }
    return contentRecords;
  }

  createOrUpdate(contentRecord: any){
    return new Observable((observer) => {
      forkJoin(
        from(this.storage.get('contentRecordsToSync')),
        from(this.storage.get('contentRecords'))
      ).subscribe((results: never[][]) => {
  
        let contentRecordsToSync = results[0] || [];
        let contentRecords = results[1] || [];
  
        forkJoin(
          this.updateContentRecordsToSync(this.addOrReplaceContentRecord(contentRecordsToSync, contentRecord)),
          this.updateContentRecords(this.addOrReplaceContentRecord(contentRecords, contentRecord))
        ).subscribe(()=>{
          this.trySynchronizeContentRecords([contentRecord]);
          observer.next([contentRecord]);
          observer.complete();
        });
      });
    });
  }

  trySynchronizeContentRecords(records: any[]){
    if(this.connectionService.isOnline){
  
      this.authService.currentUser().subscribe(user => {
        this.contentRecordsSynchronizer.sync(records, user['teacher_id']).subscribe();
      });
  
    }
  }
}