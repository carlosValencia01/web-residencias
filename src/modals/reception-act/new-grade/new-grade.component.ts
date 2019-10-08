import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { IGrade } from 'src/entities/reception-act/grade.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-new-grade',
  templateUrl: './new-grade.component.html',
  styleUrls: ['./new-grade.component.scss']
})
export class NewGradeComponent implements OnInit {
  Operation: eOperation;
  grade: IGrade;
  frmNewGrade: FormGroup;
  title = 'Nuevo Grado';
  constructor(
    public dialogRef: MatDialogRef<NewGradeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
     public sourceData: sourceDataProvider) {
    this.Operation = this.data.Operation;
    if (this.Operation === eOperation.EDIT) {
      this.grade = <IGrade>this.data.Grade;
    }
  }
  ngOnInit() {
    this.frmNewGrade = new FormGroup({
      'title': new FormControl(
        (this.Operation === eOperation.EDIT ? this.grade.title : null), Validators.required),
      'cedula': new FormControl((this.Operation === eOperation.EDIT ? this.grade.cedula : null), Validators.required),
      'abbreviation': new FormControl((this.Operation === eOperation.EDIT ? this.grade.abbreviation : null), Validators.required),
      'grade': new FormControl((this.Operation === eOperation.EDIT ? this.grade.level : 'Seleccione el nivel académico'),
        Validators.required)
    });
  }

  onSubmit(): void {
    this.grade = {
      title: this.frmNewGrade.get('title').value,
      cedula: this.frmNewGrade.get('cedula').value,
      abbreviation: this.frmNewGrade.get('abbreviation').value,
      level: this.frmNewGrade.get('grade').value
    };
    this.dialogRef.close(this.grade);
  }
  onClose(): void {
    this.dialogRef.close();
  }
}
