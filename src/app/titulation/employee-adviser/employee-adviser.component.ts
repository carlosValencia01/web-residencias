import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IGrade } from 'src/app/entities/reception-act/grade.model';
import { IDepartment } from 'src/app/entities/shared/department.model';
import { IEmployee } from 'src/app/entities/shared/employee.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

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
  private careerAcronym: String;
  private departmentInfo: { name: String, boss: String } = { name: '', boss: '' };
  public dataSource: MatTableDataSource<IAdviserTable>;
  public displayedColumns: string[];
  public type: string;
  public isNewEmployee: boolean;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public role: string;
  public synodal: string;
  public title: string;

  constructor(
    private employeProvider: EmployeeProvider,
    private notifications: NotificationsServices,
    public dialogRef: MatDialogRef<EmployeeAdviserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cookiesServ: CookiesService,
    private loadingService: LoadingService,
  ) {
    this.isNewEmployee = false;
    this.career = this.data.carrer;
    this.careerAcronym = this.data.careerAcronym;
    this.displayedColumns = ['name', 'position', 'action'];
    this.role = (this.cookiesServ.getData().user.rol.name || '').toLowerCase();
    this.synodal = (this.data.synodal || '').toLowerCase();
    this.title = this._setModalTitle(this.role, this.synodal);
  }

  ngOnInit() {
    this.frmAuxiliar = new FormGroup({
      'Name': new FormControl(null, Validators.required),
      'Titled': new FormControl(null, Validators.required),
      'Cedula': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email])
    });
    this.loadingService.setLoading(true);
    this.employeProvider.getEmployeesByDepto().subscribe(
      data => {
        this.departments = <IDepartment[]>data.departments;
        const indice = this.departments.findIndex((department) => {
          return department.careers.findIndex(career =>
            career.acronym === this.career || career.acronym === this.careerAcronym || career.fullName === this.career) !== -1;
        });
        this.getAllEmployees(indice);

        this.onlyEmployees = indice === -1 ? this.allEmployees : this.onlyEmployees.slice(0);
        this.employees = <IAdviserTable[]>this.onlyEmployees.slice(0);
        this.type = 'Empleado Carrera';
        this.departmentInfo.name = (indice === -1 ? '' : this.departments[indice].name);

        this.departmentInfo.boss = (indice === -1 ? '' : this.departments[indice].boss.name.fullName);

        this.refresh();
        this.loadingService.setLoading(false);
      }, _ => {
        this.loadingService.setLoading(false);
        this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener empleados');
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
            name: employee.name.firstName + ' ' + employee.name.lastName,
            email: employee.email ? employee.email : ''
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
            name: employee.name.firstName + ' ' + employee.name.lastName,
            email: employee.email ? employee.email : ''
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
      Employee: this.frmAuxiliar.get('Name').value,
      Depto: null,
      ExtraInfo: {
        name: this.frmAuxiliar.get('Name').value,
        title: this.frmAuxiliar.get('Titled').value,
        cedula: this.frmAuxiliar.get('Cedula').value,
        email: this.frmAuxiliar.get('email').value
      }
    });
  }

  toggleAddEmploye(): void {
    this.frmAuxiliar.get('Name').setErrors(null);
    this.frmAuxiliar.get('Name').markAsUntouched();
    this.frmAuxiliar.get('Titled').setErrors(null);
    this.frmAuxiliar.get('Titled').markAsUntouched();
    this.frmAuxiliar.get('Cedula').setErrors(null);
    this.frmAuxiliar.get('Cedula').markAsUntouched();
    this.frmAuxiliar.get('email').setErrors(null);
    this.frmAuxiliar.get('email').markAsUntouched();
    this.frmAuxiliar.setValue({ 'Name': '', 'Titled': '', 'Cedula': '', 'email': '' });
    this.isNewEmployee = !this.isNewEmployee;
  }

  private _setModalTitle(role: string, synodal?: string): string {
    if (role === 'estudiante') {
      return 'Asesor interno';
    } else {
      switch (synodal) {
        case 'president': return 'Seleccione presidenta/e';
        case 'secretary': return 'Seleccione secretario/a';
        case 'vocal': return 'Seleccione vocal';
        case 'substitute': return 'Seleccione suplente';
        default: return 'Seleccione empleada/o';
      }
    }
  }
}

interface IAdviserTable {
  name?: string;
  position?: string;
  action?: string;
}
