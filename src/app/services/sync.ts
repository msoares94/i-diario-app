import { Injectable, EventEmitter } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, interval, concat, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { ConnectionService } from './connection';
import { UtilsService } from './utils';
import { AuthService } from './auth';
import { ContentRecordsSynchronizer } from './offline_data_synchronization/content_records_synchronizer';
import { DailyFrequencyStudentsSynchronizer } from './offline_data_synchronization/daily_frequency_students_synchronizer';
import { DailyFrequenciesSynchronizer } from './offline_data_synchronization/daily_frequencies_synchronizer';
import { OfflineDataPersisterService } from './offline_data_persistence/offline_data_persister';
import { MessagesService } from './messages';
import { StorageService } from './storage.service';

@Injectable()
export class SyncProvider {
  private isSyncingStatus = false;
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
    this.verifySyncDate();
  }

  private async showLoading() {
    this.loadingSync = await this.loadingCtrl.create({
      message: "Estamos sincronizando os seus dados, aguarde por favor."
    });
    await this.loadingSync.present();
  }

  private hideLoading() {
    if (this.loadingSync) {
      return this.loadingSync.dismiss();
    }
    return Promise.resolve();
  }

  async startSyncProcess() {
    this.isSyncingStatus = true;
    await this.showLoading();
  }

  async completeSync() {
    this.isSyncingStatus = false;
    await this.hideLoading();
    this.messages.showAlert('Sincronização concluída com sucesso.', 'Fim da sincronização');
  }

  async handleError(errorMessage?: string) {
    this.isSyncingStatus = false;
    await this.hideLoading();
    this.messages.showError(errorMessage || 'Não foi possível concluir a sincronização.');
  }

  isSyncing() {
    return this.isSyncingStatus;
  }

  private verifyWifi(): Observable<boolean> {
    return new Observable(observer => {
      if (this.connectionService.getNetworkType() !== 'wifi' && this.connectionService.isOnline) {
        this.alert.create({
          header: 'Rede móvel',
          message: '<p>Você está conectado em uma rede móvel. A sincronização pode ser mais lenta que em uma rede Wi-Fi e poderá consumir seu plano de dados.</p><p><strong>Você deseja continuar a sincronização mesmo assim?</strong></p>',
          buttons: [
            { text: 'Cancelar', role: 'cancel', handler: () => observer.next(false) },
            { text: 'Sincronizar', handler: () => observer.next(true) }
          ]
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

  private getLastSyncDate(): Promise<Date> {
    return this.storage.get('lastSyncDate').then(lastSyncDate => lastSyncDate || this.utilsService.getCurrentDate());
  }

  public isSyncDelayed() {
    return this.getLastSyncDate().then(lastSyncDate => {
      const daysDifference = Math.round((this.utilsService.getCurrentDate().getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(daysDifference)
      if (daysDifference >= 5) {
        this.callDelayedSyncAlert(daysDifference);
      }
    }).catch(() => this.callSyncTooltip());
  }

  private verifySyncDate() {
    const hourInMs = 1000 * 60 * 60;
    interval(hourInMs * 12).pipe(
      switchMap(() => from(this.isSyncDelayed()))
    ).subscribe();
  }

  private callSyncTooltip() {
    this.tooltipEvent.emit({
      seconds: 5,
      text: 'Clique neste ícone para sincronizar'
    });
  }

  private callDelayedSyncAlert(delayedDays: number) {
    this.alert.create({
      header: 'Sincronização',
      message: `Você está há ${delayedDays} dias sem sincronizar o aplicativo. Acesse uma rede de internet sem fio e clique no botão de sincronização para evitar perder seus dados.`,
      backdropDismiss: false,
      buttons: [{ text: 'OK' }]
    }).then(alertEl => alertEl.present());
  }

  private setSyncDate() {
    const syncDate: Date = this.utilsService.getCurrentDate();
    this.storage.set('lastSyncDate', syncDate);
  }

  syncAll(): Observable<any> {
    return new Observable(observer => {
      this.verifyWifi().pipe(
        switchMap(continueSync => {
          if (!continueSync) {
            observer.error('Sincronização cancelada.');
            return of(null);
          }

          return from(this.utilsService.hasAvailableStorage()).pipe(
            switchMap(available => {
              if (!available) {
                this.messages.showError(this.messages.insuficientStorageErrorMessage('sincronizar frequências'));
                return of(null);
              }

              if (!this.connectionService.isOnline) {
                this.messages.showToast('Sem conexão! Verifique sua conexão com a internet e tente novamente.');
                return of(null);
              }

              this.startSyncProcess();

              return forkJoin({
                user: from(this.storage.get('user')),
                dailyFrequenciesToSync: from(this.storage.get('dailyFrequenciesToSync') || []),
                dailyFrequencyStudentsToSync: from(this.storage.get('dailyFrequencyStudentsToSync') || []),
                contentRecordsToSync: from(this.storage.get('contentRecordsToSync') || [])
              }).pipe(
                switchMap(results => {
                  console.log(results);
                  if (!results) {
                    observer.error('Nenhum resultado retornado.');
                    return of(null);
                  }

                  const { user, dailyFrequenciesToSync, dailyFrequencyStudentsToSync, contentRecordsToSync } = results;

                  // Tratamento seguro para sincronizações
                  const dailyFrequenciesObservable = dailyFrequenciesToSync?.length ?
                    this.dailyFrequenciesSynchronizer.sync(dailyFrequenciesToSync) : of(null);

                  const dailyFrequencyStudentsObservable = dailyFrequencyStudentsToSync?.length ?
                    this.dailyFrequencyStudentsSynchronizer.sync(dailyFrequencyStudentsToSync) : of(null);

                  const contentRecordsObservable = contentRecordsToSync?.length ?
                    this.contentRecordsSynchronizer.sync(contentRecordsToSync, user?.['teacher_id']) : of(null);

                  // Garantimos que todos os observables sejam válidos para o concat
                  return concat(
                    dailyFrequenciesObservable,
                    dailyFrequencyStudentsObservable,
                    contentRecordsObservable
                  ).pipe(
                    switchMap(() => forkJoin([
                      this.storage.remove('dailyFrequencyStudentsToSync'),
                      this.storage.remove('dailyFrequenciesToSync'),
                      this.offlineDataPersister.persist(user)
                    ])),
                    catchError(error => {
                      this.handleError('Erro durante o processo de sincronização.');
                      observer.error(error);
                      return of(null); // Continua o fluxo em caso de erro
                    })
                  );
                })
              );
            })
          );
        })
      ).subscribe({
        next: () => {
          this.completeSync();
          this.setSyncDate();
          observer.next(); // Notifica o sucesso
          observer.complete(); // Conclui o observable
        },
        error: error => {
          this.handleError(error);
          observer.error(error); // Notifica o erro
        }
      });
    });
  }

}
