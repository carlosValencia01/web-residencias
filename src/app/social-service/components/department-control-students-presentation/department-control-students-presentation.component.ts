import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';
import {ImageToBase64Service} from '../../../services/app/img.to.base63.service';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';
import {DatePipe} from '@angular/common';
import {InitPresentationDocument} from '../../../entities/social-service/initPresentationDocument';
import {InitRequestModel} from '../../../entities/social-service/initRequest.model';

@Component({
  selector: 'app-department-control-students-presentation',
  templateUrl: './department-control-students-presentation.component.html',
  styleUrls: ['./department-control-students-presentation.component.scss']
})
export class DepartmentControlStudentsPresentationComponent implements OnInit {
  public selectedTab: FormControl;
  public search: string;
  @ViewChild(MatSort) sortNoNumber: MatSort;
  @ViewChild(MatSort) sortWithNumber: MatSort;
  @ViewChild(MatSort) sortSign: MatSort;
  @ViewChild('matPaginatorNoNumber') paginatorNoNumber: MatPaginator;
  @ViewChild('matPaginatorNumber') paginatorNumber: MatPaginator;
  @ViewChild('matPaginatorSign') paginatorSign: MatPaginator;

  public displayedColumnsNoNumber: string[];
  public displayedColumnsNoNumberName: string[];
  public displayedColumnsNumber: string[];
  public displayedColumnsNumberName: string[];
  public displayedColumnsReevaluation: string[];
  public displayedColumnsReevaluationName: string[];

  public dataSourceNoNumber: MatTableDataSource<any>;
  public dataSourceNumber: MatTableDataSource<any>;
  public dataSourceReevaluation: MatTableDataSource<any>;

  private readonly positionName: String;
  initRequest: InitPresentationDocument;
  formDocument: InitRequestModel;
  public pdf;


  constructor(private loadingService: LoadingService,
              private cookiesService: CookiesService,
              public imgSrv: ImageToBase64Service,
              private dateFormat: DatePipe,
              private inscriptionsProv: InscriptionsProvider,
              private notificationsService: NotificationsServices,
              private controlStudentProv: ControlStudentProv) {
    this.selectedTab = new FormControl(0);
    this.positionName = this.cookiesService.getPosition().name;
    this.initRequest = new InitPresentationDocument(this.imgSrv, this.cookiesService);
  }

  ngOnInit() {
    this.displayedColumnsNoNumber = ['no', 'fullName', 'controlNumber', 'career', 'tradeDocumentNumber', 'actions'];
    this.displayedColumnsNoNumberName = ['Nombre', 'Número de control', 'Carrera', 'No. Oficio'];
    this.displayedColumnsNumber = ['no', 'fullName', 'controlNumber', 'career', 'tradeDocumentNumber', 'actions'];
    this.displayedColumnsNumberName = ['Nombre', 'Número de control', 'Carrera', 'No. Oficio'];
    this.displayedColumnsReevaluation = ['no', 'fullName', 'controlNumber', 'career', 'eStatus', 'tradeDocumentNumber', 'actions'];
    this.displayedColumnsReevaluationName = ['Nombre', 'Número de control', 'Carrera', 'Estatus', 'No. Oficio'];
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getAllNoNumberPresentations();
      case 1: return this._getAllNumberPresentations();
      case 2: return this._getAllSignPresentations();
    }
  }

  signPresentationDocument(studentId) {
    this.signPresentationConfirmation().then( conf => {
      if (conf) {
        this.controlStudentProv.getControlStudentById(studentId)
          .subscribe( resp => {
            this.formDocument = this._castToDoc(resp.controlStudent);
            this.initRequest.setSolicitudeRequest(this.formDocument);
            this.pdf = this.initRequest.socialServicePresentation().output('bloburl');
            // const binary = this.initRequest.documentSend(eSocialFiles.PRESENTACION);
            // this.saveDocument(binary, this.formDocument.student,false, '');
          }, err => {
            console.log(err);
          });
      }
    });
  }

  signPresentationConfirmation() {
    return new Promise( (resolve) => {
      Swal.fire({
        title: '¿Esta seguro(a) de firmar la carta de presentación?',
        type: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Firmar'
      }).then((res) => {
        if (res.value) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  saveDocument(document, student, statusDoc: boolean, fileId: string) {
    this.loadingService.setLoading(true);
    const documentInfo = {
      mimeType: 'application/pdf',
      nameInDrive: student.controlNumber + '-SOLICITUD.pdf',
      bodyMedia: document,
      folderId: student.folderId,
      newF: statusDoc,
      fileId: fileId
    };

    this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
      async updated => {
        if (updated.action === 'create file') {
          const documentInfo4 = {
            doc: {
              filename: updated.name,
              type: 'DRIVE',
              fileIdInDrive: updated.fileId
            },
            status: {
              name: 'ACEPTADO',
              active: true,
              message: 'Se envio por primera vez'
            }
          };

          await this.controlStudentProv.uploadDocumentDrive(student._id, documentInfo4).subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud registrada correctamente.');
            },
            err => {
              console.log(err);
            }, () => this.loadingService.setLoading(false)
          );
        } else {
          const docStatus = {
            name: 'ACEPTADO',
            active: true,
            message: 'Se actualizo el documento'
          };
          await this.controlStudentProv.updateDocumentLog(student._id, {filename: updated.filename, status: docStatus})
            .subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud actualizada correctamente.');
            }, err => {
              console.log(err);
            }, () => this.loadingService.setLoading(false));
        }
      },
      err => {
        console.log(err);
        this.loadingService.setLoading(false);
      }
    );
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceNoNumber.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceNoNumber.paginator) {
          this.dataSourceNoNumber.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceNumber.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceNumber.paginator) {
          this.dataSourceNumber.paginator.firstPage();
        }
        break;
      case 2:
        this.dataSourceReevaluation.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceReevaluation.paginator) {
          this.dataSourceReevaluation.paginator.firstPage();
        }
        break;
    }
  }

  public refreshNoNumber() {
    this._getAllNoNumberPresentations();
  }

  public refreshNumber() {
    this._getAllNumberPresentations();
  }

  public refreshSign() {
    this._getAllSignPresentations();
  }

  public verifyPositionBoss(): boolean {
    return this.positionName === 'JEFE DE DEPARTAMENTO';
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
    }).then((result) => {
      if (result.value) {
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
              {'verification.presentation': 'send', 'verification.tradeDocumentNumber': result.value})
              .subscribe(() => {
                this.notificationsService.showNotification(eNotificationType.SUCCESS,
                  'Se ha asignado correctamente el número de oficio al estudiante', '');
              }, () => {
                this.notificationsService.showNotification(eNotificationType.ERROR,
                  'Ha sucedido un error, no se ha asignado el número de oficio al estudiante', 'Vuelva a intentarlo mas tarde');
              });
          }
        });
      }
    });
  }

  _getAllNoNumberPresentations() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentByDocumentAndStatus('presentation', 'register')
      .subscribe( res => {
        const data = res.controlStudent.map(this._castToTable);
        this._refreshNoNumber(data);
      }, error => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'No se ha podido obtener la información de los estudiantes', 'Vuelva a intentarlo mas tarde');
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false) );
  }

  _getAllNumberPresentations() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentByDocumentAndStatus('presentation', 'send')
      .subscribe( res => {
        const data = res.controlStudent.map(this._castToTable);
        this._refreshNumber(data);
      }, error => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'No se ha podido obtener la información de los estudiantes', 'Vuelva a intentarlo mas tarde');
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false) );
  }

  _getAllSignPresentations() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentByDocumentAndStatus('presentation', 'register-send-approved')
      .subscribe( res => {
        const data = res.controlStudent.map(this._castToTableAll);
        this._refreshSign(data);
      }, error => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'No se ha podido obtener la información de los estudiantes', 'Vuelva a intentarlo mas tarde');
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false) );
  }

  private _refreshNoNumber(data: Array<any>): void {
    this.dataSourceNoNumber = new MatTableDataSource(data);
    this.dataSourceNoNumber.paginator = this.paginatorNoNumber;
    this.dataSourceNoNumber.sort = this.sortNoNumber;
  }

  private _refreshNumber(data: Array<any>): void {
    this.dataSourceNumber = new MatTableDataSource(data);
    this.dataSourceNumber.paginator = this.paginatorNoNumber;
    this.dataSourceNumber.sort = this.sortWithNumber;
  }

  private _refreshSign(data: Array<any>): void {
    this.dataSourceReevaluation = new MatTableDataSource(data);
    this.dataSourceReevaluation.paginator = this.paginatorSign;
    this.dataSourceReevaluation.sort = this.sortSign;
  }

  _castToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      tradeDocumentNumber: data.verification.tradeDocumentNumber
    };
  }

  _castToTableAll(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.verification.presentation,
      eStatus: data.verification.presentation === 'register' ? 'No asignada' : data.verification.presentation === 'send' ? 'Asignada' : 'Firmada',
      tradeDocumentNumber: data.verification.tradeDocumentNumber
    };
  }

  private _castToDoc(data) {
    return {
      student: data.studentId,
      dependencyName: data.dependencyName,
      dependencyPhone: data.dependencyPhone,
      dependencyAddress: data.dependencyAddress,
      dependencyHeadline: data.dependencyHeadline,
      dependencyHeadlinePosition: data.dependencyHeadlinePosition,
      dependencyDepartment: data.dependencyDepartment,
      dependencyDepartmentManager: data.dependencyDepartmentManager,
      dependencyDepartmentManagerEmail: data.dependencyDepartmentManagerEmail,
      dependencyProgramName: data.dependencyProgramName,
      dependencyProgramModality: data.dependencyProgramModality,
      initialDate: data.initialDate,
      dependencyActivities: data.dependencyActivities,
      dependencyProgramType: data.dependencyProgramType,
      dependencyProgramObjective: data.dependencyProgramObjective,
      dependencyProgramLocationInside: data.dependencyProgramLocationInside,
      dependencyProgramLocation: data.dependencyProgramLocation,
      tradeDocumentNumber: data.verification.tradeDocumentNumber
    };
  }

}
