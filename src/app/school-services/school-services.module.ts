import { NgModule } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonsModule } from '../commons/commons.module';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { StudentProvider } from '../providers/shared/student.prov';
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { ImssPageComponent } from './imss-page/imss-page.component';
import { IndustrialVisitsPageComponent } from './industrial-visits-page/industrial-visits-page.component';
import { SchoolServicesRoutingModule } from './school-services-routing.module';

@NgModule({
  imports: [
    CommonsModule,
    SchoolServicesRoutingModule,
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
