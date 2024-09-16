import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular'; // Atualizado para Ionic Storage Angular
import { SyncProvider } from '../services/sync';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  shownGroup: any = null; // Ajustado para tipagem adequada
  unities: any[] = []; // Ajustado para tipagem adequada

  constructor(
    private navCtrl: NavController,
    private sync: SyncProvider,
    private storage: Storage
  ) { }
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
    this.updateLessonPlans();
  }

  async ionViewWillEnter() { // Atualizado para ionViewWillEnter
    await this.updateLessonPlans();
  }
 
  doRefresh(event: any) { // Adicionado tipo para event
    this.sync.syncAll().subscribe(res => {
      console.log(res);
      this.updateLessonPlans().finally(() => event.target.complete()); // Completa o evento de refresh
    });
  }

  async updateLessonPlans() {
    try {
      const lessonPlans = await this.storage.get('lessonPlans');
      if (!lessonPlans) return;
      this.unities = [];

      lessonPlans.unities.forEach((unity: { plans: any[]; unity_name: any; }) => {
        if ((unity.plans || []).length === 0) {
          return;
        }

        const lessonPlans = unity.plans.map(plan => ({
          id: plan.id,
          description: `${plan.description} - ${plan.classroom_name}`
        }));

        this.unities.push({ name: unity.unity_name, lessonPlans });
        console.log(this.unities)
      });
    } catch (error) {
      console.error('Error updating lesson plans:', error);
    }
  }

  toggleGroup(group: any) { // Ajustado para tipagem adequada
    this.shownGroup = this.isGroupShown(group) ? null : group;
  }

  isGroupShown(group: any): boolean { // Ajustado para tipagem adequada
    return this.shownGroup === group;
  }

  openDetail(lessonPlanId: number) { // Ajustado para tipagem adequada
    this.navCtrl.navigateForward('/lesson-plan-details', { state: { lessonPlanId } }); // Atualizado para navigateForward 
  }

  newFrequency() {

  }

}
