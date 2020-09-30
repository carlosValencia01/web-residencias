import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyListPageComponent } from './survey-list-page/survey-list-page.component';
import { GraduationEventsPageComponent } from './graduation-events-page/graduation-events-page.component';
import { ListGraduatesPageComponent } from './list-graduates-page/list-graduates-page.component';
import { LoaderDataGraduationPageComponent } from './loader-data-graduation-page/loader-data-graduation-page.component';
import { RegisterEmailgraduationPageComponent } from './register-emailgraduation-page/register-emailgraduation-page.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { SurveyFindPageComponent } from './survey-find-page/survey-find-page.component';
import { SurveyGraduatesPageComponent } from './survey-graduates-page/survey-graduates-page.component';
import { SurveyQuestionsPageComponent } from './survey-questions-page/survey-questions-page.component';
import { SurveyRegisterPageComponent } from './survey-register-page/survey-register-page.component';
import { MyGraduationComponent } from './my-graduation/my-graduation.component';
import { MyCertificatePageComponent } from './my-certificate-page/my-certificate-page.component';

const routes: Routes = [
  {
    path: 'encuestaEgresados',
    pathMatch: 'full',
    component: SurveyListPageComponent
  },
  {
    path: 'graduationEvents',
    pathMatch: 'full',
    component: GraduationEventsPageComponent
  },
  {
    path: 'my-graduation',
    pathMatch: 'full',
    component: MyGraduationComponent
  },
  {
    path: 'listGraduates/:eventId',
    pathMatch: 'full',
    component: ListGraduatesPageComponent
  },
  {
    path: 'registerGraduate/:eventId',
    pathMatch: 'full',
    component: RegisterEmailgraduationPageComponent
  },
  {
    path: 'loaderDataGraduation/:eventId/:type',
    pathMatch: 'full',
    component: LoaderDataGraduationPageComponent
  },
  {
    path: 'surveyFind',
    pathMatch: 'full',
    component: SurveyFindPageComponent
  },
  {
    path: 'surveyRegister/:id/:nc',
    pathMatch: 'full',
    component: SurveyRegisterPageComponent
  },
  {
    path: 'survey/:id/:nc',
    pathMatch: 'full',
    component: SurveyPageComponent
  },
  {
    path: 'surveyGraduates/:id/:nc',
    pathMatch: 'full',
    component: SurveyGraduatesPageComponent
  },
  {
    path: 'surveyQuestions/:id/:nc',
    pathMatch: 'full',
    component: SurveyQuestionsPageComponent
  },
  {
    path: 'my-certificate',
    pathMatch: 'full',
    component: MyCertificatePageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraduationRoutingModule { }
