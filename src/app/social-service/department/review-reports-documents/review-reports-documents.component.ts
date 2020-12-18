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
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';

interface Score {
  option: number;
  value: string;
}

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
  public formManagerEvaluation: FormGroup;
  public questionsGroups: FormArray;
  private managerEvaluationPosition: number;
  public scores: Score[] = [
    {option: 0, value: 'Insuficiente'},
    {option: 1, value: 'Suficiente'},
    {option: 2, value: 'Bueno'},
    {option: 3, value: 'Notable'},
    {option: 4, value: 'Excelente'},
  ];
  public questions: any[] = [
    { position: 'q1', text: '1-Cumple en tiempo y forma con las actividades encomendadas alcanzando los objetivos.' },
    { position: 'q2', text: '2-Trabaja en equipo y se adapta a nuevas situaciones.' },
    { position: 'q3', text: '3-Muestra liderazgo en las actividades encomendadas.' },
    { position: 'q4', text: '4-Organiza su tiempo y trabaja de manera proactiva.' },
    { position: 'q5', text: '5-Interpreta la realidad y se sensibiliza aportando soluciones a la problemática con la actividad complementaria.' },
    { position: 'q6', text: '6-Realiza sugerencias innovadoras para beneficio o mejora del programa en el que participa.' },
    { position: 'q7', text: '7-Tiene iniciativa para ayudar en las actividades encomendadas y muestra espíritu de servicio.' }
  ];
  public evaluation = false;


  constructor(private activatedRoute: ActivatedRoute,
              private controlStudentProv: ControlStudentProv,
              private notificationsService: NotificationsServices,
              private loadingService: LoadingService,
              public location: Location,
              private formBuilder: FormBuilder,
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
    }, () => {
        this.disableLoading();
        this._initManagerEvaluationRequest();
      });
  }

  _initManagerEvaluationRequest() {
    this.questionsGroups = this.formBuilder.array(this.questions.map(quest => this.formBuilder.group({
      [quest.position]: ['', Validators.required]
    })));

    this.formManagerEvaluation = this.formBuilder.group({
      questions: this.questionsGroups
    });
  }

  _setManagerEvaluationRequestValues(documentCode) {
    const evaluation = this.managerEvaluations.find(d => d.name === documentCode);
    this.managerEvaluationPosition = evaluation.position;
    const score = Object.keys(evaluation.scores).map((key) => ({[key]: evaluation.scores[key]}));
    this.getQuestions.setValue(score);
  }

  get getQuestions(): FormArray {
    return this.formManagerEvaluation.get('questions') as FormArray;
  }

  viewDocument(documentCode, _eval: boolean) {
    this.loadingService.setLoading(true);
    this.evaluation = _eval;
    if (_eval) {
      this._setManagerEvaluationRequestValues(documentCode);
    }
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

  updateManagerScores() {
    Swal.fire({
      title: '¿Esta seguro(a) de actualizar la evaluación del responsable del programa del estudiante?',
      type: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((res) => {
      if (res.value) {
        this.loadingService.setLoading(true);
        let form = {};
        this.formManagerEvaluation.value.questions.forEach(quest => {
          form = Object.assign(form, quest);
        });
        // form  =>  {q1: '1', q2: '2', ....}
        const result = Object.assign(form, {position: this.managerEvaluationPosition});
        this.controlStudentProv.updateManagerEvaluationScore(this.controlStudentId,
          result )
          .subscribe(() => {
            this.notificationsService.showNotification(eNotificationType.SUCCESS,
              'Se ha actualizado la evaluación del documento', '');
          }, () => {
            this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
              'No se ha podido guardar la información, favor de intentarlo mas tarde');
            this.loadingService.setLoading(false);
          }, () => this.loadingService.setLoading(false));
      }
    });
  }


  sendVerificationInformation(report, information, status, nameDocument) {
    this.loadingService.setLoading(true);
    this.controlStudentProv.updateDocumentEvaluationFromDepartmentEvaluation(this.controlStudentId,
      {documentId: report._id, eStatus: status, documentDepartment: information, nameDocument: nameDocument})
      .subscribe( res => {
        this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Exito',
          res.msg);
        this.pdf = '';
        this.evaluation = false;
        this.ngOnInit();
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
