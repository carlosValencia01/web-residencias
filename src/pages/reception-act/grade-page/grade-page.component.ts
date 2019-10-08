import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { IEmployee } from 'src/entities/shared/employee.model';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { IGrade } from 'src/entities/reception-act/grade.model';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { EmployeeGradeComponent } from 'src/modals/reception-act/employee-grade/employee-grade.component';
import * as Papa from 'papaparse';
import { CookiesService } from 'src/services/app/cookie.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-grade-page',
  templateUrl: './grade-page.component.html',
  styleUrls: ['./grade-page.component.scss'],
})
@Injectable()
export class GradePageComponent implements OnInit {
  displayedColumns: string[];
  dataSource: MatTableDataSource<IGradeTable>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  employees: any;
  search: string;
  isFirst: number;

  constructor(
    public employeeProvider: EmployeeProvider,
    private notificationServ: NotificationsServices,
    public dialog: MatDialog,
    private cookiesService: CookiesService,
    private router: Router, private routeActive: ActivatedRoute) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.displayedColumns = ['nombre', 'apellido', 'area', 'puesto', 'action'];
    this.getEmployees();
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.employees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  castRowToEmploye(row: IGradeTable): IEmployee {
    const employee: IEmployee = {
      name: {
        firstName: row.nombre,
        lastName: row.apellido
      },
      area: row.area,
      position: row.puesto,
      _id: row._id
    };

    const grades: IGrade[] = [];
    row.grades.forEach(element => {
      const grade: IGrade = {
        title: element.apellido,
        cedula: element.area,
        level: element.puesto,
        abbreviation: element.nombre
      };
      grades.push(grade);
    });
    employee.grade = grades;
    return employee;
  }

  castEmployeRow(employee: IEmployee): IGradeTable {
    const tmp: IGradeTable = {
      nombre: employee.name.firstName,
      apellido: employee.name.lastName,
      area: employee.area,
      puesto: employee.position,
      _id: employee._id,
      action: '',
      grades: []
    };

    const grades = new Array<IGradeTable>();
    employee.grade.forEach(grade => {
      grades.push({
        nombre: grade.abbreviation,
        apellido: grade.title,
        area: grade.cedula,
        puesto: grade.level,
        _id: employee._id
      });
    });
    tmp.grades = grades.slice();
    return tmp;
  }

  onRowEdit(row: any) {
      const employee: IEmployee = this.castRowToEmploye(row);
      const dialogRef = this.dialog.open(EmployeeGradeComponent, {
        data: {
          Employee: employee,
          Operation: eOperation.EDIT
        },
        disableClose: true,
        hasBackdrop: true,
        width: '45em'
      });

      dialogRef.afterClosed().subscribe((employeeResult: IEmployee) => {
        if (employeeResult) {
          this.employeeProvider.updateEmployee(employeeResult._id, employeeResult).subscribe(data => {
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Empleado actualizado exitosamente', '');
            this.employees[this.employees.indexOf(row)] = this.castEmployeRow(employeeResult);
            this.refresh();

          }, error => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
          });
        }
      });
  }

  getEmployees() {
    const Empleados = new Array<Object>();
    this.employeeProvider.getAllEmployee()
      .subscribe(data => {
        data.employees.forEach(element => {
          Empleados.push(this.castEmployeRow(element));
        });
        this.employees = Empleados;
        this.refresh();
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
      });
  }

  addNewGradeEmployee() {
    const ref = this.dialog.open(EmployeeGradeComponent, {
      id: 'EmployeeModal',
      data: {
        Operation: eOperation.NEW
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });

    ref.afterClosed().subscribe((employeeResult: IEmployee) => {
      if (employeeResult) {
        employeeResult.name.fullName = employeeResult.name.firstName.concat(' ', employeeResult.name.lastName);
        this.employeeProvider.newEmployee(employeeResult).subscribe(data => {
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Empleado registrado exitosamente', '');
          employeeResult._id = data._id;
          this.employees.push(this.castRowToEmploye(employeeResult));
          this.refresh();
        }, error => {
          this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
        });
      }
    });
  }

  onUpload(event) {
    const notificacion = this.notificationServ;
    const provider = this.employeeProvider;
    const ArrayEmployees: IEmployee[] = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: function (results) {
          if (results.data.length > 0) {
            results.data.forEach((element, index) => {
              if (index > 0) {
                const indice = ArrayEmployees.findIndex(x => x.rfc === element[0]);
                let tmpEmployee: IEmployee;
                if (indice !== -1) {
                  const tmpGrade = {
                    title: element[5],
                    cedula: element[6],
                    level: element[7],
                    abbreviation: element[8]
                  };
                  ArrayEmployees[indice].grade.push(tmpGrade);
                } else {
                  if (element.length >= 9) {
                    tmpEmployee = {
                      rfc: element[0],
                      name: {
                        firstName: element[1],
                        lastName: element[2],
                        fullName: element[1].concat(' ', element[2])
                      },
                      area: element[3],
                      position: element[4],
                      grade: [{
                        title: element[5],
                        cedula: element[6],
                        level: element[7],
                        abbreviation: element[8]
                      }]
                    };
                    ArrayEmployees.push(tmpEmployee);
                  }
                }
              }
            });
            console.log('Array emplo', ArrayEmployees);
            provider.csvEmployeGrade(ArrayEmployees).subscribe(res => {
              notificacion.showNotification(eNotificationType.SUCCESS, 'La importación ha sido un éxito', '');
            }, error => {
              console.log(error);
            });
          }
        }
      });
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

interface IRowSource {
  data:
  {
    nombre?: string, apellido?: string, area?: string, puesto?: string, _id?: string
  };
  children?: Array<IRowSource>;
}

interface IGradeTable {
  nombre?: string; apellido?: string; area?: string; puesto?: string; _id?: string; grades?: Array<IGradeTable>; action?: string;
}
