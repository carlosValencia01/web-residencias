import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { IEmployee } from 'src/entities/shared/employee.model';
import { IGrade } from 'src/entities/reception-act/grade.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NewGradeComponent } from '../new-grade/new-grade.component';

@Component({
  selector: 'app-employee-grade',
  templateUrl: './employee-grade.component.html',
  styleUrls: ['./employee-grade.component.scss']
})
export class EmployeeGradeComponent implements OnInit {
  public Employee: IEmployee;
  public Operation: eOperation;
  public columns: any[];
  public grades: Array<IGrade>;
  public frmNewEmployeGrade: FormGroup;
  public title = 'Nuevo Empleado';
  public dataSource: MatTableDataSource<IGradeTable>;
  public displayedColumns: string[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialogRef: MatDialogRef<EmployeeGradeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
     public dialogTwo: MatDialog,
    public sourceData: sourceDataProvider) {
    this.displayedColumns = ['abbreviation', 'title', 'cedula', 'level', 'action'];
    this.Operation = data.Operation;
    this.Employee = <IEmployee>{
      name: {
        firstName: '',
        lastName: '',
        fullName: ''
      },
      area: '',
      position: '',
      grade: []
    };

    if (this.Operation === eOperation.EDIT) {
      this.Employee = <IEmployee>data.Employee;
      this.title = 'Editar Empleado';
    }
  }

  ngOnInit() {
    this.frmNewEmployeGrade = new FormGroup({
      'name': new FormControl(
        (this.Operation === eOperation.EDIT ? this.Employee.name.firstName : null), Validators.required),
      'lastname': new FormControl((this.Operation === eOperation.EDIT ? this.Employee.name.lastName : null), Validators.required),
      'area': new FormControl((this.Operation === eOperation.EDIT ? this.Employee.area : null), Validators.required),
      'position': new FormControl((this.Operation === eOperation.EDIT ? this.Employee.position : null), Validators.required)
    });

    this.grades = this.Employee.grade;
    this.refresh();
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.grades);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addNewGrade() {
    const referencia = this.dialogTwo.open(NewGradeComponent, {
      id: 'NewGradeModal',
      data: {
        Operation: eOperation.NEW
      },
      disableClose: true,
      hasBackdrop: true,
      width: '40em'
    });

    referencia.afterClosed().subscribe((gradeResult: IGrade) => {
      if (gradeResult) {
        this.grades.push(gradeResult);
        this.refresh();
      }
    });

  }

  onRowRemove(row: any) {
    this.grades.splice(this.grades.indexOf(<IGrade>row), 1);
    this.grades.forEach(e => {
      delete e._id;
    });
    this.grades = this.grades.slice();
    this.refresh();
  }

  onSubmit() {
    this.Employee = {
      _id: this.Employee._id,
      name: {
        firstName: this.frmNewEmployeGrade.get('name').value,
        lastName: this.frmNewEmployeGrade.get('lastname').value
      },
      area: this.frmNewEmployeGrade.get('area').value,
      position: this.frmNewEmployeGrade.get('position').value,
      grade: this.grades
    };
    this.dialogRef.close(this.Employee);
  }

  onClose() {
    this.dialogRef.close();
  }
}

interface IGradeTable {
  title?: string; cedula?: string; level?: string; action?: string;
}
