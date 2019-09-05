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

// Pages
import { LoginPageComponent } from '../pages/login-page/login-page.component';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { StudentPageComponent } from '../pages/student-page/student-page.component';
import { OneStudentPageComponent } from '../pages/one-student-page/one-student-page.component';
import { CardEmployeePageComponent } from '../pages/card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from '../pages/loader-data-credentials-page/loader-data-credentials-page.component';
import { GradePageComponent } from 'src/pages/grade-page/grade-page.component';
import { VinculacionPageComponent } from 'src/pages/vinculacion-page/vinculacion-page.component';
import { TitulacionPageComponent } from 'src/pages/titulacion-page/titulacion-page.component';

// Components
import { LoginHeaderComponent } from '../components/login-header/login-header.component';
import { HomeHeaderComponent } from '../components/home-header/home-header.component';
import { SidebarContentComponent } from '../components/sidebar-content/sidebar-content.component';
import { RequestComponentComponent } from 'src/components/request-component/request-component.component';
import { ViewerComponentComponent } from 'src/components/viewer-component/viewer-component.component';
import { ProcessComponentComponent } from 'src/components/process-component/process-component.component';

//Modals
import { NewGradeComponent } from 'src/modals/new-grade/new-grade.component';
import { EmployeeGradeComponent } from 'src/modals/employee-grade/employee-grade.component';
import { EnglishComponent } from 'src/modals/english/english.component';
import { RequestModalComponent } from 'src/modals/request-modal/request-modal.component';
// Services
import { CookiesService } from '../services/cookie.service';
import { FormErrorsService } from '../services/forms.errors.service';
import { NotificationsServices } from '../services/notifications.service';
import { ImageToBase64Service } from '../services/img.to.base63.service';

// Providers
import { Api } from '../providers/api.prov';
import { UserProvider } from '../providers/user.prov';
import { StudentProvider } from '../providers/student.prov';
import { EmployeeProvider } from '../providers/employee.prov';
import { LoaderComponent } from '../components/shared/loader/loader.component';
import { sourceDataProvider } from 'src/providers/sourceData.prov';
//Angular Material
import {
  MatListModule, MatButtonModule, MatMenuModule,
  MatFormFieldModule, MatStepperModule, MatInputModule,
  MatCardModule, MatIconModule, MAT_DIALOG_DEFAULT_OPTIONS,
  MatCheckboxModule, MatProgressBarModule, MatGridListModule,
  MatTableModule, MatPaginatorModule, MatDialogModule,
  MatSidenavModule, MatToolbarModule,MatButtonToggleModule,MatSlideToggleModule,
  MatSnackBarModule
}from '@angular/material';  

import {MatFileUploadModule } from 'mat-file-upload'; 
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
// import { TreetableModule } from 'ng-material-treetable';
//Routes
import { AppRoutingModule } from 'src/app-routing.module';
import { EmployeeAdviserComponent } from 'src/components/employee-adviser/employee-adviser.component';
import { ObservationsComponentComponent } from 'src/components/observations-component/observations-component.component';
import { IntegrantsComponentComponent } from 'src/components/integrants-component/integrants-component.component';
import { RequestProvider } from 'src/providers/request.prov';
import { ProgressPageComponent } from 'src/pages/progress-page/progress-page.component';


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
    RequestModalComponent
  ],
  imports: [
    BrowserModule,
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
    MatButtonModule,
    MatStepperModule,
    MatFormFieldModule,
    CdkStepperModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatListModule,    
    MatCheckboxModule,
    MatProgressBarModule, 
    MatGridListModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatDialogModule,
    MatSidenavModule, 
    MatToolbarModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    AppRoutingModule,  
    NgxSmartModalModule.forRoot(),
    MatFileUploadModule ,
    MatSnackBarModule    
    // TreetableModule  
  ],
  providers: [
    CookieService,
    CookiesService,
    FormErrorsService,
    NotificationsServices,
    ImageToBase64Service,    
    Api,
    UserProvider,
    StudentProvider,
    EmployeeProvider,
    sourceDataProvider,            
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    RequestProvider    
  ],
  entryComponents:[
    EnglishComponent,
    NewGradeComponent,
    EmployeeGradeComponent,    
    RequestComponentComponent,
    EmployeeAdviserComponent,
    ObservationsComponentComponent,
    IntegrantsComponentComponent,
    RequestModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
