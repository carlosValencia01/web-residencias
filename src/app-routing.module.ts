import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { StudentPageComponent } from './pages/student-page/student-page.component';
import { CardEmployeePageComponent } from './pages/card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from './pages/loader-data-credentials-page/loader-data-credentials-page.component';
import { OneStudentPageComponent } from './pages/one-student-page/one-student-page.component';
import { NgModule } from '@angular/core';
import { TitulacionPageComponent } from './pages/titulacion-page/titulacion-page.component';
import { GradePageComponent } from './pages/grade-page/grade-page.component';
import { VinculacionPageComponent } from './pages/vinculacion-page/vinculacion-page.component';
//  import { VinculacionPageComponent } from "./pages/vinculacion-page/vinculacion-page.component";
import { ProgressPageComponent } from './pages/progress-page/progress-page.component';
// import { StepComponent } from "./app/step/step.component";

import { RegisterEmailgraduationPageComponent } from './pages/register-emailgraduation-page/register-emailgraduation-page.component';
import { LoaderDataGraduationPageComponent } from './pages/loader-data-graduation-page/loader-data-graduation-page.component';
import { GraduationEventsPageComponent } from './pages/graduation-events-page/graduation-events-page.component';
import { CoordinationRequestsTablePageComponent } from './pages/coordination-requests-table-page/coordination-requests-table-page.component';
import { SurveyPageComponent } from './pages/survey-page/survey-page.component';
import { ListGraduatesPageComponent } from './pages/list-graduates-page/list-graduates-page.component';
import { SurveyGraduatesPageComponent } from './pages/survey-graduates-page/survey-graduates-page.component';
import { SurveyRegisterPageComponent } from './pages/survey-register-page/survey-register-page.component'
import { SurveyFindPageComponent } from './pages/survey-find-page/survey-find-page.component';
import { SurveyQuestionsPageComponent } from './pages/survey-questions-page/survey-questions-page.component';
const appRoutes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'student', component: StudentPageComponent, pathMatch: 'full' },
  { path: 'employeeCard', component: CardEmployeePageComponent, pathMatch: 'full' },
  { path: 'loaderDataCredentials', component: LoaderDataCredentialsPageComponent, pathMatch: 'full' },
  { path: 'oneStudentPage', component: OneStudentPageComponent, pathMatch: 'full' },
  { path: 'grades', component: GradePageComponent, pathMatch: 'full' },
  { path: 'english', component: VinculacionPageComponent, pathMatch: 'full' },
  { path: 'graduation', component: TitulacionPageComponent, pathMatch: 'full' },
  { path: 'progressPage', component: ProgressPageComponent, pathMatch: 'full' },
  { path: 'registerGraduate/:eventId', component: RegisterEmailgraduationPageComponent, pathMatch: 'full' },
  { path: 'listGraduates/:eventId', component: ListGraduatesPageComponent, pathMatch: 'full' },
  { path: 'loaderDataGraduation/:eventId/:type', component: LoaderDataGraduationPageComponent, pathMatch: 'full' },
  { path: 'graduationEvents', component: GraduationEventsPageComponent, pathMatch: 'full' },
  { path: 'coordinationRequestsTable', component: CoordinationRequestsTablePageComponent, pathMatch: 'full' },
  { path: 'surveyGraduates/:id/:nc', component: SurveyGraduatesPageComponent, pathMatch: 'full' },
  { path: 'survey/:id/:nc', component: SurveyPageComponent, pathMatch: 'full' },
  { path: 'surveyFind', component: SurveyFindPageComponent , pathMatch: 'full' },
  { path: 'surveyRegister/:id/:nc', component: SurveyRegisterPageComponent, pathMatch: 'full' },
  { path: 'surveyQuestions/:id/:nc', component: SurveyQuestionsPageComponent , pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}

