import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatNativeDateModule } from '@angular/material';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonsModule } from 'src/app/commons/commons.module';
import { RoleProvider } from '../providers/app/role.prov';
import { ESignatureProvider } from '../providers/electronic-signature/eSignature.prov';
import { sourceDataProvider } from '../providers/reception-act/sourceData.prov';
import { CareerProvider } from '../providers/shared/career.prov';
import { DepartmentProvider } from '../providers/shared/department.prov';
import { DocumentProvider } from '../providers/shared/document.prov';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { DepartmentsAdminPageComponent } from './departments-admin-page/departments-admin-page.component';
import { DocumentsAdminPageComponent } from './documents-admin-page/documents-admin-page.component';
import { DocumentsAssignPageComponent } from './documents-assign-page/documents-assign-page.component';
import { ElectronicSignatureComponent } from './electronic-signature/electronic-signature.component';
import { EmployeeGradeComponent } from './employee-grade/employee-grade.component';
import { EmployeePageComponent } from './employee-page/employee-page.component';
import { GradePageComponent } from './grade-page/grade-page.component';
import { NewGradeComponent } from './new-grade/new-grade.component';
import { NewPositionComponent } from './new-position/new-position.component';
import { PositionsAdminPageComponent } from './positions-admin-page/positions-admin-page.component';
import { PositionsHistoryComponent } from './positions-history/positions-history.component';
import { RrhhRoutingModule } from './rrhh-routing.module';
import { UploadEmployeesCsvComponent } from './upload-employees-csv/upload-employees-csv.component';

@NgModule({
  imports: [
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
