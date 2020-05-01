import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from 'src/app/commons/commons.module';

// Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatButtonModule,
  ErrorStateMatcher,
} from '@angular/material';

import { UserRoutingModule } from './user-routing.module';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ErrorMatcher } from '../services/shared/ErrorMatcher';

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    UserRoutingModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ProfileSettingsComponent,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ErrorMatcher },
  ],
})
export class UserModule { }
