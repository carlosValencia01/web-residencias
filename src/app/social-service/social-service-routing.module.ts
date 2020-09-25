import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ControlStudentsMainPageComponent} from './department/control-students-main-page/control-students-main-page.component';
import {SocialServiceMainPageComponent} from './student/social-service-main-page/social-service-main-page.component';
import {ReviewFirstDataPageComponent} from './department/review-first-data-page/review-first-data-page.component';

// Rutas de alummno o Departamento de Servicio social
const routes: Routes = [
  // Rutas de departamento
  {
    path: 'controlStudents',
    component: ControlStudentsMainPageComponent
  },
  {
    path: 'validateData',
    component: ReviewFirstDataPageComponent
  },
  // Rutas de estudiante
  {
    path: 'mySocialService',
    component: SocialServiceMainPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialServiceRoutingModule { }
