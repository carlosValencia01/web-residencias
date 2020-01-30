import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { IDepartment } from 'src/entities/shared/department.model';
import { IEmployee } from 'src/entities/shared/employee.model';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { IGrade } from 'src/entities/reception-act/grade.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-adviser',
  templateUrl: './employee-adviser.component.html',
  styleUrls: ['./employee-adviser.component.scss']
})
export class EmployeeAdviserComponent implements OnInit {
  private departments: IDepartment[];
  private employees: IAdviserTable[];
  private allEmployees: IAdviserTable[];
  public frmAuxiliar: FormGroup;
  private onlyEmployees: IAdviserTable[];
  private career: String;
  private departmentInfo: { name: String, boss: String } = { name: '', boss: '' };
  public dataSource: MatTableDataSource<IAdviserTable>;
  public displayedColumns: string[];
  public type: string;
  public isNewEmployee: boolean;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private employeProvider: EmployeeProvider,
    private notifications: NotificationsServices,
    public dialogRef: MatDialogRef<EmployeeAdviserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isNewEmployee = false;
    this.career = this.data.carrer;
    this.displayedColumns = ['name', 'position', 'action'];
  }

  ngOnInit() {
    this.frmAuxiliar = new FormGroup({
      'Name': new FormControl(null, Validators.required),
      'Titled': new FormControl(null, Validators.required),
      'Cedula': new FormControl(null, Validators.required)
    });

    this.employeProvider.getEmployeesByDepto().subscribe(
      data => {
        this.departments = <IDepartment[]>data.departments;
        const indice = this.departments.findIndex((department) => {
          return department.careers.findIndex(career => career.fullName === this.career) !== -1;
        });
        this.getAllEmployees(indice);

        this.onlyEmployees = indice === -1 ? this.allEmployees : this.onlyEmployees.slice(0);
        this.employees = <IAdviserTable[]>this.onlyEmployees.slice(0);
        this.type = 'Empleado Carrera';
        this.departmentInfo.name = (indice === -1 ? '' : this.departments[indice].name);

        // const boss = this.departments[indice].boss;
        // this.departmentInfo.boss = (indice === -1 ? '' : boss.name.fullName);
        this.departmentInfo.boss = (indice === -1 ? '' : this.departments[indice].boss.name.fullName);

        this.refresh();
      },
      error => {
        this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      }
    );
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.employees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  areAll(areAll: boolean) {
    this.employees = areAll ? this.allEmployees.slice(0) : this.onlyEmployees.slice(0);
    this.type = areAll ? 'Todos los empleados' : 'Personal del Área';
    this.refresh();
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllEmployees(index: number): void {
    this.allEmployees = [];
    this.onlyEmployees = [];
    if (index !== -1) {
      this.departments[index].Employees.forEach(employee => {
        const gradeInfo = this.gradeInfoMax(employee);
        const Adviser = {
          name: this.gradeMax(employee) + ' ' + employee.name.firstName + ' ' + employee.name.lastName,
          position: `${employee.positions[0].position.name} (${employee.positions[0].position.ascription.shortName})`,
          action: '',
          ExtraInfo: {
            title: typeof (gradeInfo) !== 'undefined' ? gradeInfo.title : '',
            abbreviation: typeof (gradeInfo) !== 'undefined' ? gradeInfo.abbreviation : '',
            cedula: typeof (gradeInfo) !== 'undefined' ? gradeInfo.cedula : '',
            name: employee.name.firstName + ' ' + employee.name.lastName
          }
        };
        this.onlyEmployees.push(Adviser);
      });
    }
    this.departments.forEach(department => {
      department.Employees.forEach(employee => {
        const gradeInfo = this.gradeInfoMax(employee);
        const Adviser = {
          name: this.gradeMax(employee) + ' ' + employee.name.firstName + ' ' + employee.name.lastName,
          position: `${employee.positions[0].position.name} (${department.shortName})`,
          action: '',
          ExtraInfo: {
            title: typeof (gradeInfo) !== 'undefined' ? gradeInfo.title : '',
            abbreviation: typeof (gradeInfo) !== 'undefined' ? gradeInfo.abbreviation : '',
            cedula: typeof (gradeInfo) !== 'undefined' ? gradeInfo.cedula : '',
            name: employee.name.firstName + ' ' + employee.name.lastName
          }
        };
        this.allEmployees.push(Adviser);
      });
    });
  }

  gradeInfoMax(employee: IEmployee): IGrade {
    if (typeof (employee.grade) === 'undefined' || employee.grade.length === 0) {
      return undefined;
    }
    let isGrade = employee.grade.find(x => x.level === 'DOCTORADO');

    if (typeof (isGrade) !== 'undefined') {
      return isGrade;
    }

    isGrade = employee.grade.find(x => x.level === 'MAESTRÍA');
    if (typeof (isGrade) !== 'undefined') {
      return isGrade;
    }

    isGrade = employee.grade.find(x => x.level === 'LICENCIATURA');
    if (typeof (isGrade) !== 'undefined') {
      return isGrade;
    }
    return undefined;
  }

  gradeMax(employee: IEmployee): String {
    if (typeof (employee.grade) === 'undefined' || employee.grade.length === 0) {
      return '';
    }
    let isGrade = employee.grade.find(x => x.level === 'DOCTORADO');

    if (typeof (isGrade) !== 'undefined') {
      return isGrade.abbreviation;
    }

    isGrade = employee.grade.find(x => x.level === 'MAESTRÍA');
    if (typeof (isGrade) !== 'undefined') {
      return isGrade.abbreviation;
    }

    isGrade = employee.grade.find(x => x.level === 'LICENCIATURA');
    if (typeof (isGrade) !== 'undefined') {
      return isGrade.abbreviation;
    }
    return '';
  }

  selected(item): void {
    this.dialogRef.close({ Employee: item.name, Depto: this.departmentInfo, ExtraInfo: item.ExtraInfo });
  }

  onSave() {
    this.dialogRef.close({
      Employee:
        this.frmAuxiliar.get('Name').value, Depto: null, ExtraInfo: {
          name: this.frmAuxiliar.get('Name').value,
          title: this.frmAuxiliar.get('Titled').value,
          cedula: this.frmAuxiliar.get('Cedula').value
        }
    });
  }
  addEmploye(): void {
    this.frmAuxiliar.get('Name').setErrors(null);
    this.frmAuxiliar.get('Name').markAsUntouched();
    this.frmAuxiliar.get('Titled').setErrors(null);
    this.frmAuxiliar.get('Titled').markAsUntouched();
    this.frmAuxiliar.get('Cedula').setErrors(null);
    this.frmAuxiliar.get('Cedula').markAsUntouched();
    this.frmAuxiliar.setValue({ 'Name': '', 'Titled': '', 'Cedula': '' });
    this.isNewEmployee = !this.isNewEmployee;
  }
}

interface IAdviserTable {
  name?: string; position?: string; action?: string;
}
