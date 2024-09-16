import { ApiService } from './../api';
import { Observable, from, concat } from 'rxjs';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ContentRecordsSynchronizer {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: Storage
  ){}

  public sync(contentRecords: any[], teacherId: number): Observable<any> {
    console.log(contentRecords)
    return new Observable(observer => {
      if (contentRecords && contentRecords.length) {
        let contentRecordObservables = contentRecords.map(contentRecord => {
          contentRecord['teacher_id'] = teacherId;
          return this.http.post(this.api.getContentRecordsSyncUrl(), contentRecord);
        });

        concat(...contentRecordObservables).subscribe(
          (result: any) => {
            this.destroyPendingSyncRecord(result);
            observer.next(result);
          },
          error => {
            observer.error(error);
          },
          () => {
            observer.complete();
          }
        );
      } else {
        observer.complete();
      }
    });
  }

  private destroyPendingSyncRecord(contentRecord: any) {
    from(this.storage.get('contentRecordsToSync')).subscribe(contentRecords => {
      const updatedRecords = contentRecords.filter((cr: any) => {
        return contentRecord.classroom_id !== cr.classroom_id ||
          contentRecord.discipline_id !== cr.discipline_id ||
          contentRecord.record_date !== cr.record_date;
      });
      this.storage.set('contentRecordsToSync', updatedRecords);
    });
  }
}
