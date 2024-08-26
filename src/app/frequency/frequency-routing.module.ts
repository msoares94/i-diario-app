import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrequencyPage } from './frequency.page';

const routes: Routes = [
  {
    path: '',
    component: FrequencyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrequencyPageRoutingModule {}
