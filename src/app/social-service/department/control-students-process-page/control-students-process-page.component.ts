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

  @ViewChild('sortProcess') sortProcess: MatSort;
  @ViewChild('matPaginatorProcess') paginatorProcess: MatPaginator;
  public displayedColumnsProcess: string[];
  public displayedColumnsProcessName: string[];
  public dataSourceProcess: MatTableDataSource<any>;

  @ViewChild('sortReport') sortReport: MatSort;
  @ViewChild('matPaginatorReport') paginatorReport: MatPaginator;
  public displayedColumnsReport: string[];
  public displayedColumnsReportName: string[];
  public dataSourceReport: MatTableDataSource<any>;

  @ViewChild('sortLastReport') sortLastReport: MatSort;
  @ViewChild('matPaginatorLastReport') paginatorLastReport: MatPaginator;
  public displayedColumnsLastReport: string[];
  public displayedColumnsLastReportName: string[];
  public dataSourceLastReport: MatTableDataSource<any>;

  @ViewChild('sortPreAssigned') sortPreAssigned: MatSort;
  @ViewChild('matPaginatorPreAssigned') paginatorPreAssigned: MatPaginator;
  public displayedColumnsPreAssigned: string[];
  public displayedColumnsPreAssignedName: string[];
  public dataSourcePreAssigned: MatTableDataSource<any>;

  @ViewChild('sortPreSign') sortPreSign: MatSort;
  @ViewChild('matPaginatorPreSign') paginatorPreSign: MatPaginator;
  public displayedColumnsPreSign: string[];
  public displayedColumnsPreSignName: string[];
  public dataSourcePreSign: MatTableDataSource<any>;

  @ViewChild('sortApproved') sortApproved: MatSort;
  @ViewChild('matPaginatorApproved') paginatorApproved: MatPaginator;
  public displayedColumnsApproved: string[];
  public displayedColumnsApprovedName: string[];
  public dataSourceApproved: MatTableDataSource<any>;

  private userData;
  private readonly positionName: String;


  constructor( private controlStudentProv: ControlStudentProv,
               private loadingService: LoadingService,
               private cookiesService: CookiesService,
               private notificationsService: NotificationsServices ) {
    this.userData = this.cookiesService.getData().user;
    this.positionName = this.cookiesService.getPosition().name;
    this.selectedTab = new FormControl(0);
    this._getByNotEqualGeneralStatus('solicitude');
  }

  ngOnInit() {
    this.displayedColumnsProcess = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsProcessName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
    this.displayedColumnsReport = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsReportName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
    this.displayedColumnsLastReport = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsLastReportName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
    this.displayedColumnsPreAssigned = ['no', 'fullName', 'controlNumber', 'career', 'actions'];
    this.displayedColumnsPreAssignedName = ['Nombre', 'Número de control', 'Carrera'];
    this.displayedColumnsPreSign = ['no', 'fullName', 'controlNumber', 'career', 'tradeNumber', 'performance', 'status', 'actions'];
    this.displayedColumnsPreSignName = ['Nombre', 'Número de control', 'Carrera', 'No. Oficio', 'Desempeño', 'Estatus'];
    this.displayedColumnsApproved = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsApprovedName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getByNotEqualGeneralStatus('solicitude');
      case 1: return this._getReport();
      case 2: return this._getLastReport();
      case 3: return this._getByGeneralStatus('preAssigned');
      case 4: return this._getByGeneralStatus('preSign');
      case 5: return this._getByGeneralStatus('approved');
    }
  }


  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceProcess.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceProcess.paginator) {
          this.dataSourceProcess.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceReport.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceReport.paginator) {
          this.dataSourceReport.paginator.firstPage();
        }
        break;
      case 2:
        this.dataSourceLastReport.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceLastReport.paginator) {
          this.dataSourceLastReport.paginator.firstPage();
        }
        break;
      case 3:
        this.dataSourcePreAssigned.filter = filterValue.trim().toLowerCase();
        if (this.dataSourcePreAssigned.paginator) {
          this.dataSourcePreAssigned.paginator.firstPage();
        }
        break;
      case 4:
        this.dataSourcePreSign.filter = filterValue.trim().toLowerCase();
        if (this.dataSourcePreSign.paginator) {
          this.dataSourcePreSign.paginator.firstPage();
        }
        break;
      case 5:
        this.dataSourceApproved.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceApproved.paginator) {
          this.dataSourceApproved.paginator.firstPage();
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

  _getByNotEqualGeneralStatus(status: string) {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getControlStudentByNotEqualGeneralStatus(status).subscribe(res => {
        const request = res.controlStudents.map(this._castToTableProcess);
        this._refreshProcess(request);
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', 'Ha sucedido un error en la descarga de la información');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      }
    );
  }

  _getReport() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getControlStudentByGeneralStatus('process').subscribe(res => {
        const missingReports = res.controlStudents.filter(s => s.verification.reports.some(r => r.status !== 'approved') ||
                                        s.verification.managerEvaluations.some(m => m.status !== 'approved') ||
                                        s.verification.selfEvaluations.some(e => e.status !== 'approved'));
        const reportRequest = missingReports.map(this._castReportToTable);
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

  _getLastReport() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getControlStudentByGeneralStatus('process').subscribe(res => {
        const lastReports = res.controlStudents.filter(s => s.verification.reports.every(r => r.status === 'approved') &&
          s.verification.managerEvaluations.every(m => m.status === 'approved') &&
          s.verification.selfEvaluations.every(e => e.status === 'approved'));
        const reportRequest = lastReports.map(this._castLastToTable);
        this._refreshLastReport(reportRequest);
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', 'Ha sucedido un error en la descarga de la información');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      }
    );
  }

  _getByGeneralStatus(status: string) {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getControlStudentByGeneralStatus(status).subscribe(res => {
        const request = res.controlStudents.map(this._castToTable);
        switch (status) {
          case 'preAssigned':
            this._refreshPreAssigned(request);
            break;
          case 'preSign':
            this._refreshPreSign(res.controlStudents.map(this._castToTablePreSign));
            break;
          case 'approved':
            this._refreshApproved(request);
            break;
        }
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', 'Ha sucedido un error en la descarga de la información');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      }
    );
  }

  public refreshProcess() {
    this._getByNotEqualGeneralStatus('solicitude');
  }

  public refreshReport() {
    this._getReport();
  }

  public refreshLastReport() {
    this._getLastReport();
  }

  public refreshPreAssigned() {
    this._getByGeneralStatus('preAssigned');
  }

  public refreshPreSign() {
    this._getByGeneralStatus('preSign');
  }

  public refreshApproved() {
    this._getByGeneralStatus('approved');
  }

  private _refreshProcess(data: Array<any>): void {
    this.dataSourceProcess = new MatTableDataSource(data);
    this.dataSourceProcess.paginator = this.paginatorProcess;
    this.dataSourceProcess.sort = this.sortProcess;
  }

  private _refreshReport(data: Array<any>): void {
    this.dataSourceReport = new MatTableDataSource(data);
    this.dataSourceReport.paginator = this.paginatorReport;
    this.dataSourceReport.sort = this.sortReport;
  }

  private _refreshLastReport(data: Array<any>): void {
    this.dataSourceLastReport = new MatTableDataSource(data);
    this.dataSourceLastReport.paginator = this.paginatorLastReport;
    this.dataSourceLastReport.sort = this.sortLastReport;
  }

  private _refreshPreAssigned(data: Array<any>): void {
    this.dataSourcePreAssigned = new MatTableDataSource(data);
    this.dataSourcePreAssigned.paginator = this.paginatorPreAssigned;
    this.dataSourcePreAssigned.sort = this.sortPreAssigned;
  }

  private _refreshPreSign(data: Array<any>): void {
    this.dataSourcePreSign = new MatTableDataSource(data);
    this.dataSourcePreSign.paginator = this.paginatorPreSign;
    this.dataSourcePreSign.sort = this.sortPreSign;
  }

  private _refreshApproved(data: Array<any>): void {
    this.dataSourceApproved = new MatTableDataSource(data);
    this.dataSourceApproved.paginator = this.paginatorApproved;
    this.dataSourceApproved.sort = this.sortApproved;
  }

  _castToTableProcess(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status:
        data.status === 'preAssigned' ? 'Constancia sin oficio' :
        data.status === 'preSign' ? 'Constancia por firmar' :
        data.status === 'approved' ? 'Liberado' :
          data.status === 'process' && data.verification.reports.every(r => r.status === 'approved') ||
          data.verification.managerEvaluations.every(m => m.status === 'approved') ||
          data.verification.selfEvaluations.every(e => e.status === 'approved') ? 'Reporte Final' : 'Reportes Bimestrales'
    };
  }

  _castToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career
    };
  }

  _castToTablePreSign(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      tradeNumber: data.tradeConstancyDocumentNumber,
      performance: data.performanceLevelConstancyDocument,
      status: data.verification.constancy
    };
  }

  _castReportToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.verification.reports.filter(r => r.status === 'approved').length + '/' + data.verification.reports.length
    };
  }

  _castLastToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.verification.lastReport === 'reevaluate' ||
              data.verification.lastReportEvaluation === 'reevaluate' ? 'reevaluate' : 'send'
    };
  }

  public verifyPositionBoss(): boolean {
    return this.positionName === 'JEFE DE DEPARTAMENTO';
  }

  signConstancyDocument(controlStudentId) {
    Swal.fire({
      title: '¿Esta seguro/a de continuar?',
      type: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si'
    }).then((res) => {
      if (res.value) {
        this.controlStudentProv.updateGeneralControlStudent(controlStudentId,
          {'verification.signs.constancy.signDepartmentName': this.userData.name.fullName,
                  'verification.signs.constancy.signDepartmentDate': new Date(),
                  'verification.constancy': 'firstSign'})
          .subscribe(() => {
            this.notificationsService.showNotification(eNotificationType.SUCCESS,
              'Se ha registrado su firma al documento', '');
            this.refreshPreAssigned();
          }, () => {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Ha sucedido un error, no se ha registrado su firma al documento', 'Vuelva a intentarlo mas tarde');
          });
      }
    });
  }

  assignTradeDocumentNumber(controlStudentId) {
    Swal.fire({
      title: 'Asignación de Número de Oficio',
      type: 'question',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Asignar'
    }).then((resultA) => {
      if (resultA.value) {
        Swal.fire({
          title: 'Asignación de Nivel de Desempeño del Estudiante',
          type: 'question',
          input: 'select',
          inputOptions: {
            'Excelente': 'Excelente',
            'Notable': 'Notable',
            'Bueno': 'Bueno',
            'Suficiente': 'Suficiente',
            'Insuficiente': 'Insuficiente'
          },
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          cancelButtonColor: '#d33',
          confirmButtonColor: '#3085d6',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Asignar'
        }).then((resultB) => {
          if (resultB.value) {
            console.log(resultB.value);
            Swal.fire({
              title: '¿Esta seguro de continuar?',
              type: 'warning',
              showCancelButton: true,
              cancelButtonColor: '#d33',
              confirmButtonColor: '#3085d6',
              cancelButtonText: 'Cancelar',
              confirmButtonText: 'Si'
            }).then((res) => {
              if (res.value) {
                this.controlStudentProv.updateGeneralControlStudent(controlStudentId,
                  {'status': 'preSign', 'tradeConstancyDocumentNumber': resultA.value, 'performanceLevelConstancyDocument': resultB.value})
                  .subscribe(() => {
                    this.notificationsService.showNotification(eNotificationType.SUCCESS,
                      'Se ha asignado correctamente el número de oficio y nivel de desempeño al estudiante', '');
                    this.refreshPreAssigned();
                  }, () => {
                    this.notificationsService.showNotification(eNotificationType.ERROR,
                      'Ha sucedido un error, no se ha asignado el número de oficio al estudiante', 'Vuelva a intentarlo mas tarde');
                  });
              }
            });
          }
        });
      }
    });
  }

}
