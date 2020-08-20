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
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
//Proveedores
import { StudentProvider } from '../providers/shared/student.prov';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';
import { GroupProvider } from 'src/app/english/providers/group.prov';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
//Componentes
import { EnglishCoursesPageComponent } from './components/english-courses-page/english-courses-page.component';
import { FormRequestCourseComponent } from './components/student-english-page/form-request-course/form-request-course.component';
import { StudentRequestsComponent } from './components/english-courses-page/student-requests/student-requests.component';
//import { ConfigureCourseComponent } from './components/english-courses-page/configure-course/configure-course.component';
import { FormCreateCourseComponent } from './components/english-courses-page/form-create-course/form-create-course.component';
import { FormGroupComponent } from './components/english-courses-page/form-group/form-group.component';
import { FromGenerateGroupsComponent } from './components/english-courses-page/from-generate-groups/from-generate-groups.component';
import { GroupStudentsComponent } from './components/english-courses-page/group-students/group-students.component';
import { SelectCourseLevelComponent } from './components/select-course-level/select-course-level.component';
import { CoursesRequestTableComponent } from './components/courses-request-table/courses-request-table.component';
import { UploadCsvPayComponent } from './components/upload-csv-pay/upload-csv-pay.component';


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
    MatSlideToggleModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatBadgeModule,
    MatAutocompleteModule,
  ],
  declarations: [
    StudentEnglishPageComponent,
    EnglishCoursesPageComponent,
    FormRequestCourseComponent,
    StudentRequestsComponent,
    //ConfigureCourseComponent,
    FormCreateCourseComponent,
    FormGroupComponent,
    FromGenerateGroupsComponent,
    GroupStudentsComponent,
    SelectCourseLevelComponent,
    CoursesRequestTableComponent,
    UploadCsvPayComponent,
  ],
  entryComponents: [ //Permite exportar
    FormRequestCourseComponent,
    StudentRequestsComponent,
    //ConfigureCourseComponent,
    FormCreateCourseComponent,
    FormGroupComponent,
    FromGenerateGroupsComponent,
    GroupStudentsComponent,
    SelectCourseLevelComponent,
  ],
  providers: [
    StudentProvider,
    InscriptionsProvider,
    EnglishStudentProvider,
    RequestCourseProvider,
    ClassroomProvider,
    EnglishCourseProvider,
    GroupProvider,
    RequestProvider
  ]
})
export class EnglishModule { }
