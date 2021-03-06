import { Component, OnInit } from '@angular/core';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';
import {IStudent} from '../../../entities/shared/student.model';
import {ActivatedRoute} from '@angular/router';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {LoadingService} from '../../../services/app/loading.service';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-review-last-report-page',
  templateUrl: './review-last-report-page.component.html',
  styleUrls: ['./review-last-report-page.component.scss']
})
export class ReviewLastReportPageComponent implements OnInit {
  private controlStudentId: string;
  public lastReport: string;
  public lastReportEvaluation: string;
  public dependencyRelease: string;
  public student: IStudent;
  public pdf: any;
  private documents: any;
  public loaded = false;

  constructor(private activatedRoute: ActivatedRoute,
              private controlStudentProv: ControlStudentProv,
              private notificationsService: NotificationsServices,
              private loadingService: LoadingService,
              public location: Location,
              public dialog: MatDialog) {
    activatedRoute.queryParams.subscribe( param => {
      this.controlStudentId = param.id;
    });
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentById(this.controlStudentId).subscribe(res => {
      this.student = res.controlStudent.studentId;
      this.documents = res.controlStudent.documents;
      this.lastReport = res.controlStudent.verification.lastReport;
      this.lastReportEvaluation = res.controlStudent.verification.lastReportEvaluation;
      this.dependencyRelease = res.controlStudent.verification.dependencyRelease;
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
        'No se pudo obtener la información del estudiante, intentelo mas tarde');
      this.disableLoading();
    }, () => this.disableLoading());
  }

  viewDocument(documentCode) {
    this.loadingService.setLoading(true);
    const documentId = this.documents.find(d => d.filename.includes(documentCode));
    this.controlStudentProv.getResource(documentId.fileIdInDrive, documentCode).subscribe(async (data: Blob) => {
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

  sendVerificationInformation(document, information, status) {
    this.loadingService.setLoading(true);
    this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId,
      {['verificationDepartment.' + document]: information,
        ['verification.' + document]: status})
      .subscribe( () => {
        this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
          'Se ha enviado su validación del documento');
        switch (document) {
          case 'lastReport':
            this.lastReport = status;
            break;
          case 'lastReportEvaluation':
            this.lastReportEvaluation = status;
            break;
        }
        if (this.lastReportEvaluation === 'approved' &&
          this.lastReport === 'approved') {
          this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId, {'status': 'preAssigned'})
            .subscribe( () => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
                'Se ha actualizado el estatus del estuadiante');
            }, () => {
              this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Atención',
                'No se ha cambiado el estatus general del estudiante');
            });
        }
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
