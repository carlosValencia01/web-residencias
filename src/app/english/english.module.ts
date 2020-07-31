import { NgModule } from '@angular/core';
import { CommonsModule } from 'src/app/commons/commons.module';
import { EnglishRoutingModule } from './english-routing.module';
import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';
//MATERIAL
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';

import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';

import { StudentProvider } from '../providers/shared/student.prov';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';
import { EnglishCoursesPageComponent } from './components/english-courses-page/english-courses-page.component';
import { FormRequestCourseComponent } from './components/student-english-page/form-request-course/form-request-course.component';
import { StudentRequestsComponent } from './components/english-courses-page/student-requests/student-requests.component';
import { ConfigureCourseComponent } from './components/english-courses-page/configure-course/configure-course.component';


@NgModule({
  imports: [
    CommonsModule,
    EnglishRoutingModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
    MatStepperModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  declarations: [
    StudentEnglishPageComponent,
    EnglishCoursesPageComponent,
    FormRequestCourseComponent,
    StudentRequestsComponent,
    ConfigureCourseComponent,
  ],
  entryComponents: [ //Permite exportar
    FormRequestCourseComponent,
    StudentRequestsComponent,
    ConfigureCourseComponent,
  ],
  providers: [
    StudentProvider,
    InscriptionsProvider,
    EnglishStudentProvider,
    RequestCourseProvider,
    ClassroomProvider,
    EnglishCourseProvider,
  ]
})
export class EnglishModule { }
