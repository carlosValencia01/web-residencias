import {ActivatedRoute, Params, Router} from '@angular/router';
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
  public positions: Array<IPosition>;
  public grades: Array<IGrade>;
  public image_src: any;
  public isChangedPositions = false;
  public isChangedGrades = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private employeeProvider: EmployeeProvider,
    private notifications: NotificationsServices,
    private router: Router,
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
          this.employee = data.employee;
          this.positions = this.employee.positions.slice();
          this.grades = this.employee.grade.slice();
          this._refreshGradesTable();
          this._refreshPositionsTable();
          if (this.employee.filename) {
            this.employeeProvider.getImageTest(this.employee._id)
              .subscribe(img_data => {
                this._createImageFromBlob(img_data);
              });
          }
        });
    });
  }

  public onRowRemoveGrade(row: IGrade) {
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
        this.grades.splice(this.grades.indexOf(<IGrade>row), 1);
        this._refreshGradesTable();
        this.isChangedGrades = true;
      }
    });
  }

  public onRowRemovePosition(row: IPosition) {
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
        this.positions.splice(this.positions.indexOf(<IGrade>row), 1);
        this._refreshPositionsTable();
        this.isChangedPositions = true;
      }
    });
  }

  public saveGrades() {
    Swal.fire({
      title: 'Actualización de grados',
      text: `Los grados del empleado ${this.employee.name.fullName}, se van actualizar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this._saveEmployeeGrades(this.grades)
          .then(_ => {
            this.notifications.showNotification(eNotificationType.SUCCESS, 'Grados', '¡Actualización exitosa!');
            this.isChangedGrades = false;
            this.employee.grade = this.grades.slice();
          })
          .catch(_ => {
            this.notifications.showNotification(eNotificationType.ERROR, 'Grados', '¡Actualización fallida, intente de nuevo!');
          });
      }
    });
  }

  public savePositions() {
    Swal.fire({
      title: 'Actualización de puestos',
      text: `Los puestos del empleado ${this.employee.name.fullName}, se van actualizar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this._saveEmployeePositions(this.positions)
          .then(_ => {
            this.notifications.showNotification(eNotificationType.SUCCESS, 'Puestos', '¡Actualización exitosa!');
            this.isChangedPositions = false;
            this.employee.positions = this.positions.slice();
          })
          .catch(_ => {
            this.notifications.showNotification(eNotificationType.ERROR, 'Puestos', '¡Actualización fallida, intente de nuevo!');
          });
      }
    });
  }

  public newGrade() {
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
        this.grades.push(grade);
        this._refreshGradesTable();
        this.isChangedGrades = true;
      }
    });
  }

  public newPosition() {
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
        this.positions.push(position);
        this._refreshPositionsTable();
        this.isChangedPositions = true;
      }
    });
  }

  public saveAll() {
    Swal.fire({
      title: 'Actualización',
      text: `Los puestos y grados del empleado ${this.employee.name.fullName}, se van actualizar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then(async (result) => {
      if (result.value) {
        await this._callSaveGradesAndPositions('Puestos y grados guardados con éxito', this.positions, this.grades);
      }
    });
  }

  public discardAllChanges() {
    Swal.fire({
      title: 'Descartar cambios',
      text: `Los puestos y grados del empleado ${this.employee.name.fullName},
       volverán a su estado inicial. ¿Desea descartar los cambios?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.positions = this.employee.positions.slice();
        this.grades = this.employee.grade.slice();
        this.isChangedPositions = false;
        this.isChangedGrades = false;
        this._refreshPositionsTable();
        this._refreshGradesTable();
      }
    });
  }

  public discardPositionsChanges() {
    Swal.fire({
      title: 'Descartar cambios',
      text: `Los puestos del empleado ${this.employee.name.fullName},
       volverán a su estado inicial. ¿Desea descartar los cambios?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.positions = this.employee.positions.slice();
        this.isChangedPositions = false;
        this._refreshPositionsTable();
      }
    });
  }

  public discardGradesChanges() {
    Swal.fire({
      title: 'Descartar cambios',
      text: `Los grados del empleado ${this.employee.name.fullName},
       volverán a su estado inicial. ¿Desea descartar los cambios?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.grades = this.employee.grade.slice();
        this.isChangedGrades = false;
        this._refreshGradesTable();
      }
    });
  }

  public goBack() {
    if (this.isChangedPositions || this.isChangedGrades) {
      let message = 'Hay cambios en los ';
      message += this.isChangedPositions ? 'puestos' : '';
      message += this.isChangedGrades ? this.isChangedPositions ? ' y grados' : 'grados' : '';
      message += ` del empleado ${this.employee.name.fullName}, que no se han guardado. ¿Desea guardar los cambios antes de salir?`;
      Swal.fire({
        title: '¡Cambios sin guardar!',
        text: message,
        type: 'question',
        allowOutsideClick: false,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: 'red',
        confirmButtonText: '¡Guardar y salir!',
        cancelButtonText: 'Salir sin guardar',
        focusConfirm: true
      }).then(async (result) => {
        if (result.value) {
          if (await this._callSaveGradesAndPositions('Datos guardados con éxito', this.positions, this.grades)) {
            this._back();
          }
        } else {
          if (result.dismiss.toString() === 'cancel') {
            this._back();
          }
        }
      });
    } else {
      this._back();
    }
  }

  private _createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.image_src = reader.result;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  private async _callSaveGradesAndPositions(messageOk: string, positions: Array<IPosition>, grades: Array<IGrade>) {
    return new Promise(resolve => {
      this._saveEmployeeGradesAndPositions(positions, grades)
        .then(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, '¡Actualización!', messageOk);
          this.isChangedPositions = false;
          this.isChangedGrades = false;
          this.employee.positions = this.positions.slice();
          this.employee.grade = this.grades.slice();
          resolve(true);
        })
        .catch(_ => {
          this.notifications.showNotification(eNotificationType.ERROR, '¡Actualización!', 'Ocurrió un error al guardar los cambios');
          resolve(false);
        });
    });
  }

  private _refreshGradesTable(): void {
    this.dataSourceGrades.data = this.grades;
    this.dataSourceGrades.paginator = this.paginatorGrades;
  }

  private _refreshPositionsTable(): void {
    this.dataSourcePositions.data = this.positions;
    this.dataSourcePositions.paginator = this.paginatorPositions;
  }

  private _saveEmployeePositions(positions: Array<IPosition>) {
    return new Promise((resolve, reject) => {
      this.employeeProvider.updateEmployeePositions(this.employee._id, positions)
        .subscribe(_ => {
          resolve();
        }, _ => {
          reject();
        });
    });
  }

  private _saveEmployeeGrades(grades: Array<IGrade>) {
    return new Promise((resolve, reject) => {
      this.employeeProvider.updateEmployeeGrades(this.employee._id, grades)
        .subscribe(_ => {
          resolve();
        }, _ => {
          reject();
        });
    });
  }

  private _saveEmployeeGradesAndPositions(positions: Array<IPosition>, grades: Array<IGrade>) {
    return new Promise((resolve, reject) => {
      this.employeeProvider
        .updateGradesAndPositions(this.employee._id, {
          positions: positions,
          grades: grades
        })
        .subscribe(_ => {
          resolve();
        }, _ => {
          reject();
        });
    });
  }

  private _back() {
    this.router.navigate(['/grades']);
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
