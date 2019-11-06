import {ActivatedRoute, Params} from '@angular/router';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import Swal from 'sweetalert2';

import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {eOperation} from 'src/enumerators/reception-act/operation.enum';
import {IDepartment} from 'src/entities/shared/department.model';
import {IEmployee} from 'src/entities/shared/employee.model';
import {IGrade} from 'src/entities/reception-act/grade.model';
import {IPosition} from 'src/entities/shared/position.model';
import {NewGradeComponent} from 'src/modals/reception-act/new-grade/new-grade.component';
import {NewPositionComponent} from 'src/modals/electronic-signature/new-position/new-position.component';
import {NotificationsServices} from 'src/services/app/notifications.service';

@Component({
  selector: 'app-employee-page',
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss']
})
export class EmployeePageComponent implements OnInit {
  @ViewChild('matPaginatorGrades') set paginatorGrades(paginator: MatPaginator) {
    this.dataSourceGrades.paginator = paginator;
  }

  @ViewChild('matPaginatorPositions') set paginatorPositions(paginator: MatPaginator) {
    this.dataSourcePositions.paginator = paginator;
  }

  public dataSourceGrades: MatTableDataSource<IGradeTable>;
  public dataSourcePositions: MatTableDataSource<IPositionTable>;
  public displayedColumnsGrades: string[];
  public displayedColumnsPositions: string[];
  public employee: IEmployee;
  public image_src: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private employeeProvider: EmployeeProvider,
    private dialog: MatDialog,
    private notifications: NotificationsServices,
  ) {
    this.dataSourceGrades = new MatTableDataSource();
    this.dataSourcePositions = new MatTableDataSource();
  }

  ngOnInit() {
    this.displayedColumnsGrades = ['abbreviation', 'title', 'cedula', 'level', 'actions'];
    this.displayedColumnsPositions = ['name', 'ascription', 'canSign', 'actions'];
    this.activatedRoute.params.subscribe((params: Params) => {
      this.employeeProvider.getEmployeeById(params.id)
        .subscribe(data => {
          console.log(data.employee);
          this.employee = data.employee;
          this.refreshGradesTable();
          this.refreshPositionsTable();
          if (this.employee.filename) {
            this.employeeProvider.getImageTest(this.employee._id)
              .subscribe(img_data => {
                this.createImageFromBlob(img_data);
              });
          }
        });
    });
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.image_src = reader.result;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  onRowRemoveGrade(row: IGrade) {
    Swal.fire({
      title: 'Borrar grado',
      text: `El grado ${row.title} del empleado ${this.employee.name.fullName}, se va a borrar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        const grades = this.employee.grade;
        grades.splice(grades.indexOf(<IGrade>row), 1);
        this.employee.grade = grades.slice();
        this.refreshGradesTable();
      }
    });
  }

  onRowRemovePosition(row: IPosition) {
    Swal.fire({
      title: 'Borrar puesto',
      text: `El puesto ${row.name} del empleado ${this.employee.name.fullName}, se va a borrar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        const positions = this.employee.positions;
        positions.splice(positions.indexOf(<IGrade>row), 1);
        this.employee.positions = positions.slice();
        this.refreshPositionsTable();
      }
    });
  }

  refreshGradesTable(): void {
    this.dataSourceGrades.data = this.employee.grade;
    this.dataSourceGrades.paginator = this.paginatorGrades;
  }

  refreshPositionsTable(): void {
    this.dataSourcePositions.data = this.employee.positions;
    this.dataSourcePositions.paginator = this.paginatorPositions;
  }

  saveGrades() {
    Swal.fire({
      title: 'Actualización de grados',
      text: `Los grados del empleado ${this.employee.name.fullName}, se van actualizar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.employeeProvider.updateEmployeeGrades(this.employee)
          .subscribe(data => {
            if (data.status === 200) {
              this.notifications.showNotification(eNotificationType.SUCCESS, 'Grados', '¡Actualización exitosa!');
            } else {
              this.notifications.showNotification(eNotificationType.ERROR, 'Grados', '¡Actualización fallida, intente de nuevo!');
            }
          });
      }
    });
  }

  savePositions() {
    Swal.fire({
      title: 'Actualización de puestos',
      text: `Los puestos del empleado ${this.employee.name.fullName}, se van actualizar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.employeeProvider.updateEmployeePositions(this.employee)
          .subscribe(data => {
            if (data.status === 200) {
              this.notifications.showNotification(eNotificationType.SUCCESS, 'Puestos', '¡Actualización exitosa!');
            } else {
              this.notifications.showNotification(eNotificationType.ERROR, 'Puestos', '¡Actualización fallida, intente de nuevo!');
            }
          });
      }
    });
  }

  newGrade() {
    const dialogRef = this.dialog.open(NewGradeComponent, {
      id: 'NewGradeModal',
      data: {
        Operation: eOperation.NEW
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });

    dialogRef.afterClosed().subscribe((grade: IGrade) => {
      if (grade) {
        this.employee.grade.push(grade);
        this.refreshGradesTable();
      }
    });
  }

  newPosition() {
    const dialogRef = this.dialog.open(NewPositionComponent, {
      id: 'NewPositionModal',
      data: {
        operationMode: eOperation.NEW
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });

    dialogRef.afterClosed().subscribe((position: IPosition) => {
      if (position) {
        this.employee.positions.push(position);
        this.refreshPositionsTable();
      }
    });
  }
}

interface IGradeTable {
  title?: string;
  cedula?: string;
  level?: string;
  actions?: string;
}

interface IPositionTable {
  name?: string;
  ascription?: IDepartment;
  canSign?: boolean;
  actions?: string;
}
