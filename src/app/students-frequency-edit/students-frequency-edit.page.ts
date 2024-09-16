import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { ConnectionService } from '../services/connection';
import { DailyFrequencyStudentService } from '../services/daily_frequency_student';
import { DailyFrequenciesSynchronizer } from '../services/offline_data_synchronization/daily_frequencies_synchronizer';
import { DailyFrequencyStudentsSynchronizer } from '../services/offline_data_synchronization/daily_frequency_students_synchronizer';
import { UtilsService } from '../services/utils';
import { StorageService } from '../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-students-frequency-edit',
  templateUrl: './students-frequency-edit.page.html',
  styleUrls: ['./students-frequency-edit.page.scss'],
  
})
export class StudentsFrequencyEditPage implements OnInit {
  studentsFrequency: any;
  classes: any[] = [];
  globalAbsence: boolean = false;
  students: any[] = [];
  unityName: string | null = null;
  unityId: number | null = null;
  classroomName: string | null = null;
  classroomId: number | null = null;
  disciplineName: string | null = null;
  disciplineId: number | null = null;
  frequencyDate: string | null = null;
  isSavingFrequencies: boolean = false;
  loadingCount: number = 0;
  formatDate: string | null = null;

  constructor(
    private navCtrl: NavController,
    //private navParams: NavParams, 
    private dailyFrequencyStudentService: DailyFrequencyStudentService,
    private loadingCtrl: LoadingController,
    private utilsService: UtilsService,
    private auth: AuthService,
    private storage: StorageService,
    private dailyFrequenciesSynchronizer: DailyFrequenciesSynchronizer,
    private dailyFrequencyStudentsSynchronizer: DailyFrequencyStudentsSynchronizer,
    private connection: ConnectionService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  async ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.globalAbsence = JSON.parse(params['global']);
      console.log(this.globalAbsence)
      const state = this.router.getCurrentNavigation()?.extras.state;
      console.log(state)
      if (this.globalAbsence) {
        this.studentsFrequency = state?.['result']['daily_frequency'];
        console.log(this.globalAbsence)
       } else {
        this.studentsFrequency = state?.['result']['daily_frequencies'];
        console.log(this.studentsFrequency)
       }

    })

   

    
  
    this.classes = this.mountClassNumbers();
    console.log(this.classes)
    this.setCurrentClassroom();
    this.setCurrentDiscipline();
    this.setCurrentUnity();
    this.setCurrentFrequencyDate();
    this.students = this.mountStudentList();

    const date = this.utilsService.getDate(this.frequencyDate as string);
    date.setHours(24, 0, 0, 0);
    this.formatDate = this.utilsService.toBrazilianFormat(date);
  }

  updateFrequency(frequency: any, classNumber: any = null, checked: boolean = false) {
    frequency.present = checked; // Atualiza o valor de 'present' com o valor do checkbox
    console.log(frequency)
    this.auth.currentUser().subscribe((user) => {
      const params = {
        id: frequency.id,
        present: frequency.present,
        classroomId: this.classroomId,
        disciplineId: this.disciplineId,
        studentId: frequency.student.id,
        classNumber: classNumber,
        userId: user.id,
        frequencyDate: this.frequencyDate,
      };
  
      this.dailyFrequencyStudentService.updateFrequency(params).subscribe(
        (dailyFrequencyStudentsToSync) => {
          if (this.connection.isOnline) {
            this.loadingCount++;
            const loadingCountLocal = this.loadingCount;
            this.isSavingFrequencies = true;
  
            this.dailyFrequencyStudentsSynchronizer.sync(dailyFrequencyStudentsToSync).subscribe(
              () => {
                // Sucesso na sincronização
              },
              () => {
                // Erro na sincronização
              },
              () => {
                // Finalização da sincronização
                if (this.loadingCount === loadingCountLocal) {
                  this.isSavingFrequencies = false;
                }
              }
            );
          }
        },
        (error) => {
          console.error('Erro ao atualizar frequência:', error);
        }
      );
    })
  }
  
  

  private sortStudents(studentA: any, studentB: any): number {
    if (studentA.sequence > studentB.sequence) {
      return 1;
    } else if (studentA.sequence < studentB.sequence) {
      return -1;
    } else if ((studentA.name || studentA.student.name).toUpperCase() > (studentB.name || studentB.student.name).toUpperCase()) {
      return 1;
    } else if ((studentA.name || studentA.student.name).toUpperCase() < (studentB.name || studentB.student.name).toUpperCase()) {
      return -1;
    } else {
      return 0;
    }
  }

  private mountStudentList(): any[] {
    let students: any[] = [];

    if (this.globalAbsence) {
      students = this.studentsFrequency.students;
    } else {
      students = this.studentsFrequency[0].students.map((student: any) => {
        const obj = { ...student.student, sequence: student['sequence'] };
        return obj;
      });

      students.forEach((student) => {
        const studentFrequencies: any[] = [];
        this.studentsFrequency.forEach((dailyFrequency: { students: any[]; }) => {
          dailyFrequency.students.map((dailyFrequencyStudent: any) => {
            if (dailyFrequencyStudent.student.id === student.id) {
              studentFrequencies.push(dailyFrequencyStudent);
            }
          });
        });
        student['frequencies'] = JSON.parse(JSON.stringify(studentFrequencies));
      });
    }

    return students.sort(this.sortStudents);
  }

  private mountClassNumbers(): any[] {
    if (this.globalAbsence) {
      return [];
    }
    console.log(this.studentsFrequency)
    return this.studentsFrequency.map((studentFrequency: any) => studentFrequency.class_number);
  }

  private setCurrentDiscipline() {
    if (this.globalAbsence) {
      this.disciplineId = this.studentsFrequency.discipline_id;
      this.disciplineName = this.studentsFrequency.discipline_name;
    } else {
      this.disciplineId = this.studentsFrequency[0].discipline_id;
      this.disciplineName = this.studentsFrequency[0].discipline_name;
    }
  }

  private setCurrentUnity() {
    if (this.globalAbsence) {
      this.unityId = this.studentsFrequency.unity_id;
      this.unityName = this.studentsFrequency.unity_name;
    } else {
      this.unityId = this.studentsFrequency[0].unity_id;
      this.unityName = this.studentsFrequency[0].unity_name;
    }
  }

  private setCurrentClassroom() {
    console.log(this.globalAbsence)
    if (this.globalAbsence) {
      this.classroomId = this.studentsFrequency.classroom_id;
      this.classroomName = this.studentsFrequency.classroom_name;
    } else {
      this.classroomId = this.studentsFrequency[0].classroom_id;
      this.classroomName = this.studentsFrequency[0].classroom_name;
    }
  }

  private setCurrentFrequencyDate() {
    if (this.globalAbsence) {
      this.frequencyDate = this.studentsFrequency.frequency_date;
    } else {
      this.frequencyDate = this.studentsFrequency[0].frequency_date;
    }
  }

  goBack() {
    this.router.navigate(['/tabs/tab1'])
  }
}