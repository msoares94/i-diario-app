import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeachingPlanDetailsPageRoutingModule } from './teaching-plan-details-routing.module';

import { TeachingPlanDetailsPage } from './teaching-plan-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeachingPlanDetailsPageRoutingModule
  ],
  declarations: [TeachingPlanDetailsPage]
})
export class TeachingPlanDetailsPageModule {}
