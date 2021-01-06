import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { DialogVerificationComponent } from '../dialog-verification/dialog-verification.component';

@Component({
  selector: 'app-dialog-student-init-date',
  templateUrl: './dialog-student-init-date.component.html',
  styleUrls: ['./dialog-student-init-date.component.scss']
})
export class DialogStudentInitDateComponent implements OnInit {

  public form: FormGroup;
  public showAlertDiv = false;
  public messageAlertDiv = 'Ingrese su fecha de inicio';
  
  constructor(private dialogRef: MatDialogRef<DialogVerificationComponent>,
              private formBuilder: FormBuilder) { 
    this.form = this.formBuilder.group({
      'dependencyInitialDate': new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {
  }

  

  saveDate(){
    if(!this.form.invalid){
      this.dialogRef.close(this.form.get('dependencyInitialDate').value);
      this.showAlertDiv = false;
      return;

    }
    this.showAlertDiv = true;
  }

}


