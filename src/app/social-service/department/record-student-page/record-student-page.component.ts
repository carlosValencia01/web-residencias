import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingService} from '../../../services/app/loading.service';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {ExtendViewerComponent} from '../../../commons/extend-viewer/extend-viewer.component';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {MatDialog} from '@angular/material';
import {Location} from '@angular/common';
import {ImageToBase64Service} from '../../../services/app/img.to.base63.service';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';
import {CookiesService} from '../../../services/app/cookie.service';
import {InitRequest} from '../../../entities/social-service/initRequest';
import {SolicitudeModel} from '../../../entities/social-service/solicitude.model';
import {eSocialFiles} from '../../../enumerators/social-service/document.enum';
import {eSocialNameDocuments} from '../../../enumerators/social-service/socialServiceNameDocuments.enum';
import {DialogHistoryViewerComponent} from '../../components/dialog-history-viewer/dialog-history-viewer.component';

@Component({
  selector: 'app-record-student-page',
  templateUrl: './record-student-page.component.html',
  styleUrls: ['./record-student-page.component.scss']
})
export class RecordStudentPageComponent implements OnInit {
  private controlStudentId: string;
  public studentInformation: any;
  public solicitudeDoc: Array<any>;
  public presentationDoc: Array<any>;
  public acceptanceDoc: Array<any>;
  public commitmentDoc: Array<any>;
  public workPlanProjectDoc: Array<any>;
  public reports: Array<any>;
  public constancyDoc: Array<any>;
  public evaluationOfProgramDocs: Array<any>;
  public finalReportDoc: Array<any>;
  public evaluationOfFinalReportDoc: Array<any>;
  public selfEvaluationDocs: Array<any>;
  public verificationDocuments: object;
  public reportDocuments: Array<any>;
  public managerEvaluationDocuments: Array<any>;
  public selfEvaluationDocuments: Array<any>;
  public showInformation = false;
  public showDocuments = false;
  initRequest: InitRequest;
  formDocument: SolicitudeModel;
  private historyDocumentStatus: Array<any>;

  constructor(private activatedRoute: ActivatedRoute,
              private loadingService: LoadingService,
              private notificationsService: NotificationsServices,
              private dialog: MatDialog,
              public location: Location,
              public imgSrv: ImageToBase64Service,
              private inscriptionsProv: InscriptionsProvider,
              private cookiesService: CookiesService,
              private controlStudentProv: ControlStudentProv) {
    activatedRoute.queryParams.subscribe( param => {
      this.controlStudentId = param.id;
    });
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentById(this.controlStudentId)
      .subscribe( res => {
        this.studentInformation = res.controlStudent.studentId;
        this.verificationDocuments = res.controlStudent.verification;
        this.reportDocuments = res.controlStudent.verification.reports;
        this.managerEvaluationDocuments = res.controlStudent.verification.managerEvaluations;
        this.selfEvaluationDocuments = res.controlStudent.verification.selfEvaluations;
        const documents = res.controlStudent.documents;
        this.solicitudeDoc = documents.filter(d => d.filename.includes('ITT-POC-08-02'));
        this.presentationDoc = documents.filter(d => d.filename.includes('ITT-POC-08-03'));
        this.acceptanceDoc = documents.filter(d => d.filename.includes('ITT-POC-08-00'));
        this.workPlanProjectDoc = documents.filter(d => d.filename.includes('ITT-POC-08-04'));
        this.commitmentDoc = documents.filter(d => d.filename.includes('ITT-POC-08-05'));
        this.reports = documents.filter(d => d.filename.includes('ITT-POC-08-06'));
        this.constancyDoc = documents.filter(d => d.filename.includes('ITT-POC-08-08'));
        this.evaluationOfProgramDocs = documents.filter(d => d.filename.includes('ITT-POC-08-09'));
        this.finalReportDoc = documents.filter(d => d.filename.includes('ITT-POC-08-00-12'));
        this.evaluationOfFinalReportDoc = documents.filter(d => d.filename.includes('ITT-POC-08-10'));
        this.selfEvaluationDocs = documents.filter(d => d.filename.includes('ITT-POC-08-11'));
        this.formDocument = this._castToDoc(res.controlStudent);
        this._initializeDocument(res.controlStudent.studentId);
        this.historyDocumentStatus = res.controlStudent.historyDocumentStatus;
      }, error => {
        // console.log(error);
        this.loadingService.setLoading(false);
      }, () => {
        this.showInformation = true;
        this.showDocuments = true;
        this.loadingService.setLoading(false);
      });
  }

  _initializeDocument(student) {
    this.controlStudentProv.getActivePeriod().toPromise().then( res => {
      // Init para documentos para la información del estudiante y del periodo activo
      this.initRequest = new InitRequest( { student: student, periodId: res.period }, this.imgSrv, this.cookiesService);
    }).catch( err => {
      console.log(err);
    });
  }

  downloadControlCard() {
    this.initRequest.setSolicitudeRequest(this.formDocument);
    this.initRequest.setDocumentStatus(this.verificationDocuments);
    const binary = this.initRequest.documentSend(eSocialFiles.TARJETACONTROL);
    const linkSource = 'data:pdf/application;base64,' + binary;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = eSocialNameDocuments.TARJETACONTROL;
    downloadLink.click();
    this.notificationsService.showNotification(eNotificationType.SUCCESS, 'Se ha descargado el documento correctamente', '');
  }

  whatStatus(document: string): string {
    return this.verificationDocuments[document];
  }

  viewHistory(file: string, idx = 0) {
    let history;

    switch (file) {
      case 'solicitude':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-02'));
        break;
      case 'presentation':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-03'));
        break;
      case 'acceptance':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-00'));
        break;
      case 'workPlanProject':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-04'));
        break;
      case 'commitment':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-05'));
        break;
      case 'reports':
        const rep = this.historyDocumentStatus.filter(f => f.name.includes('ITT-POC-08-06'));
        history = rep[idx];
        break;
      case 'constancy':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-08'));
        break;
      case 'dependencyManagerEvaluation':
        const rep2 = this.historyDocumentStatus.filter(f => f.name.includes('ITT-POC-08-09'));
        history = rep2[idx];
        break;
      case 'lastReportEvaluation':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-10'));
        break;
      case 'lastReport':
        history = this.historyDocumentStatus.find(f => f.name.includes('ITT-POC-08-12'));
        break;
      case 'selfEvaluation':
        const rep3 = this.historyDocumentStatus.filter(f => f.name.includes('ITT-POC-08-11'));
        history = rep3[idx];
        break;
    }

    if (history) {
      this.dialog.open(DialogHistoryViewerComponent, {
        data: history,
        disableClose: true,
        hasBackdrop: true
      });
    } else {
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Servicio Social', 'Sin historial');
    }
  }

  onView(file, idx = 0): void {
    let document;
    this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Servicio social', 'Recuperando archivo');
    this.loadingService.setLoading(true);

    switch (file) {
      case 'solicitude':
        document = this.solicitudeDoc;
        break;
      case 'presentation':
        document = this.presentationDoc;
        break;
      case 'acceptance':
        document = this.acceptanceDoc;
        break;
      case 'workPlanProject':
        document = this.workPlanProjectDoc;
        break;
      case 'commitment':
        document = this.commitmentDoc;
        break;
      case 'reports':
        document = this.reports;
        break;
      case 'constancy':
        document = this.constancyDoc;
        break;
      case 'dependencyManagerEvaluation':
        document = this.evaluationOfProgramDocs;
        break;
      case 'lastReportEvaluation':
        document = this.evaluationOfFinalReportDoc;
        break;
      case 'lastReport':
        document = this.finalReportDoc;
        break;
      case 'selfEvaluation':
        document = this.selfEvaluationDocs;
        break;
    }

    this.controlStudentProv.getResource(document[idx].fileIdInDrive, document[idx].filename).subscribe(data => {
      this.loadingService.setLoading(false);
      this.dialog.open(ExtendViewerComponent, {
        data: {
          source: data,
          isBase64: true,
          title: document[idx].filename
        },
        disableClose: true,
        hasBackdrop: true,
        width: '60em',
      });
    }, _ => {
      this.loadingService.setLoading(false);
      this.notificationsService
        .showNotification(eNotificationType.ERROR, 'Servicio Social', 'Documento no encontrado');
    });
  }

  downloadFile(file, idx = 0) {
    let documents;
    this.notificationsService.showNotification(eNotificationType.INFORMATION, 'Servicio social', 'Recuperando archivo');
    this.loadingService.setLoading(true);

    switch (file) {
      case 'solicitude':
        documents = this.solicitudeDoc;
        break;
      case 'presentation':
        documents = this.presentationDoc;
        break;
      case 'acceptance':
        documents = this.acceptanceDoc;
        break;
      case 'workPlanProject':
        documents = this.workPlanProjectDoc;
        break;
      case 'commitment':
        documents = this.commitmentDoc;
        break;
      case 'reports':
        documents = this.reports;
        break;
      case 'constancy':
        documents = this.constancyDoc;
        break;
      case 'dependencyManagerEvaluation':
        documents = this.evaluationOfProgramDocs;
        break;
      case 'lastReportEvaluation':
        documents = this.evaluationOfFinalReportDoc;
        break;
      case 'lastReport':
        documents = this.finalReportDoc;
        break;
      case 'selfEvaluation':
        documents = this.selfEvaluationDocs;
        break;
    }
    const fileName = documents[idx].filename;

    this.controlStudentProv.getFile(documents[idx].fileIdInDrive, fileName).subscribe(async (res) => {
      const linkSource = 'data:' + res.contentType + ';base64,' + this.bufferToBase64(res.file.data);
      const downloadLink = document.createElement('a');
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

  public bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
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
    };
  }

}
