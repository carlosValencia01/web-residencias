import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {eOperation} from 'src/app/enumerators/reception-act/operation.enum';
import {IGrade} from 'src/app/entities/reception-act/grade.model';
import {sourceDataProvider} from 'src/app/providers/reception-act/sourceData.prov';

@Component({
  selector: 'app-new-grade',
  templateUrl: './new-grade.component.html',
  styleUrls: ['./new-grade.component.scss']
})
export class NewGradeComponent implements OnInit {
  public frmNewGrade: FormGroup;
  public title = 'Nuevo Grado';
  private Operation: eOperation;
  private grade: IGrade;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<NewGradeComponent>,
    public sourceData: sourceDataProvider,
  ) {
    this.Operation = this.data.Operation;
    if (this.Operation === eOperation.EDIT) {
      this.grade = <IGrade>this.data.Grade;
    }
  }

  ngOnInit() {
    this.frmNewGrade = new FormGroup({
      'title': new FormControl(
        (this.Operation === eOperation.EDIT ? this.grade.title : null), Validators.required),
      'cedula': new FormControl(
        (this.Operation === eOperation.EDIT ? this.grade.cedula : null), Validators.required),
      'abbreviation': new FormControl(
        (this.Operation === eOperation.EDIT ? this.grade.abbreviation : null), Validators.required),
      'level': new FormControl(
        (this.Operation === eOperation.EDIT ? this.grade.level : ''), Validators.required)
    });
  }

  onSubmit(): void {
    this.grade = {
      title: this.frmNewGrade.get('title').value,
      cedula: this.frmNewGrade.get('cedula').value,
      abbreviation: this.frmNewGrade.get('abbreviation').value,
      level: this.frmNewGrade.get('level').value
    };
    this.dialogRef.close(this.grade);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
