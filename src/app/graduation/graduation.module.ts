import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { ErrorStateMatcher, MatNativeDateModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import { environment } from 'src/environments/environment';
import { CommonsModule } from '../commons/commons.module';
import { GraduationProvider } from '../providers/graduation/graduation.prov';
import { StudentProvider } from '../providers/shared/student.prov';
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { GraduationEventsPageComponent } from './graduation-events-page/graduation-events-page.component';
import { GraduationRoutingModule } from './graduation-routing.module';
import { ListGraduatesPageComponent } from './list-graduates-page/list-graduates-page.component';
import { LoaderDataGraduationPageComponent } from './loader-data-graduation-page/loader-data-graduation-page.component';
import { MyGraduationComponent } from './my-graduation/my-graduation.component';
import { NewGraduationEventComponent } from './new-graduation-event/new-graduation-event.component';
import { RegisterEmailgraduationPageComponent } from './register-emailgraduation-page/register-emailgraduation-page.component';
import { SurveyFindPageComponent } from './survey-find-page/survey-find-page.component';
import { SurveyGraduatesPageComponent } from './survey-graduates-page/survey-graduates-page.component';
import { SurveyListPageComponent } from './survey-list-page/survey-list-page.component';
import { SurveyPageComponent } from './survey-page/survey-page.component';
import { SurveyQuestionsPageComponent } from './survey-questions-page/survey-questions-page.component';
import { SurveyRegisterPageComponent } from './survey-register-page/survey-register-page.component';
import { CareerProvider } from '../providers/shared/career.prov';
import { CertificateIneComponent } from './certificate-ine/certificate-ine.component';
import { MyCertificatePageComponent } from './my-certificate-page/my-certificate-page.component';
import { DropzoneConfigInterface, DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: environment.filesGraduationURL,
  maxFilesize: 3,
  acceptedFiles: 'image/jpeg,image/png,application/pdf',
  maxFiles: 1
};
import { ReviewPhotosPaydocModalComponent } from './review-photos-paydoc-modal/review-photos-paydoc-modal.component';
import { SafePipe } from './pipes/safe.pipe';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
@NgModule({
  imports: [
    CommonsModule,
    GraduationRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    NgxPaginationModule,
    NgxQRCodeModule,
    NgbModule.forRoot(),
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatExpansionModule,
    MatMenuModule,
    MatFormFieldModule,
    MatListModule,
    MatRadioModule,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule,
    MatNativeDateModule,
    MatInputModule,
    MatBadgeModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatStepperModule,
    DropzoneModule,
  ],
  declarations: [
    SurveyListPageComponent,
    GraduationEventsPageComponent,
    MyGraduationComponent,
    ListGraduatesPageComponent,
    RegisterEmailgraduationPageComponent,
    LoaderDataGraduationPageComponent,
    SurveyFindPageComponent,
    SurveyRegisterPageComponent,
    SurveyPageComponent,
    SurveyGraduatesPageComponent,
    SurveyQuestionsPageComponent,
    NewGraduationEventComponent,
    CertificateIneComponent,
    MyCertificatePageComponent,
    ReviewPhotosPaydocModalComponent,
    SafePipe
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    },
    AngularFirestore,
    AngularFirestoreModule,
    FirebaseService,
    GraduationProvider,
    ImageToBase64Service,
    StudentProvider,
    CareerProvider,
    InscriptionsProvider,
  ],
  entryComponents: [
    NewGraduationEventComponent,
    ReviewPhotosPaydocModalComponent,
  ]
})
export class GraduationModule { }
