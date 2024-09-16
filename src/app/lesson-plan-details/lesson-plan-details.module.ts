import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LessonPlanDetailsPageRoutingModule } from './lesson-plan-details-routing.module';

import { LessonPlanDetailsPage } from './lesson-plan-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LessonPlanDetailsPageRoutingModule
  ],
  declarations: [LessonPlanDetailsPage]
})
export class LessonPlanDetailsPageModule {}
