import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

export interface DialogData {
  courseSelected: any;
  nameCourseSelected: string;
  period: string;
  scheduleSelected: string;
  currentPhone: string;
}

@Component({
  selector: 'app-form-request-course',
  templateUrl: './form-request-course.component.html',
  styleUrls: ['./form-request-course.component.scss']
})
export class FormRequestCourseComponent implements OnInit {

  scheduleFormGroup: FormGroup;
  phoneFormGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FormRequestCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.scheduleFormGroup = this._formBuilder.group({
      scheduleCtrl: ['', Validators.required]
    });
    this.phoneFormGroup = this._formBuilder.group({
      phoneCtrl: ['', [ Validators.pattern('^[0-9]{10}$'), Validators.required]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
