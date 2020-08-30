import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-form-create-course',
  templateUrl: './form-create-course.component.html',
  styleUrls: ['./form-create-course.component.scss']
})
export class FormCreateCourseComponent implements OnInit {

  courseFormGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FormCreateCourseComponent>,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.courseFormGroup = this._formBuilder.group({
      nameCtrl: ['', Validators.required],
      dailyHoursCtrl: ['', [Validators.required, Validators.min(1)]],
      semesterHoursCtrl: ['', [Validators.required, Validators.min(1)]],
      totalSemestersCtrl: ['', [Validators.required, Validators.min(1)]],
      totalHoursCtrl: ['450', [Validators.required, Validators.min(1)]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
