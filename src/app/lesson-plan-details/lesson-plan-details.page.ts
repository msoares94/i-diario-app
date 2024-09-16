import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from '../services/utils';

import { Storage } from '@ionic/storage-angular';

interface LessonPlan {
  id: number;
  description: string;
  classroom_name: string;
  unity_name: string;
  period: string;
  contents: any[];
  knowledge_areas: any;
  objectives?: any[];
  evaluation?: string;
  bibliography?: string;
  activities?: string;
  opinion?: string;
  resources?: string;
  start_at: Date; 
  end_at: Date;
}

interface Unity {
  plans: LessonPlan[];
}

@Component({
  selector: 'app-lesson-plan-details',
  templateUrl: './lesson-plan-details.page.html',
  styleUrls: ['./lesson-plan-details.page.scss'],
})
export class LessonPlanDetailsPage implements OnInit {
  lessonPlanId!: number;
  description!: string;
  unity_name!: string;
  period!: string;
  objectives:any[] = [];
  activities!: string;
  evaluation!: string;
  bibliography!: string;
  contents: any[] = [];
  knowledge_areas!: any;
  period_date!: string;
  start_at!: Date;
  end_at!: Date;
  opinion!: string;
  resources!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private utilsService: UtilsService
  ) {}

  async ngOnInit() {
    

    const state = this.router.getCurrentNavigation()?.extras.state;
    console.log(state)
    this.lessonPlanId = state!['lessonPlanId'];
    await this.storage.create();  // Necessário para inicializar o storage
    const lessonPlans: { unities: Unity[] } = await this.storage.get('lessonPlans');
    const details = this.getLessonPlanDetail(lessonPlans);

    if (details) {
      this.description = `${details.description} - ${details.classroom_name}`;
      this.unity_name = details.unity_name;
      this.period = details.period;
      this.contents = details.contents;
      this.knowledge_areas = details.knowledge_areas;

      this.objectives = details.objectives || [];
      this.evaluation = this.utilsService.convertTextToHtml(details.evaluation || '');
      this.bibliography = this.utilsService.convertTextToHtml(details.bibliography || '');
      this.activities = this.utilsService.convertTextToHtml(details.activities || '');
      this.opinion = this.utilsService.convertTextToHtml(details.opinion || '');
      this.resources = this.utilsService.convertTextToHtml(details.resources || '');
      this.start_at = details.start_at;
      this.end_at = details.end_at;
    }
  }

  getLessonPlanDetail(lessonPlans: { unities: Unity[] }): LessonPlan | undefined {
    let response: LessonPlan | undefined;
    lessonPlans.unities.forEach((unity: Unity) => {
      unity.plans.forEach((plan: LessonPlan) => {
        if (plan.id === this.lessonPlanId) {
          response = plan;
        }
      });
    });
    return response;
  }

  goBack() {
    this.router.navigate(['/previous-page']); // Ajuste conforme necessário
  }
}
