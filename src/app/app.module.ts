import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation';
import { Routes, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HotkeyModule } from 'angular2-hotkeys';
import { SidebarModule } from 'ng-sidebar';
import { NgxPaginationModule } from 'ngx-pagination';

// Firestore
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

// import { NgxPaginationModule } from 'ngx-pagination';

import { environment } from '../environments/environment';

// FilterPipe
import { FilterPipe } from '../pages/list-graduates-page/filter.pipe';

// Material
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
// import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule, MatNativeDateModule, MatRadioModule} from '@angular/material';
import { MatButtonModule } from "@angular/material";

import {MatFileUploadModule } from 'mat-file-upload';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgxSmartModalModule } from 'ngx-smart-modal';
// Pages
import { LoginPageComponent } from '../pages/login-page/login-page.component';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { StudentPageComponent } from '../pages/student-page/student-page.component';
import { OneStudentPageComponent } from '../pages/one-student-page/one-student-page.component';
import { CardEmployeePageComponent } from '../pages/card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from '../pages/loader-data-credentials-page/loader-data-credentials-page.component';
import { InscriptionsPageComponent } from '../pages/inscriptions-page/inscriptions-page.component';
import { AcademicDegreeApplicationPageComponent } from '../pages/academic-degree-application-page/academic-degree-application-page.component';
import { RegisterEmailgraduationPageComponent } from '../pages/register-emailgraduation-page/register-emailgraduation-page.component';
import { LoaderDataGraduationPageComponent } from '../pages/loader-data-graduation-page/loader-data-graduation-page.component';
import { GraduationEventsPageComponent } from '../pages/graduation-events-page/graduation-events-page.component';
import { CoordinationRequestsTablePageComponent } from '../pages/coordination-requests-table-page/coordination-requests-table-page.component';
import { SurveyPageComponent } from '../pages/survey-page/survey-page.component';

import { GradePageComponent } from 'src/pages/grade-page/grade-page.component';
import { VinculacionPageComponent } from 'src/pages/vinculacion-page/vinculacion-page.component';
import { TitulacionPageComponent } from 'src/pages/titulacion-page/titulacion-page.component';

// Components
import { LoginHeaderComponent } from '../components/login-header/login-header.component';
import { HomeHeaderComponent } from '../components/home-header/home-header.component';
import { SidebarContentComponent } from '../components/sidebar-content/sidebar-content.component';
import { AcademicDegreeApplicationFormComponent } from '../components/academic-degree-application-form/academic-degree-application-form.component';
import { GraduateAcademicRecordComponent } from '../pages/graduate-academic-record/graduate-academic-record.component';
import { RequestModalContentComponent } from '../components/request-modal-content/request-modal-content.component';
import { RequestComponentComponent } from 'src/components/request-component/request-component.component';
import { ViewerComponentComponent } from 'src/components/viewer-component/viewer-component.component';
import { ProcessComponentComponent } from 'src/components/process-component/process-component.component';

// Modals
import { NewGradeComponent } from 'src/modals/new-grade/new-grade.component';
import { EmployeeGradeComponent } from 'src/modals/employee-grade/employee-grade.component';
import { EnglishComponent } from 'src/modals/english/english.component';
import { RequestModalComponent } from 'src/modals/request-modal/request-modal.component';

// Services
import { CookiesService } from '../services/cookie.service';
import { SidebarService } from '../services/sidebar.service';
import { FormErrorsService } from '../services/forms.errors.service';
import { NotificationsServices } from '../services/notifications.service';
import { ImageToBase64Service } from '../services/img.to.base63.service';
import { FirebaseService } from '../services/firebase.service';
import { FirebaseStorageService } from '../services/firebase-storage.service';

// Providers
import { Api } from '../providers/api.prov';
import { UserProvider } from '../providers/user.prov';
import { StudentProvider } from '../providers/student.prov';
import { EmployeeProvider } from '../providers/employee.prov';
import { InscriptionsProvider } from '../providers/inscriptions.prov';
import { RequestProvider } from '../providers/request.prov';
import { GraduationProvider } from '../providers/graduation.prov';


import { LoaderComponent } from '../components/shared/loader/loader.component';
import { ListGraduatesPageComponent } from '../pages/list-graduates-page/list-graduates-page.component';
import { SurveyGraduatesPageComponent } from '../pages/survey-graduates-page/survey-graduates-page.component';
import { sourceDataProvider } from 'src/providers/sourceData.prov';


// const appRouters: Routes = [
//   { path: '', component: HomePageComponent, pathMatch: 'full' },
//   { path: 'student', component: StudentPageComponent, pathMatch: 'full' },
//   { path: 'employeeCard', component: CardEmployeePageComponent, pathMatch: 'full' },
//   { path: 'loaderDataCredentials', component: LoaderDataCredentialsPageComponent, pathMatch: 'full' },
//   { path: 'oneStudentPage', component: OneStudentPageComponent, pathMatch: 'full' },
//   { path: 'inscriptions', component: InscriptionsPageComponent, pathMatch: 'full' },
//   { path: 'registerGraduate/:eventId', component: RegisterEmailgraduationPageComponent, pathMatch: 'full' },
//   { path: 'listGraduates/:eventId', component: ListGraduatesPageComponent, pathMatch: 'full' },
//   { path: 'loaderDataGraduation/:eventId/:type', component: LoaderDataGraduationPageComponent, pathMatch: 'full' },
//   { path: 'graduationEvents', component: GraduationEventsPageComponent, pathMatch: 'full' },
//   { path: 'academicDegreeApplication', component: AcademicDegreeApplicationPageComponent, pathMatch: 'full' },
//   { path: 'coordinationRequestsTable', component: CoordinationRequestsTablePageComponent, pathMatch: 'full' },
//   { path: 'chiefAcademicRequestsTable', component: CoordinationRequestsTablePageComponent, pathMatch: 'full' },
//   { path: 'surveyGraduates/:id/:nc', component: SurveyGraduatesPageComponent, pathMatch: 'full' },
//   { path: 'survey/:id/:nc', component: SurveyPageComponent, pathMatch: 'full' },
// ];


// import { TreetableModule } from 'ng-material-treetable';

// Routes
import { AppRoutingModule } from 'src/app-routing.module';
import { EmployeeAdviserComponent } from 'src/components/employee-adviser/employee-adviser.component';
import { ObservationsComponentComponent } from 'src/components/observations-component/observations-component.component';
import { IntegrantsComponentComponent } from 'src/components/integrants-component/integrants-component.component';
import { ProgressPageComponent } from 'src/pages/progress-page/progress-page.component';
import { ConfirmDialogComponent } from 'src/components/confirm-dialog/confirm-dialog.component';
import { SteepComponentComponent } from './steep-component/steep-component.component';
import { RequestViewComponent } from './request-view/request-view.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    LoginHeaderComponent,
    HomePageComponent,
    StudentPageComponent,
    HomeHeaderComponent,
    OneStudentPageComponent,
    LoaderComponent,
    CardEmployeePageComponent,
    LoaderDataCredentialsPageComponent,
    SidebarContentComponent,
    InscriptionsPageComponent,
    AcademicDegreeApplicationPageComponent,
    AcademicDegreeApplicationFormComponent,
    RegisterEmailgraduationPageComponent,
    ListGraduatesPageComponent,
    LoaderDataGraduationPageComponent,
    GraduationEventsPageComponent,
    CoordinationRequestsTablePageComponent,
    FilterPipe,
    GraduateAcademicRecordComponent,
    RequestModalContentComponent,
    SurveyGraduatesPageComponent,
    SurveyPageComponent,
    GradePageComponent,
    EmployeeGradeComponent,
    NewGradeComponent,
    VinculacionPageComponent,
    EnglishComponent,
    TitulacionPageComponent,
    RequestComponentComponent,
    ViewerComponentComponent ,
    ProcessComponentComponent,
    EmployeeAdviserComponent,
    ObservationsComponentComponent,
    IntegrantsComponentComponent,
    ProgressPageComponent,
    RequestModalComponent,
    ConfirmDialogComponent,
    SteepComponentComponent,
    RequestViewComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    NgbModule.forRoot(),
    HttpModule,
    HotkeyModule.forRoot(),
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    CustomFormsModule,
    SimpleNotificationsModule.forRoot(),
    ImageCropperModule,
    BrowserAnimationsModule,
    SidebarModule.forRoot(),
    MatStepperModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,    
    AngularFireStorageModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatMenuModule,
    MatSidenavModule,
    CdkStepperModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonToggleModule,
    AppRoutingModule,
    NgxSmartModalModule.forRoot(),
    MatFileUploadModule ,
    NgxPaginationModule
    // RouterModule.forRoot(appRouters),
    // TreetableModule
  ],
  providers: [
    CookieService,
    CookiesService,
    SidebarService,
    FormErrorsService,
    NotificationsServices,
    ImageToBase64Service,
    FirebaseService,
    FirebaseStorageService,
    Api,
    UserProvider,
    StudentProvider,
    EmployeeProvider,
    InscriptionsProvider,
    RequestProvider,
    GraduationProvider,
    AngularFirestoreModule,
    AngularFirestore,
    sourceDataProvider,   
    RequestProvider,
  ],
  entryComponents: [
    EnglishComponent,
    NewGradeComponent,
    EmployeeGradeComponent,
    RequestComponentComponent,
    EmployeeAdviserComponent,
    ObservationsComponentComponent,
    IntegrantsComponentComponent,
    RequestModalComponent,
    ConfirmDialogComponent,
    SteepComponentComponent,
    GraduateAcademicRecordComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
