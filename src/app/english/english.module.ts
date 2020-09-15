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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
import { ConfigureCourseComponent } from './components/english-courses-page/configure-course/configure-course.component';
import { FormCreateCourseComponent } from './components/english-courses-page/form-create-course/form-create-course.component';
import { FormGroupComponent } from './components/english-courses-page/form-group/form-group.component';
import { FromGenerateGroupsComponent } from './components/english-courses-page/from-generate-groups/from-generate-groups.component';
import { GroupStudentsComponent } from './components/english-courses-page/group-students/group-students.component';
import { SelectCourseLevelComponent } from './components/select-course-level/select-course-level.component';
import { CoursesRequestTableComponent } from './components/courses-request-table/courses-request-table.component';
import { ActiveGroupModalComponent } from '../english/modals/active-group-modal/active-group-modal.component';
import { StudyingCourseDetailComponent } from './components/studying-course-detail/studying-course-detail.component';
import { AssignEnglishTeacherComponent } from './modals/assign-english-teacher/assign-english-teacher.component';
import { ReviewInformationPageComponent } from './components/review-information-page/review-information-page.component';
import { ReviewInformationModalComponent } from './modals/review-information-modal/review-information-modal.component';
import { UploadExternalStudentsComponent } from './components/upload-external-students/upload-external-students.component';
import { AddStudentsGroupModalComponent } from './modals/add-students-group-modal/add-students-group-modal.component';
import { BossMessageComponent } from './components/boss-message/boss-message.component';
import { EnglishGroupsPageComponent } from './components/english-groups-page/english-groups-page.component';
// Services
import { ImageToBase64Service } from '../services/app/img.to.base63.service';
import { UploadAvgsModalComponent } from './components/upload-avgs-modal/upload-avgs-modal.component';
import { StudentOptionsPageComponent } from './components/student-options-page/student-options-page.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { EnglishStudentsListPageComponent } from './components/english-students-list-page/english-students-list-page.component';

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
    NgbModule.forRoot(),
  ],
  declarations: [
    StudentEnglishPageComponent,
    EnglishCoursesPageComponent,
    FormRequestCourseComponent,
    StudentRequestsComponent,
    ConfigureCourseComponent,
    FormCreateCourseComponent,
    FormGroupComponent,
    FromGenerateGroupsComponent,
    GroupStudentsComponent,
    SelectCourseLevelComponent,
    CoursesRequestTableComponent,
    ActiveGroupModalComponent,
    StudyingCourseDetailComponent,
    AssignEnglishTeacherComponent,
    ReviewInformationPageComponent,
    ReviewInformationModalComponent,
    UploadExternalStudentsComponent,
    AddStudentsGroupModalComponent,
    BossMessageComponent,
    EnglishGroupsPageComponent,
    UploadAvgsModalComponent,
    StudentOptionsPageComponent,
    StudentListComponent,
    EnglishStudentsListPageComponent,
  ],
  entryComponents: [ //Permite exportar
    FormRequestCourseComponent,
    StudentRequestsComponent,
    ConfigureCourseComponent,
    FormCreateCourseComponent,
    FormGroupComponent,
    FromGenerateGroupsComponent,
    GroupStudentsComponent,
    SelectCourseLevelComponent,
    ActiveGroupModalComponent,
    AssignEnglishTeacherComponent,
    ReviewInformationModalComponent,
    AddStudentsGroupModalComponent,
    UploadAvgsModalComponent,
  ],
  providers: [
    StudentProvider,
    InscriptionsProvider,
    EnglishStudentProvider,
    RequestCourseProvider,
    ClassroomProvider,
    EnglishCourseProvider,
    GroupProvider,
    RequestProvider,
    ImageToBase64Service,
  ]
})
export class EnglishModule { }
