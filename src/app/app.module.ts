import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ErrorStateMatcher } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SidebarModule } from 'ng-sidebar';
import { CookieService } from 'ngx-cookie-service';
import { LoadingBarModule } from 'ngx-loading-bar';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SelectPositionComponent } from 'src/app/commons/select-position/select-position.component';
import { Api } from 'src/app/providers/app/api.prov';
import { UserProvider } from 'src/app/providers/app/user.prov';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { PositionProvider } from 'src/app/providers/shared/position.prov';


import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';

import { CookiesService } from 'src/app/services/app/cookie.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { Storage } from 'src/app/services/app/storage.service';
import { CurrentPositionService } from 'src/app/services/shared/current-position.service';
import { ErrorMatcher } from 'src/app/services/shared/ErrorMatcher';
import { RoleService } from 'src/app/services/shared/role.service';
import { WebSocketService } from 'src/app/services/app/web-socket.service';
import { AppComponent } from './app.component';
import { CommonsModule } from './commons/commons.module';
import { LoaderComponent } from './commons/loader/loader.component';
import { LockSessionComponent } from './commons/lock-session/lock-session.component';
import { SidebarContentComponent } from './commons/sidebar-content/sidebar-content.component';
import { HomeHeaderComponent } from './home/home-header/home-header.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { LoginHeaderComponent } from './login/login-header/login-header.component';
import { LoginPageComponent } from './login/login-page/login-page.component';
import { ESignatureProvider } from './providers/electronic-signature/eSignature.prov';
registerLocaleData(localeEs);
import { getSpanishPaginatorIntl } from 'src/app/services/shared/mat-paginator-labels';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RequestProvider } from './providers/reception-act/request.prov';

@NgModule({
  
  declarations: [
    AppComponent,
    HomeHeaderComponent,
    HomePageComponent,
    LoginHeaderComponent,
    LoginPageComponent,
    SidebarContentComponent,
    LockSessionComponent,
    SelectPositionComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    SidebarModule.forRoot(),
    AppRoutingModule,
    CommonsModule,

    // Angular
    HttpClientModule,
    HttpModule,

    // Material
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,

    // Angular 2
    SimpleNotificationsModule.forRoot(),

    // Ngx
    LoadingBarModule,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    // Ngx
    CookieService,

    // Providers
    Api,
    EmployeeProvider,
    UserProvider,
    PositionProvider,
    ESignatureProvider,
    EnglishStudentProvider,

    // Services
    CurrentPositionService,
    CookiesService,
    NotificationsServices,
    RoleService,
    Storage,
    WebSocketService,
    RequestProvider
  ],
  entryComponents: [SelectPositionComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
