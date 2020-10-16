import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {IStudent} from '../../../entities/shared/student.model';
import {MatDialog} from '@angular/material';
import {ExtendViewerComponent} from '../../../commons/extend-viewer/extend-viewer.component';

@Component({
  selector: 'app-review-solicitude-documents-page',
  templateUrl: './review-solicitude-documents-page.component.html',
  styleUrls: ['./review-solicitude-documents-page.component.scss']
})
export class ReviewSolicitudeDocumentsPageComponent implements OnInit {
  private controlStudentId: string;
  public acceptanceDoc: boolean;
  public presentationDoc: boolean;
  public workPlanDoc: boolean;
  public commitmentDoc: boolean;
  public student: IStudent;
  public pdf: any;
  private documents: any;
  public loaded = false;

  constructor(private activatedRoute: ActivatedRoute,
              private controlStudentProv: ControlStudentProv,
              private notificationsService: NotificationsServices,
              private loadingService: LoadingService,
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
      this.acceptanceDoc = res.controlStudent.verification.acceptance;
      this.presentationDoc = res.controlStudent.verification.presentation;
      this.workPlanDoc = res.controlStudent.verification.workPlanProject;
      this.commitmentDoc = res.controlStudent.verification.commitment;
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


  openDialog(data): void {
    const dialogRef = this.dialog.open(ExtendViewerComponent, {
      width: '250px',
      data: {source: data, isBase64: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  disableLoading() {
    this.loadingService.setLoading(false);
    this.loaded = true;
  }
}
