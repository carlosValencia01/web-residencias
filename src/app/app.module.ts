// External modules
import { AppRoutingModule } from 'src/app/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SidebarModule } from 'ng-sidebar';
import { CommonsModule } from './commons/commons.module';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

// Angular 2
import { SimpleNotificationsModule } from 'angular2-notifications';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatButtonModule,
} from '@angular/material';

// Ngx
import { CookieService } from 'ngx-cookie-service';
import { LoadingBarModule } from 'ngx-loading-bar';

// Modals
import { SelectPositionComponent } from 'src/app/commons/select-position/select-position.component';

// Providers
import { Api } from 'src/app/providers/app/api.prov';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { UserProvider } from 'src/app/providers/app/user.prov';
import { PositionProvider } from 'src/app/providers/shared/position.prov';

// Services
import { CookiesService } from 'src/app/services/app/cookie.service';
import { CurrentPositionService } from 'src/app/services/shared/current-position.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { RoleService } from 'src/app/services/shared/role.service';
import { Storage } from 'src/app/services/app/storage.service';

// Components
import { AppComponent } from './app.component';
import { HomeHeaderComponent } from './home/home-header/home-header.component';
import { HomePageComponent } from './home/home-page/home-page.component';
import { LoginHeaderComponent } from './login/login-header/login-header.component';
import { LoginPageComponent } from './login/login-page/login-page.component';
import { SidebarContentComponent } from './commons/sidebar-content/sidebar-content.component';
import { LockSessionComponent } from './commons/lock-session/lock-session.component';

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
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    SidebarModule.forRoot(),
    AppRoutingModule,
    CommonsModule,

    // Angular
    FormsModule,
    HttpClientModule,
    HttpModule,
    ReactiveFormsModule,

    // Material
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,

    // Angular 2
    SimpleNotificationsModule.forRoot(),

    // Ngx
    LoadingBarModule,
  ],
  providers: [
    // Ngx
    CookieService,

    // Providers
    Api,
    EmployeeProvider,
    UserProvider,
    PositionProvider,

    // Services
    CurrentPositionService,
    CookiesService,
    NotificationsServices,
    RoleService,
    Storage,
  ],
  entryComponents: [SelectPositionComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
