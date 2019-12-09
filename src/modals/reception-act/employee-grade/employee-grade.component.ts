import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {eOperation} from 'src/enumerators/reception-act/operation.enum';
import {IEmployee} from 'src/entities/shared/employee.model';

@Component({
  selector: 'app-employee-grade',
  templateUrl: './employee-grade.component.html',
  styleUrls: ['./employee-grade.component.scss']
})
export class EmployeeGradeComponent implements OnInit {
  public frmNewEmployeeGrade: FormGroup;
  public title = 'Nuevo Empleado';
  private Employee: IEmployee;
  private Operation: eOperation;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EmployeeGradeComponent>,
  ) {
    this.Operation = data.Operation;
    this.Employee = <IEmployee>{
      rfc: '',
      curp: '',
      name: {
        firstName: '',
        lastName: '',
        fullName: ''
      },
      gender: '',
      birthDate: null,
      grade: [],
      positions: [],
    };

    if (this.Operation === eOperation.EDIT) {
      this.Employee = <IEmployee>data.Employee;
      this.title = 'Editar Empleado';
    }
  }

  ngOnInit() {
    this.frmNewEmployeeGrade = new FormGroup({
      'rfc': new FormControl(
        this.Operation === eOperation.EDIT ? this.Employee.rfc : null,
        [Validators.required, Validators.minLength(10), Validators.maxLength(13)]),
      'curp': new FormControl(
        this.Operation === eOperation.EDIT ? this.Employee.curp : null,
        [Validators.required, Validators.minLength(18), Validators.maxLength(18)]),
      'name': new FormControl(
        (this.Operation === eOperation.EDIT ? this.Employee.name.firstName : null), Validators.required),
      'lastname': new FormControl(
        (this.Operation === eOperation.EDIT ? this.Employee.name.lastName : null), Validators.required),
      'gender': new FormControl(
        (this.Operation === eOperation.EDIT ? this.Employee.gender : null), Validators.required),
      'birthDate': new FormControl(
        (this.Operation === eOperation.EDIT ? this.Employee.birthDate : null), Validators.required),
    });
  }

  onSubmit() {
    this.Employee.rfc = this.frmNewEmployeeGrade.get('rfc').value;
    this.Employee.curp = this.frmNewEmployeeGrade.get('curp').value;
    this.Employee.name.firstName = this.frmNewEmployeeGrade.get('name').value;
    this.Employee.name.lastName = this.frmNewEmployeeGrade.get('lastname').value;
    this.Employee.gender = this.frmNewEmployeeGrade.get('gender').value;
    this.Employee.birthDate = this.frmNewEmployeeGrade.get('birthDate').value;
    this.dialogRef.close(this.Employee);
  }

  onClose() {
    this.dialogRef.close();
  }
}
