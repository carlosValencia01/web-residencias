import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { sourceDataProvider } from 'src/providers/sourceData.prov';
import { IStudent } from 'src/entities/student.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-english',
  templateUrl: './english.component.html',
  styleUrls: ['./english.component.scss']
})
export class EnglishComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EnglishComponent>,
    public sourceData: sourceDataProvider) { }
  frmNewStudent: FormGroup;

  ngOnInit() {
    this.frmNewStudent = new FormGroup({
      'controlNumber': new FormControl(null,
        [Validators.required,
        Validators.pattern('^[0-9]+$')]),
      'fullname': new FormControl(null, Validators.required),
      'career': new FormControl('Seleccione la Carrera', this.invalidOption.bind(this))
    });
  }

  onSubmit(): void {
    const Student: IStudent = {
      controlNumber: this.frmNewStudent.value.controlNumber,
      fullName: this.frmNewStudent.value.fullname,
      career: this.frmNewStudent.value.career,
    };
    this.frmNewStudent.reset({
      'controlNumber': '',
      'fullname': '',
      'career': 'Seleccione la Carrera'
    });
    this.dialogRef.close(Student);
  }

  onClose(): void {
    // this.ref1.close();
    this.dialogRef.close();
  }

  invalidOption(control: FormControl): { [s: string]: boolean } {
    if (control.value === 'Seleccione la Carrera') {
      return { 'invalidOption': true };
    }
    return null;
  }

}


// constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, public sourceData: sourceDataProvider) { }
// frmNewStudent: FormGroup;

// ngOnInit() {
//   this.frmNewStudent = new FormGroup({
//     'controlNumber': new FormControl(null,
//       [Validators.required,
//       Validators.pattern('^[0-9]+$')]),
//     'fullname': new FormControl(null, Validators.required),
//     'career': new FormControl('Seleccione la Carrera', this.invalidOption.bind(this))
//   });
// }

// onSubmit(): void {
//   let Student: IStudent =
//   {
//     controlNumber: this.frmNewStudent.value.controlNumber,
//     fullName: this.frmNewStudent.value.fullname,
//     career: this.frmNewStudent.value.career,
//   }
//   this.frmNewStudent.reset({
//     'controlNumber': '',
//     'fullname': '',
//     'career': 'Seleccione la Carrera'
//   })
//   this.ref.close(Student);
// }


// invalidOption(control: FormControl): { [s: string]: boolean } {
//   if (control.value === 'Seleccione la Carrera') {
//     return { 'invalidOption': true };
//   }
//   return null;
// }

