import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RolesAdminComponent } from './roles-admin/roles-admin.component';
import { PermissionsAdminComponent } from './permissions-admin/permissions-admin.component';
import { PositionsAdminPageComponent } from '../rrhh/positions-admin-page/positions-admin-page.component';
import { InscriptionsMainPageComponent } from './inscriptions-main-page/inscriptions-main-page.component';

const routes: Routes = [
  {
    path: 'roles',
    pathMatch: 'full',
    component: RolesAdminComponent
  },
  {
    path: 'permissions',
    pathMatch: 'full',
    component: PermissionsAdminComponent
  },
  {
    path: 'roles/assignment',
    pathMatch: 'full',
    component: PositionsAdminPageComponent
  },
  {
    path: 'periods',
    pathMatch: 'full',
    component: InscriptionsMainPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
