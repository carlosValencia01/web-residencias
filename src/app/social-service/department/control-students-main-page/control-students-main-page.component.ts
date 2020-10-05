import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { ControlStudentProv } from 'src/app/providers/social-service/control-student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import {ComponentType} from '@angular/cdk/overlay';
import * as Papa from 'papaparse';
import {LoadCsvDataComponent} from '../../../commons/load-csv-data/load-csv-data.component';


@Component({
  selector: 'app-control-students-main-page',
  templateUrl: './control-students-main-page.component.html',
  styleUrls: ['./control-students-main-page.component.scss']
})
export class ControlStudentsMainPageComponent implements OnInit {
  public selectedTab: FormControl;
  public search: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorAttendance') paginatorAttendance: MatPaginator;
  public displayedColumnsAttendance: string[];
  public displayedColumnsAttendanceName: string[];

  public dataSourceAttendance: MatTableDataSource<any>;
  constructor( private controlStudentProv: ControlStudentProv,
                private loadingService: LoadingService,
                private dialog: MatDialog,
                private notificationsService: NotificationsServices) {
              this.selectedTab = new FormControl(0);
  }

  ngOnInit() {
    this.displayedColumnsAttendance = ['controlNumber', 'fullName', 'career', 'date', 'actions'];
    this.displayedColumnsAttendanceName = ['Número de control', 'Nombre completo', 'Carrera', 'Fecha de asistencia'];
    this._getAllControlStudents();
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getAllControlStudents();
      // case 1: return this._getAllSendRequests();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceAttendance.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceAttendance.paginator) {
          this.dataSourceAttendance.paginator.firstPage();
        }
        break;
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
      date: data.releaseAssistanceDate
    };
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
