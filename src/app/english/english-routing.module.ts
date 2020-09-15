import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';
import { EnglishCoursesPageComponent } from './components/english-courses-page/english-courses-page.component';
import { BossMessageComponent } from './components/boss-message/boss-message.component';

import { EnglishGroupsPageComponent } from './components/english-groups-page/english-groups-page.component';
import { StudentOptionsPageComponent } from './components/student-options-page/student-options-page.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnglishRoutingModule { }
