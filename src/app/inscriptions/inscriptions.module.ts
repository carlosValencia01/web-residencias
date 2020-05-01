import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../commons/commons.module';

// Ngx
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DROPZONE_CONFIG, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { NgxPaginationModule } from 'ngx-pagination';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Material
import { ErrorStateMatcher } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';

import { InscriptionsRoutingModule } from './inscriptions-routing.module';
import { DocumentsHelpComponent } from './documents-help/documents-help.component';
import { ExpedientHistoryComponent } from './expedient-history/expedient-history.component';
import { ReviewAnalysisComponent } from './review-analysis/review-analysis.component';
import { ReviewCredentialsComponent } from './review-credentials/review-credentials.component';
import { ReviewExpedientComponent } from './review-expedient/review-expedient.component';
import { StudentInformationComponent } from './student-information/student-information.component';
import { ConfirmationStudentPageComponent } from './confirmation-student-page/confirmation-student-page.component';
import { ContractStudentPageComponent } from './contract-student-page/contract-student-page.component';
import { InscriptionsPageComponent } from './inscriptions-page/inscriptions-page.component';
import { InscriptionsUploadFilesPageComponent } from './inscriptions-upload-files-page/inscriptions-upload-files-page.component';
import { ListAceptStudentComponent } from './list-acept-student/list-acept-student.component';
import { ListPendingStudentComponent } from './list-pending-student/list-pending-student.component';
import { ListProcessStudentComponent } from './list-process-student/list-process-student.component';
import { ProfileInscriptionPageComponent } from './profile-inscription-page/profile-inscription-page.component';
import { RegisterStudentPageComponent } from './register-student-page/register-student-page.component';
import { ResumeStudentPageComponent } from './resume-student-page/resume-student-page.component';
import { SecretaryInscriptionPageComponent } from './secretary-inscription-page/secretary-inscription-page.component';
import { WizardInscriptionPageComponent } from './wizard-inscription-page/wizard-inscription-page.component';
import { FilterPipe } from './secretary-inscription-page/filter.pipe';
import { environment } from 'src/environments/environment';

// Services
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { StudentProvider } from '../providers/shared/student.prov';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: environment.filesURL,
  maxFilesize: 3,
  acceptedFiles: 'application/pdf',
  maxFiles: 1
};

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    InscriptionsRoutingModule,
    NgbModule.forRoot(),
    NgxExtendedPdfViewerModule,
    DropzoneModule,
    NgxPaginationModule,
    ImageCropperModule,
    FormsModule,
    ReactiveFormsModule,
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
    FilterPipe,
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

  ]
})
export class InscriptionsModule { }
