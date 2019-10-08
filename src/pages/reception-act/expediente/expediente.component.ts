import { Component, OnInit } from '@angular/core';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { ActivatedRoute, Params } from '@angular/router';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-expediente',
  templateUrl: './expediente.component.html',
  styleUrls: ['./expediente.component.scss']
})
export class ExpedienteComponent implements OnInit {
  public Request: iRequest;
  public Documents: Array<iDocument>;
  public FileRequest: iDocument;
  public FileRegistered: iDocument;
  public FileReleased: iDocument;
  public FileActa: iDocument;
  public FileCurp: iDocument;
  public FileCertificado: iDocument;
  public FileCedula: iDocument;
  public FileLicenciatura: iDocument;
  public FileServicio: iDocument;
  public FileIngles: iDocument;
  public FilePago: iDocument;
  public FileRevalidacion: iDocument;
  private _Request: uRequest;
  constructor(
    public requestProvider: RequestProvider,
    private notificationService: NotificationsServices,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public imgSrv: ImageToBase64Service
  ) {
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.requestProvider.getRequestById(params.id).subscribe(
          data => {
            this.Request = data.request[0];
            this.Request.student = data.request[0].studentId;            
            this._Request = new uRequest(this.Request, imgSrv);
            this.onLoad(this.Request.documents);
            (async () => {
              await this.delay(150);
            })();
          },
          error => {
            this.notificationService.showNotification(eNotificationType.ERROR,
              'Titulación App', error);
          }
        );
      }
    );
  }

  ngOnInit() {
  }

  onLoad(documents): void {
    this.Documents = [];
    documents.forEach(element => {
      this.Documents.push({ type: element.type, value: null, status: element.status });
    });
    this.FileRegistered = this.getDocument(eFILES.REGISTRO);
    this.FileRequest = this.getDocument(eFILES.SOLICITUD);
    this.FileReleased = this.getDocument(eFILES.RELEASED);
    this.FileActa = this.getDocument(eFILES.ACTA_NACIMIENTO);
    this.FileCurp = this.getDocument(eFILES.CURP);
    this.FileCedula = this.getDocument(eFILES.CEDULA);
    this.FileCertificado = this.getDocument(eFILES.CERTIFICADO_B);
    this.FileLicenciatura = this.getDocument(eFILES.CERTIFICADO_L);
    this.FileRevalidacion = this.getDocument(eFILES.CERTIFICADO_R);
    this.FileIngles = this.getDocument(eFILES.INGLES);
    this.FileServicio = this.getDocument(eFILES.SERVICIO);
    this.FilePago = this.getDocument(eFILES.PAGO);
  }

  onViewPdf(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    let exists: boolean = false;
    let pdf: any;
    switch (type) {
      case eFILES.SOLICITUD: {
        exists = typeof (this.FileRequest) !== 'undefined';
        if (exists)
          pdf = this._Request.protocolActRequest().output('bloburl');
        break;
      }
      case eFILES.REGISTRO: {
        exists = typeof (this.FileRegistered) !== 'undefined';
        if (exists)
          pdf = this._Request.projectRegistrationOffice().output('bloburl');
        break;
      }
    }
    
    if (exists) {
      this.dialog.open(ExtendViewerComponent, {
        data: {
          source: pdf,
          isBase64: true
        },
        disableClose: true,
        hasBackdrop: true,
        width: '60em',
        height: '600px'
      });
    }
  }

  onView(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    let exists = false;
    switch (type) {
      case eFILES.RELEASED: {
        exists = typeof (this.FileReleased) !== 'undefined';
        break;
      }
      case eFILES.ACTA_NACIMIENTO: {
        exists = typeof (this.FileActa) !== 'undefined';
        break;
      }
      case eFILES.CURP: {
        exists = typeof (this.FileCurp) !== 'undefined';
        break;
      }
      case eFILES.CERTIFICADO_B: {
        exists = typeof (this.FileCertificado) !== 'undefined';
        break;
      }
      case eFILES.CEDULA: {
        exists = typeof (this.FileCedula) !== 'undefined';
        break;
      }
      case eFILES.CERTIFICADO_L: {
        exists = typeof (this.FileLicenciatura) !== 'undefined';
        break;
      }
      case eFILES.SERVICIO: {
        exists = typeof (this.FileServicio) !== 'undefined';
        break;
      }
      case eFILES.INGLES: {
        exists = typeof (this.FileIngles) !== 'undefined';
        break;
      }
      case eFILES.PAGO: {
        exists = typeof (this.FilePago) !== 'undefined';
        break;
      }
      case eFILES.CERTIFICADO_R: {
        exists = typeof (this.FileRevalidacion) !== 'undefined';
        break;
      }
    }
    if (exists) {
      this.requestProvider.getResource(this.Request._id, type).subscribe(data => {
        this.dialog.open(ExtendViewerComponent, {
          data: {
            source: data,
            isBase64: true
          },
          disableClose: true,
          hasBackdrop: true,
          width: '60em',
          height: '600px'
        });
      }, error => {
        this.notificationService.showNotification(eNotificationType.ERROR,
          'Titulación App', error);
      });
    }
  }

  viewHistory(): void {
    const ref = this.dialog.open(ObservationsComponentComponent, {
      data: {
        phase: 'Solicitado',
        request: this.Request
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });
  }
  isUndefined(value): boolean {
    return typeof (value) === 'undefined';
  }
  whatStatus(value): eStatusRequest {
    if (typeof (value) === 'undefined') {
      return eStatusRequest.NONE;
    }
    return <eStatusRequest><keyof typeof eStatusRequest>value.status;
  }
  getDocument(fileType: eFILES): iDocument {
    return this.Documents.find(e => e.type === fileType);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// tslint:disable-next-line: class-name
interface iDocument {
  type: string;
  value: any;
  status: string;
}
