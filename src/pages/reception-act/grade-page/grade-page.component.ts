import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';

import { CookiesService } from 'src/services/app/cookie.service';
import { EmployeeGradeComponent } from 'src/modals/reception-act/employee-grade/employee-grade.component';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { IEmployee } from 'src/entities/shared/employee.model';
import { NotificationsServices } from 'src/services/app/notifications.service';

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
  }

  ngOnInit() {
    this.displayedColumns = ['fullName', 'rfc', 'grades', 'positions', 'action'];
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
      fullName: employee.name.fullName,
      grades: employee.grade ? employee.grade.length : 0,
      positions: employee.positions ? employee.positions.length : 0,
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
          employeeResult.name.fullName = employeeResult.name.firstName.concat(' ', employeeResult.name.lastName);
          this.employeeProvider.updateEmployee(employeeResult._id, employeeResult).subscribe(data => {
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Empleado actualizado exitosamente', '');
            this.employees[this.employees.indexOf(row)] = this.castEmployeeRow(employeeResult);
            this.refresh();
          }, error => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
          });
        }
      });
  }

  public employeeDetails(row: IGradeTable) {
    this.router.navigate([row._id], {relativeTo: this.routeActive});
  }

  private getEmployees() {
    const Empleados = new Array<Object>();
    this.employeeProvider.getAllEmployee()
      .subscribe(data => {
        data.employees.forEach(element => {
          Empleados.push(this.castEmployeeRow(element));
        });
        this.employees = Empleados;
        this.refresh();
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al recuperar los datos, intente nuevamente', '');
      });
  }

  public addNewGradeEmployee() {
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
          this.employees.push(this.castEmployeeRow(employeeResult));
          this.router.navigate([employeeResult._id], {relativeTo: this.routeActive});
        }, error => {
          this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un problema ' + error, '');
        });
      }
    });
  }

  public onUpload(event) {
    const notification = this.notificationServ;
    const provider = this.employeeProvider;
    const ArrayEmployees: IEmployee[] = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: async results => {
          if (results.data.length > 0) {
            const elements = results.data;
            await this._asyncForEach(elements, async (element, index) => {
              if (index > 0) {
                const employeeIndex = ArrayEmployees.findIndex(x => x.rfc === element[0]);
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
                    ArrayEmployees.splice(employeeIndex, 1);
                    ArrayEmployees.push(this._buildEmployeeStructure(element));
                  }
                } else {
                  if (elements[index].length >= 6) {
                    ArrayEmployees.push(this._buildEmployeeStructure(element));
                  }
                }
              }
            });
            provider.csvEmployeGrade(ArrayEmployees).subscribe(_ => {
              notification.showNotification(eNotificationType.SUCCESS, 'Los empleados se han guardado con éxito', '');
              this.refreshEmployees();
            }, _ => {
              notification.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error al importar los empleados', '');
            });
          }
        }
      });
    }
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

  private _buildEmployeeStructure(data: Array<any>): IEmployee {
    return {
      rfc: data[0],
      curp: data[1],
      name: {
        firstName: data[2],
        lastName: data[3],
        fullName: data[2].concat(' ', data[3])
      },
      gender: data[4],
      birthDate: data[5]
    };
  }

  private async _asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

interface IGradeTable {
  _id?: string;
  rfc?: string;
  fullName?: string;
  grades?: number;
  positions?: number;
  employee?: IEmployee;
  action?: string;
}
