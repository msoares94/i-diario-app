import { Injectable, EventEmitter } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, interval, concat, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ConnectionService } from './connection';
import { UtilsService } from './utils';
import { AuthService } from './auth';
import { ContentRecordsSynchronizer } from './offline_data_synchronization/content_records_synchronizer';
import { DailyFrequencyStudentsSynchronizer } from './offline_data_synchronization/daily_frequency_students_synchronizer';
import { DailyFrequenciesSynchronizer } from './offline_data_synchronization/daily_frequencies_synchronizer';
import { OfflineDataPersisterService } from './offline_data_persistence/offline_data_persister';
import { MessagesService } from './messages';

@Injectable()
export class SyncProvider {
  private isSyncingStatus: boolean;
  private loadingSync!: HTMLIonLoadingElement;
  public tooltipEvent: EventEmitter<any> = new EventEmitter();

  constructor(
    private alert: AlertController,
    private connectionService: ConnectionService,
    private loadingCtrl: LoadingController,
    private messages: MessagesService,
    private storage: Storage,
    private utilsService: UtilsService,
    private auth: AuthService,
    private dailyFrequenciesSynchronizer: DailyFrequenciesSynchronizer,
    private dailyFrequencyStudentsSynchronizer: DailyFrequencyStudentsSynchronizer,
    private contentRecordsSynchronizer: ContentRecordsSynchronizer,
    private offlineDataPersister: OfflineDataPersisterService
  ) {
    this.isSyncingStatus = false;
    this.verifySyncDate();
  }

  async start() {
    this.isSyncingStatus = true;
    this.loadingSync = await this.loadingCtrl.create({
      message: "Estamos sincronizando os seus dados, aguarde por favor."
    });
    await this.loadingSync.present();
  }

  async cancel(errorMessage?: string) {
    this.isSyncingStatus = false;
    await this.loadingSync.dismiss();
    this.messages.showError(errorMessage || 'Não foi possível concluir a sincronização.');
  }

  async complete() {
    this.isSyncingStatus = false;
    await this.loadingSync.dismiss();
    this.messages.showAlert('Sincronização concluída com sucesso.', 'Fim da sincronização');
  }

  isSyncing() {
    return this.isSyncingStatus;
  }

  verifyWifi(): Observable<boolean> {
    return new Observable(observer => {
      if (this.connectionService.getNetworkType() !== 'wifi' && this.connectionService.isOnline) {
        this.alert.create({
          header: 'Rede móvel',
          message: '<p>Você está conectado em uma rede móvel. A sincronização pode ser mais lenta que em uma rede Wi-Fi e poderá consumir seu plano de dados.</p><p><strong>Você deseja continuar a sincronização mesmo assim?</strong></p>',
          buttons: [{
            text: 'Cancelar',
            role: 'cancel',
            handler: () => observer.next(false)
          }, {
            text: 'Sincronizar',
            handler: () => observer.next(true)
          }]
        }).then(alertEl => {
          alertEl.present();
          alertEl.onDidDismiss().then(() => observer.complete());
        });
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  }

  getLastSyncDate(): Promise<Date> {
    return this.storage.get('lastSyncDate').then(lastSyncDate => {
      return lastSyncDate || this.utilsService.getCurrentDate();
    });
  }

  isSyncDelayed() {
    return this.getLastSyncDate().then(lastSyncDate => {
      const difference = this.utilsService.getCurrentDate().getTime() - lastSyncDate.getTime();
      const dayInMs = 1000 * 60 * 60 * 24;
      const daysDifference = Math.round(difference / dayInMs);

      if (daysDifference >= 5 || !lastSyncDate)
        this.callDelayedSyncAlert(daysDifference);
    }).catch(() => {
      this.callSyncTooltip();
    });
  }

  verifySyncDate() {
    const hourInMs = 1000 * 60 * 60;
    interval(hourInMs * 12).pipe(
      switchMap(() => from(this.isSyncDelayed())),
    ).subscribe();
  }

  callSyncTooltip() {
    this.tooltipEvent.emit({
      seconds: 5,
      text: 'Clique neste ícone para sincronizar'
    });
  }

  callDelayedSyncAlert(delayedDays: number) {
    this.alert.create({
      header: 'Sincronização',
      message: `Você está há ${delayedDays} dias sem sincronizar o aplicativo. Acesse uma rede de internet sem fio e clique no botão de sincronização para evitar perder seus dados.`,
      backdropDismiss: false,
      buttons: [{ text: 'OK' }]
    }).then(alertEl => alertEl.present());
  }

  setSyncDate() {
    const syncDate: Date = this.utilsService.getCurrentDate();
    this.storage.set('lastSyncDate', syncDate);
  }

  syncAll(): Observable<any> {
    return new Observable(observer => {
      this.verifyWifi().pipe(
        switchMap(continueSync => {
          if (continueSync) {
            return from(this.utilsService.hasAvailableStorage()).pipe(
              switchMap(available => {
                if (!available) {
                  this.messages.showError(this.messages.insuficientStorageErrorMessage('sincronizar frequências'));
                  return of(null); // Retornar um observable vazio aqui
                }

                if (!this.connectionService.isOnline) {
                  this.messages.showToast('Sem conexão! Verifique sua conexão com a internet e tente novamente.');
                  return of(null); // Retornar um observable vazio aqui
                }

                this.start();

                return forkJoin({
                  user: from(this.auth.currentUser()),
                  dailyFrequenciesToSync: from(this.storage.get('dailyFrequenciesToSync')),
                  dailyFrequencyStudentsToSync: from(this.storage.get('dailyFrequencyStudentsToSync')),
                  contentRecordsToSync: from(this.storage.get('contentRecordsToSync'))
                }).pipe(
                  switchMap(results => {
                    if (!results) {
                      observer.error();
                      observer.complete();
                      return of(null); // Retornar um observable vazio aqui
                    }

                    const user = results.user;
                    const dailyFrequenciesToSync = results.dailyFrequenciesToSync || [];
                    const dailyFrequencyStudentsToSync = results.dailyFrequencyStudentsToSync || [];
                    const contentRecordsToSync = results.contentRecordsToSync || [];

                    return concat(
                      this.dailyFrequenciesSynchronizer.sync(dailyFrequenciesToSync),
                      this.dailyFrequencyStudentsSynchronizer.sync(dailyFrequencyStudentsToSync),
                      this.contentRecordsSynchronizer.sync(contentRecordsToSync, user['teacher_id'])
                    ).pipe(
                      switchMap(() => from(this.storage.remove('dailyFrequencyStudentsToSync')).pipe(
                        switchMap(() => from(this.storage.remove('dailyFrequenciesToSync'))),
                        switchMap(() => this.offlineDataPersister.persist(user))
                      ))
                    );
                  })
                );
              })
            );
          } else {
            observer.error();
            return of(null); // Retornar um observable vazio aqui
          }
        })
      ).subscribe(
        () => {
          this.complete();
          this.setSyncDate();
          observer.next();
          observer.complete();
        },
        error => {
          this.cancel();
          this.messages.showError('Não foi possível finalizar a sincronização.');
          observer.error(error);
        }
      );
    });
  }
}
