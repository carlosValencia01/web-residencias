import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';
import { EnglishCoursesPageComponent } from './components/english-courses-page/english-courses-page.component';
import { BossMessageComponent } from './components/boss-message/boss-message.component';

import { EnglishGroupsPageComponent } from './components/english-groups-page/english-groups-page.component';

import { StudentOptionsPageComponent } from './components/student-options-page/student-options-page.component';

import { EnglishStudentsListPageComponent } from './components/english-students-list-page/english-students-list-page.component';
import { EnglishTeachersListPageComponent } from './components/english-teachers-list-page/english-teachers-list-page.component';
import { EnglishClassroomsListPageComponent } from './components/english-classrooms-list-page/english-classrooms-list-page.component';
import { ReleasedOptionsPageComponent } from './components/released-options-page/released-options-page.component';
import { EnglishPeriodListPageComponent } from './components/english-period-list-page/english-period-list-page.component';

const routes: Routes = [
  {
    path: 'profile-student',
    pathMatch: 'full',
    component: StudentEnglishPageComponent
  },
  {
    path: 'english-courses',
    pathMatch: 'full',
    component: EnglishCoursesPageComponent
  },
  {
    path: 'message',
    pathMatch: 'full',
    component: BossMessageComponent
  },
  {
    path: 'english-groups',
    pathMatch: 'full',
    component: EnglishGroupsPageComponent
  },
  {
    path: 'student-options',
    pathMatch: 'full',
    component: StudentOptionsPageComponent
  },
  {
    path: 'teacher-options',
    pathMatch: 'full',
    component: EnglishTeachersListPageComponent
  },
  {
    path: 'classroom-options',
    pathMatch: 'full',
    component: EnglishClassroomsListPageComponent
  },
  {
    path: 'released-options',
    pathMatch: 'full',
    component: ReleasedOptionsPageComponent
  },
  {
    path: 'english-groups/:grupId',
    pathMatch: 'full',
    component: EnglishStudentsListPageComponent
  },
  {
    path: 'english-groups/:teacherId/:grupId',
    pathMatch: 'full',
    component: EnglishStudentsListPageComponent
  },
  {
    path: 'english-periods',
    pathMatch: 'full',
    component: EnglishPeriodListPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnglishRoutingModule { }
