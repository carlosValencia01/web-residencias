import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ng2-validation'

import { CookieService } from 'ngx-cookie-service';
import { SimpleNotificationsModule } from 'angular2-notifications';

// Pages
import { LoginPageComponent } from '../pages/login-page/login-page.component';
import { HomePageComponent } from '../pages/home-page/home-page.component';


// Components
import { LoginHeaderComponent } from '../components/login-header/login-header.component';
import { HomeHeaderComponent } from '../components/home-header/home-header.component';


// Services
import { CookiesService } from '../services/cookie.service';
import { FormErrorsService } from '../services/forms.errors.service';
import { NotificationsServices } from '../services/notifications.service';

// Providers
import { Api } from '../providers/api.prov';
import { UserProvider } from '../providers/user.prov';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    LoginHeaderComponent,
    HomePageComponent,
    HomeHeaderComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    CustomFormsModule,
    SimpleNotificationsModule.forRoot()
  ],
  providers: [
    CookieService,

    CookiesService,
    FormErrorsService,
    NotificationsServices,

    Api,
    UserProvider,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
