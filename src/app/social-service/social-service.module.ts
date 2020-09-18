import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialServiceRoutingModule } from './social-service-routing.module';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


// Material
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule, MatPaginatorIntl} from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import {MatPaginatorIntlCro} from './materialConfig/matPaginatorIntlCroClass';
import { ControlStudentsMainPageComponent } from './department/control-students-main-page/control-students-main-page.component';
import {ControlStudentProv} from '../providers/social-service/control-student.prov';
import { SocialServiceMainPageComponent } from './student/social-service-main-page/social-service-main-page.component';
import { SocialServiceInitFormComponent } from './student/social-service-init-form/social-service-init-form.component';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {ImageToBase64Service} from '../services/app/img.to.base63.service';
import {MatNativeDateModule} from '@angular/material';
import { DialogVerificationComponent } from './components/dialog-verification/dialog-verification.component';


@NgModule({
  imports: [
    CommonModule,
    SocialServiceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatStepperModule,
    MatExpansionModule,
    MatListModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatSlideToggleModule,
    NgxExtendedPdfViewerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  declarations: [
    ControlStudentsMainPageComponent,
    SocialServiceMainPageComponent,
    SocialServiceInitFormComponent,
    DialogVerificationComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro },
    ControlStudentProv,
    ImageToBase64Service
  ],
  entryComponents: [DialogVerificationComponent]
})
export class SocialServiceModule { }