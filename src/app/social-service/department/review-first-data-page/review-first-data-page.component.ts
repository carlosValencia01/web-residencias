import {Component, OnInit} from '@angular/core';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import Swal from 'sweetalert2';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {LoadingService} from '../../../services/app/loading.service';
import {DatePipe} from '@angular/common';
import {InitRequest} from '../../../entities/social-service/initRequest';
import {ImageToBase64Service} from '../../../services/app/img.to.base63.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {SolicitudeModel} from '../../../entities/social-service/solicitude.model';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';
import {eSocialFiles} from '../../../enumerators/social-service/document.enum';

interface InformationReview {
  fieldName: string;
  validation: boolean;
  message: string;
}

@Component({
  selector: 'app-review-first-data-page',
  templateUrl: './review-first-data-page.component.html',
  styleUrls: ['./review-first-data-page.component.scss']
})
export class ReviewFirstDataPageComponent implements OnInit {
  private controlStudentId: string;
  private studentFolderId: string;
  private studentDocumentSolicitude;
  public formRequest: FormGroup;
  private formInformationReview: Array<InformationReview> = [];
  public displayControlFieldName = [
    'dependencyName',
    'dependencyPhone',
    'dependencyAddress',
    'dependencyHeadline',
    'dependencyHeadlinePosition',
    'dependencyDepartment',
    'dependencyDepartmentManager',
    'dependencyDepartmentManagerEmail',
    'dependencyProgramName',
    'dependencyProgramModality',
    'initialDate',
    'dependencyActivities',
    'dependencyProgramType',
    'dependencyProgramObjective',
    'dependencyProgramLocationInside',
    'dependencyProgramLocation'
  ];
  public displayName = [
    'Dependencia oficial',
    'Teléfono',
    'Domicilio de la depencia',
    'Titular de la dependencia',
    'Puesto ó cargo del titular',
    'Unidad orgánica ó departamento',
    'Nombre del encargado',
    'Correo electrónico',
    'Nombre del programa',
    'Modalidad',
    'Fecha de inicio',
    'Actividades del programa',
    'Tipo de programa',
    'Objetivo del programa',
    'El servicio social lo realizara dentro de las instalaciones de la dependencia',
    'Donde'
  ];
  private wrongFields: Array<any> = [];
  initRequest: InitRequest;
  formDocument: SolicitudeModel;
  private readonly userData: any;
  public errorFields = false;
  public errorFieldsMessage: Array<any> = [];
  public errorFieldsValidate: Array<any> = [];
  private signStudentDate: Date;
  private historyDocumentStatus: Array<any>;

  constructor(private controlStudentProvider: ControlStudentProv,
              private formBuilder: FormBuilder,
              private loadingService: LoadingService,
              private dateFormat: DatePipe,
              public imgSrv: ImageToBase64Service,
              private inscriptionsProv: InscriptionsProvider,
              private cookiesService: CookiesService,
              private notificationsService: NotificationsServices,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    activatedRoute.queryParams.subscribe( param => {
      this.controlStudentId = param.id;
    });
    this.userData = cookiesService.getData().user;
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this._initialize();
    this.controlStudentProvider.getControlStudentById(this.controlStudentId)
      .subscribe( res => {
        const data = this._castToForm(res.controlStudent);
        this.formRequest.setValue(data);

        this.formDocument = this._castToDoc(res.controlStudent);
        this._initializeDocument(res.controlStudent.studentId);
        this.historyDocumentStatus = res.controlStudent.historyDocumentStatus;
        this.signStudentDate = res.controlStudent.verification.signs.solicitude.signStudentDate;
        this.studentFolderId = res.controlStudent.studentId.folderIdSocService.idFolderInDrive;
        this.studentDocumentSolicitude = res.controlStudent.documents.filter(f => f.filename.includes('SOLICITUD'));
        const informationSolicitude = res.controlStudent.verificationDepartment.solicitude;
        if (informationSolicitude.length > 0) {
          this.errorFields = true;
          informationSolicitude.forEach( dep => {
            this.errorFieldsValidate[dep.fieldName] = dep.validation;
            if (!dep.validation) {
              this.errorFieldsMessage[dep.fieldName] = dep.message;
            }
          });
        }
      }, error => {
        this.loadingService.setLoading(false);
        console.log(error);
      }, () => this.loadingService.setLoading(false));
    this.createFormInformationReview(); // Inicialización de objeto de campos a evaluar, del formulario
  }

  _initializeDocument(student) {
    this.controlStudentProvider.getActivePeriod().toPromise().then( res => {
      // Init para documentos para la información del estudiante y del periodo activo
      this.initRequest = new InitRequest( { student: student, periodId: res.period }, this.imgSrv, this.cookiesService);
    }).catch( err => {
      console.log(err);
    });
  }

  _initialize() {
    this.formRequest = this.formBuilder.group({
      dependencyName: [{value: '', disabled: true}],
      dependencyPhone: [{value: '', disabled: true}],
      dependencyAddress: [{value: '', disabled: true}],
      dependencyHeadline: [{value: '', disabled: true}],
      dependencyHeadlinePosition: [{value: '', disabled: true}],
      dependencyDepartment: [{value: '', disabled: true}],
      dependencyDepartmentManager: [{value: '', disabled: true}],
      dependencyDepartmentManagerEmail: [{value: '', disabled: true}],
      dependencyProgramName: [{value: '', disabled: true}],
      dependencyProgramModality: [{value: '', disabled: true}],
      initialDate: [{value: '', disabled: true}],
      dependencyActivities: [{value: '', disabled: true}],
      dependencyProgramType: [{value: '', disabled: true}],
      dependencyProgramObjective: [{value: '', disabled: true}],
      dependencyProgramLocationInside: [{value: '', disabled: true}],
      dependencyProgramLocation: [{value: '', disabled: true}],
      'dependencyName-v': [true, Validators.required],
      'dependencyPhone-v': [true, Validators.required],
      'dependencyAddress-v': [true, Validators.required],
      'dependencyHeadline-v': [true, Validators.required],
      'dependencyHeadlinePosition-v': [true, Validators.required],
      'dependencyDepartment-v': [true, Validators.required],
      'dependencyDepartmentManager-v': [true, Validators.required],
      'dependencyDepartmentManagerEmail-v': [true, Validators.required],
      'dependencyProgramName-v': [true, Validators.required],
      'dependencyProgramModality-v': [true, Validators.required],
      'initialDate-v': [true, Validators.required],
      'dependencyActivities-v': [true, Validators.required],
      'dependencyProgramType-v': [true, Validators.required],
      'dependencyProgramObjective-v': [true, Validators.required],
      'dependencyProgramLocationInside-v': [true, Validators.required],
      'dependencyProgramLocation-v': [true, Validators.required]
    });
  }

  private _castToForm(data) {
    return {
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
      initialDate: this.dateFormat.transform(data.initialDate, 'medium'),
      dependencyActivities: data.dependencyActivities,
      dependencyProgramType: data.dependencyProgramType.value,
      dependencyProgramObjective: data.dependencyProgramObjective,
      dependencyProgramLocationInside: data.dependencyProgramLocationInside ? 'Si' : 'No',
      dependencyProgramLocation: data.dependencyProgramLocation,
      'dependencyName-v': true,
      'dependencyPhone-v': true,
      'dependencyAddress-v': true,
      'dependencyHeadline-v': true,
      'dependencyHeadlinePosition-v': true,
      'dependencyDepartment-v': true,
      'dependencyDepartmentManager-v': true,
      'dependencyDepartmentManagerEmail-v': true,
      'dependencyProgramName-v': true,
      'dependencyProgramModality-v': true,
      'initialDate-v': true,
      'dependencyActivities-v': true,
      'dependencyProgramType-v': true,
      'dependencyProgramObjective-v': true,
      'dependencyProgramLocationInside-v': true,
      'dependencyProgramLocation-v': true
    };
  }

  private _castToDoc(data) {
    return {
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
      studentCity:data.studentCity,
      studentGender:data.studentGender,
      studentPhone:data.studentPhone,
      studentState:data.studentState,
      studentStreet:data.studentStreet,
      studentSuburb:data.studentSuburb,
    };
  }
  createFormInformationReview() {
    const info = this.formRequest.value;
    for (const field in info) {
      if (info.hasOwnProperty(field)) {
        const name = field.split('-')[0];
        this.formInformationReview.push({
          fieldName: name,
          validation: true,
          message: ''
        });
      }
    }
  }

  valueChange(event, field: string, fieldName: string) {
    if (!event.value) {
      this.messageForCompany('informationReject', fieldName, field);
    } else {
      this.setFieldMessageVerification('', field, true);
    }
  }

  setFieldMessageVerification(message: string, field: string, status: boolean) {
    // Guardar la información respecto al campo
    this.formInformationReview.forEach(data => {
      if (data.fieldName === field) {
        data.message = message;
        data.validation = status;
        if (!status) {
          this.wrongFields.push(data);
        } else {
          // console.log(this.wrongFields);
          const index = this.wrongFields.findIndex(element => element.fieldName === field);
          this.wrongFields.splice(index, 1);
        }
        return;
      }
    });
  }

  messageForCompany(elemento, fieldName?, field?) {
    switch (elemento) {
      case 'informationReject':
        Swal.fire({
          title: 'Evaluación de información',
          html: 'Escriba un mensaje que describa el error para el campo <b>' + fieldName + '</b> por favor',
          type: 'error',
          input: 'text',
          inputValue: '',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar el proceso',
          confirmButtonText: 'Guardar mensaje'
        }).then((result) => {
          if (!result.dismiss) {
            if (result.value === '') {
              this.notificationsService.showNotification(
                eNotificationType.ERROR,
                'Campo vacio',
                'Si se ha rechazado alguna información de la empresa por favor ' +
                'escriba un mensaje para la empresa de los errores en su información');
              this.formRequest.get(field + '-v').setValue(true);
            } else {
              // Asignar mensaje por parte de bolsa de trabajo
              this.setFieldMessageVerification(result.value, field, false);
            }
          } else {
            this.formRequest.get(field + '-v').setValue(true);
          }
        });
        break;
      case 'sendInformation':
        Swal.fire({
          title: 'Evaluación de información',
          html: 'Se ha realizado la validación de toda la información de la solicitud del estudiante' +
            '<br><strong>¿Está seguro de continuar?</strong>',
          type: 'info',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar el proceso',
          confirmButtonText: 'Validar información'
        }).then((result) => {
          if (result.value) {
            // Enviar mensaje predefinido y enviar la informacion
            if (this.wrongFields.length > 0) {
              // Se ha encontrado al menos un campo rechazado
              this.sendVerificationInformation(this.formInformationReview, 'reevaluate');
              this._pushHistoryDocumentStatus('SE EVALUO', 'SE RECHAZO INFORMACION DE SOLICITUD', this.userData.name.fullName);
            } else {
              // Todos los campos del formulario son correctos
              this.sendVerificationInformation( [], 'approved');
              this._pushHistoryDocumentStatus('SE EVALUO', 'SE HA ACEPTADO LA INFORMACIÓN DE SOLICITUD', this.userData.name.fullName);
              // Se asigna el valor del formulario del alumno a la clase de initRequest para el documento de solicitud
              this.initRequest.setSolicitudeRequest(this.formDocument);
              this.initRequest.setSignResponsibles(this.userData, this.signStudentDate);
              // Se obtiene el documento pdf de Servicio Social
              const binary = this.initRequest.documentSend(eSocialFiles.SOLICITUD);
              const fileId = this.studentDocumentSolicitude.length > 0 ? this.studentDocumentSolicitude[0].fileIdInDrive : '';
              this.saveDocument(binary, this.studentDocumentSolicitude.length === 0, fileId);
            }
          }
        });
        break;
    }
  }

  saveDocument(document, statusDoc: boolean, fileId: string) {
    this.loadingService.setLoading(true);
    const documentInfo = {
      mimeType: 'application/pdf',
      nameInDrive: 'ITT-POC-08-02 Solicitud de Servicio Social.pdf',
      bodyMedia: document,
      folderId: this.studentFolderId,
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
              message: 'El departamento lo envio por primera vez'
            }
          };

          await this.controlStudentProvider.uploadDocumentDrive(this.controlStudentId, documentInfo4).subscribe( () => {
              this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId,
                {'verification.signs.solicitude.signDepartmentDate': new Date(),
                  'verification.signs.solicitude.signDepartmentName': this.userData.name.fullName} )
                .subscribe( res => {
                  this._pushHistoryDocumentStatus('SE CREO', 'CREACIÓN DE DOCUMENTO DE SOLICITUD', this.userData.name.fullName);
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
                }, () => {
                  this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Atención',
                    'No se ha podido guardar la información de firma del responsable');
                });
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
            message: 'El departamento actualizo el documento'
          };
          await this.controlStudentProvider.updateDocumentLog(this.controlStudentId, {filename: updated.filename, status: docStatus})
            .subscribe( () => {
              this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId,
                {'verification.signs.solicitude.signDepartmentDate': new Date(),
                  'verification.signs.solicitude.signDepartmentName': this.userData.name.fullName} )
                .subscribe( res => {
                  this._pushHistoryDocumentStatus('SE ACTUALIZO', 'ACTUALIZACIÓN DE DOCUMENTO DE SOLICITUD', this.userData.name.fullName);
                  this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
                }, () => {
                  this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Atención',
                    'No se ha podido guardar la información de firma del responsable');
                });
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

  sendInformationReview() {
    if (this.formRequest.invalid) {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        '', 'Ha sucedido un error en el formulario, vuelva a intentarlo mas tarde');
    } else {
      this.messageForCompany('sendInformation');
    }
  }

  cancelInformationReview() {
    this.router.navigate(['/social-service/solicitudeStudents']);
  }

  sendVerificationInformation(information, status) {
    this.controlStudentProvider.updateGeneralControlStudent(this.controlStudentId,
      {'verificationDepartment.solicitude': information,
            'verification.solicitude': status})
      .subscribe( () => {
        this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
          'Se ha enviado su validación de información');
        this.router.navigate(['/social-service/solicitudeStudents']);
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
          'Ha sucedido un error guardando la información, vuelva a intentarlo mas tarde');
      });
  }

  _pushHistoryDocumentStatus(nameStatus: string, messageStatus: string, responsible: string) {
    const doc = this.historyDocumentStatus.find(h => h.name.includes('ITT-POC-08-02'));
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

}
