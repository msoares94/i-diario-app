import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiService {
  serverUrl: string = "";

  constructor(
    private storage: StorageService
  ){
    /*if (this.serverUrl == "") {
      this.storage.get('serverUrl').then(url => {
        console.log(url)
        this.serverUrl = url;
      })
    }*/
   this.serverUrl = environment.cities.url;
   //console.log(this.serverUrl)
  }

  async getServerUrl() {
    return environment.cities.url;
    /*
    await this.storage.get('serverUrl').then(url => {
      console.log(url)
      //this.serverUrl = url;
      return url
    })*/
  }

  setServerUrl(serverUrl: string) {
    this.storage.set('serverUrl', serverUrl);
    this.serverUrl = serverUrl;
  }

  getTeatcherClassroomsUrl() {
    return this.serverUrl  + '/api/v2/teacher_classrooms.json'
  }

  getLoginUrl() {
    return this.serverUrl  + '/usuarios/logar.json'
  }

  getDailyFrequencyStudentsUrl(id: number) {
    return this.serverUrl  + '/api/v2/daily_frequency_students/' + id + '.json';
  }

  getDailyFrequencyUrl() {
    return this.serverUrl  + '/api/v2/diario-de-frequencia.json'
  }

  getTeacherDisciplinesUrl() {
    return this.serverUrl  + '/api/v2/teacher_disciplines.json'
  }

  getExamRulesUrl() {
    return this.serverUrl  + '/api/v2/exam_rules.json'
  }

  getSchoolCalendarUrl() {
    return this.serverUrl  + '/api/v2/calendarios-letivo.json'
  }

  getClassroomStudentsUrl() {
    return this.serverUrl  + '/api/v2/classroom_students.json'
  }

  getTeacherUnitiesUrl() {
   // console.log(this.serverUrl + '/api/v2/teacher_unities.json');
    return this.serverUrl + '/api/v2/teacher_unities.json'
  }

  getTeacherLessonPlansUrl() {
    return this.serverUrl  + '/api/v2/lesson_plans.json'
  }

  getContentLessonPlansUrl() {
    return this.serverUrl  + '/api/v2/content_records/lesson_plans.json'
  }

  getContentRecordsUrl() {
    return this.serverUrl  + '/api/v2/content_records.json'
  }

  getTeacherTeachingPlansUrl() {
    return this.serverUrl  + '/api/v2/teaching_plans.json'
  }

  getDailyFrequencyStudentsUpdateOrCreateUrl() {
    return this.serverUrl  + '/api/v2/daily_frequency_students/update_or_create.json'
  }

  getContentRecordsSyncUrl(){
    return this.serverUrl  + '/api/v2/content_records/sync.json'
  }

  getallHostsUrl() {
    return '';
  }
}