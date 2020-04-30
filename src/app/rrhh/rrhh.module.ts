import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from 'src/app/commons/commons.module';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {
  MatButtonModule,
  MatAutocompleteModule,
  MatExpansionModule,
  MatSlideToggleModule,
  MatDatepickerModule,
  MatSelectModule,
  MatRadioModule,
  MatNativeDateModule,
  ErrorStateMatcher,
} from '@angular/material';

import { RrhhRoutingModule } from './rrhh-routing.module';
import { DepartmentsAdminPageComponent } from './departments-admin-page/departments-admin-page.component';
import { PositionsAdminPageComponent } from './positions-admin-page/positions-admin-page.component';
import { EmployeePageComponent } from './employee-page/employee-page.component';
import { GradePageComponent } from './grade-page/grade-page.component';
import { ElectronicSignatureComponent } from './electronic-signature/electronic-signature.component';
import { DocumentsAssignPageComponent } from './documents-assign-page/documents-assign-page.component';
import { DocumentsAdminPageComponent } from './documents-admin-page/documents-admin-page.component';
import { UploadEmployeesCsvComponent } from './upload-employees-csv/upload-employees-csv.component';
import { NewPositionComponent } from './new-position/new-position.component';
import { PositionsHistoryComponent } from './positions-history/positions-history.component';
import { NewGradeComponent } from './new-grade/new-grade.component';
import { EmployeeGradeComponent } from './employee-grade/employee-grade.component';

// Providers
import { ESignatureProvider } from '../providers/electronic-signature/eSignature.prov';
import { DepartmentProvider } from '../providers/shared/department.prov';
import { sourceDataProvider } from '../providers/reception-act/sourceData.prov';
import { RoleProvider } from '../providers/app/role.prov';
import { CareerProvider } from '../providers/shared/career.prov';
import { DocumentProvider } from '../providers/shared/document.prov';

// Services
import { ErrorMatcher } from '../services/shared/ErrorMatcher';

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    RrhhRoutingModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatSlideToggleModule,
    NgbModule.forRoot(),
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatNativeDateModule,
  ],
  declarations: [
    DepartmentsAdminPageComponent,
    DocumentsAdminPageComponent,
    DocumentsAssignPageComponent,
    ElectronicSignatureComponent,
    GradePageComponent,
    EmployeePageComponent,
    PositionsAdminPageComponent,
    UploadEmployeesCsvComponent,
    NewPositionComponent,
    PositionsHistoryComponent,
    NewGradeComponent,
    EmployeeGradeComponent,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    ESignatureProvider,
    DepartmentProvider,
    sourceDataProvider,
    RoleProvider,
    CareerProvider,
    DocumentProvider,
  ],
  exports: [PositionsAdminPageComponent],
  entryComponents: [
    UploadEmployeesCsvComponent,
    NewPositionComponent,
    PositionsHistoryComponent,
    NewGradeComponent,
    EmployeeGradeComponent,
  ]
})
export class RrhhModule { }
