import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewContentRecordFormPageRoutingModule } from './new-content-record-form-routing.module';

import { NewContentRecordFormPage } from './new-content-record-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewContentRecordFormPageRoutingModule
  ],
  declarations: [NewContentRecordFormPage]
})
export class NewContentRecordFormPageModule {}
