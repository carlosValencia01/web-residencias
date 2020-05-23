import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, MatButtonModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material';
// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
// Ngx
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { QuicklinkModule } from 'ngx-quicklink';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ExtendViewerComponent } from './extend-viewer/extend-viewer.component';
import { LoadCsvDataComponent } from './load-csv-data/load-csv-data.component';

@NgModule({
  imports: [
    CommonModule,
    QuicklinkModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LoadCsvDataComponent,
    ExtendViewerComponent,
    ConfirmDialogComponent,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
  ],
  exports: [
    QuicklinkModule,
    LoadCsvDataComponent,
    ExtendViewerComponent,
    ConfirmDialogComponent,
  ],
  entryComponents: [
    LoadCsvDataComponent,
    ExtendViewerComponent,
    ConfirmDialogComponent,
  ]
})
export class CommonsModule { }
