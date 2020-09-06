import {Component, OnInit, ViewChild} from '@angular/core';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatDialog, MatTableDataSource} from '@angular/material';
import * as Papa from 'papaparse';
import {LoadCsvDataComponent} from '../../../commons/load-csv-data/load-csv-data.component';
import {ComponentType} from '@angular/cdk/overlay';

@Component({
  selector: 'app-control-students-main-page',
  templateUrl: './control-students-main-page.component.html',
  styleUrls: ['./control-students-main-page.component.scss']
})
export class ControlStudentsMainPageComponent implements OnInit {
  public search: string;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginator') paginator: MatPaginator;
  public displayedColumns: string[];
  public displayedColumnsName: string[];
  public dataSource: MatTableDataSource<any>;

  constructor( private controlStudentProv: ControlStudentProv,
               private loadingService: LoadingService,
               private dialog: MatDialog,
               private notificationsService: NotificationsServices ) { }

  ngOnInit() {
    this.displayedColumns = ['controlNumber', 'fullName', 'career', 'date', 'actions'];
    this.displayedColumnsName = ['Número de control', 'Nombre completo', 'Carrera', 'Fecha de asistencia'];
    this._getAllControlStudents();
  }

  _getAllControlStudents() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getAllControlStudents().subscribe( res => {
      const controlStudents = res.controlStudents.map(this._castToTable);
      this._refresh(controlStudents);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public refresh() {
    this._getAllControlStudents();
  }

  private _refresh(data: Array<any>): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  _castToTable(data) {
    return {
      _id: data._id,
      studentId: data.studentId._id,
      controlNumber: data.controlNumber,
      fullName: data.studentId.fullName,
      career: data.studentId.career,
      date: data.releaseAssistanceDate
    };
  }

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
                this.controlStudentProv.releaseSocialServiceCsv(_students).subscribe(_ => {
                  this.loadingService.setLoading(false);
                  this.notificationsService.showNotification(eNotificationType.SUCCESS,
                    'La asistencia de los estudiantes ha sido registrada', '');
                  this.refresh();
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
