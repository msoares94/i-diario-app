import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class SyncProvider {
  private isSyncingStatus: Boolean;
  public tooltipEvent: EventEmitter<any> = new EventEmitter;

  constructor(
    private storage: Storage,
  ) {
    this.isSyncingStatus = false;
  }

  start() {
    this.isSyncingStatus = true;
  }

  cancel() {
    this.isSyncingStatus = false;
  }

  complete() {
    this.isSyncingStatus = false;
  }

  isSyncing() {
    return this.isSyncingStatus;
  }

  getLastSyncDate(): Promise<Date> {
    return this.storage.get('lastSyncDate').then(lastSyncDate => {
      return lastSyncDate;
    }).catch(error => {
      return new Date();
    });
  }

  isSyncDelayed() {
    return this.getLastSyncDate().then(lastSyncDate => {
      let difference = new Date().getTime() - lastSyncDate.getTime();
      let dayInMs = 100*60*60*24;

      if (difference/dayInMs >= 5)
        this.callSyncTooltip();
    }).catch(error => {
      this.callSyncTooltip();
    });
  }

  callSyncTooltip() {
    this.tooltipEvent.emit(5);
  }

  setSyncDate() {
    let syncDate: Date = new Date();
    this.storage.set('lastSyncDate', syncDate);
  }

}
