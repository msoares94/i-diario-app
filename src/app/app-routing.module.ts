import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./sign-in/sign-in.module').then( m => m.SignInPageModule)
  },
  {
    path: 'tab4',
    loadChildren: () => import('./tab4/tab4.module').then( m => m.Tab4PageModule)
  },
  {
    path: 'tab5',
    loadChildren: () => import('./tab5/tab5.module').then( m => m.Tab5PageModule)
  },
  {
    path: 'teaching-plan-details',
    loadChildren: () => import('./teaching-plan-details/teaching-plan-details.module').then( m => m.TeachingPlanDetailsPageModule)
  },
  {
    path: 'teaching-plan-details/:id',
    loadChildren: () => import('./teaching-plan-details/teaching-plan-details.module').then( m => m.TeachingPlanDetailsPageModule)
  },
  {
    path: 'frequency',
    loadChildren: () => import('./frequency/frequency.module').then( m => m.FrequencyPageModule)
  },
  {
    path: 'new-content-record-form',
    loadChildren: () => import('./new-content-record-form/new-content-record-form.module').then( m => m.NewContentRecordFormPageModule)
  },
  {
    path: 'content-record-form',
    loadChildren: () => import('./content-record-form/content-record-form.module').then( m => m.ContentRecordFormPageModule)
  },
  {
    path: 'students-frequency-edit',
    loadChildren: () => import('./students-frequency-edit/students-frequency-edit.module').then( m => m.StudentsFrequencyEditPageModule)
  },
  {
    path: 'lesson-plan-details',
    loadChildren: () => import('./lesson-plan-details/lesson-plan-details.module').then( m => m.LessonPlanDetailsPageModule)
  }
  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
