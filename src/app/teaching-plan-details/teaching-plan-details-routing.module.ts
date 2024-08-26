import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeachingPlanDetailsPage } from './teaching-plan-details.page';

const routes: Routes = [
  {
    path: '',
    component: TeachingPlanDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeachingPlanDetailsPageRoutingModule {}
