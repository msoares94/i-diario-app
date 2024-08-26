import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IonContent, LoadingController, NavController, NavParams } from '@ionic/angular';
import { Classroom } from '../data/classroom.interface';
import { Unity } from '../data/unity.interface';
import { User } from '../data/user.interface';
import { AuthService } from '../services/auth';
import { ClassroomsService } from '../services/classrooms';
import { ConnectionService } from '../services/connection';
import { DailyFrequencyService } from '../services/daily_frequency';
import { DisciplinesService } from '../services/disciplines';
import { ExamRulesService } from '../services/exam_rules';
import { MessagesService } from '../services/messages';
import { OfflineDataPersisterService } from '../services/offline_data_persistence/offline_data_persister';
import { SchoolCalendarsService } from '../services/school_calendars';
import { UnitiesService } from '../services/unities';
import { UtilsService } from '../services/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-frequency',
  templateUrl: './frequency.page.html',
  styleUrls: ['./frequency.page.scss'],
  providers: [NavParams]
})
export class FrequencyPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content: IonContent | undefined;

  unities: Unity[] = [];
  unityId: number | undefined;
  classrooms: Classroom[] = [];
  classroomId: number | undefined;
  date: any;
  globalAbsence = true;
  disciplines: any;
  disciplineId!: number;
  classes: any;
  selectedClasses: any[] = [];
  emptyUnities = true;

  constructor(
    private unitiesService: UnitiesService,
    private classroomsService: ClassroomsService,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private dailyFrequencyService: DailyFrequencyService,
    private examRulesService: ExamRulesService,
    private disciplinesService: DisciplinesService,
    private schoolCalendarsService: SchoolCalendarsService,
    private navCtrl: NavController,
    private connectionService: ConnectionService,
    private navParams: NavParams,
    private offlineDataPersister: OfflineDataPersisterService,
    private utilsService: UtilsService,
    private cdr: ChangeDetectorRef,
    private messages: MessagesService,
    private route: ActivatedRoute,
    private storage: StorageService,
    private router: Router,
  ) { }

  async ngOnInit() {
    if (!this.date) {
      const currentDate = this.utilsService.getCurrentDate();
      this.date = this.utilsService.toStringWithoutTime(currentDate);
    }
    if (!this.unities || !this.unities.length) {
      this.unities = await this.storage.get('unities');
      console.log(this.unities)
      this.emptyUnities = (!this.unities || this.unities.length === 0);
    }
  }

  ionViewWillLeave() {
    this.utilsService.leaveView(true);
  }

  scrollTo(elementId: string) {
    const yOffset = document.getElementById(elementId)?.offsetTop || 0;
    //this.content.scrollToPoint(0, yOffset, 1000);
  }

  onChangeUnity() {
    if (!this.unityId) { return; }
    this.showLoader('Carregando...').then(loader => {
      this.auth.currentUser().subscribe((user: User) => {
        this.classroomsService.getOfflineClassrooms(this.unityId!).subscribe(
          (classrooms: any) => {
            console.log(classrooms)
            this.schoolCalendarsService.getOfflineSchoolCalendar(this.unityId!).subscribe(
              (schoolCalendar: any) => {
                this.resetSelectedValues();
                this.classrooms = classrooms.data;
                loader.dismiss();

                if (!schoolCalendar.data) {
                  this.messages.showToast('Calendário escolar não encontrado.');
                  return;
                }

                this.classes = this.schoolCalendarsService.getClasses(schoolCalendar.data.number_of_classes);
                this.cdr.detectChanges();
                this.scrollTo("frequency-classroom");
              },
              error => {
                loader.dismiss();
                this.messages.showToast(error);
                console.log(error)
              }
            );
          },
          error => {
            loader.dismiss();
            this.messages.showToast(error);
            console.log(error)
          }
        );
      });
    });
  }

  onChangeClassroom() {
    if (!this.classroomId) { return; }
    //this.disciplineId = undefined;

    const _classes = this.classes;
    this.classes = [];
    this.selectedClasses = [];
    this.cdr.detectChanges();
    this.classes = _classes;

    this.showLoader('Carregando...').then(loader => {
      this.auth.currentUser().subscribe(user => {
        this.examRulesService.getOfflineExamRules(this.classroomId!).subscribe(
          (result: any) => {
            if (result.data.exam_rule && result.data.exam_rule.allow_frequency_by_discipline) {
              this.disciplinesService.getOfflineDisciplines(this.classroomId!).subscribe(
                (result: any) => {
                  this.disciplines = result.data;
                  this.globalAbsence = false;
                  this.cdr.detectChanges();
                  this.scrollTo("frequency-discipline");
                  loader.dismiss();
                },
                error => {
                  loader.dismiss();
                }
              );
            } else {
              this.globalAbsence = true;
              loader.dismiss();
              this.cdr.detectChanges();
              this.scrollTo("frequency-date");
            }
          },
          error => {
            loader.dismiss();
          }
        );
      });
    });
  }

  onChangeDiscipline() {
    this.scrollTo("frequency-classes");
  }

  frequencyForm(form: NgForm) {
    const unityId = form.value.unity;
    const classroomId = form.value.classroom;
    const date = this.utilsService.dateToTimezone(form.value.date);
    const stringDate = this.utilsService.toStringWithoutTime(date);
    const disciplineId = form.value.discipline;
    const classes = this.selectedClasses || [];

    this.showLoader('Carregando...').then(loader => {
      this.auth.currentUser().subscribe(user => {
        this.dailyFrequencyService.getStudents({
          userId: user.id,
          teacherId: user.teacher_id,
          unityId: unityId,
          classroomId: classroomId,
          frequencyDate: stringDate,
          disciplineId: disciplineId,
          classNumbers: classes.join()
        }).subscribe(
          (result: any) => {
            /*this.navCtrl.navigateForward(StudentsFrequencyPage, {
              queryParams: { frequencies: result, global: this.globalAbsence }
            });*/
            loader.dismiss();
          },
          error => {
            loader.dismiss();
          }
        );
      });
    });
  }

  resetSelectedValues() {
    this.globalAbsence = true;
    //this.classroomId = null;
    //this.disciplineId = null;
    this.selectedClasses = [];
  }

  updateSelectedClasses(selectedClass: any) {
    const index = this.selectedClasses.indexOf(selectedClass);

    if (index < 0) {
      this.selectedClasses.push(selectedClass);
    } else {
      this.selectedClasses.splice(index, 1);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }

  private async showLoader(message: string) {
    const loader = await this.loadingCtrl.create({
      message: message
    });
    await loader.present();
    return loader;
  }
}