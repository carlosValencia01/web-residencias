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
import { RequestService } from 'src/services/reception-act/request.service';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';
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
  public FileInconvenience: iDocument;
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
  public FilePhotos: iDocument;
  private _Request: uRequest;
  public changeDocument: boolean;
  public role: string;
  public isTitled: string;
  public existJury: boolean;
  public existTitledDate: boolean;
  public titledDate: string;
  public titledHour: string;
  public registeredDate: string;
  public folderId: string;
  public showLoading: boolean;
  constructor(
    public requestProvider: RequestProvider,
    private _NotificationsServices: NotificationsServices,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public imgSrv: ImageToBase64Service,
    public _RequestService: RequestService,
    private _CookiesService: CookiesService,
    private _StudentProvider: StudentProvider
  ) {
    this.role = this._CookiesService.getData().user.rol.name;
    this.changeDocument = false;
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.requestProvider.getRequestById(params.id).subscribe(
          data => {
            this.Request = data.request[0];
            this.registeredDate = moment(new Date(this.Request.applicationDate)).format('LL')
            this.existTitledDate = typeof (this.Request.proposedDate) !== 'undefined';
            this.existJury = typeof (this.Request.jury) !== 'undefined' && this.Request.jury.length === 4;
            let tmpDate: Date;
            if (this.existTitledDate) {
              tmpDate = new Date(this.Request.proposedDate);
              tmpDate.setHours(0, 0, 0, 0);
              tmpDate.setHours(this.Request.proposedHour / 60, this.Request.proposedHour % 60, 0, 0);
            }
            this.titledDate = this.existTitledDate ? moment(tmpDate).format('LL') : 'SIN DEFINIR';
            this.titledHour = this.existTitledDate ? moment(tmpDate).format('LT') : 'SIN DEFINIR';
            this.isTitled = ((<eRequest><keyof typeof eRequest>this.Request.phase) === eRequest.TITLED && (<eStatusRequest><keyof typeof eStatusRequest>this.Request.status) === eStatusRequest.FINALIZED) ? 'Si' : 'No';

            this.Request.student = data.request[0].studentId;

            this._StudentProvider.getDriveFolderId(this.Request.student.controlNumber, eFOLDER.TITULACION).subscribe(
              (folder) => {
                this.folderId = folder.folderIdInDrive;
              },
              err => {
                console.log(err);
                this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulacion App", "Su folder ha desaparecido");
              }
            );

            this._Request = new uRequest(this.Request, imgSrv, this._CookiesService);
            this.onLoad(this.Request.documents);
            (async () => {
              await this.delay(150);
            })();
          },
          error => {
            this._NotificationsServices.showNotification(eNotificationType.ERROR,
              'Acto Recepcional', error);
          });
      });
  }

  ngOnInit() {
  }

  changed(): void {
    if (typeof (this.folderId) !== 'undefined' || this.folderId === '') {
      if (!this.changeDocument) {
        this.Request.folder = this.folderId;
        this._RequestService.AddRequest(this.Request, <eRequest><keyof typeof eRequest>this.Request.phase, true);
      }
      this.changeDocument = !this.changeDocument;
    } else {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, "Acto Recepcional", "Folder del estudiante no encontrado");
    }

    // if (this.changeDocument) {
    //   this._RequestService.AddRequest(this.Request, <eRequest><keyof typeof eRequest>this.Request.phase);
    // }
  }
  onLoad(documents): void {
    this.Documents = [];
    documents.forEach(element => {
      this.Documents.push({ type: element.type, value: null, status: element.status });
    });
    this.FileRegistered = this.getDocument(eFILES.REGISTRO);
    this.FileRequest = this.getDocument(eFILES.SOLICITUD);
    this.FileReleased = this.getDocument(eFILES.RELEASED);
    this.FileInconvenience = this.getDocument(eFILES.INCONVENIENCE);
    this.FileActa = this.getDocument(eFILES.ACTA_NACIMIENTO);
    this.FileCurp = this.getDocument(eFILES.CURP);
    this.FileCedula = this.getDocument(eFILES.CEDULA);
    this.FileCertificado = this.getDocument(eFILES.CERTIFICADO_B);
    this.FileLicenciatura = this.getDocument(eFILES.CERTIFICADO_L);
    this.FileRevalidacion = this.getDocument(eFILES.CERTIFICADO_R);
    this.FileIngles = this.getDocument(eFILES.INGLES);
    this.FileServicio = this.getDocument(eFILES.SERVICIO);
    this.FilePago = this.getDocument(eFILES.PAGO);
    this.FilePhotos = this.getDocument(eFILES.PHOTOS);
  }

  documentTitle(type: eFILES): string {
    let name: string;
    switch (type) {
      case eFILES.PROYECTO: {
        name = "PORTADA DE PROYECTO";
        break;
      }
      case eFILES.SOLICITUD: {
        name = "SOLICITUD DE PROYECTO";
        break;
      }
      case eFILES.REGISTRO: {
        name = "REGISTRO DE PROYECTO";
        break;
      }
      case eFILES.RELEASED: {
        name = "CONSTANCIA DE LIBERACION";
        break;
      }
      case eFILES.INCONVENIENCE: {
        name = "CONSTANCIA DE NO INCONVENIENCIA"
        break;
      }
      case eFILES.ACTA_NACIMIENTO: {
        name = "ACTA DE NACIMIENTO";
        break;
      }
      case eFILES.CURP: {
        name = "CURPO";
        break;
      }
      case eFILES.CERTIFICADO_B: {
        name = "CERTIFICADO DE BACHILLERATO";
        break;
      }
      case eFILES.CEDULA: {
        name = "CÉDULA TÉCNICA";
        break;
      }
      case eFILES.CERTIFICADO_L: {
        name = "CERTIFICADO PROFESIONAL";
        break;
      }
      case eFILES.SERVICIO: {
        name = "CONSTANCIA DE SERVICIO SOCIAL";
        break;
      }
      case eFILES.INGLES: {
        name = "CONSTANCIA DE SEGUNDA LENGUA";
        break;
      }
      case eFILES.PAGO: {
        name = "COMPROBANTE DE PAGO";
        break;
      }
      case eFILES.CERTIFICADO_R: {
        name = "CERTIFICADO DE REVALIDACIÓN";
        break;
      }
      case eFILES.PHOTOS: {
        name = "FOTOGRAFÍAS";
        break;
      }
      case eFILES.ACTA_EXAMEN: {
        name = "ACTA DE EXAMEN";
        break;
      }
      case eFILES.INE: {
        name = "CREDENCIAL DE ELECTOR";
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        name = "CÉDULA PROFESIONAL";
        break;
      }
      default: {
        name = "DESCONOCIDO";
      }
    }
    return name;
  }

  onView(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    let exists = false;
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, "Acto Recepcional", "Recuperando Archivo");
    this.showLoading = true;
    switch (type) {
      case eFILES.SOLICITUD: {
        exists = typeof (this.FileRequest) !== 'undefined';
        break;
      }
      case eFILES.REGISTRO: {
        exists = typeof (this.FileRegistered) !== 'undefined';
        break;
      }
      case eFILES.INCONVENIENCE: {
        exists = typeof (this.FileInconvenience) !== 'undefined';
        break;
      }
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
        this.showLoading = false;
        this.dialog.open(ExtendViewerComponent, {
          data: {
            source: data,
            isBase64: true,
            title: type
          },
          disableClose: true,
          hasBackdrop: true,
          width: '60em',
          height: '600px'
        });
      }, error => {
        this.showLoading = false;
        this._NotificationsServices.showNotification(eNotificationType.ERROR,
          'Acto Recepcional', 'Documento no encontrado');
      });
    }
    else {
      this.showLoading = false;
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
