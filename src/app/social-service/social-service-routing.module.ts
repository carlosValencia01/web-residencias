import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ControlStudentsMainPageComponent} from './department/control-students-main-page/control-students-main-page.component';
import {SocialServiceMainPageComponent} from './student/social-service-main-page/social-service-main-page.component';
import {ReviewFirstDataPageComponent} from './department/review-first-data-page/review-first-data-page.component';
import {ControlStudentsRequestsComponent} from './department/control-students-requests/control-students-requests.component';
import {ReviewSolicitudeDocumentsPageComponent} from './department/review-solicitude-documents-page/review-solicitude-documents-page.component';
import {RecordStudentPageComponent} from './department/record-student-page/record-student-page.component';
import {ControlStudentsProcessPageComponent} from './department/control-students-process-page/control-students-process-page.component';
import {ReviewReportsDocumentsComponent} from './department/review-reports-documents/review-reports-documents.component';

// Rutas de alummno o Departamento de Servicio social
const routes: Routes = [
  // Rutas de departamento
  {
    path: 'controlStudents',
    component: ControlStudentsMainPageComponent
  },
  {
    path: 'solicitudeStudents',
    component: ControlStudentsRequestsComponent
  },
  {
    path: 'processStudents',
    component: ControlStudentsProcessPageComponent
  },
  {
    path: 'validateData',
    component: ReviewFirstDataPageComponent
  },
  {
    path: 'validateSolicitudeDocuments',
    component: ReviewSolicitudeDocumentsPageComponent
  },
  {
    path: 'validateReportsDocuments',
    component: ReviewReportsDocumentsComponent
  },
  {
    path: 'recordStudent',
    component: RecordStudentPageComponent
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
