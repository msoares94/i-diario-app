import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FrequencyPageRoutingModule } from './frequency-routing.module';

import { FrequencyPage } from './frequency.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FrequencyPageRoutingModule
  ],
  declarations: [FrequencyPage]
})
export class FrequencyPageModule {}
