// External modules
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CookieService } from 'ngx-cookie-service';
import { CustomFormsModule } from 'ng2-validation';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotkeyModule } from 'angular2-hotkeys';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatFileUploadModule } from 'mat-file-upload';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SidebarModule } from 'ng-sidebar';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
 
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  // url: 'http://localhost:3003/escolares/credenciales/drive/upload/file',
  url: environment.filesURL,  
  maxFilesize: 3,
  acceptedFiles: 'application/pdf',  
  maxFiles:1  
};



// Firestore
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
// Material
import {
  MatButtonModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRadioModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatProgressBarModule,
  MatGridListModule,
  MatToolbarModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatExpansionModule,
} from '@angular/material';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

// App module
// Pages
import { HomePageComponent } from 'src/pages/app/home-page/home-page.component';
import { LoginPageComponent } from 'src/pages/app/login-page/login-page.component';
// Components
import { HomeHeaderComponent } from 'src/components/app/home-header/home-header.component';
import { LoginHeaderComponent } from 'src/components/app/login-header/login-header.component';
import { SidebarContentComponent } from 'src/components/app/sidebar-content/sidebar-content.component';
// Services
import { CookiesService } from 'src/services/app/cookie.service';
import { FormErrorsService } from 'src/services/app/forms.errors.service';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
// Providers
import { Api } from 'src/providers/app/api.prov';
import { UserProvider } from 'src/providers/app/user.prov';
// Routes
import { AppRoutingModule } from 'src/app-routing.module';

// Credentials module
// Pages
import { CardEmployeePageComponent } from 'src/pages/credentials/card-employee-page/card-employee-page.component';
import {
  LoaderDataCredentialsPageComponent
} from 'src/pages/credentials/loader-data-credentials-page/loader-data-credentials-page.component';
import { OneStudentPageComponent } from 'src/pages/credentials/one-student-page/one-student-page.component';
import { StudentPageComponent } from 'src/pages/credentials/student-page/student-page.component';

// Inscriptions module
// Pages
import { InscriptionsPageComponent } from 'src/pages/inscriptions/inscriptions-page/inscriptions-page.component';
import { InscriptionsMainPageComponent } from 'src/pages/inscriptions/inscriptions-main-page/inscriptions-main-page.component';
import { RegisterStudentPageComponent } from 'src/pages/inscriptions/register-student-page/register-student-page.component';
import { WizardInscriptionPageComponent } from '../pages/inscriptions/wizard-inscription-page/wizard-inscription-page.component';
import { ContractStudentPageComponent } from '../pages/inscriptions/contract-student-page/contract-student-page.component';
import { ResumeStudentPageComponent } from '../pages/inscriptions/resume-student-page/resume-student-page.component';
import { ConfirmationStudentPageComponent } from '../pages/inscriptions/confirmation-student-page/confirmation-student-page.component';
import { InscriptionsUploadFilesPageComponent } from 'src/pages/inscriptions/inscriptions-upload-files-page/inscriptions-upload-files-page.component'
import { ProfileInscriptionPageComponent } from '../pages/inscriptions/profile-inscription-page/profile-inscription-page.component';
import { SecretaryInscriptionPageComponent } from '../pages/inscriptions/secretary-inscription-page/secretary-inscription-page.component';
// Providers
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
//services
import { WizardService } from 'src/services/inscriptions/wizard.service';
import { UploadFilesService } from 'src/services/inscriptions/upload-files.service';
//modals
import { NewPeriodComponent } from 'src/modals/inscriptions/new-period/new-period.component'
import { ReviewExpedientComponent } from 'src/modals/inscriptions/review-expedient/review-expedient.component'
import { ExpedientHistoryComponent } from 'src/modals/inscriptions/expedient-history/expedient-history.component';

// Reception act module
// Pages
import { DocumentReviewComponent } from 'src/pages/reception-act/document-review/document-review.component';
import { DocumentsValidComponent } from 'src/pages/reception-act/documents-valid/documents-valid.component';
import { ExpedienteComponent } from 'src/pages/reception-act/expediente/expediente.component';
import { GradePageComponent } from 'src/pages/reception-act/grade-page/grade-page.component';
import { ProgressPageComponent } from 'src/pages/reception-act/progress-page/progress-page.component';
import { TitulacionPageComponent } from 'src/pages/reception-act/titulacion-page/titulacion-page.component';
import { VinculacionPageComponent } from 'src/pages/reception-act/vinculacion-page/vinculacion-page.component';
// Components
import { ProcessComponentComponent } from 'src/components/reception-act/process-component/process-component.component';
import { RequestComponentComponent } from 'src/components/reception-act/request-component/request-component.component';
import { RequestViewComponent } from 'src/components/reception-act/request-view/request-view.component';
import { UploadFilesComponent } from 'src/components/reception-act/upload-files/upload-files.component';
import { ViewerComponentComponent } from 'src/components/reception-act/viewer-component/viewer-component.component';
// Modals
import { EmployeeAdviserComponent } from 'src/modals/reception-act/employee-adviser/employee-adviser.component';
import { EmployeeGradeComponent } from 'src/modals/reception-act/employee-grade/employee-grade.component';
import { EnglishComponent } from 'src/modals/reception-act/english/english.component';
import { IntegrantsComponentComponent } from 'src/modals/reception-act/integrants-component/integrants-component.component';
import { NewGradeComponent } from 'src/modals/reception-act/new-grade/new-grade.component';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { ReleaseCheckComponent } from 'src/modals/reception-act/release-check/release-check.component';
import { ReleaseComponentComponent } from 'src/modals/reception-act/release-component/release-component.component';
import { RequestModalComponent } from 'src/modals/reception-act/request-modal/request-modal.component';
import { SteepComponentComponent } from 'src/modals/reception-act/steep-component/steep-component.component';

// Services
import { RequestService } from 'src/services/reception-act/request.service';
// Providers
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';

// Graduation module
// Pages
import { GraduationEventsPageComponent } from 'src/pages/graduation/graduation-events-page/graduation-events-page.component';
import { ListGraduatesPageComponent } from 'src/pages/graduation/list-graduates-page/list-graduates-page.component';
import { LoaderDataGraduationPageComponent } from 'src/pages/graduation/loader-data-graduation-page/loader-data-graduation-page.component';
import {
  RegisterEmailgraduationPageComponent
} from 'src/pages/graduation/register-emailgraduation-page/register-emailgraduation-page.component';
import { SurveyFindPageComponent } from 'src/pages/graduation/survey-find-page/survey-find-page.component';
import { SurveyGraduatesPageComponent } from 'src/pages/graduation/survey-graduates-page/survey-graduates-page.component';
import { SurveyListPageComponent } from 'src/pages/graduation/survey-list-page/survey-list-page.component';
import { SurveyPageComponent } from 'src/pages/graduation/survey-page/survey-page.component';
import { SurveyQuestionsPageComponent } from 'src/pages/graduation/survey-questions-page/survey-questions-page.component';
import { SurveyRegisterPageComponent } from 'src/pages/graduation/survey-register-page/survey-register-page.component';
// Pipes
import { FilterPipe } from 'src/pages/graduation/list-graduates-page/filter.pipe';
// Services
import { FirebaseService } from 'src/services/graduation/firebase.service';
// Providers
import { GraduationProvider } from 'src/providers/graduation/graduation.prov';

// Shared
// Components
import { LoaderComponent } from 'src/components/shared/loader/loader.component';
// Modals
import { ConfirmDialogComponent } from 'src/modals/shared/confirm-dialog/confirm-dialog.component';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
// Providers
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { CareerProvider } from 'src/providers/shared/career.prov';

@NgModule({
  declarations: [
    // App module
    // Pages
    AppComponent,
    HomePageComponent,
    LoginPageComponent,
    // Components
    HomeHeaderComponent,
    LoginHeaderComponent,
    SidebarContentComponent,

    // Credentials module
    // Pages
    CardEmployeePageComponent,
    LoaderDataCredentialsPageComponent,
    OneStudentPageComponent,
    StudentPageComponent,

    // Inscriptions module
    // Pages
    InscriptionsPageComponent,
    InscriptionsMainPageComponent,
    RegisterStudentPageComponent,
    WizardInscriptionPageComponent,
    ContractStudentPageComponent,
    InscriptionsUploadFilesPageComponent,
    ProfileInscriptionPageComponent,
    SecretaryInscriptionPageComponent,
    //Modals
    NewPeriodComponent,
    ReviewExpedientComponent,
    ExpedientHistoryComponent,
    // Reception act module
    // Pages
    DocumentReviewComponent,
    GradePageComponent,
    ProgressPageComponent,
    TitulacionPageComponent,
    VinculacionPageComponent,
    DocumentsValidComponent,
    ExpedienteComponent,
    // Components
    ProcessComponentComponent,
    RequestComponentComponent,
    RequestViewComponent,
    UploadFilesComponent,
    ViewerComponentComponent,
    // Modals
    EmployeeAdviserComponent,
    EmployeeGradeComponent,
    EnglishComponent,
    IntegrantsComponentComponent,
    NewGradeComponent,
    ObservationsComponentComponent,
    ReleaseComponentComponent,
    RequestModalComponent,
    SteepComponentComponent,
    
    // Graduation module
    // Pages
    GraduationEventsPageComponent,
    ListGraduatesPageComponent,
    LoaderDataGraduationPageComponent,
    RegisterEmailgraduationPageComponent,
    SurveyFindPageComponent,
    SurveyGraduatesPageComponent,
    SurveyListPageComponent,
    SurveyPageComponent,
    SurveyQuestionsPageComponent,
    SurveyRegisterPageComponent,
    // Pipes
    FilterPipe,

    // Shared
    // Components
    LoaderComponent,
    // Modals
    ConfirmDialogComponent,
    ExtendViewerComponent,
    DocumentReviewComponent,
    ExpedienteComponent,
    ReleaseCheckComponent,
    ResumeStudentPageComponent,
    ConfirmationStudentPageComponent,
  ],
  imports: [
    // Angular
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    BrowserAnimationsModule,
    BrowserModule,
    CdkStepperModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    ReactiveFormsModule,

    // Angular2
    HotkeyModule.forRoot(),
    SimpleNotificationsModule.forRoot(),

    // Material
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFileUploadModule ,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatProgressBarModule,
    MatExpansionModule,
    // Ngx
    ImageCropperModule,
    NgxExtendedPdfViewerModule,
    NgxPaginationModule,
    NgxSmartModalModule.forRoot(),
    DropzoneModule,

    // Others
    AngularFontAwesomeModule,
    AppRoutingModule,
    CustomFormsModule,
    NgbModule.forRoot(),
    SidebarModule.forRoot(),    
  ],
  providers: [
    // App module
    // Providers
    Api,
    UserProvider,
    AngularFirestore,
    AngularFirestoreModule,
    // Services
    CookieService,
    CookiesService,
    FormErrorsService,
    ImageToBase64Service,
    NotificationsServices,

    // Inscriptions module
    // Providers
    InscriptionsProvider,
    //services
    WizardService,
    UploadFilesService,

    // Reception act module
    // Providers
    RequestProvider,
    sourceDataProvider,
    // Services
    RequestService,

    // Graduation module
    // Providers
    GraduationProvider,
    // Services
    FirebaseService,

    // Shared
    // Providers
    EmployeeProvider,
    StudentProvider,
    CareerProvider,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
  ],
  entryComponents: [
    // Reception act module
    // Pages
    DocumentReviewComponent,
    // Modals
    EmployeeAdviserComponent,
    EmployeeGradeComponent,
    EnglishComponent,
    IntegrantsComponentComponent,
    NewGradeComponent,
    ObservationsComponentComponent,
    ReleaseComponentComponent,
    RequestModalComponent,
    SteepComponentComponent,
    ReleaseCheckComponent,
    
    //inscriptions
    //Modals
    NewPeriodComponent,
    ReviewExpedientComponent,
    ExpedientHistoryComponent,

    // Shared
    // Modals
    ConfirmDialogComponent,
    ExtendViewerComponent,
    DocumentReviewComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
