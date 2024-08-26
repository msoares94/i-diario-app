import { User } from './../../data/user.interface';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { ContentLessonPlansService } from './../content_lesson_plans';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';


@Injectable()

export class ContentLessonPlansPersisterService{
  constructor(
    private contentLessonPlansService: ContentLessonPlansService,
    private storage: StorageService
  ){}

  persist(user: User){
    return new Observable((observer) => {
      this.contentLessonPlansService.getContentLessonPlans(user.teacher_id).subscribe(
        (contentLessonPlans: { [x: string]: any; }) => {
          console.log(contentLessonPlans)
          observer.next(this.storage.set('contentLessonPlans', contentLessonPlans['lesson_plans']||[]))
        },
        (error: any) => {
          observer.error(error);
        },
        () => {
          observer.complete()
        }
      )
    })
  }
}