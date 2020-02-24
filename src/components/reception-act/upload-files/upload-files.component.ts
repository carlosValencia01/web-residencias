import { Component, OnInit } from '@angular/core';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { RequestService } from 'src/services/reception-act/request.service';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';
import { StepperDocumentComponent } from 'src/modals/reception-act/stepper-document/stepper-document.component';
import { CookiesService } from 'src/services/app/cookie.service';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {
  public Request: iRequest;
  public Documents: Array<IDocument>;
  public UploadActa: IDocument;
  public UploadCurp: IDocument;
  public UploadCertificado: IDocument;
  public UploadCedula: IDocument;
  public UploadLicenciatura: IDocument;
  public UploadServicio: IDocument;
  public UploadIngles: IDocument;
  public UploadPago: IDocument;
  public UploadRevalidacion: IDocument;
  public UploadPhotos: IDocument;
  public UploadActaExamen: IDocument;
  public isEditable: boolean;
  public showLoading = false;

  constructor(
    private requestService: RequestService,
    public dialog: MatDialog,
    public requestProvider: RequestProvider,
    private _CookiesService: CookiesService,
    public notificationServices: NotificationsServices,
  ) { }

  ngOnInit() {
    this.UploadActa = { type: eFILES.ACTA_NACIMIENTO, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadCurp = { type: eFILES.CURP, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadCertificado = { type: eFILES.CERTIFICADO_B, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadCedula = { type: eFILES.CEDULA, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadLicenciatura = { type: eFILES.CERTIFICADO_L, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadServicio = { type: eFILES.SERVICIO, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadIngles = { type: eFILES.INGLES, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadPago = { type: eFILES.PAGO, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadRevalidacion = { type: eFILES.CERTIFICADO_R, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadPhotos = { type: eFILES.PHOTOS, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadActaExamen = { type: eFILES.ACTA_EXAMEN, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.requestService.requestUpdate.subscribe(
      (result) => {
        this.Request = result.Request;
        this.isEditable = result.IsEdit;
        this.onLoad(this.Request.documents);
      }
    );
  }

  onLoad(documents) {
    this.Documents = [];
    if (typeof (documents) !== 'undefined') {
      documents.forEach(element => {
        this.Documents.push({
          type: element.type,
          dateRegistered: element.dateRegistered,
          path: element.nameFile,
          status: element.status,
          isBase64: true,
          observation: element.observation
        });
      });

      const isActa = this.getDocument(eFILES.ACTA_NACIMIENTO);
      this.UploadActa = typeof (isActa) === 'undefined' ? this.UploadActa : isActa;

      const isCurp = this.getDocument(eFILES.CURP);
      this.UploadCurp = typeof (isCurp) === 'undefined' ? this.UploadCurp : isCurp;

      const isCedula = this.getDocument(eFILES.CEDULA);
      this.UploadCedula = typeof (isCedula) === 'undefined' ? this.UploadCedula : isCedula;

      const isCertBach = this.getDocument(eFILES.CERTIFICADO_B);
      this.UploadCertificado = typeof (isCertBach) === 'undefined' ? this.UploadCertificado : isCertBach;

      const isLicenciatura = this.getDocument(eFILES.CERTIFICADO_L);
      this.UploadLicenciatura = typeof (isLicenciatura) === 'undefined' ? this.UploadLicenciatura : isLicenciatura;

      const isRevalidacion = this.getDocument(eFILES.CERTIFICADO_R);
      this.UploadRevalidacion = typeof (isRevalidacion) === 'undefined' ? this.UploadRevalidacion : isRevalidacion;

      const isIngles = this.getDocument(eFILES.INGLES);
      this.UploadIngles = typeof (isIngles) === 'undefined' ? this.UploadIngles : isIngles;

      const isServicio = this.getDocument(eFILES.SERVICIO);
      this.UploadServicio = typeof (isServicio) === 'undefined' ? this.UploadServicio : isServicio;

      const isPago = this.getDocument(eFILES.PAGO);
      this.UploadPago = typeof (isPago) === 'undefined' ? this.UploadPago : isPago;

      const isPhotos = this.getDocument(eFILES.PHOTOS);
      this.UploadPhotos = typeof (isPhotos) === 'undefined' ? this.UploadPhotos : isPhotos;

      const isActaExamen = this.getDocument(eFILES.ACTA_EXAMEN);
      this.UploadActaExamen = typeof (isActaExamen) === 'undefined' ? this.UploadActaExamen : isActaExamen;
    }
  }

  getDocument(fileType: eFILES): IDocument {
    return this.Documents.find(e => e.type === fileType);
  }

  onView(file) {
    this.showLoading = true;
    const type = <eFILES><keyof typeof eFILES>file;
    let pdf: any;
    let isBase64: boolean;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        pdf = this.UploadActa.file;
        isBase64 = this.UploadActa.isBase64;
        break;
      }
      case eFILES.CURP: {
        pdf = this.UploadCurp.file;
        isBase64 = this.UploadCurp.isBase64;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        pdf = this.UploadCertificado.file;
        isBase64 = this.UploadCertificado.isBase64;
        break;
      }
      case eFILES.CEDULA: {
        pdf = this.UploadCedula.file;
        isBase64 = this.UploadCedula.isBase64;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        pdf = this.UploadLicenciatura.file;
        isBase64 = this.UploadLicenciatura.isBase64;
        break;
      }
      case eFILES.SERVICIO: {
        pdf = this.UploadServicio.file;
        isBase64 = this.UploadServicio.isBase64;
        break;
      }
      case eFILES.INGLES: {
        pdf = this.UploadIngles.file;
        isBase64 = this.UploadIngles.isBase64;
        break;
      }
      case eFILES.PAGO: {
        pdf = this.UploadPago.file;
        isBase64 = this.UploadPago.isBase64;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        pdf = this.UploadRevalidacion.file;
        isBase64 = this.UploadRevalidacion.isBase64;
        break;
      }
      case eFILES.ACTA_EXAMEN: {
        pdf = this.UploadActaExamen.file;
        isBase64 = this.UploadActaExamen.isBase64;
        break;
      }
    }
    if (!isBase64) {
      if (pdf !== null) {
        this.showLoading = false;
        this.openView(pdf, isBase64, type);
      }
    } else {
      this.requestProvider.getResource(this.Request._id, type).subscribe(data => {
        this.showLoading = false;
        this.openView(data, isBase64, type);
      }, _ => {
        this.showLoading = false;
        this.notificationServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener archivo');
      });
    }

  }

  openView(source: any, isBase64: boolean, type: eFILES): void {
    this.dialog.open(ExtendViewerComponent, {
      data: {
        source: source,
        isBase64: isBase64,
        title: this.documentTitle(type)
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
      height: '600px'
    });
  }

  documentTitle(type: eFILES): string {
    let name: string;
    switch (type) {
      case eFILES.PROYECTO: {
        name = 'PORTADA DE PROYECTO';
        break;
      }
      case eFILES.SOLICITUD: {
        name = 'SOLICITUD DE PROYECTO';
        break;
      }
      case eFILES.REGISTRO: {
        name = 'REGISTRO DE PROYECTO';
        break;
      }
      case eFILES.RELEASED: {
        name = 'CONSTANCIA DE LIBERACION';
        break;
      }
      case eFILES.INCONVENIENCE: {
        name = 'CONSTANCIA DE NO INCONVENIENCIA';
        break;
      }
      case eFILES.ACTA_NACIMIENTO: {
        name = 'ACTA DE NACIMIENTO';
        break;
      }
      case eFILES.CURP: {
        name = 'CURP';
        break;
      }
      case eFILES.CERTIFICADO_B: {
        name = 'CERTIFICADO DE BACHILLERATO';
        break;
      }
      case eFILES.CEDULA: {
        name = 'CÉDULA TÉCNICA';
        break;
      }
      case eFILES.CERTIFICADO_L: {
        name = 'CERTIFICADO PROFESIONAL';
        break;
      }
      case eFILES.SERVICIO: {
        name = 'CONSTANCIA DE SERVICIO SOCIAL';
        break;
      }
      case eFILES.INGLES: {
        name = 'CONSTANCIA DE SEGUNDA LENGUA';
        break;
      }
      case eFILES.PAGO: {
        name = 'COMPROBANTE DE PAGO';
        break;
      }
      case eFILES.CERTIFICADO_R: {
        name = 'CERTIFICADO DE REVALIDACIÓN';
        break;
      }
      case eFILES.PHOTOS: {
        name = 'FOTOGRAFÍAS';
        break;
      }
      case eFILES.ACTA_EXAMEN: {
        name = 'ACTA DE EXAMEN';
        break;
      }
      case eFILES.INE: {
        name = 'CREDENCIAL DE ELECTOR';
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        name = 'CÉDULA PROFESIONAL';
        break;
      }
      default: {
        name = 'DESCONOCIDO';
      }
    }
    return name;
  }

  onMessage(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    let message = '';
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        message = this.UploadActa.observation;
        break;
      }
      case eFILES.CURP: {
        message = this.UploadCurp.observation;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        message = this.UploadCertificado.observation;
        break;
      }
      case eFILES.CEDULA: {
        message = this.UploadCedula.observation;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        message = this.UploadLicenciatura.observation;
        break;
      }
      case eFILES.SERVICIO: {
        message = this.UploadServicio.observation;
        break;
      }
      case eFILES.INGLES: {
        message = this.UploadIngles.observation;
        break;
      }
      case eFILES.PAGO: {
        message = this.UploadPago.observation;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        message = this.UploadRevalidacion.observation;
        break;
      }
      case eFILES.PHOTOS: {
        message = this.UploadPhotos.observation;
        break;
      }
    }
    Swal.fire({
      type: 'error',
      title: '¡Observaciones!',
      text: message,
      showCloseButton: true,
    });
  }

  onSend(file): void {
    this.showLoading = true;
    this.notificationServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Cargando archivo');
    const type = <eFILES><keyof typeof eFILES>file;
    let document: any;
    const frmData = new FormData();
    frmData.append('folderId', this.isEditable ? this.Request.folder : this._CookiesService.getFolder());
    frmData.append('Document', type);
    frmData.append('IsEdit', this.isEditable ? 'true' : 'false');
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        frmData.append('file', this.UploadActa.file);
        document = this.UploadActa;
        break;
      }
      case eFILES.CURP: {
        frmData.append('file', this.UploadCurp.file);
        document = this.UploadCurp;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        frmData.append('file', this.UploadCertificado.file);
        document = this.UploadCertificado;
        break;
      }
      case eFILES.CEDULA: {
        frmData.append('file', this.UploadCedula.file);
        document = this.UploadCedula;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        frmData.append('file', this.UploadLicenciatura.file);
        document = this.UploadLicenciatura;
        break;
      }
      case eFILES.SERVICIO: {
        frmData.append('file', this.UploadServicio.file);
        document = this.UploadServicio;
        break;
      }
      case eFILES.INGLES: {
        frmData.append('file', this.UploadIngles.file);
        document = this.UploadIngles;
        break;
      }
      case eFILES.PAGO: {
        frmData.append('file', this.UploadPago.file);
        document = this.UploadPago;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        frmData.append('file', this.UploadRevalidacion.file);
        document = this.UploadRevalidacion;
        break;
      }
      case eFILES.ACTA_EXAMEN: {
        frmData.append('file', this.UploadActaExamen.file);
        document = this.UploadActaExamen;
        break;
      }
    }
    frmData.append('phase', this.Request.phase);
    this.requestProvider.uploadFile(this.Request._id, frmData).subscribe(_ => {
      const doc = this.getDocument(type);
      doc.status = this.isEditable ? eStatusRequest.ACCEPT : eStatusRequest.PROCESS;
      document.status = this.isEditable ? eStatusRequest.ACCEPT : eStatusRequest.PROCESS; // eStatusRequest.PROCESS;
      this.showLoading = false;
      if (this.isEditable) {
        this.onRemove(file);
        this.notificationServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Documento cambiado');
      }
    }, _ => {
      this.showLoading = false;
      this.notificationServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
    });
  }

  onRemove(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    const archivo = this.getDocument(type);
    archivo.file = null;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        this.UploadActa.file = null;
        this.UploadActa.isBase64 = this.isEditable ? true : this.UploadActa.isBase64;
        break;
      }
      case eFILES.CURP: {
        this.UploadCurp.file = null;
        this.UploadCurp.isBase64 = this.isEditable ? true : this.UploadCurp.isBase64;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        this.UploadCertificado.file = null;
        this.UploadCertificado.isBase64 = this.isEditable ? true : this.UploadCertificado.isBase64;
        break;
      }
      case eFILES.CEDULA: {
        this.UploadCedula.file = null;
        this.UploadCedula.isBase64 = this.isEditable ? true : this.UploadCedula.isBase64;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        this.UploadLicenciatura.file = null;
        this.UploadLicenciatura.isBase64 = this.isEditable ? true : this.UploadLicenciatura.isBase64;
        break;
      }
      case eFILES.SERVICIO: {
        this.UploadServicio.file = null;
        this.UploadServicio.isBase64 = this.isEditable ? true : this.UploadServicio.isBase64;
        break;
      }
      case eFILES.INGLES: {
        this.UploadIngles.file = null;
        this.UploadIngles.isBase64 = this.isEditable ? true : this.UploadIngles.isBase64;
        break;
      }
      case eFILES.PAGO: {
        this.UploadPago.file = null;
        this.UploadPago.isBase64 = this.isEditable ? true : this.UploadPago.isBase64;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        this.UploadRevalidacion.file = null;
        this.UploadRevalidacion.isBase64 = this.isEditable ? true : this.UploadRevalidacion.isBase64;
        break;
      }
      case eFILES.ACTA_EXAMEN: {
        this.UploadActaExamen.file = null;
        this.UploadActaExamen.isBase64 = this.isEditable ? true : this.UploadActaExamen.isBase64;
        break;
      }
    }
  }

  onUploadNew(file): void {
    const dialogRef = this.dialog.open(StepperDocumentComponent, {
      data: {
        Documento: file
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em',
      height: '650px'
    });

    dialogRef.afterClosed().subscribe((fileUpload: any) => {
      if (typeof (fileUpload) !== 'undefined') {
        const type = <eFILES><keyof typeof eFILES>file;
        const archivo = this.getDocument(type);
        if (typeof (archivo) === 'undefined') {
          this.Documents.push({
            type: type, dateRegistered: new Date(), path: '',
            status: eStatusRequest.NONE, file: fileUpload.file, isBase64: false
          });
        } else {
          archivo.file = fileUpload.file;
          archivo.isBase64 = false;
        }

        switch (type) {
          case eFILES.ACTA_NACIMIENTO: {
            this.UploadActa.file = fileUpload.file;
            this.UploadActa.isBase64 = false;
            break;
          }
          case eFILES.CURP: {
            this.UploadCurp.file = fileUpload.file;
            this.UploadCurp.isBase64 = false;
            break;
          }
          case eFILES.CERTIFICADO_B: {
            this.UploadCertificado.file = fileUpload.file;
            this.UploadCertificado.isBase64 = false;
            break;
          }
          case eFILES.CEDULA: {
            this.UploadCedula.file = fileUpload.file;
            this.UploadCedula.isBase64 = false;
            break;
          }
          case eFILES.CERTIFICADO_L: {
            this.UploadLicenciatura.file = fileUpload.file;
            this.UploadLicenciatura.isBase64 = false;
            break;
          }
          case eFILES.SERVICIO: {
            this.UploadServicio.file = fileUpload.file;
            this.UploadServicio.isBase64 = false;
            break;
          }
          case eFILES.INGLES: {
            this.UploadIngles.file = fileUpload.file;
            this.UploadIngles.isBase64 = false;
            break;
          }
          case eFILES.PAGO: {
            this.UploadPago.file = fileUpload.file;
            this.UploadPago.isBase64 = false;
            break;
          }
          case eFILES.CERTIFICADO_R: {
            this.UploadRevalidacion.file = fileUpload.file;
            this.UploadRevalidacion.isBase64 = false;
            break;
          }
          case eFILES.ACTA_EXAMEN: {
            this.UploadActaExamen.file = fileUpload.file;
            this.UploadActaExamen.isBase64 = false;
            break;
          }
        }
      }
    });

  }
  onUpload(event, file): void {
    if (typeof (event.target.files) !== 'undefined' && event.target.files.length > 0) {
      const type = <eFILES><keyof typeof eFILES>file;
      const archivo = this.getDocument(type);
      if (typeof (archivo) === 'undefined') {
        this.Documents.push({
          type: type, dateRegistered: new Date(), path: '',
          status: eStatusRequest.NONE, file: event.target.files[0], isBase64: false
        });
      } else {
        archivo.file = event.target.files[0];
        archivo.isBase64 = false;
      }

      switch (type) {
        case eFILES.ACTA_NACIMIENTO: {
          this.UploadActa.file = event.target.files[0];
          this.UploadActa.isBase64 = false;
          break;
        }
        case eFILES.CURP: {
          this.UploadCurp.file = event.target.files[0];
          this.UploadCurp.isBase64 = false;
          break;
        }
        case eFILES.CERTIFICADO_B: {
          this.UploadCertificado.file = event.target.files[0];
          this.UploadCertificado.isBase64 = false;
          break;
        }
        case eFILES.CEDULA: {
          this.UploadCedula.file = event.target.files[0];
          this.UploadCedula.isBase64 = false;
          break;
        }
        case eFILES.CERTIFICADO_L: {
          this.UploadLicenciatura.file = event.target.files[0];
          this.UploadLicenciatura.isBase64 = false;
          break;
        }
        case eFILES.SERVICIO: {
          this.UploadServicio.file = event.target.files[0];
          this.UploadServicio.isBase64 = false;
          break;
        }
        case eFILES.INGLES: {
          this.UploadIngles.file = event.target.files[0];
          this.UploadIngles.isBase64 = false;
          break;
        }
        case eFILES.PAGO: {
          this.UploadPago.file = event.target.files[0];
          this.UploadPago.isBase64 = false;
          break;
        }
        case eFILES.CERTIFICADO_R: {
          this.UploadRevalidacion.file = event.target.files[0];
          this.UploadRevalidacion.isBase64 = false;
          break;
        }
      }
    }
  }

  onOmit(file) {
    const type = <eFILES><keyof typeof eFILES>file;
    const data = { 'Document': type, 'Status': eStatusRequest.OMIT };
    let document: any;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        document = this.UploadActa;
        break;
      }
      case eFILES.CURP: {
        document = this.UploadCurp;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        document = this.UploadCertificado;
        break;
      }
      case eFILES.CEDULA: {
        document = this.UploadCedula;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        document = this.UploadLicenciatura;
        break;
      }
      case eFILES.SERVICIO: {
        document = this.UploadServicio;
        break;
      }
      case eFILES.INGLES: {
        document = this.UploadIngles;
        break;
      }
      case eFILES.PAGO: {
        document = this.UploadPago;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        document = this.UploadRevalidacion;
        break;
      }
    }
    this.requestProvider.omitFile(this.Request._id, data).subscribe(_ => {
      document.status = eStatusRequest.OMIT;
    }, _ => {
      this.notificationServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al omitir archivo');
    });
  }

  onReverse(file) {
    const type = <eFILES><keyof typeof eFILES>file;
    const data = { 'Document': type, 'Status': eStatusRequest.NONE };
    let document: any;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        document = this.UploadActa;
        break;
      }
      case eFILES.CURP: {
        document = this.UploadCurp;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        document = this.UploadCertificado;
        break;
      }
      case eFILES.CEDULA: {
        document = this.UploadCedula;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        document = this.UploadLicenciatura;
        break;
      }
      case eFILES.SERVICIO: {
        document = this.UploadServicio;
        break;
      }
      case eFILES.INGLES: {
        document = this.UploadIngles;
        break;
      }
      case eFILES.PAGO: {
        document = this.UploadPago;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        document = this.UploadRevalidacion;
        break;
      }
    }
    this.requestProvider.omitFile(this.Request._id, data).subscribe(_ => {
      document.status = eStatusRequest.NONE;
    }, _ => {
      this.notificationServices
      .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al cancelar omisión del archivo');
    });
  }
}

interface IDocument {
  type?: eFILES;
  dateRegistered?: Date;
  path?: String;
  status?: eStatusRequest;
  file?: any;
  observation?: string;
  isBase64?: boolean;
}
