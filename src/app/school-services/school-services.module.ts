import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../commons/commons.module';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { ErrorStateMatcher } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';

import { SchoolServicesRoutingModule } from './school-services-routing.module';
import { ImssPageComponent } from './imss-page/imss-page.component';
import { IndustrialVisitsPageComponent } from './industrial-visits-page/industrial-visits-page.component';

import { StudentProvider } from '../providers/shared/student.prov';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { ImageToBase64Service } from '../services/app/img.to.base63.service';

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    SchoolServicesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatInputModule,
  ],
  declarations: [
    ImssPageComponent,
    IndustrialVisitsPageComponent,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
    ImageToBase64Service,
    StudentProvider,
    InscriptionsProvider,
  ]
})
export class SchoolServicesModule { }
