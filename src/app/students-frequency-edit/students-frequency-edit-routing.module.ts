import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentsFrequencyEditPage } from './students-frequency-edit.page';

const routes: Routes = [
  {
    path: '',
    component: StudentsFrequencyEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudentsFrequencyEditPageRoutingModule {}
