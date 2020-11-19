import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {LoadingService} from '../../../services/app/loading.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {MatDialog} from '@angular/material';
import Swal from 'sweetalert2';
import {IStudent} from '../../../entities/shared/student.model';
import {Location} from '@angular/common';

@Component({
  selector: 'app-review-reports-documents',
  templateUrl: './review-reports-documents.component.html',
  styleUrls: ['./review-reports-documents.component.scss']
})
export class ReviewReportsDocumentsComponent implements OnInit {
  private controlStudentId: string;
  public loaded = false;
  public reports: any;
  public selfEvaluations: any;
  public managerEvaluations: any;
  public pdf: any;
  public student: IStudent;
  public documents: any;


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
    this.controlStudentProv.getControlStudentById(this.controlStudentId)
      .subscribe(res => {
        this.student = res.controlStudent.studentId;
        this.reports = res.controlStudent.verification.reports;
        this.selfEvaluations = res.controlStudent.verification.selfEvaluations;
        this.managerEvaluations = res.controlStudent.verification.managerEvaluations;
        this.documents = res.controlStudent.documents;
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
        'No se pudo obtener la información del estudiante, intentelo mas tarde');
      this.disableLoading();
    }, () => this.disableLoading());
  }

  viewDocument(documentCode) {
    this.loadingService.setLoading(true);
    const documentId = this.documents.find(d => d.filename.includes(documentCode));
    if (documentId) {
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
        this.loadingService.setLoading(false);
        this.notificationsService
          .showNotification(eNotificationType.ERROR, 'Servicio social', message);
      }, () => this.loadingService.setLoading(false) );
    } else {
      this.loadingService.setLoading(false);
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Servicio social', 'El documento no se encuentra disponible todavía');
    }
  }

  messageForCompany(type, report, nameDocument) {
    switch (type) {
      case 'rejectDocument':
        Swal.fire({
          title: 'Evaluación de documento',
          text: 'Escriba un mensaje que describa el error para el reporte por favor',
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
              this.sendVerificationInformation( report, {filename: report.name, validation: false, message: result.value}, 'reevaluate', nameDocument);
            }
          }
        });
        break;
      case 'evaluateDocument':
        Swal.fire({
          title: 'Evaluación de reporte bimestral',
          html: 'Se ha realizado la validación de toda la información del reporte del estudiante' +
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
            this.sendVerificationInformation( report, {filename: report.name, validation: true, message: ''}, 'approved', nameDocument);
          }
        });
        break;
    }
  }


  sendVerificationInformation(report, information, status, nameDocument) {
    this.loadingService.setLoading(true);
    this.controlStudentProv.updateDocumentEvaluationFromDepartmentEvaluation(this.controlStudentId,
      {documentId: report._id, eStatus: status, documentDepartment: information, nameDocument: nameDocument})
      .subscribe( res => {
        this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
          res.msg);
        this.ngOnInit();
        // this.controlStudentProv.updateOneVerificationDepartmentReport(this.controlStudentId,
        //   {document: information, nameDocument: nameDocument}).subscribe( eRes => {
        //   this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
        //     eRes.msg);
        //   this.ngOnInit();
        // }, err => {
        //     const message = JSON.parse(err._body).msg || 'Error al buscar recurso';
        //     this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
        //     message);
        // });
      }, error => {
        const message = JSON.parse(error._body).msg || 'Error al buscar recurso';
        this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
          message);
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false));
  }

  disableLoading() {
    this.loadingService.setLoading(false);
    this.loaded = true;
  }

}
