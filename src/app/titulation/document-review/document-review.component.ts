import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-document-review',
  templateUrl: './document-review.component.html',
  styleUrls: ['./document-review.component.scss']
})
export class DocumentReviewComponent implements OnInit {

  displayedColumns: string[];
  opened = true;
  pdf: any;
  existFile: boolean;
  dataSource: MatTableDataSource<IDocument>;
  @ViewChild(MatSort) sort: MatSort;
  isTitled: boolean;
  documents: Array<IDocument>;
  allDocuments = ['1_CURP', '2_ACTA_NACIMIENTO', '3_CERTIFICADO_BACHILLERATO', '4_CEDULA_TECNICA',
    '5_CERTIFICADO_LICENCIATURA', 'SERVICIO_SOCIAL', 'LIBERACION_INGLES', 'RECIBO', 'FOTOS', 'REVALIDACION'];
  allDocuments2 = ['INE', 'CEDULA_PROFESIONAL', 'XML'];
  request: iRequest;
  student;
  uRequest: uRequest;
  documentDisplayed;
  constructor(
    public dialogRef: MatDialogRef<DocumentReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string, isTitled: boolean, request: iRequest },
    public requestProvider: RequestProvider,
    private notificationService: NotificationsServices,
    public imgSrv: ImageToBase64Service,
    public _CookiesService: CookiesService,
    private loadingService: LoadingService,
  ) {
    this.isTitled = this.data.isTitled;
    this.init();
  }

  ngOnInit() {
    this.displayedColumns = ['Icon', 'Archivo', 'Fecha', 'Estatus', 'View', 'Action'];
  }

  init() {
    this.request = this.data.request;
    this.request.phase = 'Registrado';
    this.student = this.data.request.student;
    this.student['career'] = this.data.request.student.careerId.acronym;
    this.request.student = this.data.request.student;
    this.uRequest = new uRequest(this.request, this.imgSrv, this._CookiesService);
    this.refresh();
  }

  refresh(): void {
    this.documents = [];
    let findDoc = false;
    if (this.isTitled) {
      for (let i = 0; i < this.allDocuments2.length; i++) {
        this.request.documents.forEach(element => {
          if (element.type === eFILES.INE || element.type === eFILES.XML || element.type === eFILES.CED_PROFESIONAL) {
            if (this.allDocuments2[i] === element.type) {
              findDoc = true;
              this.documents.push({
                type: element.type, dateRegistered: element.dateRegister,
                status: this.getStatus(element.status), file: null, view: '', action: '', icon: ''
              });
            }

          }
        });
        if (!findDoc) {
          this.documents.push({
            type: this.allDocuments2[i], status: 'No Enviado', file: null, view: '', action: '', icon: ''
          });
        }
        findDoc = false;
      }

    } else {
      for (let i = 0; i < this.allDocuments.length; i++) {
        this.request.documents.forEach((element) => {
          if (element.type !== eFILES.PROYECTO && element.type !== eFILES.RELEASED
            && element.type !== eFILES.SOLICITUD && element.type !== eFILES.REGISTRO
            && element.type !== eFILES.INCONVENIENCE
          ) {
            if (this.allDocuments[i] === element.type) {
              findDoc = true;
              this.documents.push({
                type: element.type, dateRegistered: element.dateRegister,
                status: this.getStatus(element.status), file: null, view: '', action: '', icon: ''
              });
            }
          }
        });
        if (!findDoc) {
          this.documents.push({
            type: this.allDocuments[i], status: 'No Enviado', file: null, view: '', action: '', icon: ''
          });
        }
        findDoc = false;
      }
    }
    if (this.documentDisplayed) {
      this.documentDisplayed = this.getDocument(this.documentDisplayed.type);
      setTimeout(() => {
        const li = document.getElementById(this.documentDisplayed.type);
        li.classList.add('clicked');
      }, 100);
    }
  }

  getDocument(fileType: eFILES): IDocument {
    return this.documents.find(e => e.type === fileType);
  }

  view(file, status): void {
    if (status !== 'Omitido' && status !== 'No Enviado') {
      const type = <eFILES><keyof typeof eFILES>file;
      if (type === eFILES.PHOTOS) {
        this.existFile = false;
        return;
      }
      const li = document.getElementById(file);
      const lis = document.getElementsByClassName('clicked');
      for (let i = 0; i < lis.length; i++) {
        lis.item(i).classList.remove('clicked');
      }
      li.classList.add('clicked');
      this.existFile = true;
      const archivo = this.getDocument(type);
      this.documentDisplayed = archivo;
      this.loadingService.setLoading(true);
      if (archivo.status !== 'Omitido' && archivo.status !== 'No Enviado') {
        switch (type) {
          case eFILES.SOLICITUD: {
            this.pdf = this.uRequest.protocolActRequest().output('bloburl');
            this.disableLoading();
            break;
          }
          case eFILES.REGISTRO: {
            this.pdf = this.uRequest.projectRegistrationOffice().output('bloburl');
            this.disableLoading();
            break;
          }
          default: {
            this.requestProvider.getResource(this.request._id, type).subscribe(async (data: Blob) => {

              if (type !== 'XML') {
                this.pdf = data;
              } else {
                const text = await data['text']();
                this.viewXML(text);
              }
              this.disableLoading();
            }, error => {
              this.disableLoading();
              const message = JSON.parse(error._body).message || 'Error al buscar recurso';
              this.notificationService
                .showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
            });
          }
        }
      }
    }
  }

  getStatus(eStatus: string): string {
    let status = '';
    switch (eStatus) {
      case eStatusRequest.PROCESS: {
        status = 'Pendiente';
        break;
      }
      case eStatusRequest.ACCEPT: {
        status = 'Aceptado';
        break;
      }

      case eStatusRequest.OMIT: {
        status = 'Omitido';
        break;
      }
      case eStatusRequest.REJECT: {
        status = 'Rechazado';
        break;
      }
      default: {
        status = 'Desconocido';
      }
    }
    return status;
  }

  check(type: eFILES, status: string): void {
    const update = {
      Document: type,
      Status: status,
      Observation: '',
      Doer: this._CookiesService.getData().user.name.fullName
    };

    if (status === eStatusRequest.REJECT) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-outline-success mx-2',
          cancelButton: 'btn btn-outline-danger'
        },
        buttonsStyling: false
      });

      swalWithBootstrapButtons.fire({
        title: 'Motivo',
        input: 'textarea',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        showCloseButton: true,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'Motivo obligatorio';
          }
        }
      }).then((result) => {
        if (result.value) {
          update.Observation = result.value;
          this.requestProvider.updateFileStatus(
            this.request._id,
            update
          ).subscribe(data => {
            this.notificationService.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Documento rechazado');
            this.request = data.request;
            this.refresh();
          }, _ => {
            this.notificationService.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al rechazar documento');
          });
        }
      });
    } else {
      this.requestProvider.updateFileStatus(
        this.request._id,
        update
      ).subscribe(result => {
        this.notificationService.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Documento aceptado');
        this.request = result.request;
        this.refresh();
      }, _ => {
        this.notificationService.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al aceptar documento');
      });
    }
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  disableLoading() {
    this.loadingService.setLoading(false);
  }

  viewXML(xml: string) {

    let text = this.excludeSpacesInNamesXML(xml);
    let textArea = document.getElementById('dataXML');
    let newHTML = "";
    //change text color to display
    let keywords = ["<cedulaelectronica", "<cedula", "</cedulaelectronica>", "<profesionista", "/>", "<institucion", "<carrera", "<nodosep"];
    let wordCount = 0, fordward = false //begin after line <?XML;
    const hasXMLLabel = text.indexOf('?xml') > -1;
    text.split(" ").forEach((word: string) => {
      if (fordward || !hasXMLLabel) {
        if (wordCount >= 40) { // number of characters x line
          newHTML += '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
          wordCount = 0;
        }
        if (keywords.indexOf(word.trim().toLowerCase()) > -1)
          newHTML += "<span style='color: maroon;'>" + word.replace('<', '&lt;').replace('>', '&gt;') + "&nbsp;</span>";
        else {
          if (word.indexOf('"') > -1) {
            let asign = word.split(`"`);
            newHTML += `<span style='color: chocolate;'>${asign[0].replace(/@+/g, ' ')}</span><span style='color: blue;'>"${asign[1].replace(/@+/g, ' ')}"&nbsp;</span> ${
              asign[2] ? asign[2].indexOf('>') > -1 ?
                "<span style='color: maroon;'>" + asign[2].replace(/@+/g, ' ').replace('<', '&lt;').replace('>', '&gt;') + "</span>" :
                '' : ''
              }`;
          } else {
            newHTML += "<span>" + word.replace(/@+/g, ' ').replace('<', '&lt;').replace('>', '&gt;') + "&nbsp;</span>";
          }
        }
        if (word.indexOf('>') > -1) {// end of property
          newHTML += '<br>&nbsp;&nbsp;';
          wordCount = 0;
        }
        wordCount += word.length;
      }
      if (word.indexOf('?>') > -1) //end line <?XML;
      {
        fordward = true;
      }
    });
    textArea.innerHTML = newHTML;
  }

  excludeSpacesInNamesXML(text: string) {
    let formatedText = '', temporalText = '';
    let count = 0;
    text.replace(/\r?\n|\r/g, ' ').split('').forEach(
      (character) => {
        if (character == `"`) {// spaces into quotes
          count++;
        }
        if (count == 1) {// text into quotes
          temporalText += character.indexOf(' ') > -1 ? '@' : character;
        } else if (count == 0) {
          formatedText += character;
        } else if (count == 2) {
          formatedText += temporalText + `"`;
          count = 0;
          temporalText = '';
        }
      }
    );
    return formatedText;
  }
}

interface IDocument {
  type?: string;
  dateRegistered?: Date;
  status?: string;
  file?: any;
  view?: string;
  action?: string;
  icon?: string;
}
