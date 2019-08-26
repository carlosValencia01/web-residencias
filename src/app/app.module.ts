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

//Firestore
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/firestore';

import {NgxPaginationModule} from 'ngx-pagination';

import { environment } from '../environments/environment';

//FilterPipe
import { FilterPipe} from '../pages/list-graduates-page/filter.pipe';

// Pages
import { LoginPageComponent } from '../pages/login-page/login-page.component';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { StudentPageComponent } from '../pages/student-page/student-page.component';
import { OneStudentPageComponent } from '../pages/one-student-page/one-student-page.component';
import { CardEmployeePageComponent } from '../pages/card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from '../pages/loader-data-credentials-page/loader-data-credentials-page.component';
import { InscriptionsPageComponent } from '../pages/inscriptions-page/inscriptions-page.component';
import { RegisterEmailgraduationPageComponent } from '../pages/register-emailgraduation-page/register-emailgraduation-page.component';
import { LoaderDataGraduationPageComponent } from '../pages/loader-data-graduation-page/loader-data-graduation-page.component';
import { GraduationEventsPageComponent } from '../pages/graduation-events-page/graduation-events-page.component'

// Components
import { LoginHeaderComponent } from '../components/login-header/login-header.component';
import { HomeHeaderComponent } from '../components/home-header/home-header.component';
import { SidebarContentComponent } from '../components/sidebar-content/sidebar-content.component';



// Services
import { CookiesService } from '../services/cookie.service';
import { FormErrorsService } from '../services/forms.errors.service';
import { NotificationsServices } from '../services/notifications.service';
import { ImageToBase64Service } from '../services/img.to.base63.service';
import { FirebaseService } from '../services/firebase.service';

// Providers
import { Api } from '../providers/api.prov';
import { UserProvider } from '../providers/user.prov';
import { StudentProvider } from '../providers/student.prov';
import { EmployeeProvider } from '../providers/employee.prov';
import { InscriptionsProvider } from '../providers/inscriptions.prov';
import { GraduationProvider } from '../providers/graduation.prov';


import { LoaderComponent } from '../components/shared/loader/loader.component';
import { ListGraduatesPageComponent } from '../pages/list-graduates-page/list-graduates-page.component';


const appRouters: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'student', component: StudentPageComponent, pathMatch: 'full' },
  { path: 'employeeCard', component: CardEmployeePageComponent, pathMatch: 'full' },
  { path: 'loaderDataCredentials', component: LoaderDataCredentialsPageComponent, pathMatch: 'full' },
  { path: 'oneStudentPage', component: OneStudentPageComponent, pathMatch: 'full' },
  { path: 'inscriptions', component: InscriptionsPageComponent, pathMatch: 'full' },
  { path: 'registerGraduate/:eventId', component: RegisterEmailgraduationPageComponent, pathMatch: 'full'},
  { path: 'listGraduates/:eventId', component: ListGraduatesPageComponent, pathMatch: 'full'},
  { path: 'loaderDataGraduation/:eventId', component: LoaderDataGraduationPageComponent, pathMatch: 'full'},
  { path: 'graduationEvents', component: GraduationEventsPageComponent, pathMatch: 'full'},

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
    LoaderDataCredentialsPageComponent,
    SidebarContentComponent,
    InscriptionsPageComponent,
    RegisterEmailgraduationPageComponent,
    ListGraduatesPageComponent,
    LoaderDataGraduationPageComponent,
    GraduationEventsPageComponent,
    FilterPipe
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
    RouterModule.forRoot(appRouters),
    SimpleNotificationsModule.forRoot(),
    ImageCropperModule,
    BrowserAnimationsModule,
    SidebarModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [
    CookieService,
    CookiesService,
    FormErrorsService,
    NotificationsServices,
    ImageToBase64Service,
    FirebaseService,
    Api,
    UserProvider,
    StudentProvider,
    EmployeeProvider,
    InscriptionsProvider,
    GraduationProvider,
    AngularFirestoreModule,
    AngularFirestore
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
