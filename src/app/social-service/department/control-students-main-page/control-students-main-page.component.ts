import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { ControlStudentProv } from 'src/app/providers/social-service/control-student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import {ComponentType} from '@angular/cdk/overlay';
import * as Papa from 'papaparse';
import {LoadCsvDataComponent} from '../../../commons/load-csv-data/load-csv-data.component';
import {MatChipInputEvent} from '@angular/material/typings/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';

interface ControlNumber {
  controlNumber: string;
}

@Component({
  selector: 'app-control-students-main-page',
  templateUrl: './control-students-main-page.component.html',
  styleUrls: ['./control-students-main-page.component.scss']
})
export class ControlStudentsMainPageComponent implements OnInit {
  public search: string;
  public selectedTab: FormControl;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorAttendance') paginatorAttendance: MatPaginator;
  public displayedColumnsAttendance: string[];
  public displayedColumnsAttendanceName: string[];
  public dataSourceAttendance: MatTableDataSource<any>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  assistance: ControlNumber[] = [];
  public addAssistanceBtn = true;

  constructor( private controlStudentProv: ControlStudentProv,
                private loadingService: LoadingService,
                private dialog: MatDialog,
                private notificationsService: NotificationsServices) {
    this.selectedTab = new FormControl(0);
  }

  ngOnInit() {
    this.displayedColumnsAttendance = ['controlNumber', 'fullName', 'career', 'assistance', 'date', 'actions'];
    this.displayedColumnsAttendanceName = ['Número de control', 'Nombre completo', 'Carrera', 'Asistencia', 'Fecha de asistencia'];
    this._getAllControlStudents();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (/^[A-Za-z]?[0-9]{8,9}$/.test(value)) {
      // Add our fruit
      if ((value || '').trim()) {
        this.assistance.push({controlNumber: value.trim()});
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }
      this.addAssistanceBtn = false;

    } else if (value.length > 0) {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ingrese un número de control valido');
    }
  }

  remove(number: ControlNumber): void {
    const index = this.assistance.indexOf(number);

    if (index >= 0) {
      this.assistance.splice(index, 1);
    }
    if (this.assistance.length === 0) {
      this.addAssistanceBtn = true;
    }
  }

  public applyFilter(filterValue: string) {
      this.dataSourceAttendance.filter = filterValue.trim().toLowerCase();
      if (this.dataSourceAttendance.paginator) {
        this.dataSourceAttendance.paginator.firstPage();
      }
  }

  public refreshAttendance() {
    this._getAllControlStudents();
  }

  _getAllControlStudents() {
    this.loadingService.setLoading(true);
    // Obtención de todos los estudiantes en base de datos en Servicio Social
    this.controlStudentProv.getAllControlStudents().subscribe( res => {
      const controlStudents = res.controlStudents.map(this._castToTableAttendance);
      this._refreshAttendance(controlStudents);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
  }

  private _refreshAttendance(data: Array<any>): void {
    this.dataSourceAttendance = new MatTableDataSource(data);
    this.dataSourceAttendance.paginator = this.paginatorAttendance;
    this.dataSourceAttendance.sort = this.sort;
  }

  _castToTableAttendance(data) {
    return {
      _id: data._id,
      studentId: data.studentId._id,
      controlNumber: data.controlNumber,
      fullName: data.studentId.fullName,
      career: data.studentId.career,
      assistance: data.verification.assistance,
      date: data.releaseAssistanceDate
    };
  }

  // function para guardar las asistencias de forma manual
  addAssistance() {
    this.controlStudentProv.releaseSocialServiceCsv(this.assistance).subscribe(_ => {
      this.loadingService.setLoading(false);
      this.notificationsService.showNotification(eNotificationType.SUCCESS,
        'La asistencia de los estudiantes ha sido registrada', '');
      this.selectedTab.setValue(0);
      this.assistance = [];
      this.refreshAttendance();
    }, _ => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Ocurrió un error al registrar la asistencia de los estudiantes', '');
      this.loadingService.setLoading(false);
    });
  }

  // function para quitar asistencia a alumno, a traves de cambiar el estatus a false de la propiedad assistance
  removeAssistance(controlStudentId) {
    this.controlStudentProv.updateGeneralControlStudent(controlStudentId, {'verification.assistance': false})
      .subscribe( () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Se ha retirado la asistencia del estudiante', '');
        this.refreshAttendance();
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Ocurrió un error al remover la asistencia del estudiante', 'Intentelo más tarde');
      });
  }

  // Evento para cargar asistencia de alumnos mediante csv
  onUpload(event) {
    const students = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (results) => {
          if (results.data.length > 0) {
            results.data.slice(1).forEach(element => {
              if (element[0]) {
                const index = students.findIndex(student => student.controlNumber === element[0]);
                if (index === -1) {
                  students.push({ controlNumber: element[0], fullName: element[1] });
                }
              }
            });
            const _data = {
              config: {
                title: 'Asistencia de platicas de Servicio social',
                displayedColumns: ['controlNumber', 'fullName'],
                displayedColumnsName: ['Número de control', 'Nombre completo']
              },
              componentData: students
            };
            const refDialog = this._openDialog(LoadCsvDataComponent, 'SocialServiceRelease', _data);
            refDialog.afterClosed().subscribe((_students: Array<any>) => {
              if (_students) {
                this.loadingService.setLoading(true);
                // Carga de los estudiantes que Existan y hayamos elegido para su carga a la base de datos (asistencia)
                this.controlStudentProv.releaseSocialServiceCsv(_students).subscribe(_ => {
                  this.loadingService.setLoading(false);
                  this.notificationsService.showNotification(eNotificationType.SUCCESS,
                    'La asistencia de los estudiantes ha sido registrada', '');
                  this.refreshAttendance();
                }, _ => {
                  this.notificationsService.showNotification(eNotificationType.ERROR,
                    'Ocurrió un error al registrar la asistencia de los estudiantes', '');
                  this.loadingService.setLoading(false);
                });
              }
            });
          }
        }
      });
    }
  }

  // Carga del componente modal
  private _openDialog(component: ComponentType<any>, id?: string, data?: any) {
    return this.dialog.open(component, {
      id: id ? id : '',
      data: data ? data : null,
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });
  }

}
