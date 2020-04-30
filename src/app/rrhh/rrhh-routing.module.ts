import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepartmentsAdminPageComponent } from './departments-admin-page/departments-admin-page.component';
import { DocumentsAdminPageComponent } from './documents-admin-page/documents-admin-page.component';
import { DocumentsAssignPageComponent } from './documents-assign-page/documents-assign-page.component';
import { ElectronicSignatureComponent } from './electronic-signature/electronic-signature.component';
import { EmployeePageComponent } from './employee-page/employee-page.component';
import { PositionsAdminPageComponent } from './positions-admin-page/positions-admin-page.component';
import { GradePageComponent } from './grade-page/grade-page.component';

const routes: Routes = [
  {
    path: 'departments',
    pathMatch: 'full',
    component: DepartmentsAdminPageComponent
  },
  {
    path: 'documents',
    pathMatch: 'full',
    component: DocumentsAdminPageComponent
  },
  {
    path: 'documents/assign',
    pathMatch: 'full',
    component: DocumentsAssignPageComponent
  },
  {
    path: 'electronicSignature',
    pathMatch: 'full',
    component: ElectronicSignatureComponent
  },
  {
    path: 'employees',
    pathMatch: 'full',
    component: GradePageComponent,
  },
  {
    path: 'employees/:id',
    pathMatch: 'full',
    component: EmployeePageComponent
  },
  {
    path: 'positions',
    pathMatch: 'full',
    component: PositionsAdminPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RrhhRoutingModule { }
