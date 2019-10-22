// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Pages
import { HomePageComponent } from 'src/pages/app/home-page/home-page.component';
import { ProfileSettingsComponent } from 'src/pages/app/profile-settings/profile-settings.component';

// Credentials
import { CardEmployeePageComponent } from 'src/pages/credentials/card-employee-page/card-employee-page.component';
import {
  LoaderDataCredentialsPageComponent
} from 'src/pages/credentials/loader-data-credentials-page/loader-data-credentials-page.component';
import { StudentPageComponent } from 'src/pages/credentials/student-page/student-page.component';
import { OneStudentPageComponent } from 'src/pages/credentials/one-student-page/one-student-page.component';

// Electronic signature
// Pages
import {ElectronicSignatureComponent} from 'src/pages/electronic-signature/electronic-signature/electronic-signature.component';

// Inscriptions
import { InscriptionsPageComponent } from 'src/pages/inscriptions/inscriptions-page/inscriptions-page.component';

// Reception act
import { GradePageComponent } from 'src/pages/reception-act/grade-page/grade-page.component';
import { ProgressPageComponent } from 'src/pages/reception-act/progress-page/progress-page.component';
import { TitulacionPageComponent } from 'src/pages/reception-act/titulacion-page/titulacion-page.component';
import { VinculacionPageComponent } from 'src/pages/reception-act/vinculacion-page/vinculacion-page.component';
import { DocumentReviewComponent } from 'src/pages/reception-act/document-review/document-review.component';
import { ExpedienteComponent } from 'src/pages/reception-act/expediente/expediente.component';
import { DocumentsValidComponent } from 'src/pages/reception-act/documents-valid/documents-valid.component';

// Graduation
import {
  RegisterEmailgraduationPageComponent
} from 'src/pages/graduation/register-emailgraduation-page/register-emailgraduation-page.component';
import { LoaderDataGraduationPageComponent } from 'src/pages/graduation/loader-data-graduation-page/loader-data-graduation-page.component';
import { GraduationEventsPageComponent } from 'src/pages/graduation/graduation-events-page/graduation-events-page.component';
import { SurveyPageComponent } from 'src/pages/graduation/survey-page/survey-page.component';
import { ListGraduatesPageComponent } from 'src/pages/graduation/list-graduates-page/list-graduates-page.component';
import { SurveyGraduatesPageComponent } from 'src/pages/graduation/survey-graduates-page/survey-graduates-page.component';
import { SurveyRegisterPageComponent } from 'src/pages/graduation/survey-register-page/survey-register-page.component';
import { SurveyFindPageComponent } from 'src/pages/graduation/survey-find-page/survey-find-page.component';
import { SurveyQuestionsPageComponent } from 'src/pages/graduation/survey-questions-page/survey-questions-page.component';
import { SurveyListPageComponent } from 'src/pages/graduation/survey-list-page/survey-list-page.component';

const appRoutes: Routes = [
  // App
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'profileSettings', component: ProfileSettingsComponent, pathMatch: 'full' },

  // Credentials
  { path: 'employeeCard', component: CardEmployeePageComponent, pathMatch: 'full' },
  { path: 'loaderDataCredentials', component: LoaderDataCredentialsPageComponent, pathMatch: 'full' },
  { path: 'oneStudentPage', component: OneStudentPageComponent, pathMatch: 'full' },
  { path: 'student', component: StudentPageComponent, pathMatch: 'full' },

  // Electronic signature
  { path: 'electronicSignature', component: ElectronicSignatureComponent, pathMatch: 'full' },

  // Inscriptions
  { path: 'inscriptions', component: InscriptionsPageComponent, pathMatch: 'full' },

  // Reception act
  { path: 'english', component: VinculacionPageComponent, pathMatch: 'full' },
  { path: 'grades', component: GradePageComponent, pathMatch: 'full' },
  { path: 'graduation', component: TitulacionPageComponent, pathMatch: 'full' },
  { path: 'progressPage', component: ProgressPageComponent, pathMatch: 'full' },
  { path: 'progressPage/:id', component: DocumentReviewComponent, pathMatch: 'full' },
  { path: 'progressPage/:id/expediente', component: ExpedienteComponent, pathMatch: 'full' },

  // Graduation
  { path: 'encuestaEgresados', component: SurveyListPageComponent , pathMatch: 'full' },
  { path: 'graduationEvents', component: GraduationEventsPageComponent, pathMatch: 'full' },
  { path: 'listGraduates/:eventId', component: ListGraduatesPageComponent, pathMatch: 'full' },
  { path: 'loaderDataGraduation/:eventId/:type', component: LoaderDataGraduationPageComponent, pathMatch: 'full' },
  { path: 'registerGraduate/:eventId', component: RegisterEmailgraduationPageComponent, pathMatch: 'full' },
  { path: 'survey/:id/:nc', component: SurveyPageComponent, pathMatch: 'full' },
  { path: 'surveyFind', component: SurveyFindPageComponent , pathMatch: 'full' },
  { path: 'surveyGraduates/:id/:nc', component: SurveyGraduatesPageComponent, pathMatch: 'full' },
  { path: 'surveyQuestions/:id/:nc', component: SurveyQuestionsPageComponent , pathMatch: 'full' },
  { path: 'surveyRegister/:id/:nc', component: SurveyRegisterPageComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}

