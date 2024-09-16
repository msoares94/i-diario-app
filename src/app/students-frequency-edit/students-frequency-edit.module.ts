import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudentsFrequencyEditPageRoutingModule } from './students-frequency-edit-routing.module';

import { StudentsFrequencyEditPage } from './students-frequency-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StudentsFrequencyEditPageRoutingModule
  ],
  declarations: [StudentsFrequencyEditPage]
})
export class StudentsFrequencyEditPageModule {}
