import { NgModule } from '@angular/core';
import { CommonsModule } from 'src/app/commons/commons.module';
import { EnglishRoutingModule } from './english-routing.module';
import { StudentEnglishPageComponent } from './components/student-english-page/student-english-page.component';

@NgModule({
  imports: [
    CommonsModule,
    EnglishRoutingModule,
  ],
  declarations: [
    StudentEnglishPageComponent,
  ],
  entryComponents: [

  ],
  providers: [
  
  ]
})
export class EnglishModule { }
