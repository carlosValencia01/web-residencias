import {ActivatedRoute, Params, Router} from '@angular/router';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {MatDialog, MatPaginator, MatTableDataSource} from '@angular/material';
import Swal from 'sweetalert2';
import * as Papa from 'papaparse';
import * as moment from 'moment';

import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {eOperation} from 'src/enumerators/reception-act/operation.enum';
import {IDepartment} from 'src/entities/shared/department.model';
import {IEmployee} from 'src/entities/shared/employee.model';
import {IGrade} from 'src/entities/reception-act/grade.model';
import {IPosition} from 'src/entities/shared/position.model';
import {LoadCsvDataComponent} from 'src/modals/shared/load-csv-data/load-csv-data.component';
import {NewGradeComponent} from 'src/modals/reception-act/new-grade/new-grade.component';
import {NewPositionComponent} from 'src/modals/electronic-signature/new-position/new-position.component';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {PositionsHistoryComponent} from 'src/modals/electronic-signature/positions-history/positions-history.component';

moment.locale('es');

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
  public positions: { actives, inactives };
  public grades: Array<IGrade>;
  public image_src: any;
  public isChangedPositions = false;
  public isChangedGrades = false;
  public employeeeBirthDate: string;

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
    this.activatedRoute.params.subscribe((params: Params) => this._getEmployee(params.id));
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
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Borrar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.positions.actives.splice(this.positions.actives.indexOf(<IPosition>row), 1);
        this._refreshPositionsTable();
        this.isChangedPositions = true;
      }
    });
  }

  public onRowDisablePosition(row: IPosition) {
    Swal.fire({
      title: 'Inhabilitar puesto',
      text: `El puesto ${row.name} del empleado ${this.employee.name.fullName}, se va a inhabilitar. ¿Desea continuar?`,
      type: 'question',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Inhabilitar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        const position = this.positions.actives.find(pos => pos.position._id === row._id);
        this.positions.actives.splice(this.positions.actives.indexOf(position), 1);
        position.deactivateDate = new Date();
        this.positions.inactives.push(position);
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
        const allPositions = this._joinPositions(this.positions);
        this._saveEmployeePositions(allPositions)
          .then(_ => {
            this.notifications.showNotification(eNotificationType.SUCCESS, 'Puestos', '¡Actualización exitosa!');
            this.isChangedPositions = false;
            this.employee.positions = allPositions.slice();
          })
          .catch(_ => {
            this.notifications.showNotification(eNotificationType.ERROR, 'Puestos', '¡Actualización fallida, intente de nuevo!');
          });
      }
    });
  }

  public newGrade() {
    const data = {
      Operation: eOperation.NEW
    };
    const dialogRef = this._openDialog(NewGradeComponent, 'NewGradeModal', data);
    dialogRef.afterClosed().subscribe((grade: IGrade) => {
      if (grade) {
        this.grades.push(grade);
        this._refreshGradesTable();
        this.isChangedGrades = true;
      }
    });
  }

  public newPosition() {
    const data = {
      operationMode: eOperation.NEW,
      employeeId: this.employee._id,
      currentPositions: this.positions
    };
    const dialogRef = this._openDialog(NewPositionComponent, 'NewPositionModal', data);

    dialogRef.afterClosed().subscribe((position: IPosition) => {
      if (position) {
        this._addPosition(position);
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
        const allPositions = this._joinPositions(this.positions);
        await this._callSaveGradesAndPositions('Puestos y grados guardados con éxito', allPositions, this.grades);
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
        this.positions = this._separatePositions(this.employee.positions);
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
        this.positions = this._separatePositions(this.employee.positions);
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
          const allPositions = this._joinPositions(this.positions);
          if (await this._callSaveGradesAndPositions('Datos guardados con éxito', allPositions, this.grades)) {
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

  public showPositionsHistory() {
    const data = {
      positions: this.employee.positions
    };
    const dialogRef = this._openDialog(PositionsHistoryComponent, 'PositionsHistoryModal', data);

    dialogRef.afterClosed()
      .subscribe(position => {
        if (position) {
          this._addPosition(position);
        }
      });
  }

  public onUploadPositions(event) {
    const arrayPositions = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: async results => {
          if (results.data.length > 1) {
            const positions = results.data.slice(1);
            positions.forEach(position => (position.length >= 3) ? arrayPositions.push(this._buildPositionStructure(position)) : null);
            const _displayedColumns = ['name', 'ascription', 'activateDate', 'deactivateDate'];
            const _displayedColumnsName = ['Puesto', 'Departamento', 'Fecha de alta', 'Fecha de baja'];
            const _data = {
              config: {
                title: 'Puestos cargados',
                displayedColumns: _displayedColumns,
                displayedColumnsName: _displayedColumnsName
              },
              componentData: arrayPositions
            };
            const dialogRef = this._openDialog(LoadCsvDataComponent, 'LoadCsvPositions', _data);

            dialogRef.afterClosed()
              .subscribe((_positions: Array<any>) => {
                if (_positions && _positions.length) {
                  this.employeeProvider.uploadCsvPositions(this.employee._id, _positions)
                    .subscribe(_ => {
                      this.notifications.showNotification(eNotificationType.SUCCESS, 'Los puestos se han guardado con éxito', '');
                      this._getEmployee(this.employee._id);
                    }, _ => {
                      this.notifications.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error al importar los puestos', '');
                    });
                }
              });
          }
        }
      });
    }
  }

  public onUploadGrades(event) {
    const arrayGrades: IGrade[] = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: async results => {
          if (results.data.length > 1) {
            const grades = results.data.slice(1);
            grades.forEach(grade => (grade.length >= 4) ? arrayGrades.push(this._buildGradeStructure(grade)) : null);
            const _displayedColumns = ['title', 'cedula', 'abbreviation', 'level'];
            const _displayedColumnsName = ['Titulo', 'Cédula', 'Abreviación', 'Nivel'];
            const _data = {
              config: {
                title: 'Grados cargados',
                displayedColumns: _displayedColumns,
                displayedColumnsName: _displayedColumnsName
              },
              componentData: arrayGrades
            };
            const dialogRef = this._openDialog(LoadCsvDataComponent, 'LoadCsvGrades', _data);

            dialogRef.afterClosed()
              .subscribe((_grades: Array<any>) => {
                if (_grades && _grades.length) {
                  this.employeeProvider.uploadCsvGrades(this.employee._id, _grades)
                    .subscribe(_ => {
                      this.notifications.showNotification(eNotificationType.SUCCESS, 'Los grados se han guardado con éxito', '');
                      this._getEmployee(this.employee._id);
                    }, _ => {
                      this.notifications.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error al importar los grados', '');
                    });
                }
              });
          }
        }
      });
    }
  }

  private _getEmployee(employeeId: string) {
    this.employeeProvider.getEmployeeById(employeeId)
      .subscribe(data => {
        this.employee = data.employee;
        this.employeeeBirthDate = moment(this.employee.birthDate).format('LL');
        this.positions = this._separatePositions(this.employee.positions);
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

  private _callSaveGradesAndPositions(messageOk: string, positions: Array<any>, grades: Array<IGrade>) {
    return new Promise(resolve => {
      this._saveEmployeeGradesAndPositions(positions, grades)
        .then(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, '¡Actualización!', messageOk);
          this.isChangedPositions = false;
          this.isChangedGrades = false;
          this.employee.positions = positions.slice();
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
    this.dataSourcePositions.data = this.positions.actives.map(pos => pos.position);
    this.dataSourcePositions.paginator = this.paginatorPositions;
  }

  private _saveEmployeePositions(positions: Array<any>) {
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

  private _saveEmployeeGradesAndPositions(positions: Array<any>, grades: Array<IGrade>) {
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

  private _separatePositions(allPositions: Array<any>): { actives, inactives } {
    return {
      actives: allPositions.filter(pos => pos.status === 'ACTIVE').map(({status, ...pos}) => pos).slice(),
      inactives: allPositions.filter(pos => pos.status === 'INACTIVE').map(({status, ...pos}) => pos).slice(),
    };
  }

  private _joinPositions(positions: { actives, inactives }): Array<{ position, status }> {
    const actives = positions.actives.map(pos => {
      pos.status = 'ACTIVE';
      return pos;
    });
    const inactives = positions.inactives.map(pos => {
      pos.status = 'INACTIVE';
      return pos;
    });
    return actives.concat(inactives);
  }

  private _buildPositionStructure(data: Array<any>) {
    return {
      name: data[0],
      ascription: data[1],
      activateDate: new Date(data[2]),
      deactivateDate: data[3] ? new Date(data[3]) : null
    };
  }

  private _buildGradeStructure(data: Array<any>): IGrade {
    return <IGrade>{
      title: data[0],
      cedula: data[1],
      abbreviation: data[2],
      level: data[3],
    };
  }

  private _openDialog(component: ComponentType<any>, id?: string, data?: any) {
    return this.dialog.open(component, {
      id: id ? id : '',
      data: data ? data : null,
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });
  }

  private _addPosition(position: IPosition) {
    if (this._isActivePosition(position)) {
      Swal.fire(
        'No se pudo reactivar el puesto',
        `El puesto de ${position.name} ya está activo para este empleado`,
        'warning'
      );
      return;
    }
    const pos = {
      position: position,
      activateDate: new Date()
    };
    this.positions.actives.push(pos);
    this._refreshPositionsTable();
    this.isChangedPositions = true;
  }

  private _isActivePosition(position: IPosition): boolean {
    return this.positions.actives.findIndex(
      item => item.position._id === position._id
        || item.position.name.toUpperCase() === position.name.toUpperCase()) !== -1;
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
