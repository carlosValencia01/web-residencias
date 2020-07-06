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
    loadChildren: './credentials/credentials.module#CredentialsModule'
  },
  {
    path: 'rrhh',
    loadChildren: './rrhh/rrhh.module#RrhhModule'
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule'
  },
  {
    path: 'user',
    loadChildren: './user/user.module#UserModule'
  },
  {
    path: 'titulation',
    loadChildren: './titulation/titulation.module#TitulationModule'
  },
  {
    path: 'graduation',
    loadChildren: './graduation/graduation.module#GraduationModule'
  },
  {
    path: 'inscriptions',
    loadChildren: './inscriptions/inscriptions.module#InscriptionsModule'
  },
  {
    path: 'school-services',
    loadChildren: './school-services/school-services.module#SchoolServicesModule'
  },
  {
    path: 'english',
    loadChildren: './english/english.module#EnglishModule'
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

