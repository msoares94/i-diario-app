import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LessonPlanDetailsPage } from './lesson-plan-details.page';

const routes: Routes = [
  {
    path: '',
    component: LessonPlanDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LessonPlanDetailsPageRoutingModule {}
