import { NgModule } from '@angular/core';
import { ErrorStateMatcher, MatButtonModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonsModule } from 'src/app/commons/commons.module';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  imports: [
    CommonsModule,
    UserRoutingModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  declarations: [
    ProfileSettingsComponent,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
  ],
})
export class UserModule { }
