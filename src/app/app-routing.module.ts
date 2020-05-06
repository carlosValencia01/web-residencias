import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuicklinkStrategy } from 'ngx-quicklink';

import { HomePageComponent } from './home/home-page/home-page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePageComponent
  },
  {
    path: 'credentials',
    loadChildren: () => import('./credentials/credentials.module').then(m => m.CredentialsModule)
  },
  {
    path: 'rrhh',
    loadChildren: () => import('./rrhh/rrhh.module').then(m => m.RrhhModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'titulation',
    loadChildren: () => import('./titulation/titulation.module').then(m => m.TitulationModule)
  },
  {
    path: 'graduation',
    loadChildren: () => import('./graduation/graduation.module').then(m => m.GraduationModule)
  },
  {
    path: 'inscriptions',
    loadChildren: () => import('./inscriptions/inscriptions.module').then(m => m.InscriptionsModule)
  },
  {
    path: 'school-services',
    loadChildren: () => import('./school-services/school-services.module').then(m => m.SchoolServicesModule)
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: QuicklinkStrategy
    }),
  ],
  exports: [RouterModule]
})

export class AppRoutingModule {

}

