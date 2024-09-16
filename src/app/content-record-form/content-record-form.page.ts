import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ContentRecordsService } from '../services/content_records';
import { UtilsService } from '../services/utils';
import { StorageService } from '../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-content-record-form',
  templateUrl: './content-record-form.page.html',
  styleUrls: ['./content-record-form.page.scss'],
})
export class ContentRecordFormPage implements OnInit {
  recordDate!: string;
  unityId!: number;
  disciplineId!: number;
  classroomId!: number;
  gradeId!: number;
  displayDate!: string;
  description!: string;
  unityName!: string;
  classroomName!: string;
  callback: any;
  newContent = '';
  baseContents: any = {};
  contentRecord: any = {};
  contents: any[] = [];

  constructor(
    //public navCtrl: NavController,
    //public navParams: NavParams,
    private storage: StorageService,
    private utilsService: UtilsService,
    private contentRecordService: ContentRecordsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.baseContents = {};
      this.contentRecord = {};
      this.contents = [];
      this.recordDate = params['date'];
      const date = this.utilsService.getDate(this.recordDate);
      date.setHours(24, 0, 0, 0);
      this.displayDate = this.utilsService.toExtensiveFormat(date);
      this.unityId = params['unityId'];
      this.disciplineId = params['disciplineId'];
      this.classroomId = params['classroomId'];
      this.gradeId = params['gradeId'];
      this.description = params['description'];
      this.callback = params['callback'];
      this.classroomName = params['classroomName'];
      this.unityName = params['unityName'];



      forkJoin({
        contentLessonPlans: this.storage.get('contentLessonPlans'),
        contentRecords: this.storage.get('contentRecords'),
        teachingPlans: this.storage.get('teachingPlans'),
      }).subscribe((results) => {
        const contentLessonPlans = results.contentLessonPlans || [];
        const contentRecords = results.contentRecords || [];
        const teachingPlans = results.teachingPlans || [];

        this.baseContents = this.getContentLessonPlan(contentLessonPlans);
        if (!Object.keys(this.baseContents).length) {
          this.baseContents = this.getTeachingPlan(teachingPlans);
        }
        this.contentRecord = this.getContentRecord(contentRecords);
        if (!Object.keys(this.contentRecord).length) {
          this.contentRecord = {
            id: undefined,
            record_date: this.recordDate,
            classroom_id: this.classroomId,
            classroom_name: this.classroomName,
            description: this.description,
            discipline_id: this.disciplineId,
            grade_id: this.gradeId,
            unity_id: this.unityId,
            unity_name: this.unityName,
            contents: [],
          };
        }

        this.loadContents();
      });


    });



    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['unities']) {
      console.log(state)

    }
  }

  async ionViewWillLeave() {
    const oldContents = this.contentRecord['contents']
      .map((x: any) => x.description.trim())
      .sort();
    const currentContents = this.contents
      .filter((x: any) => x.checked)
      .map((x: any) => x.description.trim())
      .sort();

    if (JSON.stringify(oldContents) !== JSON.stringify(currentContents)) {
      this.contentRecord['contents'] = this.contents.filter(
        (x: any) => x.checked
      );
      this.contentRecordService.createOrUpdate(this.contentRecord).subscribe(() => {
        if (typeof this.callback === 'function') {
          this.callback();
        }
      });
    }
  }

  loadContents() {
    this.contents = (this.baseContents['contents'] || [])
      .concat(this.contentRecord['contents'] || [])
      .filter(
        (c1: any, i: number, self: any[]) =>
          self.findIndex((c2) => c2.description === c1.description) === i
      );
    (this.contentRecord['contents'] || []).forEach((content: any) => {
      const index = this.contents
        .map((c: any) => c.description)
        .indexOf(content.description);
      if (index >= 0) {
        this.contents[index].checked = true;
      }
    });
  }

  async ionViewDidLoad() {
    //await this.storage.create(); // Needed for initializing the storage

  }

  addContent() {
    const indexFound = this.contents.findIndex((c) =>
      this.utilsService.compareStrings(c.description, this.newContent)
    );
 
    if (indexFound >= 0) {
      this.contents[indexFound].checked = true;
    } else {
      this.contents.push({
        id: undefined,
        description: this.newContent,
        checked: true,
      });
    }
    this.newContent = '';

    return false;
  }

  getContentLessonPlan(contentLessonPlans: any[]) {
    let response = {};

    contentLessonPlans.forEach((plan) => {
      if (
        plan.grade_id == this.gradeId &&
        plan.classroom_id == this.classroomId &&
        plan.discipline_id == this.disciplineId &&
        plan.unity_id == this.unityId &&
        plan.start_at <= this.recordDate &&
        plan.end_at >= this.recordDate
      ) {
        response = plan;
        return;
      }
    });

    return response;
  }

  getContentRecord(contentRecords: any[]) {
    let response = {};
    contentRecords.forEach((contentRecord) => {
      if (
        contentRecord.grade_id == this.gradeId &&
        contentRecord.classroom_id == this.classroomId &&
        contentRecord.discipline_id == this.disciplineId &&
        contentRecord.unity_id == this.unityId &&
        contentRecord.record_date == this.recordDate
      ) {
        response = contentRecord;
        return;
      }
    });
    return response;
  }

  getTeachingPlan(teachingPlanUnities: any) {
    let response = {};

    teachingPlanUnities.unities
      .filter((x: any) => x.unity_id == this.unityId)
      .forEach((x: any) => {
        x.plans.forEach((teachingPlan: any) => {
          if (
            teachingPlan.grade_id == this.gradeId &&
            teachingPlan.discipline_id == this.disciplineId
          ) {
            response = teachingPlan;
            return;
          }
        });
      });
    return response;
  }

  goBack() {
    // this.navCtrl.pop();
  }
}
