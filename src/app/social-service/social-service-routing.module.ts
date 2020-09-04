import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ControlStudentsMainPageComponent} from './department/control-students-main-page/control-students-main-page.component';

// Rutas de alummno o Departamento de Servicio social
const routes: Routes = [
  {
    path: 'controlStudents',
    component: ControlStudentsMainPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialServiceRoutingModule { }
