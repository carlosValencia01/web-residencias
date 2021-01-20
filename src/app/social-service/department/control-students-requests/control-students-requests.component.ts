import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {eNotificationType} from 'src/app/enumerators/app/notificationType.enum';
import {ControlStudentProv} from 'src/app/providers/social-service/control-student.prov';
import {LoadingService} from 'src/app/services/app/loading.service';
import {NotificationsServices} from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import {InitPresentationDocument} from '../../../entities/social-service/initPresentationDocument';
import {InitRequestModel} from '../../../entities/social-service/initRequest.model';
import {CookiesService} from '../../../services/app/cookie.service';
import {ImageToBase64Service} from '../../../services/app/img.to.base63.service';
import {DatePipe} from '@angular/common';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';
import {eSocialFiles} from '../../../enumerators/social-service/document.enum';
import {eSocialNameDocuments} from '../../../enumerators/social-service/socialServiceNameDocuments.enum';

@Component({
  selector: 'app-control-students-requests',
  templateUrl: './control-students-requests.component.html',
  styleUrls: ['./control-students-requests.component.scss']
})
export class ControlStudentsRequestsComponent implements OnInit {
  public selectedSubTab: FormControl;
  public search: string;
  @ViewChild(MatSort) sortSign: MatSort;
  @ViewChild(MatSort) sortAll: MatSort;
  @ViewChild(MatSort) sortNoNumber: MatSort;
  @ViewChild(MatSort) sortWithNumber: MatSort;
  @ViewChild(MatSort) sortComplete: MatSort;
  @ViewChild('matPaginatorNoNumber') paginatorNoNumber: MatPaginator;
  @ViewChild('matPaginatorNumber') paginatorNumber: MatPaginator;
  @ViewChild('matPaginatorNumber') paginatorComplete: MatPaginator;
  @ViewChild('matPaginatorSend') paginatorSend: MatPaginator;
  @ViewChild('matPaginatorAllRequests') paginatorAllRequests: MatPaginator;

  public displayedColumnsSend: string[];
  public displayedColumnsSendName: string[];
  public displayedColumnsAllRequests: string[];
  public displayedColumnsAllRequestsName: string[];
  public displayedColumnsNoNumber: string[];
  public displayedColumnsNoNumberName: string[];
  public displayedColumnsNumber: string[];
  public displayedColumnsNumberName: string[];
  public displayedColumnsComplete: string[];
  public displayedColumnsCompleteName: string[];

  public dataSourceSend: MatTableDataSource<any>;
  public dataSourceAllRequests: MatTableDataSource<any>;
  public dataSourceNoNumber: MatTableDataSource<any>;
  public dataSourceNumber: MatTableDataSource<any>;
  public dataSourceComplete: MatTableDataSource<any>;

  private readonly positionName: String;
  initRequest: InitPresentationDocument;
  formDocument: InitRequestModel;
  public pdf;
  private userData;

  public studentToSign: Array<any> = new Array<any>();
  public flagStudentToSign = true;

  constructor( private controlStudentProv: ControlStudentProv,
              private loadingService: LoadingService,
              private dialog: MatDialog,
               private cookiesService: CookiesService,
               public imgSrv: ImageToBase64Service,
               private dateFormat: DatePipe,
               private inscriptionsProv: InscriptionsProvider,
              private notificationsService: NotificationsServices ) {
            this.selectedSubTab = new FormControl(0);
    this.userData = this.cookiesService.getData().user;
    this.positionName = this.cookiesService.getPosition().name;
    this.initRequest = new InitPresentationDocument(this.imgSrv, this.cookiesService);
  }

  ngOnInit() {
    this.displayedColumnsSend = ['no', 'fullName', 'controlNumber', 'career', 'actions'];
    this.displayedColumnsSendName = ['Nombre', 'Número de control', 'Carrera'];
    this.displayedColumnsAllRequests = ['no', 'fullName', 'controlNumber', 'career', 'status', 'phase', 'actions'];
    this.displayedColumnsAllRequestsName = ['Nombre', 'Número de control', 'Carrera', 'Estatus', 'Fase'];
    this.displayedColumnsNoNumber = ['no', 'fullName', 'controlNumber', 'career', 'tradeDocumentNumber', 'actions'];
    this.displayedColumnsNoNumberName = ['Nombre', 'Número de control', 'Carrera', 'No. Oficio'];
    this.displayedColumnsNumber = this.verifyPositionBoss() ?
      ['select', 'no', 'fullName', 'controlNumber', 'career', 'tradeDocumentNumber', 'status', 'actions'] :
      ['no', 'fullName', 'controlNumber', 'career', 'tradeDocumentNumber', 'status', 'actions'];
    this.displayedColumnsNumberName = ['Nombre', 'Número de control', 'Carrera', 'No. Oficio', 'Estatus'];
    this.displayedColumnsComplete = ['no', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsCompleteName = ['Nombre', 'Número de control', 'Carrera', 'Estatus'];
    this._getAllRequests();
  }

  public changeSubTab(event) {
    this.selectedSubTab.setValue(event);
    switch (event) {
      case 0: return this._getAllRequests();
      case 1: return this._getAllSendRequests();
      case 2: return this._getAllNoNumberPresentations();
      case 3: return this._getAllNumberPresentations();
      case 4: return this._getAllCompletePresentations();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedSubTab.value) {
      case 0:
        this.dataSourceAllRequests.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceAllRequests.paginator) {
          this.dataSourceAllRequests.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceSend.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceSend.paginator) {
          this.dataSourceSend.paginator.firstPage();
        }
        break;
      case 2:
        this.dataSourceNoNumber.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceNoNumber.paginator) {
          this.dataSourceNoNumber.paginator.firstPage();
        }
        break;
      case 3:
        this.dataSourceNumber.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceNumber.paginator) {
          this.dataSourceNumber.paginator.firstPage();
        }
        break;
      case 4:
        this.dataSourceComplete.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceComplete.paginator) {
          this.dataSourceComplete.paginator.firstPage();
        }
        break;
    }
  }

  selectDocument(event, student) {
    student.check = event.checked;
    if (event.checked) {
      this.studentToSign.push(student);
      this.flagStudentToSign = false;
    } else {
      const index = this.studentToSign.findIndex(st => st.controlNumber === student.controlNumber);
      this.studentToSign.splice(index, 1);
      if (this.studentToSign.length === 0) {
        this.flagStudentToSign = true;
      }
    }
  }

  selectAll(event) {
    this.dataSourceNumber.data.forEach(fs => {
      if (event.checked) {
        if (!fs.check && fs.status !== 'firstSign') {
          fs.check = true;
          this.studentToSign.push(fs);
        }
      } else {
        fs.check = false;
        this.studentToSign.pop();
      }
    });
    if (!event.checked) {
      this.flagStudentToSign = true;
    }
  }

  async signAllPresentationDocument() {
    this.signPresentationConfirmation().then( conf => {
      if (conf) {
        for (const student of this.studentToSign) {
          this.loadingService.setLoading(true);
          const controlStudentId = student.id;
          this.controlStudentProv.getControlStudentById(controlStudentId)
            .subscribe( async resp => {
              this.formDocument = this._castToDoc(resp.controlStudent);
              const folder = await this.controlStudentProv.getControlStudentFolderById(controlStudentId).toPromise();
              this.initRequest.setPresentationRequest(this.formDocument);
              const binary = this.initRequest.documentSend(eSocialFiles.PRESENTACION);
              this.saveDocument(binary, folder.folderId, controlStudentId, true, '')
                .then(() => {
                  this.refreshNumber();
                  this.loadingService.setLoading(false);
                  this._pushHistoryDocumentStatus('SE FIRMO',
                    'SE HA FIRMADO LA CARTA DE PRESENTACIÓN',
                    this.userData.name.fullName,
                    eSocialNameDocuments.PRESENTACION_CODE,
                    controlStudentId, resp.controlStudent.historyDocumentStatus);
                }).catch(errMsg => {
                this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Error',
                  errMsg);
                this.loadingService.setLoading(false);
              });
            }, err => {
              console.log(err);
            });
        }
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

  saveDocument(document, folderIdSocService, controlStudentId, statusDoc: boolean, fileId: string) {
    return new Promise( (resolve, reject) => {
      const documentInfo = {
        mimeType: 'application/pdf',
        nameInDrive: eSocialNameDocuments.PRESENTACION,
        bodyMedia: document,
        folderId: folderIdSocService,
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
                message: 'Se envio por primera vez',
                observation: 'Firmado por: ' + this.userData.name.fullName
              }
            };

            await this.controlStudentProv.uploadDocumentDrive(controlStudentId, documentInfo4).subscribe( () => {
                this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud registrada correctamente.');
                this.controlStudentProv.updateGeneralControlStudent(controlStudentId,
                  {'verification.presentation': 'sign', 'verification.signs.presentation.signDepartmentDate': new Date(),
                    'verification.signs.presentation.signDepartmentName': this.userData.name.fullName} )
                  .subscribe( res => {
                    this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
                    resolve();
                  }, () => {
                    reject('No se ha podido guardar la información de firma del responsable');
                  });
              },
              err => {
                console.log(err);
                reject('Vuelva a intentarlo mas tarde.');
              });
          }
        },
        err => {
          console.log(err);
          reject('Vuelva a intentarlo mas tarde.');
        });
    });
  }

  public refreshSend() {
    this._getAllSendRequests();
  }

  // public refreshApproved() {
  //   this._getAllApprovedRequests();
  // }

  public refreshAllRequests() {
    this._getAllRequests();
  }

  public refreshNoNumber() {
    this._getAllNoNumberPresentations();
  }

  public refreshNumber() {
    this._getAllNumberPresentations();
  }

  public refreshComplete() {
    this._getAllCompletePresentations();
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
              {'verification.presentation': 'assigned', 'tradePresentationDocumentNumber': result.value})
              .subscribe(() => {
                this.notificationsService.showNotification(eNotificationType.SUCCESS,
                  'Se ha asignado correctamente el número de oficio al estudiante', '');
                this.changeSubTab(0);
                this._createHistoryDocumentStatus(eSocialNameDocuments.PRESENTACION, 'SE REGISTRO',
                  'SE HA ASIGNADO NO. DE OFICIO ' + result.value + ' A CARTA DE PRESENTACIÓN', this.userData.name.fullName, controlStudentId);
            }, () => {
                this.notificationsService.showNotification(eNotificationType.ERROR,
                  'Ha sucedido un error, no se ha asignado el número de oficio al estudiante', 'Vuelva a intentarlo mas tarde');
              });
          }
        });
      }
    });
  }

  _createHistoryDocumentStatus(nameDocument, nameStatus, messageStatus, responsible, controlStudentId) {
    console.log(nameDocument, nameStatus, messageStatus, responsible, controlStudentId);
    this.controlStudentProv.createHistoryDocumentStatus(controlStudentId,
      {name: nameDocument,
        status: [{  name: nameStatus,
          message: messageStatus,
          responsible: responsible }]
      }).subscribe( created => {
      this.notificationsService.showNotification(eNotificationType.SUCCESS,
        'Exito', created.msg);
    }, error => {
      const message = JSON.parse(error._body).msg || 'Error al guardar el registro';
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', message);
    });
  }

  _pushHistoryDocumentStatus(nameStatus: string, messageStatus: string, responsible: string, documentCode: string, controlStudentId, historyStatus) {
    const doc = historyStatus.find(h => h.name.includes(documentCode));
    this.controlStudentProv.pushHistoryDocumentStatus(controlStudentId, doc._id,
      {name: nameStatus, message: messageStatus, responsible: responsible})
      .subscribe(inserted => {
        this.notificationsService.showNotification(eNotificationType.SUCCESS,
          'Exito', inserted.msg);
      }, error => {
        const message = JSON.parse(error._body).msg || 'Error al guardar el registro';
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'Error', message);
      });
  }

  _getAllSendRequests() {
    this.loadingService.setLoading(true);
    // Obtención de todas las solicitudes
    this.controlStudentProv.getRequests('send').subscribe( res => {
      const signedRequests = res.controlStudents.map(this._castToTableSend);
      this._refreshSend(signedRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
  }

  _getAllRequests() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getRequests('all').subscribe(res => {
      const allRequests = res.controlStudents.map(this._castToTableAllRequests);
      this._refreshAllRequests(allRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    }
    );
  }

  _getAllNoNumberPresentations() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentByDocumentAndStatus('presentation', 'noAssigned')
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
    this.controlStudentProv.getControlStudentByDocumentAndStatus('presentation', 'assigned')
      .subscribe( res => {
        const data = res.controlStudent.map(this._castToTable);
        this._refreshNumber(data);
      }, error => {
        this.notificationsService.showNotification(eNotificationType.ERROR,
          'No se ha podido obtener la información de los estudiantes', 'Vuelva a intentarlo mas tarde');
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false) );
  }

  _getAllCompletePresentations() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentByDocumentAndStatus('presentation', 'sign-send-reevaluate-approved')
      .subscribe( res => {
        const data = res.controlStudent.map(this._castToTableRequest);
        this._refreshComplete(data);
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
  private _refreshComplete(data: Array<any>): void {
    this.dataSourceComplete = new MatTableDataSource(data);
    this.dataSourceComplete.paginator = this.paginatorComplete;
    this.dataSourceComplete.sort = this.sortComplete;
  }

  private _refreshSend(data: Array<any>): void {
    this.dataSourceSend = new MatTableDataSource(data);
    this.dataSourceSend.paginator = this.paginatorSend;
    this.dataSourceSend.sort = this.sortSign;
  }

  // private _refreshApproved(data: Array<any>): void {
  //   this.dataSourceApproved = new MatTableDataSource(data);
  //   this.dataSourceApproved.paginator = this.paginatorSend;
  //   this.dataSourceApproved.sort = this.sortApproved;
  // }

  private _refreshAllRequests(data: Array<any>): void {
    this.dataSourceAllRequests = new MatTableDataSource(data);
    this.dataSourceAllRequests.paginator = this.paginatorAllRequests;
    this.dataSourceAllRequests.sort = this.sortAll;
  }


  _castToTableSend(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career
    };
  }

  // _castToTableApproved(data) {
  //   return {
  //     id: data._id,
  //     fullName: data.studentId.fullName,
  //     controlNumber: data.controlNumber,
  //     career: data.studentId.career
  //   };
  // }

  _castToTableAllRequests(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status:
        data.verification.solicitude !== 'approved' ? 'Solicitud enviada' :
        data.verification.presentation === 'noAssigned' ? 'Presentación sin oficio' :
        data.verification.presentation === 'assigned' ? 'Presentación por firmar' :
          data.verification.presentation === 'send' &&
          data.verification.acceptance === 'send' &&
          data.verification.workPlanProject === 'send' &&
          data.verification.commitment === 'send' ? 'Recepción de solicitud' :
            data.verification.presentation === 'reevaluate' ||
            data.verification.acceptance === 'reevaluate' ||
            data.verification.workPlanProject === 'reevaluate' ||
            data.verification.commitment === 'reevaluate' ? 'Recepción de solicitud' :
              data.verification.presentation === 'send' ||
              data.verification.acceptance === 'send' ||
              data.verification.workPlanProject === 'send' ||
              data.verification.commitment === 'send' ? 'Recepción de solicitud' :
                data.verification.presentation === 'approved' &&
                data.verification.acceptance === 'approved' &&
                data.verification.workPlanProject === 'approved' &&
                data.verification.commitment === 'approved' ? 'Solicitud aprobada' : 'Solicitud',
      nStatus:
        data.verification.solicitude !== 'approved' ? 0 :
          data.verification.presentation === 'noAssigned' ? 1 :
            data.verification.presentation === 'assigned' ? 2 :
              data.verification.presentation === 'sign' ? 3 :
                data.verification.presentation === 'send' &&
                data.verification.acceptance === 'send' &&
                data.verification.workPlanProject === 'send' &&
                data.verification.commitment === 'send' ? 4 :
                    data.verification.presentation === 'send' ||
                    data.verification.acceptance === 'send' ||
                    data.verification.workPlanProject === 'send' ||
                    data.verification.commitment === 'send' ? 6 :
                    data.verification.presentation === 'approved' &&
                    data.verification.acceptance === 'approved' &&
                    data.verification.workPlanProject === 'approved' &&
                    data.verification.commitment === 'approved' ? 7 : 8,
      phase: data.verification.solicitude !== 'approved' ? data.verification.solicitude :
          data.verification.presentation === 'sign' ? 'sign' :
          data.verification.presentation === 'send' &&
          data.verification.acceptance === 'send' &&
          data.verification.workPlanProject === 'send' &&
          data.verification.commitment === 'send' ? 'send' :
            data.verification.presentation === 'send' ||
            data.verification.acceptance === 'send' ||
            data.verification.workPlanProject === 'send' ||
            data.verification.commitment === 'send' ? 'send' :
              data.verification.presentation === 'reevaluate' ||
              data.verification.acceptance === 'reevaluate' ||
              data.verification.workPlanProject === 'reevaluate' ||
              data.verification.commitment === 'reevaluate' ? 'reevaluate' :
                data.verification.presentation === 'approved' &&
                data.verification.acceptance === 'approved' &&
                data.verification.workPlanProject === 'approved' &&
                data.verification.commitment === 'approved' ? 'approved' : 'none'
    };
  }

  _castToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      tradeDocumentNumber: data.tradePresentationDocumentNumber,
      status: data.verification.presentation === 'sign' ? 'Firmada' : 'No firmada'
    };
  }

  _castToTableRequest(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.verification.presentation === 'approved' &&
              data.verification.acceptance === 'approved' &&
              data.verification.workPlanProject === 'approved' &&
              data.verification.commitment === 'approved' ? 'approved' :
                data.verification.presentation === 'send' &&
                data.verification.acceptance === 'send' &&
                data.verification.workPlanProject === 'send' &&
                data.verification.commitment === 'send' ? 'send' :
                  data.verification.presentation === 'send' ||
                  data.verification.acceptance === 'send' ||
                  data.verification.workPlanProject === 'send' ||
                  data.verification.commitment === 'send' ? 'send' :
                    data.verification.presentation === 'reevaluate' ||
                    data.verification.acceptance === 'reevaluate' ||
                    data.verification.workPlanProject === 'reevaluate' ||
                    data.verification.commitment === 'reevaluate' ? 'reevaluate' : 'register'
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
      tradeDocumentNumber: data.tradePresentationDocumentNumber
    };
  }

}
