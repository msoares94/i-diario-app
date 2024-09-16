import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Unity } from '../data/unity.interface';
import { Classroom } from '../data/classroom.interface';
import { ClassroomsService } from '../services/classrooms';
import { DisciplinesService } from '../services/disciplines';
import { UtilsService } from '../services/utils';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-new-content-record-form',
  templateUrl: './new-content-record-form.page.html',
  styleUrls: ['./new-content-record-form.page.scss'],
})
export class NewContentRecordFormPage implements OnInit {
  unities: Unity[] = [];
  unityId: number | null = null;
  classrooms: Classroom[] = [];
  classroomId: number | null = null;
  date: any;
  disciplines: any;
  disciplineId: number | null = null;
  emptyUnities: boolean = true;

  constructor(private route: ActivatedRoute, private classroomsService: ClassroomsService,
    private disciplinesService: DisciplinesService,
    private router: Router,
    private utilsService: UtilsService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.unityId = params['unityId'];
      this.date = params['date'];
      // Use os parâmetros conforme necessário
    });

    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['unities']) {
      console.log(state)
      this.unities = state['unities'];
      this.emptyUnities = false;
      // Utilize o array de unities conforme necessário
    }
  }


  onChangeUnity() {
    if (!this.unityId) return;

    this.classroomsService.getOfflineClassrooms(this.unityId).subscribe(
      (classrooms: any) => {
        this.classrooms = classrooms.data[0];
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onChangeClassroom() { 
    if (!this.classroomId) return;

    this.disciplineId = null;

    this.disciplinesService.getOfflineDisciplines(this.classroomId).subscribe(
      (result: any) => {
        console.log(result)
        this.disciplines = result.data;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  submitNewContentRecord(form: NgForm) {
    const unityId = form.value.unity;
    const unityName = this.unities.find(d => d.id === unityId)?.description || '';
    const classroomId = form.value.classroom;
    const selectedClassroom = this.classrooms.find(d => d.id === classroomId);
    const gradeId = selectedClassroom?.grade_id;
    const classroomDescription = selectedClassroom?.description || '';
    const date = this.utilsService.dateToTimezone(form.value.date);
    const stringDate = this.utilsService.toStringWithoutTime(date);
    const disciplineId = form.value.discipline;
    console.log(this.disciplines)
    const disciplineDescription = this.disciplines.find((d: { id: any; }) => d.id === disciplineId)?.description || '';

    const navigationExtras = {
      queryParams: {
        date: stringDate,
        unityId: unityId,
        disciplineId: disciplineId,
        classroomId: classroomId,
        gradeId: gradeId,
        description: disciplineDescription,
        classroomName: classroomDescription,
        unityName: unityName,
      }
    };

    // Navegar para a próxima página, passando parâmetros via queryParams
    this.router.navigate(['/content-record-form'], navigationExtras);
  }

  resetSelectedValues() {
    this.classroomId = null;
    this.disciplineId = null;
  }

  goBack() {
    this.router.navigate(['/tabs/tab2']);
  }

}
