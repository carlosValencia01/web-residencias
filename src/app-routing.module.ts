import { Routes, RouterModule } from "@angular/router";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { StudentPageComponent } from "./pages/student-page/student-page.component";
import { CardEmployeePageComponent } from "./pages/card-employee-page/card-employee-page.component";
import { LoaderDataCredentialsPageComponent } from "./pages/loader-data-credentials-page/loader-data-credentials-page.component";
import { OneStudentPageComponent } from "./pages/one-student-page/one-student-page.component";
import { NgModule } from "@angular/core";
import { TitulacionPageComponent } from "./pages/titulacion-page/titulacion-page.component";
import { GradePageComponent } from "./pages/grade-page/grade-page.component";
import { VinculacionPageComponent } from "./pages/vinculacion-page/vinculacion-page.component";
//  import { VinculacionPageComponent } from "./pages/vinculacion-page/vinculacion-page.component";
import { ProgressPageComponent } from "./pages/progress-page/progress-page.component";
// import { StepComponent } from "./app/step/step.component";

const appRoutes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'student', component: StudentPageComponent, pathMatch: 'full' },
  { path: 'employeeCard', component: CardEmployeePageComponent, pathMatch: 'full' },
  { path: 'loaderDataCredentials', component: LoaderDataCredentialsPageComponent, pathMatch: 'full' },
  { path: 'oneStudentPage', component: OneStudentPageComponent, pathMatch: 'full' },
  { path: 'grades', component: GradePageComponent, pathMatch: 'full' },
  { path: 'english', component: VinculacionPageComponent, pathMatch: 'full' },
  { path: 'graduation', component: TitulacionPageComponent, pathMatch: 'full' },
  { path: 'progressPage', component: ProgressPageComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}

