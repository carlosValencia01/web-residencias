import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';
const routes: Routes = [
  {
    path: 'profile-student',
    pathMatch: 'full',
    component: StudentEnglishPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnglishRoutingModule { }
