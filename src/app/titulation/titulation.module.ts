import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { ErrorStateMatcher, MatNativeDateModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { BookProvider } from 'src/app/providers/reception-act/book.prov';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { sourceDataProvider } from 'src/app/providers/reception-act/sourceData.prov';
import { CareerProvider } from 'src/app/providers/shared/career.prov';
import {DenyDayProvider } from '../providers/reception-act/denyDays.prov';

// Services
import { RequestService } from 'src/app/services/reception-act/request.service';
import { DepartmentProvider } from 'src/app/providers/shared/department.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { environment } from 'src/environments/environment';
import { CommonsModule } from '../commons/commons.module';
import { DocumentTypePipe } from '../pipes/doumentType.pipe';
import { SafePipe } from '../pipes/safePipe.pipe';
import { ESignatureProvider } from '../providers/electronic-signature/eSignature.prov';
import { FirebaseService } from '../services/graduation/firebase.service';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { ActNotificacionComponent } from './act-notificacion/act-notificacion.component';
import { BookComponent } from './book/book.component';
import { ChangeJuryComponent } from './change-jury/change-jury.component';
import { DiaryComponent } from './diary/diary.component';
import { DocumentReviewComponent } from './document-review/document-review.component';
import { DocumentsValidComponent } from './documents-valid/documents-valid.component';
import { EmployeeAdviserComponent } from './employee-adviser/employee-adviser.component';
import { EnglishComponent } from './english/english.component';
import { ExpedientDocumentsComponent } from './expedient-documents/expedient-documents.component';
import { ExpedientComponent } from './expedient/expedient.component';
import { IntegrantsComponentComponent } from './integrants-component/integrants-component.component';
import { ListBooksPagesComponent } from './list-books-pages/list-books-pages.component';
import { NewBookComponent } from './new-book/new-book.component';
import { NewEventComponent } from './new-event/new-event.component';
import { NewTitleComponent } from './new-title/new-title.component';
import { ObservationsComponentComponent } from './observations-component/observations-component.component';
import { ProcessComponentComponent } from './process-component/process-component.component';
import { ProgressPageComponent } from './progress-page/progress-page.component';
import { RangeModalComponent } from './range-modal/range-modal.component';
import { RangePageComponent } from './range-page/range-page.component';
import { ReleaseCheckComponent } from './release-check/release-check.component';
import { ReleaseComponentComponent } from './release-component/release-component.component';
import { RequestComponentComponent } from './request-component/request-component.component';
import { RequestModalComponent } from './request-modal/request-modal.component';
import { RequestViewComponent } from './request-view/request-view.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SteepComponentComponent } from './steep-component/steep-component.component';
import { StepperDocumentComponent } from './stepper-document/stepper-document.component';
import { TitulacionPageComponent } from './titulacion-page/titulacion-page.component';
import { TitulationProgressComponent } from './titulation-progress/titulation-progress.component';
import { TitulationRoutingModule } from './titulation-routing.module';
import { UpdateBookComponent } from './update-book/update-book.component';
import { UploadDeliveredComponent } from './upload-delivered/upload-delivered.component';
import { UploadFileTitledComponent } from './upload-file-titled/upload-file-titled.component';
import { UploadFilesComponent } from './upload-files/upload-files.component';
import { ViewAppointmentPageComponent } from './view-appointment-page/view-appointment-page.component';
import { ViewMoreComponent } from './view-more/view-more.component';
import { ViewerComponentComponent } from './viewer-component/viewer-component.component';
import { VinculacionPageComponent } from './vinculacion-page/vinculacion-page.component';
import { RangeProvider } from '../providers/reception-act/range.prov';

@NgModule({
  imports: [
    CommonsModule,
    TitulationRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    MatCardModule,
    MatStepperModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    ContextMenuModule.forRoot(),
    MatBadgeModule,
    MatDialogModule,
    MatRadioModule,
    MatInputModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule,
    NgxExtendedPdfViewerModule,
    MatChipsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatNativeDateModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
  ],
  declarations: [
    TitulacionPageComponent,
    VinculacionPageComponent,
    DiaryComponent,
    ViewAppointmentPageComponent,
    ProgressPageComponent,
    ListBooksPagesComponent,
    ActNotificacionComponent,
    BookComponent,
    ChangeJuryComponent,
    DocumentReviewComponent,
    DocumentsValidComponent,
    EmployeeAdviserComponent,
    EnglishComponent,
    ExpedientDocumentsComponent,
    IntegrantsComponentComponent,
    NewBookComponent,
    NewEventComponent,
    NewTitleComponent,
    ObservationsComponentComponent,
    ProcessComponentComponent,
    RangeModalComponent,
    RangePageComponent,
    ReleaseCheckComponent,
    ReleaseComponentComponent,
    RequestComponentComponent,
    RequestModalComponent,
    RequestViewComponent,
    ScheduleComponent,
    SteepComponentComponent,
    StepperDocumentComponent,
    TitulationProgressComponent,
    UpdateBookComponent,
    UploadDeliveredComponent,
    UploadFileTitledComponent,
    UploadFilesComponent,
    ViewMoreComponent,
    ViewerComponentComponent,
    ExpedientComponent,
    DocumentTypePipe,
    SafePipe,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    DatePipe,
    RequestProvider,
    ImageToBase64Service,
    StudentProvider,
    RequestService,
    BookProvider,
    AngularFirestore,
    AngularFirestoreModule,
    FirebaseService,
    CareerProvider,
    InscriptionsProvider,
    ESignatureProvider,
    sourceDataProvider,
    DepartmentProvider,
    RangeProvider,
    DenyDayProvider,
  ],
  entryComponents: [
    ObservationsComponentComponent,
    ExpedientDocumentsComponent,
    ActNotificacionComponent,
    BookComponent,
    ChangeJuryComponent,
    DocumentReviewComponent,
    EmployeeAdviserComponent,
    EnglishComponent,
    IntegrantsComponentComponent,
    NewBookComponent,
    NewEventComponent,
    NewTitleComponent,
    RangeModalComponent,
    ReleaseCheckComponent,
    ReleaseComponentComponent,
    RequestModalComponent,
    SteepComponentComponent,
    StepperDocumentComponent,
    UpdateBookComponent,
    UploadDeliveredComponent,
    ViewMoreComponent,
    ExpedientComponent,
  ]
})
export class TitulationModule { }
