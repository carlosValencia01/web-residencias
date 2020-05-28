import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatNativeDateModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonsModule } from 'src/app/commons/commons.module';
import { PermissionProvider } from '../providers/app/permission.prov';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { StudentProvider } from '../providers/shared/student.prov';
import { RrhhModule } from '../rrhh/rrhh.module';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { InscriptionsMainPageComponent } from './inscriptions-main-page/inscriptions-main-page.component';
import { NewPeriodComponent } from './new-period/new-period.component';
import { PermissionsAdminComponent } from './permissions-admin/permissions-admin.component';
import { RolesAdminComponent } from './roles-admin/roles-admin.component';
import { SecretaryAssignmentComponent } from './secretary-assignment/secretary-assignment.component';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
  imports: [
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
