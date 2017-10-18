import { Observable } from 'rxjs/Observable';
import { DailyFrequencyStudentsSynchronizer } from './../../services/offline_data_synchronization/daily_frequency_students_synchronizer';
import { DailyFrequenciesSynchronizer } from './../../services/offline_data_synchronization/daily_frequencies_synchronizer';
import { ContentRecordsSynchronizer } from './../../services/offline_data_synchronization/content_records_synchronizer';
import { ConnectionService } from './../../services/connection';
import { OfflineDataPersisterService } from './../../services/offline_data_persistence/offline_data_persister';
import { UnitiesPersisterService } from './../../services/offline_data_persistence/unities_persister';
import { DailyFrequencyService } from './../../services/daily_frequency';
import { Storage } from '@ionic/storage';
import { UtilsService } from './../../services/utils';
import { AuthService } from './../../services/auth';
import { FrequencyPage } from './../frequency/frequency';
import { StudentsFrequencyEditPage } from '../students-frequency-edit/students-frequency-edit';
import { UnitiesService } from './../../services/unities';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-frequency-index',
  templateUrl: 'frequency-index.html'
})
export class FrequencyIndexPage {
  shownGroup = null;
  lastFrequencyDays = null;
  emptyFrequencies = false;
  currentDate: Date = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private unitiesService: UnitiesService,
    private dailyFrequencyService: DailyFrequencyService,
    private auth: AuthService,
    private utilsService: UtilsService,
    private storage: Storage,
    private unitiesPersister: UnitiesPersisterService,
    private alertCtrl: AlertController,
    private offlineDataPersister: OfflineDataPersisterService,
    private connectionService: ConnectionService,
    private dailyFrequenciesSynchronizer: DailyFrequenciesSynchronizer,
    private dailyFrequencyStudentsSynchronizer: DailyFrequencyStudentsSynchronizer,
    private contentRecordsSynchronizer: ContentRecordsSynchronizer
  ) {}

  ionViewWillEnter(){
    if(!this.currentDate || this.navCtrl.last()['component']['name'] == "FrequencyPage"){
      this.loadFrequencies();
    }
  }

  showErrorAlert() {
    let alert = this.alertCtrl.create({
      title: 'Erro',
      subTitle: 'Não foi possível realizar a sincronização.',
      buttons: ['OK']
    });
    alert.present();
  }

  loadFrequencies() {
    this.currentDate = new Date();
    this.currentDate.setHours(0,0,0,0);
    this.storage.get('frequencies').then((frequencies) => {
      if (frequencies) {

        this.lastFrequencyDays = this.lastTenFrequencies(frequencies.daily_frequencies);
        this.emptyFrequencies = false;
      }else{
        this.utilsService.showGenericToast("Puxe para baixo para atualizar.");
        this.emptyFrequencies = true;
      }
    });
  }

  newFrequency() {
    this.storage.get('unities').then((unities) => {
      this.navCtrl.push(FrequencyPage, { "unities": unities });
    });
  }

  toggleGroup(group) {
    if (this.isGroupShown(group)) {
        this.shownGroup = null;
    } else {
        this.shownGroup = group;
    }
  };

  isGroupShown(group) {
      return this.shownGroup === group;
  };

  private lastTenFrequencies(frequencies) {


    var lastDays = []
    const frequencyLimit = 10

    for (let i = frequencyLimit; i > 0; i--) {
      let shortDate = this.utilsService.toStringWithoutTime(this.currentDate);
      let frequenciesOfDay = this.frequenciesOfDay(frequencies, shortDate);

      lastDays.push({
        date: shortDate,
        format_date: this.utilsService.toExtensiveFormat(this.currentDate),
        exists: frequenciesOfDay.length > 0,
        unities: this.unitiesOfFrequency(frequenciesOfDay)
      });
      this.currentDate.setDate(this.currentDate.getDate()-1);
    }

    return lastDays;
  }

  private frequenciesOfDay(frequencies, date) {
    return frequencies.filter((frequency) => frequency.frequency_date == date);
  }

  unitiesOfFrequency(frequencies) {
    if (!frequencies) return null;
    let unities = new Array();
    frequencies.forEach(frequency => {
      if (unities.filter((unity) => unity.id == frequency.unity_id).length == 0) {
        unities.push({
          id: frequency.unity_id,
          name: frequency.unity_name,
          classroomDisciplines: this.classroomDisciplinesOfUnityFrequency(frequencies, frequency.unity_id)
        });
      }
    });
    return unities;
  }

  classroomDisciplinesOfUnityFrequency(frequencies, unity_id) {
    let frequenciesOfUnity = frequencies.filter((frequency) => frequency.unity_id == unity_id);
    let classroomDisciplines = new Array();
    frequenciesOfUnity.forEach(frequency => {
      let indexOfClassroomDiscipline = -1;
      classroomDisciplines.forEach((classroomDiscipline, index) => {

          if( classroomDiscipline.classroomId == frequency.classroom_id
              && classroomDiscipline.disciplineId == frequency.discipline_id){
            indexOfClassroomDiscipline = index;
          }
        }
      );
      if (indexOfClassroomDiscipline < 0) {
        classroomDisciplines.push({
          classroomId: frequency.classroom_id,
          classroomName: frequency.classroom_name,
          disciplineId: frequency.discipline_id,
          disciplineName: frequency.discipline_name,
          classNumbers: frequency.class_number ? [frequency.class_number] : []
        });
      }else if(frequency.class_number){
        classroomDisciplines[indexOfClassroomDiscipline].classNumbers.push(frequency.class_number);
      }
    });

    classroomDisciplines = classroomDisciplines.sort((cd1, cd2) => {
      let desc1 = this.utilsService.comparableString(cd1.classroomName + cd1.disciplineName);
      let desc2 = this.utilsService.comparableString(cd2.classroomName + cd2.disciplineName);
      if(desc1 > desc2){
        return 1;
      }else if(desc2 > desc1){
        return -1;
      }else{
        return 0;
      }
    });

    return classroomDisciplines;
  }

  loadMoreFrequencies(){
    const loader = this.loadingCtrl.create({
      content: "Carregando..."
    });
    loader.present();
    this.storage.get('frequencies').then((frequencies) => {
      if(frequencies){
        this.lastFrequencyDays = this.lastFrequencyDays.concat(this.lastTenFrequencies(frequencies.daily_frequencies));
      }

      loader.dismiss();
    });
  }

  editFrequency(unityId, classroomId, stringDate, disciplineId, classes){
    classes = classes || [];
    let globalAbsence = !disciplineId;

    const loader = this.loadingCtrl.create({
      content: "Carregando..."
    });
    loader.present();
    this.auth.currentUser().then((user) => {
      this.dailyFrequencyService.getStudents({
        userId: user.id,
        teacherId: user.teacher_id,
        unityId: unityId,
        classroomId: classroomId,
        frequencyDate: stringDate,
        disciplineId: disciplineId,
        classNumbers: classes.join()
      }).subscribe(
        (result:any) => {
          this.navCtrl.push(StudentsFrequencyEditPage, {
              "frequencies": result,
              "global": globalAbsence })
        },
        (error) => {
          console.log(error);
        },
        () => {
          loader.dismiss();
        }
      );
    });
  }

  doRefresh(refresher) {
    Observable.forkJoin(
      Observable.fromPromise(this.auth.currentUser()),
      Observable.fromPromise(this.storage.get('dailyFrequenciesToSync')),
      Observable.fromPromise(this.storage.get('dailyFrequencyStudentsToSync')),
      Observable.fromPromise(this.storage.get('contentRecordsToSync'))
    ).subscribe(
      (results) => {
        let user = results[0];
        let dailyFrequenciesToSync = results[1] || [];
        let dailyFrequencyStudentsToSync = results[2] || [];
        let contentRecordsToSync = results[3] || [];

        Observable.concat(
          this.dailyFrequenciesSynchronizer.sync(dailyFrequenciesToSync),
          this.dailyFrequencyStudentsSynchronizer.sync(dailyFrequencyStudentsToSync),
          this.contentRecordsSynchronizer.sync(contentRecordsToSync, user['teacher_id'])
        ).subscribe(
          () => {},
          (error) => {
            refresher.cancel()
            this.showErrorAlert()
          },
          () => {
            this.storage.remove('dailyFrequencyStudentsToSync')
            this.storage.remove('dailyFrequenciesToSync')
            this.offlineDataPersister.persist(user).subscribe(
              (result) => {
              },
              (error) => {
                refresher.cancel()
                this.showErrorAlert()
              },
              () => {
                refresher.complete()
                this.loadFrequencies()
              }
            )
          }
        )
      }
    )
  }
}