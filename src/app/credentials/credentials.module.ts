import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HotkeyModule } from 'angular2-hotkeys';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CommonsModule } from 'src/app/commons/commons.module';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { CareerProvider } from '../providers/shared/career.prov';
import { StudentProvider } from '../providers/shared/student.prov';
import { FormErrorsService } from '../services/app/forms.errors.service';
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { CardEmployeePageComponent } from './card-employee-page/card-employee-page.component';
import { CredentialsRoutingModule } from './credentials-routing.module';
import { LoaderDataCredentialsPageComponent } from './loader-data-credentials-page/loader-data-credentials-page.component';
import { OneStudentPageComponent } from './one-student-page/one-student-page.component';
import { StudentPageComponent } from './student-page/student-page.component';

@NgModule({
  imports: [
    CommonsModule,
    CredentialsRoutingModule,
    ImageCropperModule,
    AngularFontAwesomeModule,
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
