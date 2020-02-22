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
// for HttpClient import:
import { LoadingBarModule,LoadingBarService } from 'ngx-loading-bar';

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
import { NgxQRCodeModule } from 'ngx-qrcode2';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  // url: 'http://localhost:3003/escolares/credenciales/drive/upload/file',
  url: environment.filesURL,
  maxFilesize: 3,
  acceptedFiles: 'application/pdf',
  maxFiles: 1
};

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { ContextMenuModule } from 'ngx-contextmenu';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// Firestore
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
// Material
import {
  ErrorStateMatcher,
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
  MatAutocompleteModule,
  MatBadgeModule
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
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
// App module
// Pages
import { HomePageComponent } from 'src/pages/app/home-page/home-page.component';
import { LoginPageComponent } from 'src/pages/app/login-page/login-page.component';
import { ProfileSettingsComponent } from 'src/pages/app/profile-settings/profile-settings.component';
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
import { InscriptionsUploadFilesPageComponent } from 'src/pages/inscriptions/inscriptions-upload-files-page/inscriptions-upload-files-page.component';
import { ProfileInscriptionPageComponent } from '../pages/inscriptions/profile-inscription-page/profile-inscription-page.component';
import { SecretaryInscriptionPageComponent } from '../pages/inscriptions/secretary-inscription-page/secretary-inscription-page.component';
import { ListProcessStudentComponent } from '../pages/inscriptions/list-process-student/list-process-student.component';
import { ListPendingStudentComponent } from '../pages/inscriptions/list-pending-student/list-pending-student.component';
import { ListAceptStudentComponent } from '../pages/inscriptions/list-acept-student/list-acept-student.component';
// Providers
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
// Pipes
import { FilterPipe as FilterPipeInscriptions } from 'src/pages/inscriptions/secretary-inscription-page/filter.pipe';
//services
import { WizardService } from 'src/services/inscriptions/wizard.service';
import { UploadFilesService } from 'src/services/inscriptions/upload-files.service';
//modals
import { NewPeriodComponent } from 'src/modals/inscriptions/new-period/new-period.component';
import { ReviewExpedientComponent } from 'src/modals/inscriptions/review-expedient/review-expedient.component';
import { ExpedientHistoryComponent } from 'src/modals/inscriptions/expedient-history/expedient-history.component';
import { StudentInformationComponent } from '../modals/inscriptions/student-information/student-information.component';
import { ReviewAnalysisComponent } from '../modals/inscriptions/review-analysis/review-analysis.component';
import { SecretaryAssignmentComponent } from '../modals/inscriptions/secretary-assignment/secretary-assignment.component';
import { ReviewCredentialsComponent } from '../modals/inscriptions/review-credentials/review-credentials.component';

import { DocumentsHelpComponent } from 'src/modals/inscriptions/documents-help/documents-help.component';

// Reception act module
// Pages
import { DocumentsValidComponent } from 'src/pages/reception-act/documents-valid/documents-valid.component';
import { GradePageComponent } from 'src/pages/reception-act/grade-page/grade-page.component';
import { ProgressPageComponent } from 'src/pages/reception-act/progress-page/progress-page.component';
import { TitulacionPageComponent } from 'src/pages/reception-act/titulacion-page/titulacion-page.component';
import { VinculacionPageComponent } from 'src/pages/reception-act/vinculacion-page/vinculacion-page.component';
import { ListBooksPagesComponent } from '../pages/reception-act/list-books-pages/list-books-pages.component';
// Components
import { ProcessComponentComponent } from 'src/components/reception-act/process-component/process-component.component';
import { RequestComponentComponent } from 'src/components/reception-act/request-component/request-component.component';
import { RequestViewComponent } from 'src/components/reception-act/request-view/request-view.component';
import { UploadFilesComponent } from 'src/components/reception-act/upload-files/upload-files.component';
import { ViewerComponentComponent } from 'src/components/reception-act/viewer-component/viewer-component.component';
import { ProgessComponent } from 'src/components/reception-act/progess/progess.component';
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
import { BookComponent } from 'src/modals/reception-act/book/book.component';
import { NewBookComponent } from 'src/modals/reception-act/new-book/new-book.component';
import { ExpedientComponent } from 'src/modals/reception-act/expedient/expedient.component';
import { DocumentReviewComponent } from 'src/modals/reception-act/document-review/document-review.component';
// Services
import { RequestService } from 'src/services/reception-act/request.service';
// Providers
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { BookProvider } from 'src/providers/reception-act/book.prov';

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
import { MyGraduationComponent } from 'src/pages/graduation/my-graduation/my-graduation.component';
// Pipes
import { FilterPipe } from 'src/pages/graduation/list-graduates-page/filter.pipe';
// Services
import { FirebaseService } from 'src/services/graduation/firebase.service';
// Providers
import { GraduationProvider } from 'src/providers/graduation/graduation.prov';
// Modals
import { NewEventComponent as NewGraduationEventComponent } from 'src/modals/graduation/new-event/new-event.component';

// Electronic signature module
// Pages
import { DepartmentsAdminPageComponent } from 'src/pages/electronic-signature/departments-admin-page/departments-admin-page.component';
import { DocumentsAdminPageComponent } from 'src/pages/electronic-signature/documents-admin-page/documents-admin-page.component';
import { DocumentsAssignPageComponent } from 'src/pages/electronic-signature/documents-assign-page/documents-assign-page.component';
import { ElectronicSignatureComponent } from 'src/pages/electronic-signature/electronic-signature/electronic-signature.component';
import { EmployeePageComponent } from 'src/pages/electronic-signature/employee-page/employee-page.component';
import { PositionsAdminPageComponent } from 'src/pages/electronic-signature/positions-admin-page/positions-admin-page.component';
// Modals
import { NewPositionComponent } from 'src/modals/electronic-signature/new-position/new-position.component';
import { PositionsHistoryComponent } from 'src/modals/electronic-signature/positions-history/positions-history.component';
import { SelectPositionComponent } from 'src/modals/electronic-signature/select-position/select-position.component';
import { UploadEmployeesCsvComponent } from 'src/modals/electronic-signature/upload-employees-csv/upload-employees-csv.component';
// Providers
import { ESignatureProvider } from 'src/providers/electronic-signature/eSignature.prov';

// Shared
// Components
import { LoaderComponent } from 'src/components/shared/loader/loader.component';
// Modals
import { ConfirmDialogComponent } from 'src/modals/shared/confirm-dialog/confirm-dialog.component';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { LoadCsvDataComponent } from 'src/modals/shared/load-csv-data/load-csv-data.component';
// Providers
import { DepartmentProvider } from 'src/providers/shared/department.prov';
import { DocumentProvider } from 'src/providers/shared/document.prov';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { PositionProvider } from 'src/providers/shared/position.prov';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { CareerProvider } from 'src/providers/shared/career.prov';
// Services
import { ErrorMatcher } from 'src/services/shared/ErrorMatcher';
import { CurrentPositionService } from 'src/services/shared/current-position.service';

import { ScheduleComponent } from '../components/reception-act/schedule/schedule.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { CustomDateFormatter } from 'src/providers/reception-act/custom-date-formatter.provider';
import { DiaryComponent } from '../pages/reception-act/diary/diary.component';
import { RangePageComponent } from '../pages/reception-act/range-page/range-page.component';
import { RangeModalComponent } from '../modals/reception-act/range-modal/range-modal.component';
import { RangeProvider } from 'src/providers/reception-act/range.prov';
import { NewEventComponent } from '../modals/reception-act/new-event/new-event.component';
import { ViewMoreComponent } from '../modals/reception-act/view-more/view-more.component';
import { StepperDocumentComponent } from '../modals/reception-act/stepper-document/stepper-document.component';
import { UploadDeliveredComponent } from '../modals/reception-act/upload-delivered/upload-delivered.component';
import { ViewAppointmentPageComponent } from '../pages/reception-act/view-appointment-page/view-appointment-page.component';
import { UploadFileTitledComponent } from '../components/reception-act/upload-file-titled/upload-file-titled.component';
import { ActNotificacionComponent } from '../modals/reception-act/act-notificacion/act-notificacion.component';
import { NewTitleComponent } from '../modals/reception-act/new-title/new-title.component';
import { SafePipe } from 'src/pipes/safePipe.pipe';
import { ChangeJuryComponent } from 'src/modals/reception-act/change-jury/change-jury.component';
import { DocumentTypePipe } from 'src/pipes/doumentType.pipe';
registerLocaleData(localeEs);

@NgModule({
  declarations: [
    // App module
    // Pages
    AppComponent,
    HomePageComponent,
    LoginPageComponent,
    ProfileSettingsComponent,
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
    ListProcessStudentComponent,
    ListPendingStudentComponent,
    ListAceptStudentComponent,
    //Modals
    NewPeriodComponent,
    ReviewExpedientComponent,
    ExpedientHistoryComponent,
    StudentInformationComponent,
    ReviewAnalysisComponent,
    SecretaryAssignmentComponent,
    ReviewCredentialsComponent,
    //Pipes
    FilterPipeInscriptions,

    DocumentsHelpComponent,
    // Reception act module
    // Pages    
    GradePageComponent,
    ProgressPageComponent,
    TitulacionPageComponent,
    VinculacionPageComponent,
    DocumentsValidComponent,    
    ListBooksPagesComponent,
    // Components
    ProcessComponentComponent,
    RequestComponentComponent,
    RequestViewComponent,
    UploadFilesComponent,
    ViewerComponentComponent,
    ProgessComponent,
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
    NewTitleComponent,
    BookComponent,
    NewBookComponent,
    ExpedientComponent,
    DocumentReviewComponent,
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
    MyGraduationComponent,
    // Pipes
    FilterPipe,
    // Modals
    NewGraduationEventComponent,

    // Electronic signature module
    // Pages
    DepartmentsAdminPageComponent,
    DocumentsAdminPageComponent,
    DocumentsAssignPageComponent,
    ElectronicSignatureComponent,
    EmployeePageComponent,
    PositionsAdminPageComponent,
    // Modals
    NewPositionComponent,
    PositionsHistoryComponent,
    SelectPositionComponent,
    UploadEmployeesCsvComponent,

    // Shared
    // Components
    LoaderComponent,
    // Modals
    ConfirmDialogComponent,
    ExtendViewerComponent,
    LoadCsvDataComponent,     
    ReleaseCheckComponent,
    ResumeStudentPageComponent,
    ConfirmationStudentPageComponent,
    ScheduleComponent,
    DiaryComponent,
    RangePageComponent,
    RangeModalComponent,
    NewEventComponent,
    ViewMoreComponent,
    StepperDocumentComponent,
    UploadDeliveredComponent,
    ViewAppointmentPageComponent,
    UploadFileTitledComponent,
    ActNotificacionComponent,

    //Pipes
    SafePipe,
    DocumentTypePipe,
    ChangeJuryComponent,
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
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFileUploadModule,
    MatExpansionModule,
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatGridListModule,

    // Ngx
    ImageCropperModule,
    NgxExtendedPdfViewerModule,
    NgxPaginationModule,
    NgxSmartModalModule.forRoot(),
    DropzoneModule,
    NgxQRCodeModule,

    // Others
    AngularFontAwesomeModule,
    AppRoutingModule,
    CustomFormsModule,
    NgxMaterialTimepickerModule,
    NgbModule.forRoot(),
    SidebarModule.forRoot(),
    SidebarModule.forRoot(),
    ContextMenuModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    LoadingBarModule
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
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

    // Inscriptions
    // Providers
    InscriptionsProvider,
    //services
    WizardService,
    UploadFilesService,

    // Reception act module
    // Providers
    RequestProvider,
    sourceDataProvider,
    RangeProvider,
    BookProvider,
    // Services
    RequestService,

    // Graduation module
    // Providers
    GraduationProvider,
    // Services
    FirebaseService,

    // Electronic signature module
    // Providers
    ESignatureProvider,

    // Shared
    // Providers
    DepartmentProvider,
    DocumentProvider,
    EmployeeProvider,
    PositionProvider,
    StudentProvider,
    CareerProvider,
    CustomDateFormatter,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
    // Services
    CurrentPositionService,
    ErrorMatcher,
    // LoadingBarService
  ],
  entryComponents: [
    // Reception act module
    // Pages    
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
    RangeModalComponent,
    StepperDocumentComponent,
    UploadDeliveredComponent,
    ActNotificacionComponent,
    NewTitleComponent,
    BookComponent,
    NewBookComponent,
    ChangeJuryComponent,
    ExpedientComponent,
    DocumentReviewComponent,
    //inscriptions
    //Modals
    NewPeriodComponent,
    ReviewExpedientComponent,
    ExpedientHistoryComponent,
    StudentInformationComponent,
    ReviewAnalysisComponent,
    SecretaryAssignmentComponent,
    ReviewCredentialsComponent,
    DocumentsHelpComponent,

    // Electronic signature
    // Modals
    NewPositionComponent,
    PositionsHistoryComponent,
    SelectPositionComponent,
    UploadEmployeesCsvComponent,

    // Graduation
    // Modals
    NewGraduationEventComponent,

    // Shared
    // Modals
    ConfirmDialogComponent,
    ExtendViewerComponent,
    LoadCsvDataComponent,    
    NewEventComponent,
    ViewMoreComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
