import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';
import { EnglishCoursesPageComponent } from './components/english-courses-page/english-courses-page.component';
import { CoursesRequestTableComponent } from './components/courses-request-table/courses-request-table.component';
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
    path: 'requests',
    pathMatch: 'full',
    component: CoursesRequestTableComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnglishRoutingModule { }
