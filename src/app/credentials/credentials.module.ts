import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from 'src/app/commons/commons.module';

// Angular
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HotkeyModule } from 'angular2-hotkeys';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material';

// Ngx
import { ImageCropperModule } from 'ngx-image-cropper';

// Providers
import { CareerProvider } from '../providers/shared/career.prov';
import { StudentProvider } from '../providers/shared/student.prov';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';

// Services
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { FormErrorsService } from '../services/app/forms.errors.service';

import { CredentialsRoutingModule } from './credentials-routing.module';
import { CardEmployeePageComponent } from './card-employee-page/card-employee-page.component';
import { LoaderDataCredentialsPageComponent } from './loader-data-credentials-page/loader-data-credentials-page.component';
import { OneStudentPageComponent } from './one-student-page/one-student-page.component';
import { StudentPageComponent } from './student-page/student-page.component';

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    CredentialsRoutingModule,
    ImageCropperModule,
    AngularFontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    HotkeyModule.forRoot(),
  ],
  declarations: [
    CardEmployeePageComponent,
    LoaderDataCredentialsPageComponent,
    OneStudentPageComponent,
    StudentPageComponent,
  ],
  providers: [
    StudentProvider,
    ImageToBase64Service,
    FormErrorsService,
    InscriptionsProvider,
    CareerProvider,
  ]
})
export class CredentialsModule { }
