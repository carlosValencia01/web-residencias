import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserProvider } from 'src/app/providers/app/user.prov';
import { MatDialogRef, MatDialogClose } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-verification',
  templateUrl: './dialog-verification.component.html',
  styleUrls: ['./dialog-verification.component.scss']
})
export class DialogVerificationComponent implements OnInit {
  @Output() emitEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public validationResult = false;

  public formVerification: FormGroup;
  public showAlertDiv = false;
  public messageAlertDiv = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private userProv: UserProvider,
              private dialogRef: MatDialogRef<DialogVerificationComponent>,
              private formBuilder: FormBuilder) {
    this.formVerification = this.formBuilder.group({
      'usernameInput': new FormControl(null, Validators.required),
      'passwordInput': new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {
  }

  verification() {
    if (this.formVerification.invalid) {
      return;
    }
    if  (this.data.email !== this.formVerification.get('usernameInput').value) {
      this.messageAlertDiv = 'Numero de control no coincide';
      this.showAlertDiv = true;
      return;
    }
    this.userProv.login({
      email: this.formVerification.get('usernameInput').value,
      password: this.formVerification.get('passwordInput').value
    })
    .subscribe((res) => {
      this.userProv.sendTokenFromAPI(res.token);
      if (res.user.rol && res.user.rol.name && res.user.rol.name.toUpperCase().indexOf('ESTUDIANTE') > -1) {
        this.dialogRef.close('true');
        return;
      }
    }, (error) => {
      const msg = JSON.parse(error._body);
      this.messageAlertDiv = msg.error;
      this.showAlertDiv = true;
    });
  }
}
