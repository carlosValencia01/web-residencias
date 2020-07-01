import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExtendViewerComponent } from 'src/app/commons/extend-viewer/extend-viewer.component';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { RequestService } from 'src/app/services/reception-act/request.service';
import { StepperDocumentComponent } from 'src/app/titulation/stepper-document/stepper-document.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-file-titled',
  templateUrl: './upload-file-titled.component.html',
  styleUrls: ['./upload-file-titled.component.scss']
})
export class UploadFileTitledComponent implements OnInit {
  public Request: iRequest;
  public Documents: Array<IDocument>;
  public UploadINE: IDocument;
  public UploadCedula: IDocument;
  public UploadXML: IDocument;

  constructor(
    private _RequestService: RequestService,
    public _RequestProvider: RequestProvider,
    public dialog: MatDialog,
    public _NotificationsServices: NotificationsServices,
    private _CookiesService: CookiesService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.UploadINE = { type: eFILES.INE, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadCedula = { type: eFILES.CED_PROFESIONAL, status: eStatusRequest.NONE, file: null, isBase64: false };
    this.UploadXML = { type: eFILES.XML, status: eStatusRequest.NONE, file: null, isBase64: false };
    this._RequestService.requestUpdate.subscribe(
      (result) => {
        this.Request = result.Request;
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

      const isINE = this.getDocument(eFILES.INE);
      this.UploadINE = typeof (isINE) === 'undefined' ? this.UploadINE : isINE;

      const isCedula = this.getDocument(eFILES.CED_PROFESIONAL);
      this.UploadCedula = typeof (isCedula) === 'undefined' ? this.UploadCedula : isCedula;

      const isXML = this.getDocument(eFILES.XML);
      this.UploadXML = typeof (isXML) === 'undefined' ? this.UploadXML : isXML;
    }
  }

  getDocument(fileType: eFILES): IDocument {
    return this.Documents.find(e => e.type === fileType);
  }

  onUploadNew(file): void {
    const dialogRef = this.dialog.open(StepperDocumentComponent, {
      data: {
        Documento: file,
        mimeType: file === eFILES.XML ? 'text/xml' : false
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });

    dialogRef.afterClosed().subscribe((fileUpload: any) => {
      if (typeof (fileUpload) !== 'undefined') {
        const type = <eFILES><keyof typeof eFILES>file;
        const archivo = this.getDocument(type);
        if (typeof (archivo) === 'undefined') {
          this.Documents.push({
            type: type,
            dateRegistered: new Date(),
            path: '',
            status: eStatusRequest.NONE,
            file: fileUpload.file,
            isBase64: false
          });
        } else {
          archivo.file = fileUpload.file;
          archivo.isBase64 = false;
        }
        switch (type) {
          case eFILES.INE: {
            this.UploadINE.file = fileUpload.file;
            this.UploadINE.isBase64 = false;
            break;
          }
          case eFILES.XML: {
            this.UploadXML.file = fileUpload.file;
            this.UploadXML.isBase64 = false;
            break;
          }
          case eFILES.CED_PROFESIONAL: {
            this.UploadCedula.file = fileUpload.file;
            this.UploadCedula.isBase64 = false;
            break;
          }
        }
      }
    });
  }

  async onView(file) {
    const type = <eFILES><keyof typeof eFILES>file;
    let pdf: any;
    let isBase64: boolean;
    switch (type) {
      case eFILES.INE: {
        pdf = this.UploadINE.file;
        isBase64 = this.UploadINE.isBase64;
        break;
      }
      case eFILES.XML: {        
        
        pdf = this.UploadXML.file;
        isBase64 = this.UploadXML.isBase64;
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        pdf = this.UploadCedula.file;
        isBase64 = this.UploadCedula.isBase64;
        break;
      }
    }

    if (!isBase64) {
      if (pdf !== null) {
        this.openView(pdf, isBase64, type);
      }
    } else {
      this.loadingService.setLoading(true);
      this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Recuperando archivo');
      await this.delay(5000);
      this._RequestProvider.getResource(this.Request._id, type).subscribe(data => {
        this.loadingService.setLoading(false);
        this.openView(data, isBase64, type);

      }, _ => {
        this.loadingService.setLoading(false);
        this._NotificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Archivo no recuperado');
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
    });
  }

  onRemove(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    const archivo = this.getDocument(type);
    archivo.file = null;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        this.UploadINE.file = null;
        break;
      }
      case eFILES.XML: {
        this.UploadXML.file = null;
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        this.UploadCedula.file = null;
        break;
      }
    }
  }

  onSend(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    let document: any;
    const frmData = new FormData();
    frmData.append('Document', type);
    frmData.append('folderId', this._CookiesService.getFolder());
    frmData.append('IsEdit', 'false');
    switch (type) {
      case eFILES.INE: {
        frmData.append('file', this.UploadINE.file);
        document = this.UploadINE;
        break;
      }
      case eFILES.XML: {
        frmData.append('file', this.UploadXML.file);
        document = this.UploadXML;
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        frmData.append('file', this.UploadCedula.file);
        document = this.UploadCedula;
        break;
      }
    }
    frmData.append('phase', this.Request.phase);
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Cargando archivo');
    this.loadingService.setLoading(true);
    this._RequestProvider.uploadFile(this.Request._id, frmData).subscribe(data => {
      const doc = this.getDocument(type);
      doc.status = eStatusRequest.PROCESS;
      document.status = eStatusRequest.PROCESS; // eStatusRequest.PROCESS;
      this.loadingService.setLoading(false);
    }, _ => {
      this.loadingService.setLoading(false);
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
    });
  }

  onMessage(file): void {
    const type = <eFILES><keyof typeof eFILES>file;
    let message = '';
    switch (type) {
      case eFILES.INE: {
        message = this.UploadINE.observation;
        break;
      }
      case eFILES.XML: {
        message = this.UploadXML.observation;
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        message = this.UploadCedula.observation;
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

  onUpload(event, type) {

  }

  documentTitle(type: eFILES): string {
    let name: string;
    switch (type) {
      case eFILES.INE: {
        name = 'INE';
        break;
      }
      case eFILES.XML: {
        name = 'XML DE CÉDULA';
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

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
