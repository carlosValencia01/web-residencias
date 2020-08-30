import { NgModule } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropzoneConfigInterface, DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxPaginationModule } from 'ngx-pagination';
import { environment } from 'src/environments/environment';
import { CommonsModule } from '../commons/commons.module';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { StudentProvider } from '../providers/shared/student.prov';
import { CareerProvider } from '../providers/shared/career.prov';
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { ConfirmationStudentPageComponent } from './confirmation-student-page/confirmation-student-page.component';
import { ContractStudentPageComponent } from './contract-student-page/contract-student-page.component';
import { DocumentsHelpComponent } from './documents-help/documents-help.component';
import { ExpedientHistoryComponent } from './expedient-history/expedient-history.component';
import { InscriptionsPageComponent } from './inscriptions-page/inscriptions-page.component';
import { InscriptionsRoutingModule } from './inscriptions-routing.module';
import { InscriptionsUploadFilesPageComponent } from './inscriptions-upload-files-page/inscriptions-upload-files-page.component';
import { ListAceptStudentComponent } from './list-acept-student/list-acept-student.component';
import { ListPendingStudentComponent } from './list-pending-student/list-pending-student.component';
import { ListProcessStudentComponent } from './list-process-student/list-process-student.component';
import { ProfileInscriptionPageComponent } from './profile-inscription-page/profile-inscription-page.component';
import { RegisterStudentPageComponent } from './register-student-page/register-student-page.component';
import { ResumeStudentPageComponent } from './resume-student-page/resume-student-page.component';
import { ReviewAnalysisComponent } from './review-analysis/review-analysis.component';
import { ReviewCredentialsComponent } from './review-credentials/review-credentials.component';
import { ReviewExpedientComponent } from './review-expedient/review-expedient.component';
import { SecretaryInscriptionPageComponent } from './secretary-inscription-page/secretary-inscription-page.component';
import { StudentInformationComponent } from './student-information/student-information.component';
import { WizardInscriptionPageComponent } from './wizard-inscription-page/wizard-inscription-page.component';
import { ExpedentTableComponentComponent } from './expedent-table-component/expedent-table-component.component';
import { WelcomeEmailsPageComponent } from './welcome-emails-page/welcome-emails-page.component';
import { WelcomeStudentsPageComponent } from './welcome-students-page/welcome-students-page.component';
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: environment.filesURL,
  maxFilesize: 3,
  acceptedFiles: 'application/pdf',
  maxFiles: 1
};

@NgModule({
  imports: [
    CommonsModule,
    InscriptionsRoutingModule,
    NgbModule.forRoot(),
    NgxExtendedPdfViewerModule,
    DropzoneModule,
    NgxPaginationModule,
    ImageCropperModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTabsModule,
    MatBadgeModule,
    MatMenuModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatAutocompleteModule,
    MatSelectModule,
  ],
  declarations: [
    ConfirmationStudentPageComponent,
    ContractStudentPageComponent,
    InscriptionsPageComponent,
    InscriptionsUploadFilesPageComponent,
    ListAceptStudentComponent,
    ListPendingStudentComponent,
    ListProcessStudentComponent,
    ProfileInscriptionPageComponent,
    RegisterStudentPageComponent,
    ResumeStudentPageComponent,
    SecretaryInscriptionPageComponent,
    WizardInscriptionPageComponent,
    DocumentsHelpComponent,
    ExpedientHistoryComponent,
    ReviewAnalysisComponent,
    ReviewCredentialsComponent,
    ReviewExpedientComponent,
    StudentInformationComponent,    
    ExpedentTableComponentComponent,
    StudentInformationComponent,
    WelcomeEmailsPageComponent,
    WelcomeStudentsPageComponent,
  ],
  entryComponents: [
    DocumentsHelpComponent,
    ExpedientHistoryComponent,
    ReviewAnalysisComponent,
    ReviewCredentialsComponent,
    ReviewExpedientComponent,
    StudentInformationComponent,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
    ImageToBase64Service,
    InscriptionsProvider,
    StudentProvider,
    CareerProvider,

  ]
})
export class InscriptionsModule { }
