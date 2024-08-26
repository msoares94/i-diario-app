import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Atualizado para Ionic Storage Angular
import { SyncProvider } from '../services/sync';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  shownGroup: any = null;
  unities: any[] = [];

  constructor(
    private router: Router,
    private sync: SyncProvider,
    private storage: Storage
  ) {

  }
  ngOnInit(): void {

    this.updateTeachingPlans();
  }



  ionViewDidLoad() {
    this.updateTeachingPlans();
  }

  doRefresh(event: any) {
    this.sync.syncAll().subscribe(() => {
      this.updateTeachingPlans();
      event.target.complete(); // Finaliza a ação de refresh
    });
  }

  async updateTeachingPlans() {
    const teachingPlans = await this.storage.get('teachingPlans');
    if (!teachingPlans) return;
    this.unities = teachingPlans.unities.map((unity: { plans: any[]; unity_name: any; }) => {
      const teachingPlans = unity.plans.map(plan => ({
        id: plan.id,
        description: `${plan.description} - ${plan.grade_name}`
      }));
      return { name: unity.unity_name, teachingPlans: teachingPlans };
    });
  }

  toggleGroup(group: any) {
    this.shownGroup = this.isGroupShown(group) ? null : group;
  }

  isGroupShown(group: any) {
    return this.shownGroup === group;
  }

  // Atualize o método openDetail
  openDetail(teachingPlanId: number) {
    console.log(teachingPlanId);
    this.router.navigate(['/teaching-plan-details', teachingPlanId]);
  }
}
