import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils';
import { SyncProvider } from '../services/sync';
import { MessagesService } from '../services/messages';
import { OfflineDataPersisterService } from '../services/offline_data_persistence/offline_data_persister';
import { DailyFrequencyService } from '../services/daily_frequency';
import { StorageService } from '../services/storage.service';
import { GlobalFrequenciesPersisterService } from '../services/offline_data_persistence/global_frequencies_persister';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  shownGroup: any = null;
  lastFrequencyDays: any = null;
  emptyFrequencies: boolean = false;
  currentDate: Date = new Date();
  frequenciesLoaded: boolean = false;
  private loadingSync!: HTMLIonLoadingElement;

  constructor(
    private router: Router,
    private sync: SyncProvider,
    private loadingCtrl: LoadingController,
    private dailyFrequencyService: DailyFrequencyService,
    private auth: AuthService,
    private utilsService: UtilsService,
    private storage: StorageService,
    private messages: MessagesService,
    private global: GlobalFrequenciesPersisterService
  ) { }

  async ngOnInit() {
   //this.storage.set('dailyFrequencyStudentsToSync', []);
    const classroms = this.storage.get('classrooms');

    this.storage.get('user').then(async res => {
      console.log(res);
      if(res){
        const user = res;
    
        (await this.global.persist(await user, await classroms)).subscribe(res => {
          console.log(res)
        })
        this.loadFrequencies();
        this.frequenciesLoaded = true;
        await this.sync.isSyncDelayed();
      }else{
        this.router.navigate(['/sign-in']);
      }
    })
    
  }

  ionViewWillEnter() {
    if (!this.frequenciesLoaded && (!this.currentDate || this.router.url.includes('frequency'))) {
      this.loadFrequencies();
    }
    this.frequenciesLoaded = false;
  }

  loadFrequencies() {
    this.shownGroup = null;
    this.currentDate = this.utilsService.getCurrentDate();
    this.currentDate.setHours(0, 0, 0, 0);
    this.storage.get('frequencies').then((frequencies) => {
      console.log(frequencies);
      if (frequencies) {
        this.lastFrequencyDays = this.lastTenFrequencies(frequencies.daily_frequencies);
        this.emptyFrequencies = false;
      } else {
        this.emptyFrequencies = true;
        this.currentDate = new Date();
      }
    });
  }

  newFrequency() {
    this.utilsService.hasAvailableStorage().then((available) => {
      if (!available) {
        this.messages.showError(this.messages.insuficientStorageErrorMessage('lançar novas frequências'));
        return;
      }
      this.storage.get('unities').then((unities) => {
        console.log(unities)
        this.router.navigate(['/frequency']);
      });
    });
  }

  toggleGroup(group: any) {
    this.shownGroup = this.isGroupShown(group) ? null : group;
  }

  isGroupShown(group: any) {
    return this.shownGroup === group;
  }

  private lastTenFrequencies(frequencies: any[]) {
    const lastDays = [];
    const frequencyLimit = 30;

    for (let i = frequencyLimit; i > 0; i--) {
      const shortDate = this.utilsService.toStringWithoutTime(this.currentDate);
      const frequenciesOfDay = this.frequenciesOfDay(frequencies, shortDate);

      lastDays.push({
        date: shortDate,
        format_date: this.utilsService.toExtensiveFormat(this.currentDate),
        exists: frequenciesOfDay.length > 0,
        unities: this.unitiesOfFrequency(frequenciesOfDay)
      });
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    console.log(lastDays)
    return lastDays;
  }

  private frequenciesOfDay(frequencies: any[], date: string) {
    return frequencies.filter(frequency => frequency.frequency_date === date);
  }

  unitiesOfFrequency(frequencies: any[]) {
    if (!frequencies) return null;
    const unities: { id: any; name: any; classroomDisciplines: any[]; }[] = [];
    frequencies.forEach(frequency => {
      if (unities.findIndex(unity => unity.id === frequency.unity_id) === -1) {
        unities.push({
          id: frequency.unity_id,
          name: frequency.unity_name,
          classroomDisciplines: this.classroomDisciplinesOfUnityFrequency(frequencies, frequency.unity_id)
        });
      }
    });
    return unities;
  }

  classroomDisciplinesOfUnityFrequency(frequencies: any[], unityId: number) {
    const frequenciesOfUnity = frequencies.filter(frequency => frequency.unity_id === unityId);
    const classroomDisciplines: {
      classroomId: any;
      disciplineId: any;
      classroomName: any;
      disciplineName: any; classNumbers: any[];
    }[] = [];

    frequenciesOfUnity.forEach(frequency => {
      const indexOfClassroomDiscipline = classroomDisciplines.findIndex(cd => cd.classroomId === frequency.classroom_id && cd.disciplineId === frequency.discipline_id);

      if (indexOfClassroomDiscipline < 0) {
        classroomDisciplines.push({
          classroomId: frequency.classroom_id,
          classroomName: frequency.classroom_name,
          disciplineId: frequency.discipline_id,
          disciplineName: frequency.discipline_name,
          classNumbers: frequency.class_number ? [frequency.class_number] : []
        });
      } else if (frequency.class_number) {
        classroomDisciplines[indexOfClassroomDiscipline].classNumbers.push(frequency.class_number);
      }
    });

    return classroomDisciplines.sort((cd1, cd2) => {
      const desc1 = this.utilsService.comparableString(cd1.classroomName + cd1.disciplineName);
      const desc2 = this.utilsService.comparableString(cd2.classroomName + cd2.disciplineName);
      return desc1 > desc2 ? 1 : desc2 > desc1 ? -1 : 0;
    });
  }

  loadMoreFrequencies() {
    this.utilsService.hasAvailableStorage().then(async (available) => {
      if (!available) {
        this.messages.showError(this.messages.insuficientStorageErrorMessage('carregar mais frequências'));
        return;
      }
      this.loadingSync = await this.loadingCtrl.create({
        message: "Carregando..."
      });
      this.loadingSync.present();
      this.storage.get('frequencies').then((frequencies) => {
        console.log(frequencies)
        if (frequencies) {

          // Verifica se this.lastFrequencyDays está inicializado
          if (!this.lastFrequencyDays) {
            this.lastFrequencyDays = [];
          }
          // Concatena apenas se houver frequências
          const newFrequencies = this.lastTenFrequencies(frequencies.daily_frequencies);
          if (newFrequencies.length > 0) {
            this.lastFrequencyDays = this.lastFrequencyDays.concat(newFrequencies);
          }
        }
        this.loadingSync.dismiss();
      });
    });
  }


  async editFrequency(unityId: number, classroomId: number, stringDate: string, disciplineId: number, classes: number[]) {
    const globalAbsence = !disciplineId;
    this.loadingSync = await this.loadingCtrl.create({
      message: "Carregando..."
    });
    this.loadingSync.present();

    this.auth.currentUser().subscribe(res => {
      console.log(res);
      const usuario = res;
      this.dailyFrequencyService.getStudents({
        userId: usuario.id,
        teacherId: usuario.teacher_id,
        unityId: unityId,
        classroomId: classroomId,
        frequencyDate: stringDate,
        disciplineId: disciplineId,
        classNumbers: classes ? classes.join() : ''
      }).subscribe(
        (result: any) => {
          console.log(result)
          const navigationExtras = {
            queryParams: {
              //frequencies: result,
              global: globalAbsence
            },
            state: {
              result
            }
          };
          this.router.navigate(['/students-frequency-edit'], navigationExtras);
        },
        (error: any) => {
          console.log(error);
        },
        () => {
          this.loadingSync.dismiss();
        }
      );

    })

  }

  doRefresh() {
    this.sync.syncAll().subscribe(res => {
      this.loadFrequencies();
      console.log(res);
    })



  }
}