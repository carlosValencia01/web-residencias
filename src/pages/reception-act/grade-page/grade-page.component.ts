import {Component, Injectable, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';

import {CookiesService} from 'src/services/app/cookie.service';
import {EmployeeGradeComponent} from 'src/modals/reception-act/employee-grade/employee-grade.component';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {eOperation} from 'src/enumerators/reception-act/operation.enum';
import {IEmployee} from 'src/entities/shared/employee.model';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {UploadEmployeesCsvComponent} from 'src/modals/electronic-signature/upload-employees-csv/upload-employees-csv.component';

@Component({
  selector: 'app-grade-page',
  templateUrl: './grade-page.component.html',
  styleUrls: ['./grade-page.component.scss'],
})
@Injectable()
export class GradePageComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource: MatTableDataSource<IGradeTable>;
  public displayedColumns: string[];
  public loading: Boolean;
  private employees: any;

  constructor(
    private cookiesService: CookiesService,
    public dialog: MatDialog,
    public employeeProvider: EmployeeProvider,
    private notificationServ: NotificationsServices,
    private routeActive: ActivatedRoute,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.loading = false;
  }

  ngOnInit() {
    this.displayedColumns = ['fullName', 'rfc', 'email', 'grades', 'positions', 'action'];
    this.getEmployees();
  }

  private refresh(): void {
    this.dataSource = new MatTableDataSource(this.employees);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private castRowToEmployee(row: IGradeTable): IEmployee {
    return row.employee;
  }

  private castEmployeeRow(employee: IEmployee): IGradeTable {
    const tmp: IGradeTable = {
      _id: employee._id,
      rfc: employee.rfc,
      email: employee.email,
      fullName: employee.name.fullName,
      grades: employee.grade ? employee.grade.length : 0,
      positions: employee.positions ? employee.positions.filter(item => item.status === 'ACTIVE').length : 0,
      employee: employee,
      action: '',
    };
    return tmp;
  }

  public onRowEdit(row: IGradeTable) {
      const employee: IEmployee = this.castRowToEmployee(row);
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
          this.loading = true;
          employeeResult.name.fullName = employeeResult.name.firstName.concat(' ', employeeResult.name.lastName);
          this.employeeProvider.updateEmployee(employeeResult._id, employeeResult).subscribe(data => {
            this.loading =  false;
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Empleado actualizado exitosamente', '');
            this.employees[this.employees.indexOf(row)] = this.castEmployeeRow(employeeResult);
            this.refresh();
          }, error => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
            this.loading = false;
          });
        }
      });
  }

  public employeeDetails(row: IGradeTable) {
    this.router.navigate([row._id], {relativeTo: this.routeActive});
  }

  private getEmployees() {
    const Empleados = new Array<Object>();
    this.loading = true;
    this.employeeProvider.getAllEmployee()
      .subscribe(data => {
        this.loading = false;
        data.employees.forEach(element => {
          Empleados.push(this.castEmployeeRow(element));
        });
        this.employees = Empleados;
        this.refresh();
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
        this.loading = false;
      });
  }

  public addNewEmployee() {
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
        this.loading = true;
        employeeResult.name.fullName = employeeResult.name.firstName.concat(' ', employeeResult.name.lastName);
        this.employeeProvider.newEmployee(employeeResult).subscribe(data => {
          this.loading = false;
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Empleado registrado exitosamente', '');
          employeeResult._id = data._id;
          this.employees.push(this.castEmployeeRow(employeeResult));
          this.router.navigate([employeeResult._id], {relativeTo: this.routeActive});
        }, err => {
          const message = JSON.parse(err._body).error;
          this.notificationServ.showNotification(eNotificationType.ERROR, message, '');
          this.loading = false;
        });
      }
    });
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public refreshEmployees() {
    this.getEmployees();
  }

  public uploadEmployeesCsv() {
    const ref = this.dialog.open(UploadEmployeesCsvComponent, {
      id: 'UploadEmployeesModal',
      disableClose: true,
      hasBackdrop: true,
      width: '70em',
    });

    ref.afterClosed().subscribe((employees) => {
      if (employees && employees.length) {
        this.loading = true;
        this.employeeProvider.csvEmployeGrade(employees).subscribe(_ => {
          this.loading = false;
          this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Los empleados se han guardado con éxito', '');
          this.refreshEmployees();
        }, _ => {
          this.notificationServ.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error al importar los empleados', '');
          this.loading = false;
        });
      }
    });
  }

}

interface IGradeTable {
  _id?: string;
  rfc?: string;
  email?: string;
  fullName?: string;
  grades?: number;
  positions?: number;
  employee?: IEmployee;
  action?: string;
}
