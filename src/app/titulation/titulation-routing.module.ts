import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VinculacionPageComponent } from './vinculacion-page/vinculacion-page.component';
import { DiaryComponent } from './diary/diary.component';
import { ViewAppointmentPageComponent } from './view-appointment-page/view-appointment-page.component';
import { TitulacionPageComponent } from './titulacion-page/titulacion-page.component';
import { ProgressPageComponent } from './progress-page/progress-page.component';
import { ListBooksPagesComponent } from './list-books-pages/list-books-pages.component';

const routes: Routes = [
  {
    path: 'request',
    pathMatch: 'full',
    component: TitulacionPageComponent
  },
  {
    path: 'language',
    pathMatch: 'full',
    component: VinculacionPageComponent
  },
  {
    path: 'diary/coordination',
    pathMatch: 'full',
    component: DiaryComponent
  },
  {
    path: 'diary/academy',
    pathMatch: 'full',
    component: ViewAppointmentPageComponent
  },
  {
    path: 'progress',
    pathMatch: 'full',
    component: ProgressPageComponent
  },
  {
    path: 'minutes',
    pathMatch: 'full',
    component: ListBooksPagesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TitulationRoutingModule { }
