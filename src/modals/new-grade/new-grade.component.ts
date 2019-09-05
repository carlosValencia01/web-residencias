import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { sourceDataProvider } from 'src/providers/sourceData.prov';
import { eOperation } from 'src/enumerators/operation.enum';
import { IGrade } from 'src/entities/grade.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// import { DynamicDialogRef } from 'primeng/api';
// import { DynamicDialogConfig } from 'primeng/api';
@Component({
  selector: 'app-new-grade',
  templateUrl: './new-grade.component.html',
  styleUrls: ['./new-grade.component.scss']
})
export class NewGradeComponent implements OnInit {  
  Operation: eOperation;
  grade: IGrade;
  frmNewGrade: FormGroup;
  title:string="Nuevo Grado";
  constructor(
    public dialogRef: MatDialogRef<NewGradeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,        
     public sourceData: sourceDataProvider) {    
    this.Operation = this.data.Operation;
    if (this.Operation === eOperation.EDIT)      
      this.grade = <IGrade>this.data.Grade;
  }
  ngOnInit() {    
    this.frmNewGrade = new FormGroup({
      'title': new FormControl(
        (this.Operation === eOperation.EDIT ? this.grade.title : null), Validators.required),
      'cedula': new FormControl((this.Operation === eOperation.EDIT ? this.grade.cedula : null), Validators.required),
      // 'maternal': new FormControl(null, Validators.required),
      'abbreviation': new FormControl((this.Operation === eOperation.EDIT ? this.grade.abbreviation : null), Validators.required),
      'grade': new FormControl((this.Operation === eOperation.EDIT ? this.grade.level : "Seleccione el nivel académico"), Validators.required)
      //,'default': new FormControl( (this.Operation === eOperation.EDIT ? this.grade.default : null), Validators.required)
    });
  }

  onSubmit(): void {
    this.grade = {
      title: this.frmNewGrade.get('title').value,
      cedula: this.frmNewGrade.get('cedula').value,
      abbreviation: this.frmNewGrade.get('abbreviation').value,
      level: this.frmNewGrade.get('grade').value
      //,default: this.frmNewGrade.get('default').value
    }    
    this.dialogRef.close(this.grade);
  }
  onClose(): void {      
    this.dialogRef.close();
  }
}
