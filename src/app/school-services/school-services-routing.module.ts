import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImssPageComponent } from './imss-page/imss-page.component';
import { IndustrialVisitsPageComponent } from './industrial-visits-page/industrial-visits-page.component';

const routes: Routes = [
  {
    path: 'imss',
    pathMatch: 'full',
    component: ImssPageComponent
  },
  {
    path: 'visits',
    pathMatch: 'full',
    component: IndustrialVisitsPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolServicesRoutingModule { }
