import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContentRecordFormPage } from './content-record-form.page';

const routes: Routes = [
  {
    path: '',
    component: ContentRecordFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentRecordFormPageRoutingModule {}
