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
import {HotkeyModule} from 'angular2-hotkeys';

// Pages
import { LoginPageComponent } from '../pages/login-page/login-page.component';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { StudentPageComponent } from '../pages/student-page/student-page.component';
import { OneStudentPageComponent } from '../pages/one-student-page/one-student-page.component';
import { CardEmployeePageComponent } from '../pages/card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from '../pages/loader-data-credentials-page/loader-data-credentials-page.component';


// Components
import { LoginHeaderComponent } from '../components/login-header/login-header.component';
import { HomeHeaderComponent } from '../components/home-header/home-header.component';


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


const appRouters: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'student', component: StudentPageComponent, pathMatch: 'full' },
  { path: 'employeeCard', component: CardEmployeePageComponent, pathMatch: 'full' },
  { path: 'loaderDataCredentials', component: LoaderDataCredentialsPageComponent, pathMatch: 'full' },
  { path: 'oneStudentPage', component: OneStudentPageComponent, pathMatch: 'full' },
];

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
    LoaderDataCredentialsPageComponent
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
    RouterModule.forRoot(appRouters),
    SimpleNotificationsModule.forRoot(),
    ImageCropperModule,
    BrowserAnimationsModule
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
    EmployeeProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
