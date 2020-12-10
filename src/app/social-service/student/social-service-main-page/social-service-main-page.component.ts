import {Component, OnInit, ViewChild} from '@angular/core';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import * as moment from 'moment';
import {eFOLDER} from '../../../enumerators/shared/folder.enum';
import {StudentProvider} from '../../../providers/shared/student.prov';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {DialogVerificationComponent} from '../../components/dialog-verification/dialog-verification.component';
import {DialogDocumentViewerComponent} from '../../components/dialog-document-viewer/dialog-document-viewer.component';
import {InitRequestModel} from '../../../entities/social-service/initRequest.model';
import {InitPresentationDocument} from '../../../entities/social-service/initPresentationDocument';
import {eSocialFiles} from '../../../enumerators/social-service/document.enum';
import {ImageToBase64Service} from 'src/app/services/app/img.to.base63.service';
import {eSocialNameDocuments} from '../../../enumerators/social-service/socialServiceNameDocuments.enum';

moment.locale('es');

@Component({
  selector: 'app-social-service-main-page',
  templateUrl: './social-service-main-page.component.html',
  styleUrls: ['./social-service-main-page.component.scss']
})
export class SocialServiceMainPageComponent implements OnInit {
  selectedFile: File = null;
  @ViewChild('dialogverification') dialogVerification: DialogVerificationComponent;

  formDocument: InitRequestModel;
  initRequest: InitPresentationDocument;

  constructor(private loadingService: LoadingService,
              private cookiesService: CookiesService,
              private studentProvider: StudentProvider,
              private inscriptionsProv: InscriptionsProvider,
              private notificationsService: NotificationsServices,
              private controlStudentProvider: ControlStudentProv,
              private formBuilder: FormBuilder,
              public dialog: MatDialog,
              public imgSrv: ImageToBase64Service) {
    // Obtencion de la informacion del alumno, id, nombre, carrera, revisar en localStorage
    this.userData = this.cookiesService.getData().user;
    this._idStudent = this.userData._id;
    this.initRequest = new InitPresentationDocument(this.imgSrv, this.cookiesService);
  }

  public loaded = false; // Carga de la pagina
  public permission: boolean; // Permiso para acceder a servicio social
  public releaseSocialService: boolean; // Condicion para saber si ha liberado el servicio social
  public assistance: boolean; // Condicion para saber si ya tiene la asistencia registrada (si existe su registro en BD)
  public assistanceFirstStep = false; // Condicion para el stepper de ASISTENCIA, controlamos que hasta que no sea verdadero no se continua
  public assistanceSecondStep = false; // Condicion para el subStepper en caso de no tener asistencia y revisar el formulario a evaluar
  public solicitudeDocument: boolean; // Condicion para saber si tiene el registro de información para los primeros documentos
  public presentationDocument: boolean; // Condicion para saber si tiene el registro de información para los primeros documentos
  public reportsDocument: boolean; // Condicion para saber si continuar con los reportes
  public statusFirstDocuments: string; // Condicion para saber si el estudiante ya envio toda la información o esta en revisión
  public bimestralReport = false; // variable para saber si se deben mostrar los reportes bimestrales
  public finalReport = false; // Variable para saber si se mustra el reporte final.
  // documents status
  public presentation: string; // Variable para guardar el estatus de la carta de presentacion.
  public workPlanProject: string; // Variable para guardar el estatus del plan de trabajo.
  public acceptance: string; // Variable para guardar el estatus de la carta de aceptacion.
  public commitment: string; // Variable para guardar el estatus de la carta de compromiso.
  // Reports status
  public reports: Array<any>; // Variable para guardar el estatus de los reportes
  public managerEvaluations: Array<any>; // Variable para guardar el estatus de las evaluaciones
  public selfEvaluations: Array<any>; // Variable para guardar el estatus de las autoevaluaciones
  // Last report  documents status
  public lastReport: string;
  public lastReportEvaluation: string;
  public dependencyRelease: string;
  // Object Documents
  public presentationDoc: any; // Variable para guardar el estatus de la carta de presentacion.
  public workPlanProjectDoc: any; // Variable para guardar el estatus del plan de trabajo.
  public acceptanceDoc: any; // Variable para guardar el estatus de la carta de aceptacion.
  public commitmentDoc: any; // Variable para guardar el estatus de la carta de compromiso.
  public reportDoc: any; // Variable para guardar el reporte que se va a subir
  public managerEvaluationDoc: any; // Variable para guardar la evaluacion que se va a subir
  public selfEvaluationDoc: any; // Variable para guardar la autoevaluacion que se va a subir
  public lastReportEvaluationDoc: any; // Variable para guardar la carta de evaluacion del reporte final que se va a subir
  public lastReportDoc: any; // Variable para guardar el reporte final que se va a subir
  public dependencyReleaseDoc: any; // Variable para guardar la carta de liberacion por parte de la dependencia que se va a subir
  public reportId: any; // Variable para guardar el id del reporte
  public managerEvaluationId: any; // Variable para guardar el id del reporte
  public selfEvaluationId: any; // Variable para guardar el id del reporte
  // document status for department
  public filesStatus = [];

  public workPlanProjectDownloaded = false; // Variable para saber cuando la carta de asignación ha sido descargada
  public presentationDownloaded = false; // Variable para saber cuando la carta de presentacion ha sido descargada
  public totalHours: number; // variable para contabilizar las horas por semana.
  public total: string; // variable para mostrar el total de horas.
  public verificationSchedule = false; // variable para saber si se cumplen las horas minimas por semana.
  public dayList: Array<any>; // arreglo con los horarios por dia.
  private userData; // Datos del usuario
  public savedSchedule = false; // variable para saber si ya se guardo el plan de trabajo
  public studentData: Array<any>;
  public controlNumber;
  private _idStudent: string; // ID del estudiante
  private folderId: string; // Id del folder del estudiante para servicio social
  private activePeriod; // Variable para guardar el periodo activo para obtener el folder Id del estudiante
  public controlStudentId: string; // id del documento guardado en la colección de ControlStudent para servicio social
  public emailStudent: string; // Variable para guardar el correo personal de comunicación con el estudiante
  public sendEmailCode: boolean; // Validacion de codigo de correo electronico enviado a estudiante
  public verificationEmail: boolean; // Validacion de verificacion de email como primer paso del proceso de servicio social
  private documents: Array<any> = []; // Array para almacenar los documentos del estudiante
  public formSchedule: FormGroup;
  public studentPhone;
  public studentStreet;
  public studentSuburb;
  public studentCity;
  public studentState;
  public initialDate: moment.Moment = moment.utc();
  public now = moment.utc();
  public dateArray: Array<any>;

  private historyDocumentStatus: Array<any>;

  editField: string;
  scheduleList: Array<any> = [
    { hour: 'Hora', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '', total: '' }
  ];


  ngOnInit() {
    this.loadingService.setLoading(true);
    this.controlStudentProvider.getControlStudentByStudentId(this.userData._id).subscribe( async res => {
      this.controlStudentId = res.controlStudent._id;
      this.emailStudent = res.controlStudent.emailStudent || '';
      this.sendEmailCode = res.controlStudent.verification.sendEmailCode;
      this.verificationEmail = res.controlStudent.verification.verificationEmail;
      this.statusFirstDocuments = res.controlStudent.verification['solicitude'];
      this.solicitudeDocument = this.statusFirstDocuments === 'approved';
      this.documents = res.controlStudent.documents;
      this.presentation = res.controlStudent.verification.presentation;
      this.workPlanProject = res.controlStudent.verification.workPlanProject;
      this.acceptance = res.controlStudent.verification.acceptance;
      this.commitment = res.controlStudent.verification.commitment;
      this.presentationDocument = false;
      this.reportsDocument = true;
      this.permission = false;
      this.releaseSocialService = res.controlStudent.status === 'approved';
      this.assistance = false;
      this.reports = res.controlStudent.verification.reports;
      this.managerEvaluations = res.controlStudent.verification.managerEvaluations;
      this.selfEvaluations = res.controlStudent.verification.selfEvaluations;
      await this.getFolderId();
      this.controlNumber = res.controlStudent.controlNumber;
      if ( res.controlStudent.months.length !== 0  ) { this.savedSchedule = true; }
      this.presentationDownloaded = res.controlStudent.verification.presentationDownloaded;
      this.workPlanProjectDownloaded = res.controlStudent.verification.workPlanProjectDownloaded;
      this.filesStatus = res.controlStudent.verificationDepartment;
      this.initialDate = moment.utc(new Date(res.controlStudent.initialDate).valueOf());
      this.addDates(new Date(res.controlStudent.initialDate).valueOf());
      this.lastReport = res.controlStudent.verification.lastReport;
      this.lastReportEvaluation = res.controlStudent.verification.lastReportEvaluation;
      this.historyDocumentStatus = res.controlStudent.historyDocumentStatus;
      this.dependencyRelease = res.controlStudent.verification.dependencyRelease;
      this.showReports();
    }, error => {
      this.notificationsService.showNotification(eNotificationType.INFORMATION,
        'Atención',
        'No se ha encontrado su información por favor de recargar la página o volver a intentarlo mas tarde');
      this._loadPage();
    }, () => this._loadPage());
      this._initializeTableForm();
  }

  showReports() {
    this.bimestralReport = this.reports[this.reports.length - 1].status === 'approved' && this.managerEvaluations[this.managerEvaluations.length - 1].status === 'approved' && this.selfEvaluations[this.selfEvaluations.length - 1].status === 'approved';
    this.finalReport = this.lastReport !== 'approved' || this.lastReportEvaluation !== 'approved' || this.dependencyRelease !== 'approved';
  }

  _loadPage() {
    this.loadingService.setLoading(false);
    this.loaded = true;
  }

  async changeStatusSendInformation() {
    this.ngOnInit();
  }

  _createHistoryDocumentStatus(nameDocument, nameStatus, messageStatus, responsible) {
    this.controlStudentProvider.createHistoryDocumentStatus(this.controlStudentId,
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
        'Atención', message);
    });
  }

  _pushHistoryDocumentStatus(nameStatus: string, messageStatus: string, responsible: string, documentCode: string) {
    const doc = this.historyDocumentStatus.find(h => h.name.includes(documentCode));
    this.controlStudentProvider.pushHistoryDocumentStatus(this.controlStudentId, doc._id,
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

  getFolderId() {
    this.inscriptionsProv.getActivePeriod().toPromise().then(
      period => {
        if (period.period) {
          this.activePeriod = period.period;
          // first check folderId on Student model
          this.studentProvider.getDriveFolderId(this.userData.email, eFOLDER.SERVICIOSOCIAL).subscribe(
            (folder) => {
              this.folderId =  folder.folderIdInDrive;
            },
            err => {
              console.log(err);
            }
          );
        } else { // no hay período activo
          this.activePeriod = false;
        }
      }
    );
  }

  downloadSolicitude() {
    this.loadingService.setLoading(true);
    const solicitude = this.documents.filter(f => f.filename.toString().includes('ITT-POC-08-02'));
    let solicitudeId = '';
    try {
      solicitudeId = solicitude[0].fileIdInDrive;
    } catch (e) {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'No se ha encontrado el documento, vuelva a intentarlo mas tarde.');
      return;
    }
    this.controlStudentProvider.getFile(solicitudeId, 'ITT-POC-08-02 Solicitud de Servicio Social.pdf').subscribe(async (res) => {
      const linkSource = 'data:' + res.contentType + ';base64,' + this.bufferToBase64(res.file.data);
      const downloadLink = document.createElement('a');
      const fileName = 'ITT-POC-08-02 Solicitud de Servicio Social.pdf';
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Se ha descargado el documento correctamente', '');
    }, error => {
      this.loadingService.setLoading(false);
      const message = JSON.parse(error._body).message || 'Error al descargar el documento, intentelo mas tarde';
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Departamento de Servicio Social', message);
    }, () =>     this.loadingService.setLoading(false) );
  }

  downloadPresentation() {
    this.loadingService.setLoading(true);
    const presentation = this.documents.filter(f => f.filename.toString().includes('ITT-POC-08-03'));
    let presentationId = '';
    try {
      presentationId = presentation[0].fileIdInDrive;
    } catch (e) {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'No se ha encontrado el documento, vuelva a intentarlo mas tarde.');
      return;
    }
    this.controlStudentProvider.getFile(presentationId, eSocialNameDocuments.PRESENTACION).subscribe(async (res) => {
      const linkSource = 'data:' + res.contentType + ';base64,' + this.bufferToBase64(res.file.data);
      const downloadLink = document.createElement('a');
      const fileName = eSocialNameDocuments.PRESENTACION;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Se ha descargado el documento correctamente', '');
      // el documento se descargo correctamente
      if ( !this.presentationDownloaded ) {// solo actualizar el status y la fecha la primera vez que se descarga
        this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId,
          {'verification.presentationDownloaded': true, 'verification.presentationDateDownload' : new Date()})
          .subscribe(() => {
            this._pushHistoryDocumentStatus('DESCARGA',
              'SE HA DESCARGADO EL DOCUMENTO POR PRIMERA VEZ', this.userData.name.fullName, eSocialNameDocuments.PRESENTACION_CODE);
            this.ngOnInit();
          }, () => {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Ha sucedido un error al descargar su Carta de Presentación', 'Vuelva a intentarlo mas tarde');
          });
      }
    }, error => {
      this.loadingService.setLoading(false);
      const message = JSON.parse(error._body).message || 'Error al descargar el documento, intentelo mas tarde';
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Departamento de Servicio Social', message);
    }, () =>     this.loadingService.setLoading(false) );
  }

  downloadAsignation() {
    this.loadingService.setLoading(true);
    const asignation = this.documents.filter(f => f.filename.toString().includes(eSocialNameDocuments.ASIGNACION_CODE));
    let asignationId = '';
    try {
      asignationId = asignation[0].fileIdInDrive;
    } catch (e) {
      console.log(e);
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'No se ha encontrado el documento, vuelva a intentarlo mas tarde.');
      return;
    }
    this.controlStudentProvider.getFile(asignationId, eSocialNameDocuments.ASIGNACION).subscribe(async (res) => {
      const linkSource = 'data:' + res.contentType + ';base64,' + this.bufferToBase64(res.file.data);
      const downloadLink = document.createElement('a');
      const fileName = eSocialNameDocuments.ASIGNACION;
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Se ha descargado el documento correctamente', '');
      // el documento se descargo correctamente
      if ( !this.workPlanProjectDownloaded ) {// solo actualizar el status y la fecha la primera vez que se descarga
        this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId,
          {'verification.workPlanProjectDownloaded': true, 'verification.workPlanProjectDateDownload' : new Date()})
          .subscribe(() => {
            this._pushHistoryDocumentStatus('DESCARGA',
              'SE HA DESCARGADO EL DOCUMENTO POR PRIMERA VEZ', this.userData.name.fullName, eSocialNameDocuments.ASIGNACION_CODE);
            this.ngOnInit();
          }, () => {
            this.notificationsService.showNotification(eNotificationType.ERROR,
              'Ha sucedido un error al descargar su Carta de Asignación', 'Vuelva a intentarlo mas tarde');
          });
      }
    }, error => {
      this.loadingService.setLoading(false);
      const message = JSON.parse(error._body).message || 'Error al descargar el documento, intentelo mas tarde';
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Departamento de Servicio Social', message);
    }, () =>     this.loadingService.setLoading(false) );
    }

  public bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  // Carga de PDF a drive
  async onFileChange(event) {
    const reader = new FileReader();
    const docType = event.target.attributes.id.value;
    let newF = true;
    let fileId = '';
    let nameDocument = '';
    switch (docType) {
      case 'presentation':
        nameDocument = eSocialNameDocuments.PRESENTACION;
        if (['reevaluate', 'sign', 'upload'].includes(this.presentation)) {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes(eSocialNameDocuments.PRESENTACION_CODE));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
        break;
      case 'acceptance':
        nameDocument = eSocialNameDocuments.ACEPTACION;
        if (this.acceptance === 'reevaluate') {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes(eSocialNameDocuments.ACEPTACION_CODE));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
        break;
      case 'workProject':
        nameDocument = eSocialNameDocuments.ASIGNACION;
        if (['reevaluate', 'register', 'upload'].includes(this.workPlanProject)) {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes(eSocialNameDocuments.ASIGNACION_CODE));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
        break;
      case 'commitment':
        nameDocument = eSocialNameDocuments.COMPROMISO;
        if (this.commitment === 'reevaluate') {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes(eSocialNameDocuments.COMPROMISO_CODE));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
        break;
    }

    this.selectedFile = <File>event.target.files[0];
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        const document = {
          mimeType: this.selectedFile.type,
          nameInDrive: nameDocument,
          bodyMedia: reader.result.toString().split(',')[1],
          folderId: this.folderId,
          newF: newF,
          fileId: fileId
        };

        this.validateDocumentViewer(reader.result.toString(), document.nameInDrive).then( async response => {
          if (response) {
            switch (docType) {
              case 'presentation':
                if (this.presentation === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'presentation');
                  this.presentation = 'send';
                } else {
                  this.presentationDoc = document;
                  this.presentation = 'upload';
                }
                break;
              case 'acceptance':
                if (this.acceptance === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'acceptance');
                  this.acceptance = 'send';
                } else {
                  this.acceptanceDoc = document;
                  this.acceptance = 'upload';
                }
                break;
              case 'workProject':
                if (this.workPlanProject === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'workPlanProject');
                  this.workPlanProject = 'send';
                } else {
                  this.workPlanProjectDoc = document;
                  this.workPlanProject = 'upload';
                }
                break;
              case 'commitment':
                if (this.commitment === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'commitment');
                  this.commitment = 'send';
                } else {
                  // this.commitmentDoc = document;
                  this.commitment = 'upload';
                }
                break;
            }
          }
        });
      };
    }
  }

  validateUploadFiles() {
    return this.presentation !== 'upload' ||
            this.acceptance !== 'upload' ||
            this.workPlanProject !== 'upload' ||
            this.commitment !== 'upload';
  }

  async uploadFiles() {
    const documents = [this.presentationDoc, this.acceptanceDoc, this.workPlanProjectDoc, this.commitmentDoc];
    const details = ['presentation', 'acceptance', 'workPlanProject', 'commitment'];
    for (let n = 0; n < documents.length; n++) {
      await this.uploadFile(documents[n].nameInDrive, documents[n], details[n]);
    }
    this.ngOnInit();
  }

  uploadFile(nameDocument, document, detailDocument) {
    this.loadingService.setLoading(true);
    const nameDocuments = {
      'presentation': eSocialNameDocuments.PRESENTACION,
      'acceptance': eSocialNameDocuments.ACEPTACION,
      'workPlanProject': eSocialNameDocuments.ASIGNACION,
      'commitment': eSocialNameDocuments.COMPROMISO,
      'lastReportEvaluation': eSocialNameDocuments.EVALUACIONREPORTEFINAL_CODE,
      'lastReport': eSocialNameDocuments.REPORTEFINAL_CODE,
      'dependencyRelease': eSocialNameDocuments.CARTALIBERACION_CODE
    };
    const codeDocuments = {
      'presentation': eSocialNameDocuments.PRESENTACION_CODE,
      'acceptance': eSocialNameDocuments.ACEPTACION_CODE,
      'workPlanProject': eSocialNameDocuments.ASIGNACION_CODE,
      'commitment': eSocialNameDocuments.COMPROMISO_CODE,
      'lastReportEvaluation': eSocialNameDocuments.EVALUACIONREPORTEFINAL_CODE,
      'lastReport': eSocialNameDocuments.REPORTEFINAL_CODE,
      'dependencyRelease': eSocialNameDocuments.CARTALIBERACION_CODE
    };

    // Cargar el documento a Drive, ya debe de existir su registro y base de datos
    this.controlStudentProvider.uploadFile2(document).subscribe( async updated => {
        if (updated.action === 'create file') {
          const documentInfo = {
            doc: {
              filename: updated.name,
              type: 'DRIVE',
              fileIdInDrive: updated.fileId,
            },
            status: {
              name: 'EN PROCESO',
              message: `El estudiante subio el ${nameDocument} por primera vez`
            }
          };
          // this._createHistoryDocumentStatus(nameDocuments[detailDocument], 'SE ENVIO', 'EL DOCUMENTO FUE ENVIADO', this.userData.name.fullName);
          // Actualizar información del documento subido a
          await this.controlStudentProvider.uploadDocumentDrive(this.controlStudentId, documentInfo).subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',  nameDocument + ' cargado');
              this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId, {['verification.' + detailDocument]: 'send'})
                .subscribe( () => {
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, '', 'Se ha guardado el registro del documento');
                });
            },
            err => {
              console.log(err);
            }, () => this.loadingService.setLoading(false)
          );
        } else {

          const documentInfo = {
            filename: updated.filename,
            status: {
              name: 'EN PROCESO',
              message: `El estudiante actualizo el ${nameDocument}`
            }
          };
          // this._pushHistoryDocumentStatus('SE ENVIO', 'EL DOCUMENTO FUE ENVIADO', this.userData.name.fullName, codeDocuments[detailDocument]);

          // Actualizar la información del documento
          await this.controlStudentProvider.updateDocumentLog(this.controlStudentId, documentInfo)
            .subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
                nameDocument + ' actualizado.');
              this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId, {['verification.' + detailDocument]: 'send'})
                .subscribe( () => {
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, '', 'Se ha guardado el registro del documento');
                });
            }, err => {
              console.log(err);
            }, () => this.loadingService.setLoading(false));
        }
      },
      err => {
        console.log(err);
        this.loadingService.setLoading(false);
      });
      if (this.commitmentDoc) {
        this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId, {['verification.' + 'commitment']: 'send'})
                .subscribe( () => {
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, '', 'Se ha guardado el registro del documento');
                });
      }
  }

  disabledUploadFile(document): boolean {
    let dis = false;
    switch (document) {
      case 'presentation':
        dis = ['approved', 'send'].includes(this.presentation);
        break;
      case 'acceptance':
        dis = ['approved', 'send'].includes(this.acceptance);
        break;
      case 'workPlanProject':
        dis = ['approved', 'send'].includes(this.workPlanProject);
        break;
      case 'commitment':
        dis = ['approved', 'send'].includes(this.commitment);
        break;
    }
    return dis;
  }

  validateSolicitudePhase(): string {
    return this.presentation === 'send' &&
      this.acceptance === 'send' &&
      this.workPlanProject === 'send' &&
      this.commitment === 'send' ? 'send' :
      this.presentation === 'reevaluate' ||
      this.acceptance === 'reevaluate' ||
      this.workPlanProject === 'reevaluate' ||
      this.commitment === 'reevaluate' ? 'reevaluate' :
        this.presentation === 'approved' &&
        this.acceptance === 'approved' &&
        this.workPlanProject === 'approved' &&
        this.commitment === 'approved' ? 'approved' : 'register';
  }

  validateDocumentViewer(pdf, title) {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(DialogDocumentViewerComponent, {
        data: {document: pdf, title: title},
        hasBackdrop: true,
        minWidth: '700px',
        maxWidth: '1000px'
      });
      dialogRef.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }

  createCommitmentDocument() {
    console.log('Carta compromiso');
    this.commitment = 'send';
  }

  _initializeTableForm() {
    this.formSchedule = new FormGroup ({
      monday:     new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      tuesday:    new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      wednesday:  new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      thursday:   new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      friday:     new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      saturday:   new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      sunday:     new FormControl('', [Validators.pattern('^(0?[7-9]|1?[0-9]):[0-5][0-9]-((0?[7-9]|1?[0-9]):[0-5][0-9])|20:00$')]),
      initialMonth: new FormControl('')
    });
  }
  // cada que el input pierda el foco sumar las horas de todos los inputs
  sumHours() {
    this.totalHours = 0.0;
    this.dayList = [
      this.formSchedule.value.monday, this.formSchedule.value.tuesday, this.formSchedule.value.wednesday, this.formSchedule.value.thursday,
      this.formSchedule.value.friday, this.formSchedule.value.saturday, this.formSchedule.value.sunday
    ];
    for (const day of this.dayList) {
      this.totalHours = this.totalHours + this.getDifference(day);
    }
    this.total = (this.totalHours / 60).toFixed(2);
    if  ( (this.totalHours / 60) ===  21) {// cuando se cumplan las horas activar boton para guardar
      this.verificationSchedule = true;
    } else {
      this.verificationSchedule = false;
    }
  }

  getDifference(times) {
    if (this.formSchedule.valid) {
      times = times.trim();
      if (times === '' ) {return 0; }
      const timeArr = times.split('-');
      const t1 = timeArr[0].split(':');
      const t2 = timeArr[1].split(':');
      if ( !t1.length || !t2.length ) {return 0; }
      if ( t1[0] > t2[0] ) {return 0; }
      let h = Number(t2[0]) - Number(t1[0]) - 1 ;
      let m = 60 - Number(t1[1]) + Number(t2[1]);
      if ( m > 60) { m = m - 60; h = h + 1; }
      return (h * 60) + m;
    } else {
      return 0;
    }
  }// getDifference

  registerSchedule() {
    if (this.formSchedule.value.initialMonth === '') {
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Falta informacion', 'Favor de seleccionar un mes de inicio.');
        return;
    }
    const monthList  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre',
                        'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'];
    const i = Number(this.formSchedule.value.initialMonth);
    const scheduleMonths = monthList.slice(i, i + 6 ); // Arreglo de meses que se enviara a la bd
    // scheduleMonths es el arreglo con el horario por dias
    // aqui pedirle al alumno que se identifique
    // console.log(this.controlNumber);
    const dialogRef = this.dialog.open(DialogVerificationComponent, { data: { email: this.controlNumber }, });
      dialogRef.afterClosed().subscribe(result => {
          if (result) {
      // Si se identifica correctamente enviar scheduleMonths y dayList
      this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId,
        {'schedule': this.dayList, 'months': scheduleMonths})
        .subscribe(() => {
          this.saveWorkPlan();
        }, () => {
          this.notificationsService.showNotification(eNotificationType.ERROR,
            'Ha sucedido un error, no se ha registrado el plan de trabajo', 'Vuelva a intentarlo mas tarde');
        });
    }
    });
  }// registerSchedule

  saveWorkPlan() {
    // this.controlStudentProvider.getStudentInformationByControlId(this.controlStudentId)
    // .subscribe(resp => {
    //   this.studentData = resp;
    // }, err => {
    //   console.log(err);
    // });
    this.controlStudentProvider.getControlStudentById(this.controlStudentId)
    .subscribe( resp => {
      this.formDocument = this._castToDoc(resp.controlStudent);
      this.initRequest.setPresentationRequest(this.formDocument);
      const binary = this.initRequest.documentSend(eSocialFiles.ASIGNACION);
      this.saveDocument(binary, this.formDocument.student, this.controlStudentId, true, '');
    }, err => {
      console.log(err);
    });
  }// saveWorkPlan

  private _castToDoc(data) {
    this.getMissingData();
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
      tradeDocumentNumber: data.tradePresentationDocumentNumber,
      months: data.months,
      schedule: data.schedule,
      studentPhone: this.studentPhone,
      studentStreet : this.studentStreet,
      studentSuburb: this.studentSuburb
    };
  }

  saveDocument(document, student, controlStudentId, statusDoc: boolean, fileId: string) {
    this.loadingService.setLoading(true);
    const documentInfo = {
      mimeType: 'application/pdf',
      nameInDrive: eSocialNameDocuments.ASIGNACION,
      bodyMedia: document,
      folderId: student.folderIdSocService.idFolderInDrive,
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
          this._createHistoryDocumentStatus(eSocialNameDocuments.ASIGNACION,
            'SE REGISTRO', 'SE HA REGISTRADO LA INFORMACIÓN PARA EL PLAN DE TRABAJO',
            this.userData.name.fullName);

          await this.controlStudentProvider.uploadDocumentDrive(controlStudentId, documentInfo4).subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Asignación registrada correctamente.');
              this.ngOnInit();
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
          await this.controlStudentProvider.updateDocumentLog(student._id, {filename: updated.filename, status: docStatus})
            .subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Asignación actualizada correctamente.');
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

  saveCommitmentDocument(document, student, controlStudentId, statusDoc: boolean, fileId: string) {
    this.validateDocumentViewer('data:application/pdf;base64,' + document,
      eSocialNameDocuments.COMPROMISO).then( async response => {
      if (response) {
        this.commitment = 'upload';
        const documentInfo = {
          mimeType: 'application/pdf',
          nameInDrive: eSocialNameDocuments.COMPROMISO,
          bodyMedia: document,
          folderId: student.folderIdSocService.idFolderInDrive,
          newF: statusDoc,
          fileId: fileId
        };
        this.commitmentDoc = documentInfo;
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
              await this.controlStudentProvider.uploadDocumentDrive(controlStudentId, documentInfo4).subscribe( () => {
                  this.notificationsService.showNotification(eNotificationType.SUCCESS,
                    'Exito', 'Carta Compromiso registrada correctamente.');
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
              await this.controlStudentProvider.updateDocumentLog(student._id, {filename: updated.filename, status: docStatus})
                .subscribe( () => {
                  this.notificationsService.showNotification(eNotificationType.SUCCESS,
                    'Exito', 'Carta Compromiso actualizada correctamente.');
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
    }
    );
  }// saveCommitmentDocument

  // getCommitment() {
  //   let commitmentFile: File = null;
  //   const commitment = this.documents.filter(f => f.filename.toString().includes(eSocialNameDocuments.COMPROMISO_CODE));
  //   let commitmentId = '';
  //   try {
  //     commitmentId = commitment[0].fileIdInDrive;
  //   } catch (e) {
  //     console.log(e);
  //     this.notificationsService.showNotification(eNotificationType.ERROR,
  //       'Error', 'No se ha encontrado la carta compromiso, vuelva a intentarlo mas tarde.');
  //     return;
  //   }
  //   this.controlStudentProvider.getFile(commitmentId, eSocialNameDocuments.COMPROMISO).subscribe(async (res) => {
  //     console.log('res', res);
  //     commitmentFile = res.file;
  //   }); {
  //
  //   }
  //   return commitmentFile;
  // }

  getMissingData() {
    this.controlStudentProvider.getFullStudentInformationByControlId(this.controlStudentId).subscribe( async res => {
      this.studentPhone = res.student.phone;
      this.studentStreet = res.student.street;
      this.studentSuburb = res.student.suburb;
      this.studentCity = res.student.city;
      this.studentState = res.student.state;
      // console.log(res.student);
    });
  }

  generateCommitment() {
    this.controlStudentProvider.getControlStudentById(this.controlStudentId)
      .subscribe( resp => {
        this.formDocument = this._castToDoc(resp.controlStudent);
        this.initRequest.setPresentationRequest(this.formDocument);
        const binary = this.initRequest.documentSend(eSocialFiles.COMPROMISO);
        this.validateDocumentViewer('data:application/pdf;base64,' + binary,
          eSocialNameDocuments.COMPROMISO).then( async response => {
          if (response) {
            this.commitmentDoc = {
              mimeType: 'application/pdf',
              nameInDrive: eSocialNameDocuments.COMPROMISO,
              bodyMedia: binary,
              folderId: this.folderId,
              newF: true,
              fileId: ''
            };
            this.commitment = 'upload';
          }
        });
        // this.saveCommitmentDocument(binary, this.formDocument.student, this.controlStudentId, true, '');
      }, err => {
        console.log(err);
      });
  }

  uploadReport(event) {
    const reader = new FileReader();
    const docType = event.target.attributes.id.value;
    let newF = true;
    let fileId = '';
    let nameDocument = '';
    switch (docType) {
        case 'report1':
          this.reportId = this.reports[0]._id;
          nameDocument = 'ITT-POC-08-06-01 Reporte bimestral de reporte social.pdf';
          if (this.reports[0].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-01'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report2':
          this.reportId = this.reports[1]._id;
          nameDocument = 'ITT-POC-08-06-02 Reporte bimestral de reporte social.pdf';
          if (this.reports[1].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-02'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report3':
          this.reportId = this.reports[2]._id;
          nameDocument = 'ITT-POC-08-06-03 Reporte bimestral de reporte social.pdf';
          if (this.reports[2].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-03'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report4':
          this.reportId = this.reports[3]._id;
          nameDocument = 'ITT-POC-08-06-04 Reporte bimestral de reporte social.pdf';
          if (this.reports[3].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-04'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report5':
          this.reportId = this.reports[4]._id;
          nameDocument = 'ITT-POC-08-06-05 Reporte bimestral de reporte social.pdf';
          if (this.reports[4].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-05'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report6':
          this.reportId = this.reports[5]._id;
          nameDocument = 'ITT-POC-08-06-06 Reporte bimestral de reporte social.pdf';
          if (this.reports[5].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-06'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report7':
          this.reportId = this.reports[6]._id;
          nameDocument = 'ITT-POC-08-06-07 Reporte bimestral de reporte social.pdf';
          if (this.reports[6].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-07'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report8':
          this.reportId = this.reports[7]._id;
          nameDocument = 'ITT-POC-08-06-08 Reporte bimestral de reporte social.pdf';
          if (this.reports[7].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-08'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report9':
          this.reportId = this.reports[8]._id;
          nameDocument = 'ITT-POC-08-06-09 Reporte bimestral de reporte social.pdf';
          if (this.reports[8].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-09'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report10':
          this.reportId = this.reports[9]._id;
          nameDocument = 'ITT-POC-08-06-10 Reporte bimestral de reporte social.pdf';
          if (this.reports[9].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-10'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report11':
          this.reportId = this.reports[10]._id;
          nameDocument = 'ITT-POC-08-06-11 Reporte bimestral de reporte social.pdf';
          if (this.reports[10].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-11'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'report12':
          this.reportId = this.reports[11]._id;
          nameDocument = 'ITT-POC-08-06-12 Reporte bimestral de reporte social.pdf';
          if (this.reports[11].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-06-12'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;


        case 'managerEvaluations1':
          this.managerEvaluationId = this.managerEvaluations[0]._id;
          nameDocument = 'ITT-POC-08-09-01 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[0].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-01'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations2':
          this.managerEvaluationId = this.managerEvaluations[1]._id;
          nameDocument = 'ITT-POC-08-09-02 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[1].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-02'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations3':
          this.managerEvaluationId = this.managerEvaluations[2]._id;
          nameDocument = 'ITT-POC-08-09-03 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[2].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-03'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations4':
          this.managerEvaluationId = this.managerEvaluations[3]._id;
          nameDocument = 'ITT-POC-08-09-04 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[3].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-04'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations5':
          this.managerEvaluationId = this.managerEvaluations[4]._id;
          nameDocument = 'ITT-POC-08-09-05 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[4].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-05'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations6':
          this.managerEvaluationId = this.managerEvaluations[5]._id;
          nameDocument = 'ITT-POC-08-09-06 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[5].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-06'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations7':
          this.managerEvaluationId = this.managerEvaluations[6]._id;
          nameDocument = 'ITT-POC-08-09-07 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[6].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-07'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations8':
          this.managerEvaluationId = this.managerEvaluations[7]._id;
          nameDocument = 'ITT-POC-08-09-08 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[7].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-08'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations9':
          this.managerEvaluationId = this.managerEvaluations[8]._id;
          nameDocument = 'ITT-POC-08-09-09 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[8].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-09'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations10':
          this.managerEvaluationId = this.managerEvaluations[9]._id;
          nameDocument = 'ITT-POC-08-09-10 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[9].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-10'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations11':
          this.managerEvaluationId = this.managerEvaluations[10]._id;
          nameDocument = 'ITT-POC-08-09-11 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[10].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-11'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'managerEvaluations12':
          this.managerEvaluationId = this.managerEvaluations[11]._id;
          nameDocument = 'ITT-POC-08-09-12 Evaluacion responsable del programa.pdf';
          if (this.managerEvaluations[11].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-09-12'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;

        case 'selfEvaluations1':
          this.selfEvaluationId = this.selfEvaluations[0]._id;
          nameDocument = 'ITT-POC-08-11-01 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[0].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-01'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations2':
          this.selfEvaluationId = this.selfEvaluations[1]._id;
          nameDocument = 'ITT-POC-08-11-02 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[1].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-02'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations3':
          this.selfEvaluationId = this.selfEvaluations[2]._id;
          nameDocument = 'ITT-POC-08-11-03 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[2].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-03'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations4':
          this.selfEvaluationId = this.selfEvaluations[3]._id;
          nameDocument = 'ITT-POC-08-11-04 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[3].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-04'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations5':
          this.selfEvaluationId = this.selfEvaluations[4]._id;
          nameDocument = 'ITT-POC-08-11-05 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[4].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-05'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations6':
          this.selfEvaluationId = this.selfEvaluations[5]._id;
          nameDocument = 'ITT-POC-08-11-06 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[5].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-06'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations7':
          this.selfEvaluationId = this.selfEvaluations[6]._id;
          nameDocument = 'ITT-POC-08-11-07 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[6].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-07'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations8':
          this.selfEvaluationId = this.selfEvaluations[7]._id;
          nameDocument = 'ITT-POC-08-11-08 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[7].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-08'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations9':
          this.selfEvaluationId = this.selfEvaluations[8]._id;
          nameDocument = 'ITT-POC-08-11-09 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[8].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-09'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations10':
          this.selfEvaluationId = this.selfEvaluations[9]._id;
          nameDocument = 'ITT-POC-08-11-10 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[9].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-10'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations11':
          this.selfEvaluationId = this.selfEvaluations[10]._id;
          nameDocument = 'ITT-POC-08-11-11 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[10].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-11'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
        case 'selfEvaluations12':
          this.selfEvaluationId = this.selfEvaluations[11]._id;
          nameDocument = 'ITT-POC-08-11-12 Autoevaluación del alumno.pdf';
          if (this.selfEvaluations[11].status === 'reevaluate') {
            newF = false;
            const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-11-12'));
            nameDocument = documentId[0].filename;
            fileId = documentId[0].fileIdInDrive;
          }
        break;
    }
    this.selectedFile = <File>event.target.files[0];
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        const document = {
          mimeType: this.selectedFile.type,
          nameInDrive: nameDocument,
          bodyMedia: reader.result.toString().split(',')[1],
          folderId: this.folderId,
          newF: newF,
          fileId: fileId
        };

      this.validateDocumentViewer(reader.result.toString(), document.nameInDrive).then(async response => {
        if (response) {

          switch (docType) {
            case 'report1':
              if (this.reports[0].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[0].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[0].status = 'upload';
              }
            break;
            case 'report2':
              if (this.reports[1].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[1].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[1].status = 'upload';
              }
            break;
            case 'report3':
              if (this.reports[2].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[2].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[2].status = 'upload';
              }
            break;
            case 'report4':
              if (this.reports[3].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[3].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[3].status = 'upload';
              }
            break;
            case 'report5':
              if (this.reports[4].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[4].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[4].status = 'upload';
              }
            break;
            case 'report6':
              if (this.reports[5].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[5].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[5].status = 'upload';
              }
            break;
            case 'report7':
              if (this.reports[6].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[6].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[6].status = 'upload';
              }
            break;
            case 'report8':
              if (this.reports[7].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[7].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[7].status = 'upload';
              }
            break;
            case 'report9':
              if (this.reports[8].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[8].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[8].status = 'upload';
              }
            break;
            case 'report10':
              if (this.reports[9].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[9].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[9].status = 'upload';
              }
            break;
            case 'report11':
              if (this.reports[10].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[10].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[10].status = 'upload';
              }
            break;
            case 'report12':
              if (this.reports[11].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.reportId, '1');
                this.reports[11].status = 'send';
              } else {
                this.reportDoc = document;
                this.reports[11].status = 'upload';
              }
            break;

            case 'managerEvaluations1':
              if (this.managerEvaluations[0].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[0].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[0].status = 'upload';
              }
            break;
            case 'managerEvaluations2':
              if (this.managerEvaluations[1].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[1].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[1].status = 'upload';
              }
            break;
            case 'managerEvaluations3':
              if (this.managerEvaluations[2].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[2].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[2].status = 'upload';
              }
            break;
            case 'managerEvaluations4':
              if (this.managerEvaluations[3].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[3].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[3].status = 'upload';
              }
            break;
            case 'managerEvaluations5':
              if (this.managerEvaluations[4].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[4].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[4].status = 'upload';
              }
            break;
            case 'managerEvaluations6':
              if (this.managerEvaluations[5].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[5].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[5].status = 'upload';
              }
            break;
            case 'managerEvaluations7':
              if (this.managerEvaluations[6].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[6].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[6].status = 'upload';
              }
            break;
            case 'managerEvaluations8':
              if (this.managerEvaluations[7].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[7].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[7].status = 'upload';
              }
            break;
            case 'managerEvaluations9':
              if (this.managerEvaluations[8].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[8].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[8].status = 'upload';
              }
            break;
            case 'managerEvaluations10':
              if (this.managerEvaluations[9].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[9].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[9].status = 'upload';
              }
            break;
            case 'managerEvaluations11':
              if (this.managerEvaluations[10].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[10].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[10].status = 'upload';
              }
            break;
            case 'managerEvaluations12':
              if (this.managerEvaluations[11].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.managerEvaluationId, '2');
                this.managerEvaluations[11].status = 'send';
              } else {
                this.managerEvaluationDoc = document;
                this.managerEvaluations[11].status = 'upload';
              }
            break;

            case 'selfEvaluations1':
              if (this.selfEvaluations[0].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[0].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[0].status = 'upload';
              }
            break;
            case 'selfEvaluations2':
              if (this.selfEvaluations[1].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[1].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[1].status = 'upload';
              }
            break;
            case 'selfEvaluations3':
              if (this.selfEvaluations[2].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[2].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[2].status = 'upload';
              }
            break;
            case 'selfEvaluations4':
              if (this.selfEvaluations[3].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[3].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[3].status = 'upload';
              }
            break;
            case 'selfEvaluations5':
              if (this.selfEvaluations[4].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[4].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[4].status = 'upload';
              }
            break;
            case 'selfEvaluations6':
              if (this.selfEvaluations[5].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[5].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[5].status = 'upload';
              }
            break;
            case 'selfEvaluations7':
              if (this.selfEvaluations[6].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[6].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[6].status = 'upload';
              }
            break;
            case 'selfEvaluations8':
              if (this.selfEvaluations[7].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[7].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[7].status = 'upload';
              }
            break;
            case 'selfEvaluations9':
              if (this.selfEvaluations[8].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[8].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[8].status = 'upload';
              }
            break;
            case 'selfEvaluations10':
              if (this.selfEvaluations[9].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[9].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[9].status = 'upload';
              }
            break;
            case 'selfEvaluations11':
              if (this.selfEvaluations[10].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[10].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[10].status = 'upload';
              }
            break;
            case 'selfEvaluations12':
              if (this.selfEvaluations[11].status === 'reevaluate') {
                await this.uploadFileReportToDrive(document.nameInDrive, document, this.selfEvaluationId, '3');
                this.selfEvaluations[11].status = 'send';
              } else {
                this.selfEvaluationDoc = document;
                this.selfEvaluations[11].status = 'upload';
              }
            break;
          }
        }
      });
      };
    }
  }// uploadReport

  validateUploadReport() { // metodo para activar el boton para enviar reportes
    if ( this.reportDoc && this.managerEvaluationDoc && this.selfEvaluationDoc)
    {
      return false;
    }
    return true;
  }

  /*retornar true para deshabilitar el boton
  posibles statues del reporte = 'register', 'send', 'reevaluate', 'approved'
   el boton se activa cuando:
    -el status es diferente de approved
    -el anterior (report, managerEvaluation y selfEvaluation) esta en status approved excepto en el primer reporte
    -la fecha ya permite enviar el reporte.
  */
  disabledUploadReport(reportPosition, reportStatus) {
    let button = true;
    if ( reportStatus !== 'approved') {
      // el reporte anterior esta aprobado
      if (reportPosition > 1) {
        // tslint:disable-next-line: max-line-length
        if (this.reports[reportPosition - 2].status === 'approved' && this.managerEvaluations[reportPosition - 2].status === 'approved' && this.selfEvaluations[reportPosition - 2].status === 'approved') {
          // validar que dependiendo del numero de reporte la fecha sea adecuada
          if (this.now.isAfter(this.dateArray[reportPosition - 1])) {
            button = false;
          }
        }
      } else { // Si es el primero solo validar la fecha
      // aqui validar solo la fecha
        if (this.now.isAfter(this.dateArray[reportPosition - 1])) {
          button = false;
        }
      }
    }
    return button;
  }

  addDates(initDate) {
      this.dateArray =
        [moment.utc(initDate).add(50, 'days'), moment.utc(initDate).add(110, 'days'), moment.utc(initDate).add(170, 'days'), moment.utc(initDate).add(230, 'days'),
        moment.utc(initDate).add(290, 'days'), moment.utc(initDate).add(350, 'days'), moment.utc(initDate).add(410, 'days'), moment.utc(initDate).add(470, 'days'),
        moment.utc(initDate).add(530, 'days'), moment.utc(initDate).add(590, 'days'), moment.utc(initDate).add(650, 'days'), moment.utc(initDate).add(710, 'days')];
  }

  async uploadReportFile() {
    if ( this.reportDoc ) {
      await this.uploadFileReportToDrive(this.reportDoc.nameInDrive, this.reportDoc, this.reportId, '1');
    }
    if ( this.managerEvaluationDoc ) {
      await this.uploadFileReportToDrive(this.managerEvaluationDoc.nameInDrive, this.managerEvaluationDoc, this.managerEvaluationId, '2');
    }
    if ( this.selfEvaluationDoc ) {
      await this.uploadFileReportToDrive(this.selfEvaluationDoc.nameInDrive, this.selfEvaluationDoc, this.selfEvaluationId, '3');
    }
  }


  uploadFileReportToDrive(nameDocument, document, documentId, type) {
    let typeDoc = '';
    switch (type) {
      case '1':
        typeDoc = 'reports';
      break;
      case '2':
        typeDoc = 'managerEvaluations';
      break;
      case '3':
        typeDoc = 'selfEvaluations';
      break;
    }
    this.loadingService.setLoading(true);
    // Cargar el documento a Drive, ya debe de existir su registro y base de datos
    this.controlStudentProvider.uploadFile2(document).subscribe( async updated => {
        if (updated.action === 'create file') {
          const documentInfo = {
            doc: {
              filename: updated.name,
              type: 'DRIVE',
              fileIdInDrive: updated.fileId,
            },
            status: {
              name: 'EN PROCESO',
              message: `El estudiante subio el ${nameDocument} por primera vez`
            }
          };
          // Actualizar información del documento subido a drive
          await this.controlStudentProvider.uploadDocumentDrive(this.controlStudentId, documentInfo).subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',  nameDocument + ' cargado');
              // Actualizar en la bd el status del reporte
              this.controlStudentProvider.updateReportFromDepartmentEvaluation(this.controlStudentId,
                {nameDocument: typeDoc, documentId: documentId, eStatus: 'send'})
                .subscribe( res => {
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, '', 'Se guardo el registro del reporte');
                  this.ngOnInit();
                } );
            },
            err => {
              console.log(err);
            }, () => this.loadingService.setLoading(false)
          );
        } else {
          const documentInfo = {
            filename: updated.filename,
            status: {
              name: 'EN PROCESO',
              message: `El estudiante actualizo el ${nameDocument}`
            }
          };
          // Actualizar la información del documento
          await this.controlStudentProvider.updateDocumentLog(this.controlStudentId, documentInfo)
            .subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
                nameDocument + ' actualizado.');
                this.controlStudentProvider.updateReportFromDepartmentEvaluation(this.controlStudentId,
                  {nameDocument: typeDoc, documentId: documentId, eStatus: 'send'})
                  .subscribe( res => {
                    this.notificationsService.showNotification(eNotificationType.SUCCESS, '', 'Se guardo el registro del reporte');
                    this.ngOnInit();
                  } );
            }, err => {
              console.log(err);
            }, () => this.loadingService.setLoading(false));
        }
      },
      err => {
        console.log(err);
        this.loadingService.setLoading(false);
      });
  }

  async uploadFinalDocumentation() {
    if (this.lastReportDoc) {
      await this.uploadFile(this.lastReportDoc.nameInDrive, this.lastReportDoc, 'lastReport');
    }
    if (this.lastReportEvaluationDoc) {
      await this.uploadFile(this.lastReportEvaluationDoc.nameInDrive, this.lastReportEvaluationDoc, 'lastReportEvaluation');
    }
    if (this.dependencyReleaseDoc) {
      await this.uploadFile(this.dependencyReleaseDoc.nameInDrive, this.dependencyReleaseDoc, 'dependencyRelease');
    }
  }

  validateUploadFinalFiles() {
    return this.lastReport !== 'upload' ||
            this.lastReportEvaluation !== 'upload' ||
            this.dependencyRelease !== 'upload';
  }

  disabledUploadFinalFile(document) {
    let res = false;
    switch (document) {
      case 'lastReport':
        res = ['approved', 'send'].includes(this.lastReport);
      break;
      case 'lastReportEvaluation':
        res = ['approved', 'send'].includes(this.lastReportEvaluation);
      break;
      case 'dependencyRelease':
        res = ['approved', 'send'].includes(this.dependencyRelease);
      break;
    }
    return res;
  }

  async onFinalFileChange(event) {
    const reader = new FileReader();
    const docType = event.target.attributes.id.value;
    let newF = true;
    let fileId = '';
    let nameDocument = '';
    switch (docType) {
      case 'lastReport':
        nameDocument = 'ITT-POC-08-12 Reporte final.pdf';
        if ( this.lastReport === 'reevaluate' ) {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-12'));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
      break;
      case 'lastReportEvaluation':
        nameDocument = 'ITT-POC-08-10 Evaluación del reporte final.pdf';
        if ( this.lastReportEvaluation === 'reevaluate' ) {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-10'));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
      break;
      case 'dependencyRelease':
        nameDocument = 'ITT-POC-08-13 Carta de liberacion de la dependencia.pdf';
        if ( this.dependencyRelease === 'reevaluate' ) {
          newF = false;
          const documentId = this.documents.filter(d => d.filename.includes('ITT-POC-08-13'));
          nameDocument = documentId[0].filename;
          fileId = documentId[0].fileIdInDrive;
        }
      break;
    }
    this.selectedFile = <File>event.target.files[0];
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        const document = {
          mimeType: this.selectedFile.type,
          nameInDrive: nameDocument,
          bodyMedia: reader.result.toString().split(',')[1],
          folderId: this.folderId,
          newF: newF,
          fileId: fileId
        };
        this.validateDocumentViewer(reader.result.toString(), document.nameInDrive).then( async response => {
          if (response) {
            switch (docType) {
              case 'lastReport':
                if (this.lastReport === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'lastReport');
                  this.lastReport = 'send';
                } else {
                  this.lastReportDoc = document;
                  this.lastReport = 'upload';
                }
              break;
              case 'lastReportEvaluation':
                if (this.lastReportEvaluation === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'lastReportEvaluation');
                  this.lastReportEvaluation = 'send';
                } else {
                  this.lastReportEvaluationDoc = document;
                  this.lastReportEvaluation = 'upload';
                }
              break;
              case 'dependencyRelease':
                if (this.dependencyRelease === 'reevaluate') {
                  await this.uploadFile(document.nameInDrive, document, 'dependencyRelease');
                  this.dependencyRelease = 'send';
                } else {
                  this.dependencyReleaseDoc = document;
                  this.dependencyRelease = 'upload';
                }
              break;
            }
          }
        });
      };
    }
  }

}
