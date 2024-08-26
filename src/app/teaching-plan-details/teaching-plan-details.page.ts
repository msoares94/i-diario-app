import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { UtilsService } from '../services/utils';
import { Storage } from '@ionic/storage-angular'; // Atualizado para Ionic Storage Angular
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-teaching-plan-details',
  templateUrl: './teaching-plan-details.page.html',
  styleUrls: ['./teaching-plan-details.page.scss'],
})
export class TeachingPlanDetailsPage implements OnInit {

  teachingPlanId!: number;
  description!: string;
  unity_name!: string;
  period!: string;
  objectives: any[] = [];
  activities!: string;
  evaluation!: string;
  bibliography!: string;
  contents!: string;
  knowledge_areas!: any;
  year!: string;

  constructor(
    //public navCtrl: NavController,
    //public navParams: NavParams,
    private route: ActivatedRoute,
    private storage: Storage,
    private utilsService: UtilsService
  ) {

  }
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.teachingPlanId = +id;
      console.log(this.teachingPlanId);
    } else {
      // Caso o id seja null ou undefined
      console.error('ID não encontrado na rota');
    }

    this.storage.get('teachingPlans').then((teachingPlans) => {
      const details = this.getTeachingPlanDetail(teachingPlans);
      console.log(details)
      if (details) {
        this.description = `${details.description} - ${details.grade_name}`;
        this.unity_name = details.unity_name;
        this.period = details.period;
        this.contents = details.contents;
        this.knowledge_areas = details.knowledge_areas;
        this.year = details.year;

        this.objectives = details.objectives || [];
        this.evaluation = this.utilsService.convertTextToHtml(details.evaluation);
        this.bibliography = this.utilsService.convertTextToHtml(details.bibliography);
        this.activities = this.utilsService.convertTextToHtml(details.activities);
      }
    });
  }

  getTeachingPlanDetail(teachingPlans: any) {
    let response: any;
    if (!teachingPlans || !teachingPlans.unities) return null;

    teachingPlans.unities.forEach((unity: any) => {
      unity.plans.forEach((plan: any) => {
        if (plan.id === this.teachingPlanId) {
          response = plan;
        }
      });
    });
    return response;
  }

  goBack() {
    //this.navCtrl.back(); // Atualizado para o método correto em Ionic 5+
  }
}








