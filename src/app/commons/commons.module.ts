import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Ngx
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { QuicklinkModule } from 'ngx-quicklink';

// Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule, } from '@angular/material';

import { LoaderComponent } from './loader/loader.component';
import { MAT_DIALOG_DEFAULT_OPTIONS, ErrorStateMatcher } from '@angular/material';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { LoadCsvDataComponent } from './load-csv-data/load-csv-data.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ExtendViewerComponent } from './extend-viewer/extend-viewer.component';

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
    LoaderComponent,
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
    LoaderComponent,
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
