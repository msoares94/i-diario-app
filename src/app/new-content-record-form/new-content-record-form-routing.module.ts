import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewContentRecordFormPage } from './new-content-record-form.page';

const routes: Routes = [
  {
    path: '',
    component: NewContentRecordFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewContentRecordFormPageRoutingModule {}
