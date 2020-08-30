import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InscriptionsPageComponent } from './inscriptions-page/inscriptions-page.component';
import { RegisterStudentPageComponent } from './register-student-page/register-student-page.component';
import { WizardInscriptionPageComponent } from './wizard-inscription-page/wizard-inscription-page.component';
import { ContractStudentPageComponent } from './contract-student-page/contract-student-page.component';
import { ResumeStudentPageComponent } from './resume-student-page/resume-student-page.component';
import { ConfirmationStudentPageComponent } from './confirmation-student-page/confirmation-student-page.component';
import { InscriptionsUploadFilesPageComponent } from './inscriptions-upload-files-page/inscriptions-upload-files-page.component';
import { ProfileInscriptionPageComponent } from './profile-inscription-page/profile-inscription-page.component';
import { SecretaryInscriptionPageComponent } from './secretary-inscription-page/secretary-inscription-page.component';
import { WelcomeEmailsPageComponent } from './welcome-emails-page/welcome-emails-page.component';
import { WelcomeStudentsPageComponent } from './welcome-students-page/welcome-students-page.component';

const routes: Routes = [
  {
    path: 'emails',
    pathMatch: 'full',
    component: InscriptionsPageComponent
  },
  {
    path: 'registerStudent',
    pathMatch: 'full',
    component: RegisterStudentPageComponent
  },
  {
    path: 'wizardInscription',
    pathMatch: 'full',
    component: WizardInscriptionPageComponent
  },
  {
    path: 'contractStudent',
    pathMatch: 'full',
    component: ContractStudentPageComponent
  },
  {
    path: 'resumeStudent',
    pathMatch: 'full',
    component: ResumeStudentPageComponent
  },
  {
    path: 'confirmationStudent',
    pathMatch: 'full',
    component: ConfirmationStudentPageComponent
  },
  {
    path: 'uploadFiles',
    pathMatch: 'full',
    component: InscriptionsUploadFilesPageComponent
  },
  {
    path: 'profileInscription',
    pathMatch: 'full',
    component: ProfileInscriptionPageComponent
  },
  {
    path: 'studentsFiles',
    pathMatch: 'full',
    component: SecretaryInscriptionPageComponent
  },
  {
    path: 'newStudentsEmails',
    pathMatch: 'full',
    component: WelcomeEmailsPageComponent
  },
  {
    path: 'welcome-students',
    pathMatch: 'full',
    component: WelcomeStudentsPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InscriptionsRoutingModule { }
