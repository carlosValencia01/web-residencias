import { NgModule } from '@angular/core';
import { CommonsModule } from 'src/app/commons/commons.module';
import { EnglishRoutingModule } from './english-routing.module';
import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

import { StudentProvider } from '../providers/shared/student.prov';
import { InscriptionsProvider } from '../providers/inscriptions/inscriptions.prov';
import { EnglishCoursesPageComponent } from './components/english-courses-page/english-courses-page.component';

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
    MatStepperModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  declarations: [
    StudentEnglishPageComponent,
    EnglishCoursesPageComponent,
  ],
  entryComponents: [

  ],
  providers: [
    StudentProvider,
    InscriptionsProvider
  ]
})
export class EnglishModule { }
