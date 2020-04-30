import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from 'src/app/commons/commons.module';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Ngx
import { NgxPaginationModule } from 'ngx-pagination';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import {
  MatButtonModule,
  MatAutocompleteModule,
  MatSlideToggleModule,
  MatDatepickerModule,
  MatNativeDateModule,
  ErrorStateMatcher,
} from '@angular/material';

import { SettingsRoutingModule } from './settings-routing.module';
import { RrhhModule } from '../rrhh/rrhh.module';
import { RolesAdminComponent } from './roles-admin/roles-admin.component';
import { PermissionsAdminComponent } from './permissions-admin/permissions-admin.component';
import { InscriptionsMainPageComponent } from './inscriptions-main-page/inscriptions-main-page.component';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { SecretaryAssignmentComponent } from './secretary-assignment/secretary-assignment.component';
import { NewPeriodComponent } from './new-period/new-period.component';

// Providers
import { PermissionProvider } from '../providers/app/permission.prov';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { StudentProvider } from '../providers/shared/student.prov';

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    SettingsRoutingModule,
    RrhhModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatChipsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    NgbModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    NgxPaginationModule,
  ],
  declarations: [
    RolesAdminComponent,
    PermissionsAdminComponent,
    InscriptionsMainPageComponent,
    SecretaryAssignmentComponent,
    NewPeriodComponent,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    PermissionProvider,
    InscriptionsProvider,
    StudentProvider,
  ],
  entryComponents: [
    SecretaryAssignmentComponent,
    NewPeriodComponent,
  ]
})
export class SettingsModule { }
