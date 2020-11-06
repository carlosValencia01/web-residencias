import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {FormControl} from '@angular/forms';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-control-students-process-page',
  templateUrl: './control-students-process-page.component.html',
  styleUrls: ['./control-students-process-page.component.scss']
})
export class ControlStudentsProcessPageComponent implements OnInit {
  public selectedTab: FormControl;

  public search: string;
  @ViewChild('sortReport') sortReport: MatSort;
  @ViewChild('matPaginatorReport') paginatorReport: MatPaginator;
  public displayedColumnsReport: string[];
  public displayedColumnsReportName: string[];
  public dataSourceReport: MatTableDataSource<any>;

  private userData;


  constructor( private controlStudentProv: ControlStudentProv,
               private loadingService: LoadingService,
               private cookiesService: CookiesService,
               private notificationsService: NotificationsServices ) {
    this.userData = this.cookiesService.getData().user;
    this.selectedTab = new FormControl(0);
    this._getReport();
  }

  ngOnInit() {
    this.displayedColumnsReport = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsReportName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getReport();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceReport.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceReport.paginator) {
          this.dataSourceReport.paginator.firstPage();
        }
        break;
    }
  }

  addNewReport(controlStudentId) {
    Swal.fire({
      title: 'Nuevo Reporte Bimestral',
      text: '¿Esta seguro de agregar un nuevo reporte bimestral al estudiante?',
      type: 'info',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.value) {
        this.controlStudentProv.addOneReportToStudent(controlStudentId)
          .subscribe(res => {
            this.notificationsService.showNotification(eNotificationType.SUCCESS,
              'Exito', res.msg);
            this.refreshReport();
          }, error => {
            const message = JSON.parse(error._body).message || 'Error al agregar, intentelo más tarde';
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Error', message);
          });
      }
    });
  }

  removeOneReport(controlStudentId) {
    Swal.fire({
      title: 'Remover Reporte Bimestral',
      text: '¿Esta seguro de remover un reporte bimestral al estudiante?',
      type: 'info',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Remover',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.value) {
        this.controlStudentProv.removeOneReportToStudent(controlStudentId)
          .subscribe(res => {
            this.notificationsService.showNotification(eNotificationType.SUCCESS,
              'Exito', res.msg);
            this.refreshReport();
          }, error => {
            const message = JSON.parse(error._body).msg || 'Error al remover, intentelo más tarde';
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Error', message);
          });
      }
    });
  }

  _getReport() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getRequests('all').subscribe(res => {
        const reportRequest = res.controlStudents.map(this._castToTable);
        this._refreshReport(reportRequest);
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', 'Ha sucedido un error en la descarga de la información');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      }
    );
  }

  public refreshReport() {
    this._getReport();
  }

  private _refreshReport(data: Array<any>): void {
    this.dataSourceReport = new MatTableDataSource(data);
    this.dataSourceReport.paginator = this.paginatorReport;
    this.dataSourceReport.sort = this.sortReport;
  }

  _castToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: '0/' + data.verification.reports.length
    };
  }

}
