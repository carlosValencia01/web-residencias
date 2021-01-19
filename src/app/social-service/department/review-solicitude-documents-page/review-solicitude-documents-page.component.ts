import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {IStudent} from '../../../entities/shared/student.model';
import {MatDialog} from '@angular/material';
import Swal from 'sweetalert2';
import {Location} from '@angular/common';
import {CookiesService} from '../../../services/app/cookie.service';
import {eSocialNameDocuments} from '../../../enumerators/social-service/socialServiceNameDocuments.enum';

@Component({
  selector: 'app-review-solicitude-documents-page',
  templateUrl: './review-solicitude-documents-page.component.html',
  styleUrls: ['./review-solicitude-documents-page.component.scss']
})
export class ReviewSolicitudeDocumentsPageComponent implements OnInit {
  private controlStudentId: string;
  public acceptance: string;
  public presentation: string;
  public workPlan: string;
  public commitment: string;
  public student: IStudent;
  public pdf: any;
  private documents: any;
  public loaded = false;
  private historyDocumentStatus: Array<any>;
  private userData;

  constructor(private activatedRoute: ActivatedRoute,
              private controlStudentProv: ControlStudentProv,
              private notificationsService: NotificationsServices,
              private loadingService: LoadingService,
              private cookiesService: CookiesService,
              public location: Location,
              public dialog: MatDialog) {
    activatedRoute.queryParams.subscribe( param => {
      this.controlStudentId = param.id;
    });
    this.userData = this.cookiesService.getData().user;
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentById(this.controlStudentId).subscribe(res => {
      this.student = res.controlStudent.studentId;
      this.documents = res.controlStudent.documents;
      this.acceptance = res.controlStudent.verification.acceptance;
      this.presentation = res.controlStudent.verification.presentation;
      this.workPlan = res.controlStudent.verification.workPlanProject;
      this.commitment = res.controlStudent.verification.commitment;
      this.historyDocumentStatus = res.controlStudent.historyDocumentStatus;
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
        'No se pudo obtener la información del estudiante, intentelo mas tarde');
      this.disableLoading();
    }, () => this.disableLoading());
  }

  viewDocument(documentCode) {
    this.loadingService.setLoading(true);
    const documentId = this.documents.filter(d => d.filename.includes(documentCode));
    this.controlStudentProv.getResource(documentId[0].fileIdInDrive, documentCode).subscribe(async (data: Blob) => {
      this.pdf = data;
      // this.openDialog(this.pdf);
    }, error => {
      let message = '';
      try {
        message = JSON.parse(error._body).message || 'Error al buscar recurso';
      } catch {
        message = 'Error al buscar el recurso';
      }
      this.disableLoading();
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Servicio social', message);
    }, () => this.disableLoading() );
  }

  messageForCompany(element, document) {
    switch (element) {
      case 'rejectDocument':
        Swal.fire({
          title: 'Evaluación de documento',
          text: 'Escriba un mensaje que describa el error para el documento por favor',
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
                'Si se ha rechazado alguna información del documento por favor ' +
                'escriba un mensaje para el alumno de los errores en su información');
            } else {
              // Asignar mensaje por parte de bolsa de trabajo
              this.sendVerificationInformation( document, {validation: false, message: result.value}, 'reevaluate');
            }
          }
        });
        break;
      case 'evaluateDocument':
        Swal.fire({
          title: 'Evaluación de documento',
          html: 'Se ha realizado la validación de toda la información de la solicitud del estudiante' +
            '<br><strong>¿Está seguro de continuar?</strong>',
          type: 'info',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar el proceso',
          confirmButtonText: 'Validar documento'
        }).then((result) => {
          if (result.value) {
              // Todos los campos del formulario son correctos
            this.sendVerificationInformation( document, {validation: true, message: ''}, 'approved');
          }
        });
        break;
    }
  }

  _pushHistoryDocumentStatus(nameStatus: string, messageStatus: string, responsible: string, documentCode: string) {
    const doc = this.historyDocumentStatus.find(h => h.name.includes(documentCode));
    this.controlStudentProv.pushHistoryDocumentStatus(this.controlStudentId, doc._id,
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

  sendVerificationInformation(document, information, status) {
    this.loadingService.setLoading(true);
    this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId,
      {['verificationDepartment.' + document]: information,
        ['verification.' + document]: status})
      .subscribe( () => {
        this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
          'Se ha enviado su validación del documento');
        switch (document) {
          case 'presentation':
            this.presentation = status;
            // if (status === 'reevaluate') {
            //   this._pushHistoryDocumentStatus('SE RECHAZO', information.message,
            //     this.userData.name.fullName, eSocialNameDocuments.PRESENTACION_CODE);
            // } else {
            //   this._pushHistoryDocumentStatus('SE ACEPTO', 'SE HA ACEPTADO EL DOCUMENTO',
            //     this.userData.name.fullName, eSocialNameDocuments.PRESENTACION_CODE);
            // }
            break;
          case 'acceptance':
            this.acceptance = status;
            // if (status === 'reevaluate') {
            //   this._pushHistoryDocumentStatus('SE RECHAZO', information.message,
            //     this.userData.name.fullName, eSocialNameDocuments.ACEPTACION_CODE);
            // } else {
            //   this._pushHistoryDocumentStatus('SE ACEPTO', 'SE HA ACEPTADO EL DOCUMENTO',
            //     this.userData.name.fullName, eSocialNameDocuments.ACEPTACION_CODE);
            // }
            break;
          case 'workPlanProject':
            this.workPlan = status;
            // if (status === 'reevaluate') {
            //   this._pushHistoryDocumentStatus('SE RECHAZO', information.message,
            //     this.userData.name.fullName, eSocialNameDocuments.ASIGNACION_CODE);
            // } else {
            //   this._pushHistoryDocumentStatus('SE ACEPTO', 'SE HA ACEPTADO EL DOCUMENTO',
            //     this.userData.name.fullName, eSocialNameDocuments.ASIGNACION_CODE);
            // }
            break;
          case 'commitment':
            this.commitment = status;
            // if (status === 'reevaluate') {
            //   this._pushHistoryDocumentStatus('SE RECHAZO', information.message,
            //     this.userData.name.fullName, eSocialNameDocuments.COMPROMISO_CODE);
            // } else {
            //   this._pushHistoryDocumentStatus('SE ACEPTO', 'SE HA ACEPTADO EL DOCUMENTO',
            //     this.userData.name.fullName, eSocialNameDocuments.COMPROMISO_CODE);
            // }
            break;
        }
        if (this.presentation === 'approved' &&
            this.acceptance === 'approved' &&
            this.workPlan === 'approved' &&
            this.commitment === 'approved') {
          this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId, {'status': 'process'})
            .subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
                'Se ha iniciado el proceso de servicio social del estudiante');
            }, () => {
              this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Atención',
                'No se ha cambiado el estatus general del estudiante');
            });
        }
        this.ngOnInit();
      }, () => {
        this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
          'Ha sucedido un error guardando la información, vuelva a intentarlo mas tarde');
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false));
  }

  disableLoading() {
    this.loadingService.setLoading(false);
    this.loaded = true;
  }
}
