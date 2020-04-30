import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CardEmployeePageComponent } from './card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from './loader-data-credentials-page/loader-data-credentials-page.component';
import { OneStudentPageComponent } from './one-student-page/one-student-page.component';
import { StudentPageComponent } from './student-page/student-page.component';

const routes: Routes = [
  {
    path: 'employeeCard',
    pathMatch: 'full',
    component: CardEmployeePageComponent
  },
  {
    path: 'loaderDataCredentials',
    pathMatch: 'full',
    component: LoaderDataCredentialsPageComponent
  },
  {
    path: 'oneStudentPage',
    pathMatch: 'full',
    component: OneStudentPageComponent
  },
  {
    path: 'student',
    pathMatch: 'full',
    component: StudentPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CredentialsRoutingModule { }
