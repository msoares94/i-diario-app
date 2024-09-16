import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContentRecordFormPageRoutingModule } from './content-record-form-routing.module';

import { ContentRecordFormPage } from './content-record-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentRecordFormPageRoutingModule
  ],
  declarations: [ContentRecordFormPage]
})
export class ContentRecordFormPageModule {}
