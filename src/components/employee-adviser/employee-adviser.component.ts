import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { EmployeeProvider } from 'src/providers/employee.prov';
import { NotificationsServices } from 'src/services/notifications.service';
import { IDepartment } from 'src/entities/department.model';
import { IEmployee } from 'src/entities/employee.model';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-employee-adviser',
  templateUrl: './employee-adviser.component.html',
  styleUrls: ['./employee-adviser.component.scss']
})
export class EmployeeAdviserComponent implements OnInit {

  private departments: IDepartment[];
  private employees: IAdviserTable[];
  private allEmployees: IAdviserTable[];
  private onlyEmployees: IAdviserTable[];
  private career: String;
  private departmentInfo: { name: String, boss: String } = { name: '', boss: '' };
  public dataSource: MatTableDataSource<IAdviserTable>;
  public displayedColumns: string[];
  public type:string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private employeProvider: EmployeeProvider,
    private notifications: NotificationsServices,
    public dialogRef: MatDialogRef<EmployeeAdviserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.career = this.data.carrer;
    this.displayedColumns = ['name', 'position', 'action'];
  }

  ngOnInit() {
    this.employeProvider.getEmployeesByDepto().subscribe(
      data => {
        
        this.departments = <IDepartment[]>data.departments;
        let indice = this.departments.findIndex((e) => {
          return e.careers.findIndex(s => s == this.career) !== -1;
        });
        this.getAllEmployees(indice);        


        this.onlyEmployees = indice === -1 ? this.allEmployees:this.onlyEmployees.slice(0) ;
        this.employees = <IAdviserTable[]>this.onlyEmployees.slice(0);
        this.type="Empleado Carrera";
        this.departmentInfo.name = (indice === -1 ? '' : this.departments[indice].name)

        let boss = this.departments[indice].Employees.find(x => (x.position.includes('JEFE DE DEPARTAMENTO') || x.position.includes('JEFE DE DEPTO')));
        this.departmentInfo.boss = (indice === -1 ? '' : boss.name.fullName);
        this.refresh();
      },
      error => {
        this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      }
    )
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.employees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  areAll(areAll: boolean) {    
    this.employees = areAll ? this.allEmployees.slice(0) : this.onlyEmployees.slice(0);
    this.type=areAll?"Todos los empleados":"Personal del Área";
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
      this.departments[index].Employees.forEach(e => {
        let Adviser = {
          name: this.gradeMax(e) + ' ' + e.name.firstName + ' ' + e.name.lastName,
          position: e.area + ' ' + e.position,
          action: ''
        }
        this.onlyEmployees.push(Adviser);
      })
    }
    this.departments.forEach(e => {
      e.Employees.forEach(em => {
        let Adviser = {
          name: this.gradeMax(em) + ' ' + em.name.firstName + ' ' + em.name.lastName,
          position: e.name + ' ' + em.position,
          action: ''
        }        
        this.allEmployees.push(Adviser);
      })
    });
  }

  gradeMax(employee: IEmployee): String {
    if (typeof (employee.grade) === 'undefined' || employee.grade.length === 0)
      return "";
    let isGrade = employee.grade.find(x => x.level === 'DOCTORADO');

    if (typeof (isGrade) !== 'undefined')
      return isGrade.abbreviation;

    isGrade = employee.grade.find(x => x.level === 'MAESTRÍA');
    if (typeof (isGrade) !== 'undefined')
      return isGrade.abbreviation;

    isGrade = employee.grade.find(x => x.level === 'LICENCIATURA');
    if (typeof (isGrade) !== 'undefined')
      return isGrade.abbreviation;
    return "";
  };

  selected(item): void {    
    //let lEmployee: IEmployee = <IEmployee>item;
    this.dialogRef.close({ Employee: item.name, Depto: this.departmentInfo });
  }

  // onClose(): void {
  //   this.dialogRef.close();
  // }
}
interface IAdviserTable {
  name?: string, position?: string, action?: string
}