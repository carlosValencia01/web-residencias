import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';

import { IEmployee } from 'src/entities/shared/employee.model';

@Component({
  selector: 'app-upload-employees-csv',
  templateUrl: './upload-employees-csv.component.html',
  styleUrls: ['./upload-employees-csv.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UploadEmployeesCsvComponent implements OnInit {
  public employeesData: Array<any>;
  public dataSource: Array<any>;
  public expandedElement: IEmployeeCsv | null;
  public columnsToDisplay: Array<string>;
  public columnsNameToDisplay: Array<string>;
  public columnsToDisplayPosition: Array<string>;
  public columnsNameToDisplayPosition: Array<string>;
  public columnsToDisplayGrade: Array<string>;
  public columnsNameToDisplayGrade: Array<string>;

  constructor(
    private dialogRef: MatDialogRef<UploadEmployeesCsvComponent>,
  ) { }

  ngOnInit() {
    this.columnsToDisplay = ['rfc', 'curp', 'email', 'firstName', 'lastName', 'gender', 'birthDate'];
    this.columnsNameToDisplay = ['RFC', 'CURP', 'EMAIL', 'NOMBRE(S)', 'APELLIDOS', 'GÉNERO', 'FECHA DE NACIMIENTO'];
    this.columnsToDisplayPosition = ['name', 'ascription', 'activateDate', 'deactivateDate'];
    this.columnsNameToDisplayPosition = ['PUESTO', 'DEPARTAMENTO', 'FECHA DE ALTA', 'FECHA DE BAJA'];
    this.columnsToDisplayGrade = ['title', 'cedula', 'abbreviation', 'level'];
    this.columnsNameToDisplayGrade = ['TITULO', 'CÉDULA', 'ABREVIACIÓN', 'NIVEL'];
  }

  public onUpload(event) {
    this.employeesData = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: async results => {
          if (results.data.length > 0) {
            const elements = results.data;
            let currentEmployee = null;
            await this._asyncForEach(elements, async (element, index) => {
              if (index > 0) {
                if (element[0] === 'P' && currentEmployee && element[1] === currentEmployee.rfc) {
                  if (!currentEmployee.positions) {
                    currentEmployee.positions = [];
                  }
                  currentEmployee.positions.push(this._buildPositionPreviousStructure(element));
                } else if (element[0] === 'G' && currentEmployee && element[1] === currentEmployee.rfc) {
                  if (!currentEmployee.grades) {
                    currentEmployee.grades = [];
                  }
                  currentEmployee.grades.push(this._buildGradePreviousStructure(element));
                } else if (element[0] !== 'P' && element[0] !== 'G') {
                  if (currentEmployee) {
                    this.employeesData.push(currentEmployee);
                    currentEmployee = null;
                  }
                  const employeeIndex = this.employeesData.findIndex(x => x.rfc === element[0]);
                  if (employeeIndex !== -1) {
                    const {value: updateEmployee} = await Swal.fire({
                      title: 'Empleado duplicado',
                      text: `El empleado con RFC ${element[0]}, está duplicado. ¿Desea actualizar o descartar los nuevos datos?`,
                      type: 'question',
                      allowOutsideClick: false,
                      showCancelButton: true,
                      confirmButtonColor: 'blue',
                      cancelButtonColor: 'red',
                      confirmButtonText: 'Actualizar',
                      cancelButtonText: 'Descartar',
                      focusConfirm: true
                    });
                    if (updateEmployee) {
                      this.employeesData.splice(employeeIndex, 1);
                      currentEmployee = this._buildEmployeePreviousStructure(element);
                    } else {
                      currentEmployee = null;
                    }
                  } else {
                    if (elements[index].length >= 6) {
                      currentEmployee = this._buildEmployeePreviousStructure(element);
                    }
                  }
                }
              }
            });
            this.dataSource = this.employeesData;
          }
        }
      });
    }
  }

  public downloadExampleCsvFile() {
    const employeesExample = [
      {
        rfc: 'RFC', curp: 'CURP', firstName: 'NOMBRES', lastName: 'APELLIDOS',
        gender: 'GÉNERO', birthDate: 'FECHA DE NACIMIENTO', email: 'EMAIL'
      },
      {
        rfc: 'MALO950914CR1', curp: 'MALO950914HNTRLX00', firstName: 'JOSÉ',
        lastName: 'MARTÍNEZ LÓPEZ', gender: 'MASCULINO', birthDate: '1995-09-14', email: 'jmartinez@ittepic.edu.mx'
      },
      {
        rfc: 'P', curp: 'MALO950914CR1', firstName: 'DOCENTE',
        lastName: 'DEPARTAMENTO DE INGENIERÍA CIVIL', gender: '2020-01-08', birthDate: ''
      },
      {
        rfc: 'G', curp: 'MALO950914CR1', firstName: 'INGENIERO CIVIL',
        lastName: '1234567', gender: 'ING.', birthDate: 'LICENCIATURA'
      },
      {
        rfc: 'VAJI900410CR6', curp: 'VAJI900410MNTRLF04', firstName: 'MARÍA',
        lastName: 'VARGAS JIMÉNEZ', gender: 'FEMENINO', birthDate: '1990-04-10', email: 'mvargas@ittepic.edu.mx'
      },
      {
        rfc: 'P', curp: 'VAJI900410CR6', firstName: 'JEFE DE DEPARTAMENTO',
        lastName: 'DEPARTAMENTO DE SISTEMAS Y COMPUTACIÓN', gender: '2020-01-08', birthDate: ''
      },
      {
        rfc: 'P', curp: 'VAJI900410CR6', firstName: 'DOCENTE',
        lastName: 'DEPARTAMENTO DE SISTEMAS Y COMPUTACIÓN', gender: '2019-08-19', birthDate: '2020-01-08'
      },
      {
        rfc: 'G', curp: 'VAJI900410CR6', firstName: 'INGENIERO EN SISTEMAS COMPUTACIONALES',
        lastName: '7654321', gender: 'ING.', birthDate: 'LICENCIATURA'
      },
      {
        rfc: 'G', curp: 'VAJI900410CR6', firstName: 'MAESTRO EN TECNOLOGÍAS DE LA INFORMACIÓN',
        lastName: '0192837', gender: 'M.T.I.', birthDate: 'MAESTRÍA'
      }
    ];
    // tslint:disable-next-line: no-unused-expression
    new Angular5Csv(employeesExample, 'EjemploEmpleados');
  }

  public saveData() {
    const employees = this.employeesData.map(this._buildEmployeeStructure);
    this.dialogRef.close(employees);
  }

  public onClose(): void {
    this.dialogRef.close();
  }

  private _buildEmployeePreviousStructure(data: Array<any>): any {
    return {
      rfc: (data[0] || ''),
      curp: (data[1] || ''),
      firstName: (data[2] || ''),
      lastName: (data[3] || ''),
      gender: (data[4] || ''),
      birthDate: (data[5] || ''),
      email: (data[6] || '')
    };
  }

  private _buildPositionPreviousStructure(data: Array<any>): IPositionCsv {
    return {
      name: (data[2] || ''),
      ascription: (data[3] || ''),
      activateDate: (data[4] || ''),
      deactivateDate: (data[5] || '')
    };
  }

  private _buildGradePreviousStructure(data: Array<any>): IGradesCsv {
    return {
      title: (data[2] || ''),
      cedula: (data[3] || ''),
      abbreviation: (data[4] || ''),
      level: (data[5] || '')
    };
  }

  private _buildEmployeeStructure(data: any): IEmployee {
    return {
      rfc: data.rfc,
      curp: data.curp,
      email: data.email,
      name: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.firstName.concat(' ', data.lastName)
      },
      gender: data.gender,
      birthDate: data.birthDate,
      positions: data.positions,
      grade: data.grades
    };
  }

  private async _asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

}

export interface IEmployeeCsv {
  rfc: string;
  curp: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  positions: Array<IPositionCsv>;
  grades: Array<IGradesCsv>;
}

export interface IPositionCsv {
  name: string;
  ascription: string;
  activateDate: string;
  deactivateDate?: string;
}

export interface IGradesCsv {
  title: string;
  cedula: string;
  abbreviation: string;
  level: string;
}
