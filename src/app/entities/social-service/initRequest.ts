import * as jsPDF from 'jspdf';
import * as moment from 'moment';

import 'jspdf-autotable';
import {ImageToBase64Service} from '../../services/app/img.to.base63.service';
import {CookiesService} from '../../services/app/cookie.service';
import {eSocialFiles} from '../../enumerators/social-service/document.enum';
import {InitRequestModel} from './initRequest.model';
import {SolicitudeModel} from './solicitude.model';

moment.locale('es');

export class InitRequest {
  private ENCABEZADO = '"2020, Año de Leona Vicario, Benemérita Madre de la Patria"';
  private WIDTH = 216;
  private HEIGHT = 279;
  private FONT = 'Montserrat';
  private MARGIN: {
    LEFT: number,
    RIGHT: number,
    TOP: number,
    BOTTOM: number
  } = {
    LEFT: 20,
    RIGHT: 20,
    TOP: 25,
    BOTTOM: 25
  };
  private sepLogo: any;
  private tecNacLogoTitle: any;
  private tecLogo: any;
  private serviceFirm: any;
  private directorFirm: any;
  private montserratNormal: any;
  private montserratBold: any;
  private category = {
    'a': '', 'b': '',
    'c': '', 'd': '',
    'e': '', 'f': '',
    'g': '',
  };
  private responsibleSign: any;
  private signStudentDate: Date;
  private documentStatus: any;

  constructor(
    public _request: InitRequestModel,
    public _getImage: ImageToBase64Service,
    public _CookiesService: CookiesService
  ) {
    this._getImageToPdf();
    console.log(this._request.periodId);
  }

  public setSolicitudeRequest(request: SolicitudeModel) {
    this._request = Object.assign(this._request, request);
  }

  public setSignResponsibles(userData, signStudent) {
    this.responsibleSign = userData;
    this.signStudentDate = signStudent;
  }

  public setDocumentStatus(documents) {
    this.documentStatus = documents;
  }

  private _getImageToPdf() {
    this._getImage.getBase64('assets/imgs/sep.png').then(logo => {
      this.sepLogo = logo;
    });

    this._getImage.getBase64('assets/imgs/ittepic-sm.png').then(logo => {
      this.tecLogo = logo;
    });

    this._getImage.getBase64('assets/imgs/tecnm.png').then(logo => {
      this.tecNacLogoTitle = logo;
    });

    this._getImage.getBase64('assets/fonts/Montserrat-Regular.ttf').then(base64 => {
      this.montserratNormal = base64.toString().split(',')[1];
    });

    this._getImage.getBase64('assets/fonts/Montserrat-Bold.ttf').then(base64 => {
      this.montserratBold = base64.toString().split(',')[1];
    });

    this._getImage.getBase64('assets/imgs/firms/director.png').then(firm => {
      this.directorFirm = firm;
    });

    this._getImage.getBase64('assets/imgs/firms/servicios.png').then(firm => {
      this.serviceFirm = firm;
    });
  }

  public documentSend(file: eSocialFiles) {
    let document;
    let binary;
    switch (file) {
      case eSocialFiles.SOLICITUD: {
        document = this.socialServiceSolicitude().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eSocialFiles.TARJETACONTROL: {
        document = this.socialServiceControlCard().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
    }
    return binary;
  }

  public bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  // ************** CARTA DE SOLICITUD PARA LA REALIZACION DEL SERVICIO SOCIAL
  public socialServiceSolicitude(): jsPDF {
    const doc = this.newDocumentTec(true, false);

    const sentHistory = new Date();
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(8);
    doc.text('Solicitud de Servicio Social ITT-POC-08-02', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('DEPARTAMENTO DE GESTIÓN TECNOLÓGICA Y VINCULACIÓN', (this.WIDTH / 2), 40, { align: 'center' });
    doc.text('SOLICITUD DE SERVICIO SOCIAL', (this.WIDTH / 2), 45, { align: 'center' });

    // Cuadro de Datos personales
    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Bold');
    doc.text('DATOS PERSONALES', this.MARGIN.LEFT, 55, { align: 'left' });
    doc.rect(this.MARGIN.LEFT, 58, this.WIDTH - (this.MARGIN.RIGHT * 2), 32);
    doc.setFont(this.FONT, 'Normal');
    doc.text(`Nombre completo: ${this._request.student.fullName}`, this.MARGIN.LEFT + 2, 62, { align: 'left' });
    doc.text(`Sexo: ${this._request.student.sex}`, this.MARGIN.LEFT + 2, 69, { align: 'left' });
    doc.text(`Teléfono: ${this._request.student.phone}`, this.MARGIN.LEFT + 18, 69, { align: 'left' });
    doc.text(`Domicilio: ${this._request.student.street} ${this._request.student.suburb}`, this.MARGIN.LEFT + 58, 69, { align: 'left' });
    doc.setFont(this.FONT, 'Bold');
    doc.text('ESCOLARIDAD', this.MARGIN.LEFT + 2, 77, { align: 'left' });
    doc.setFont(this.FONT, 'Normal');
    doc.text(`No. de Control: ${this._request.student.controlNumber}`, this.MARGIN.LEFT + 2, 82, { align: 'left' });
    doc.text(`Carrera: ${this._request.student.career}`, this.MARGIN.LEFT + 52, 82, { align: 'left' });
    doc.text(`Periodo: ${this._request.periodId.periodName}`, this.MARGIN.LEFT + 2, 87, { align: 'left' });
    doc.text(`Semestre: ${this._request.student.semester}`, this.MARGIN.LEFT + 62, 87, { align: 'left' });

    // Cuadro de Datos del programa
    doc.setFont(this.FONT, 'Bold');
    doc.text('DATOS DEL PROGRAMA', this.MARGIN.LEFT, 97, { align: 'left' });
    doc.rect(this.MARGIN.LEFT, 100, this.WIDTH - (this.MARGIN.RIGHT * 2), 108);
    doc.setFont(this.FONT, 'Normal');
    doc.text(`Dependencia Oficial: ${this._request.dependencyName}`, this.MARGIN.LEFT + 2, 105, { align: 'left' });
    doc.text(`Tel: ${this._request.dependencyPhone}`, this.MARGIN.LEFT + 125, 105, { align: 'left' });
    doc.text(`Titular de la dependencia: ${this._request.dependencyHeadline}`, this.MARGIN.LEFT + 2, 112, { align: 'left' });
    doc.text(`Puesto o cargo: ${this._request.dependencyHeadlinePosition}`, this.MARGIN.LEFT + 2, 119, { align: 'left' });
    doc.text(`Unidad órganica o Departamento: ${this._request.dependencyDepartment}`, this.MARGIN.LEFT + 2, 126, { align: 'left' });
    doc.text(`Nombre del encargado: ${this._request.dependencyDepartmentManager}`, this.MARGIN.LEFT + 2, 133, { align: 'left' });
    doc.text(`Correo electrónico: ${this._request.dependencyDepartmentManagerEmail}`, this.MARGIN.LEFT + 2, 140, { align: 'left' });
    doc.text(`Nombre del programa: ${this._request.dependencyProgramName}`, this.MARGIN.LEFT + 2, 147, { align: 'left' });
    doc.text(`Modalidad: ${this._request.dependencyProgramModality}`, this.MARGIN.LEFT + 2, 154, { align: 'left' });
    doc.text(`Fecha de inicio: ${moment(this._request.initialDate).format('LL')}`, this.MARGIN.LEFT + 42, 154, { align: 'left' });
    doc.text('Actividades:', this.MARGIN.LEFT + 2, 161, { align: 'left' });
    doc.setFontSize(9);
    // doc.text('Descripcion de las actividades', this.MARGIN.LEFT + 2, 169, { align: 'left' });
    this.justifyText(doc,
      this._request.dependencyActivities,
      {x: this.MARGIN.LEFT + 4, y: 165}, this.WIDTH - (this.MARGIN.LEFT * 2 + 10), 4, 8);
    const categoryDe = this._request.dependencyProgramType.option;
    this.category[categoryDe] = 'X';
    const community = categoryDe === 'd' ? this._request.dependencyProgramType.value.split(':')[1] : '';
    doc.text('(' + this.category['a'] + ') Educación para adultos', this.MARGIN.LEFT + 2, 190, { align: 'left' });
    doc.text('(' + this.category['b'] + ') Desarrollo de comunidad: urbano, suburbano, rural.', this.MARGIN.LEFT + 70, 190, { align: 'left' });
    doc.text('(' + this.category['c'] + ') Asesoría académica a niños  primaria, secundaria o bachillerato de zonas vulnerables de escuelas publicas', this.MARGIN.LEFT + 2, 195, { align: 'left' });
    doc.text('(' + this.category['d'] + ') Promoción social, cultural o deportiva en la comunidad, especificar comunidad: ' + community, this.MARGIN.LEFT + 2, 200, { align: 'left' });
    doc.text('(' + this.category['e'] + ') Dependencias de Gobierno', this.MARGIN.LEFT + 2, 205, { align: 'left' });
    doc.text('(' + this.category['f'] + ') I.T de Tepic', this.MARGIN.LEFT + 62, 205, { align: 'left' });
    doc.text('(' + this.category['g'] + ') Instituciones educativas publicas', this.MARGIN.LEFT + 92, 205, { align: 'left' });

    // Cuadro de Uso exclusivo de la oficina del servicio social
    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Bold');
    doc.text('PARA USO EXCLUSIVO DE LA OFICINA DE SERVICIO SOCIAL', this.MARGIN.LEFT, 215, { align: 'left' });
    doc.rect(this.MARGIN.LEFT, 218, this.WIDTH - (this.MARGIN.RIGHT * 2), 14);
    doc.setFont(this.FONT, 'Normal');
    doc.text('ACEPTADO: ', this.MARGIN.LEFT + 2, 222, { align: 'left' });
    doc.text('SI: (X):  NO: ( )', this.MARGIN.LEFT + 26, 222, { align: 'left' });
    doc.text('MOTIVO: ', this.MARGIN.LEFT + 50, 222, { align: 'left' });
    doc.text('OBSERVACIONES: ', this.MARGIN.LEFT + 2, 230, { align: 'left' });

    doc.setFontSize(9);
    doc.text('FIRMA DEL DEPARTAMENTO', (this.WIDTH / 2), 238, { align: 'center' });
    doc.text(`Esta solicitud fue firmada electrónicamente por ${this.responsibleSign.name.fullName} el ${moment().format('D [de] MMMM [de] YYYY [a las] h:mm a')}`,
      (this.WIDTH / 2), 242, { align: 'center' });

    // Firma del solicitante
    doc.setFontSize(9);
    doc.text('FIRMA DEL SOLICITANTE', (this.WIDTH / 2), 250, { align: 'center' });
    doc.text(`Esta solicitud fue firmada electrónicamente por ${this._request.student.fullName} el ${moment(this.signStudentDate).format('D [de] MMMM [de] YYYY [a las] h:mm a')}`,
      (this.WIDTH / 2), 255, { align: 'center' });
    doc.text('_______________________________________________________', (this.WIDTH / 2), 257, { align: 'center' });

    // Footer
    doc.setFont(this.FONT, 'Bold');
    doc.setTextColor(189, 189, 189);
    doc.setFontSize(8);
    doc.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
    doc.text('Código ITT-POC-08-02', (this.WIDTH / 2), 262, { align: 'center' });
    doc.text('Rev. 0', (this.WIDTH / 2), 267, { align: 'center' });
    doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 272, { align: 'center' });
    return doc;
  }

  // ************** TARJETA DE CONTROL PARA LA REALIZACION DEL SERVICIO SOCIAL
  public socialServiceControlCard(): jsPDF {
    const doc = this.newDocumentTec(true, false);

    const sentHistory = new Date();
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(8);
    doc.text('Tarjeta de Control de Servicio Social', (this.WIDTH / 2), 30, { align: 'center' });
    doc.text('Código: ITT-POC-08-07   Revision: 1', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('Referencia a la Norma ISO 9001:2015  8.2.3', (this.WIDTH / 2), 40, { align: 'center' });

    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(10);
    doc.text('DEPARTAMENTO DE GESTIÓN TECNOLÓGICA Y VINCULACIÓN', (this.WIDTH / 2), 50, { align: 'center' });
    doc.text('TARJETA DE CONTROL DE SERVICIO SOCIAL', (this.WIDTH / 2), 55, { align: 'center' });

    // Cuadro de Datos personales
    doc.rect(this.MARGIN.LEFT, 60, this.WIDTH - (this.MARGIN.RIGHT * 2), 22);
    doc.text(`NOMBRE: ${this._request.student.fullName}`, this.MARGIN.LEFT + 4, 68, { align: 'left' });
    doc.text(`EDAD: ${this._request.student.sex || ''}`, this.MARGIN.LEFT + 130, 68, { align: 'left' });
    doc.text(`SEXO: ${this._request.student.sex || ''}`, this.MARGIN.LEFT + 150, 68, { align: 'left' });
    doc.text(`DOMICLIO: ${this._request.student.street || ''} ${this._request.student.suburb}`, this.MARGIN.LEFT + 4, 73, { align: 'left' });
    doc.text(`TEL: ${this._request.student.phone || ''}`, this.MARGIN.LEFT + 130, 73, { align: 'left' });
    doc.text(`NO. DE CONTROL: ${this._request.student.controlNumber}`, this.MARGIN.LEFT + 4, 78, { align: 'left' });
    doc.text(`CREDITOS APROBADOS: 70%`, this.MARGIN.LEFT + 120, 78, { align: 'left' });

    // Cuadro de Datos del programa
    const periodMark = this._request.periodId.periodName === 'AGOSTO-DICIEMBRE' ? 144 : 86;
    doc.text('PERIODO', this.MARGIN.LEFT, 90, { align: 'left' });
    doc.text('ENERO-JUNIO', this.MARGIN.LEFT + 50, 90, { align: 'left' });
    doc.text('JULIO-DICIEMBRE', this.MARGIN.LEFT + 100, 90, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 80, 86, 10, 5); // ENERO-JUNIO
    doc.rect(this.MARGIN.LEFT + 140, 86, 10, 5); // JULIO-DICIEMBRE
    doc.text('X', this.MARGIN.LEFT + periodMark, 90, { align: 'left' }); // 86 -> ENERO, 144 -> JULIO


    doc.rect(this.MARGIN.LEFT, 95, this.WIDTH - (this.MARGIN.RIGHT * 2), 45); // tabla general
    // columns
    doc.rect(this.MARGIN.LEFT, 95, 30, 45); // Primer cuadro
    doc.rect(this.MARGIN.LEFT + 30, 95, 35, 45); // Segundo cuadro
    doc.rect(this.MARGIN.LEFT + 65, 95, 30, 45); // Tercer cuadro
    doc.rect(this.MARGIN.LEFT + 95, 95, 35, 45); // Cuarto cuadro
    doc.rect(this.MARGIN.LEFT + 130, 95, this.WIDTH - (this.MARGIN.RIGHT * 2) - 130, 45); // Quinto cuadro
    // rows
    doc.rect(this.MARGIN.LEFT, 95, this.WIDTH - (this.MARGIN.RIGHT * 2), 10);
    doc.rect(this.MARGIN.LEFT, 130, this.WIDTH - (this.MARGIN.RIGHT * 2), 10);
    // text
    doc.text('INICIO', this.MARGIN.LEFT + 10, 100, { align: 'left' });
    this.justifyText(doc,
      moment(this._request.initialDate).format('D [de] MMMM [de] YYYY'),
      {x: this.MARGIN.LEFT + 2, y: 110}, 27, 4, 8);
    doc.setFontSize(10);
    doc.text('TERMINACIÓN', this.MARGIN.LEFT + 32, 100, { align: 'left' });
    doc.text('PROGRAMA', this.MARGIN.LEFT + 67, 100, { align: 'left' });
    this.justifyText(doc,
      this._request.dependencyProgramName,
      {x: this.MARGIN.LEFT + 67, y: 110}, 27, 3, 8);
    doc.setFontSize(10);
    doc.text('DEPENDENCIA', this.MARGIN.LEFT + 98, 100, { align: 'left' });
    this.justifyText(doc,
      this._request.dependencyName,
      {x: this.MARGIN.LEFT + 98, y: 110}, 30, 3, 8);
    doc.setFontSize(10);
    doc.text('HORAS ACREDITADAS', this.MARGIN.LEFT + 132, 100, { align: 'left' });

    // CONTROL DE EXPEDIENTE
    doc.text('CONTROL DE EXPEDIENTE', (this.WIDTH / 2), 155, { align: 'center' });
    doc.rect(this.MARGIN.LEFT, 160, this.WIDTH - (this.MARGIN.RIGHT * 2), 60);
    doc.text('SOLICITUD', this.MARGIN.LEFT + 4, 170, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 45, 166, 10, 5);
    if (this.documentStatus.solicitude === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 49, 170, { align: 'left' });
    }
    doc.text('REPORTES BIMESTRALES', this.MARGIN.LEFT + 65, 170, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 115, 166, 10, 5);
    doc.rect(this.MARGIN.LEFT + 130, 166, 5, 5);
    doc.rect(this.MARGIN.LEFT + 138, 166, 5, 5);
    doc.rect(this.MARGIN.LEFT + 146, 166, 5, 5);
    if (this.documentStatus.reports.length > 3) {
      if (this.documentStatus.reports.length >= 4) {
        doc.rect(this.MARGIN.LEFT + 154, 166, 5, 5);
        if (this.documentStatus.reports[3].status === 'approved') {
          doc.text('X', this.MARGIN.LEFT + 155, 170, { align: 'left' });
        }
      }
      if (this.documentStatus.reports.length >= 5) {
        doc.rect(this.MARGIN.LEFT + 162, 166, 5, 5);
        if (this.documentStatus.reports[4].status === 'approved') {
          doc.text('X', this.MARGIN.LEFT + 163, 170, { align: 'left' });
        }
      }
      if (this.documentStatus.reports.length >= 6) {
        doc.rect(this.MARGIN.LEFT + 170, 166, 5, 5);
        if (this.documentStatus.reports[5].status === 'approved') {
          doc.text('X', this.MARGIN.LEFT + 171, 170, { align: 'left' });
        }
      }
    }
    if (this.documentStatus.reports.every(r => r.status === 'approved')) {
      doc.text('X', this.MARGIN.LEFT + 119, 170, { align: 'left' });
    }
    if (this.documentStatus.reports[0].status === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 131, 170, { align: 'left' });
    }
    if (this.documentStatus.reports[1].status === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 139, 170, { align: 'left' });
    }
    if (this.documentStatus.reports[2].status === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 147, 170, { align: 'left' });
    }

    doc.text('CURSO DE', this.MARGIN.LEFT + 4, 180, { align: 'left' });
    doc.text('INDUCCIÓN', this.MARGIN.LEFT + 4, 183, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 45, 177, 10, 5);
    if (this.documentStatus.assistance) {
      doc.text('X', this.MARGIN.LEFT + 49, 181, { align: 'left' });
    }
    doc.text('REPORTE FINAL', this.MARGIN.LEFT + 65, 180, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 115, 177, 10, 5);
    if (this.documentStatus.lastReportEvaluation === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 119, 181, { align: 'left' });
    }

    doc.text('CARTA DE', this.MARGIN.LEFT + 4, 193, { align: 'left' });
    doc.text('APROBACIÓN', this.MARGIN.LEFT + 4, 196, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 45, 190, 10, 5);
    if (this.documentStatus.acceptance === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 49, 194, { align: 'left' });
    }

    let dateRelease = '';
    doc.text('CARTA DE TERMINACIÓN', this.MARGIN.LEFT + 65, 193, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 115, 190, 10, 5);
    if (this.documentStatus.dependencyRelease === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 119, 194, { align: 'left' });
      dateRelease = moment(new Date()).format('L');
    }

    doc.text('FECHA', this.MARGIN.LEFT + 135, 194, { align: 'left' });
    doc.text(dateRelease, this.MARGIN.LEFT + 150, 194, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 150, 190, 20, 5);

    doc.text('PLAN DE TRABAJO', this.MARGIN.LEFT + 4, 206, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 45, 202, 10, 5);
    if (this.documentStatus.workPlanProject === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 49, 206, { align: 'left' });
    }

    let dateConstancy = '';
    doc.text('CONSTANCIA OFICIAL', this.MARGIN.LEFT + 65, 206, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 115, 202, 10, 5);
    if (this.documentStatus.lastReport === 'approved') {
      doc.text('X', this.MARGIN.LEFT + 119, 206, { align: 'left' });
      dateConstancy = moment(this.documentStatus.signs.constancy.signSubPrincipalDate).format('L');
    }
    doc.text('FECHA', this.MARGIN.LEFT + 135, 206, { align: 'left' });
    doc.text(dateConstancy, this.MARGIN.LEFT + 151, 206, { align: 'left' });
    doc.rect(this.MARGIN.LEFT + 150, 202, 20, 5);



    // Cuadro de Uso exclusivo de la oficina del servicio social
    doc.rect(this.MARGIN.LEFT, 230, this.WIDTH - (this.MARGIN.RIGHT * 2), 30);
    doc.setFont(this.FONT, 'Normal');
    doc.text('OBSERVACIONES: ', this.MARGIN.LEFT + 2, 233, { align: 'left' });

    // Footer
    doc.setFont(this.FONT, 'Bold');
    doc.setTextColor(189, 189, 189);
    doc.setFontSize(8);
    doc.text('Referencia a la Norma ISO 9001:2015  8.2.3', this.MARGIN.LEFT, 267, { align: 'left' });
    doc.text('Código ITT-POC-08-07', this.MARGIN.LEFT + 100, 267, { align: 'left' });
    doc.text('Rev. 1', this.WIDTH - 30, 267, { align: 'left' });
    return doc;
  }

  // A una cadena de texto, le añade @ a cada palabra tanto al inicio y al final
  // Esto es para indicar que se le agregará texto en negritas
  private addArroba(Text: string): string {
    const text = Text.trim();
    return text.split(' ').map(word => '@' + word + '@').join(' ');
  }

  private letterCapital(text: string): string {
    text = text.toLowerCase();
    if (text.trim().length > 0) {
      return text.split(/\s+/).map((value) => value.replace(/^./, value[0].toUpperCase())).join(' ');
    }
    return '';
  }

  // Alinea un texto a la derecha
  private addTextRight(doc: jsPDF, text: string, positionY: number) {
    // Obtengo el texto tal cual
    const tmpCount = doc.getTextWidth(text.split('@').join(''));
    let tmpPositionX = this.WIDTH - (this.MARGIN.RIGHT + tmpCount);
    const words: Array<string> = text.split(/\s+/);
    const space = (tmpCount - this.summation(doc, words)) / (words.length - 1);
    words.forEach(current => {
      let tmpWord = current;
      if (/^@[^\s]+@$/.test(current.replace(',', '').replace('.', ''))) {
        doc.setFont(this.FONT, 'Bold');
        tmpWord = tmpWord.split('@').join('');
      } else {
        doc.setFont(this.FONT, 'Normal');
      }
      doc.text(tmpWord, tmpPositionX, positionY);
      tmpPositionX += doc.getTextWidth(tmpWord) + space;
    });
    // doc.text(text, this.WIDTH - (this.MARGIN.RIGHT + tmpCount), positionY);
  }
  // Justifica un texto
  // Doc: Instancia JSPDF, Text: Texto a justificar, Point: Coordenada (X,Y) de dibujo
  // Size: Anchura en la que se dividirá, lineaBreak: Salto de linea
  private justifyText(Doc: jsPDF, Text: string, Point: { x: number, y: number }, Size: number, lineBreak: number = 5, fontSize: number, afterParagraph: boolean = false) {
    // Texto sin @ (Negritas) para conocer más adelante las filas en las que será dividido
    const tmpText: string = Text.split('@').join('');
    // Texto original
    const aText: Array<string> = Text.split(/\s+/);
    // Indice global que indicará la palabra a dibujar
    let iWord = 0;
    // Filas en las cuales se dividirá el texto
    Doc.setFontSize(fontSize);
    let rows: Array<string> = Doc.splitTextToSize(tmpText, Size);
    let lastRow = rows.length - 1;
    let lastX = 0, lastY = 0;
    let includedToParagraph = false;
    for (let i = 0, index = 0; i < rows.length; i++ , index++) {

      // Posicion X,Y para poner la palabra
      let tmpIncX = Point.x;
      let tmpIncY = Point.y + (index * lineBreak);

      if (afterParagraph && rows.length > 1 && i > 0 && !includedToParagraph) {
        tmpIncX = this.MARGIN.LEFT + 32;
        rows.shift();
        rows = Doc.splitTextToSize(rows.join(' '), 138);
        i = 0;
        lastRow = rows.length - 1;
        includedToParagraph = true;
      }
      let longitud = rows[i].trim().split(/\s+/).length;
      const summation: number = this.summation(Doc, aText.slice(iWord, iWord + longitud));
      let space: number = i === lastRow ? 1.5 : (Size - summation) / (longitud - 1);

      while (longitud > 0) {
        // Se obtiene la palabra del texto original a escribiri
        let tmpWord = aText[iWord];

        if (typeof (tmpWord) !== 'undefined') {
          // Verifico si la palabra es negrita
          if (/^@[^\s]+@$/.test(tmpWord.replace(',', '').replace('.', ''))) {
            Doc.setFont(this.FONT, 'Bold');
            // Limpio la palabra de @
            tmpWord = tmpWord.split('@').join('');
          } else {
            Doc.setFont(this.FONT, 'Normal');
          }

          // Impresión de la palabra
          Doc.text(tmpWord, tmpIncX, tmpIncY);
          // Nueva posición
          tmpIncX += Doc.getTextWidth(tmpWord) + space;
          lastX = tmpIncX;
          lastY = tmpIncY;

        }
        // Se prosigue con la otra palabra
        longitud--;
        // Se incrementa el indice global
        iWord++;
      }
    }
    return { lastX, lastY, lastRowWidth: Doc.getTextWidth(rows[lastRow]) };
  }
  // Retorna la longitud del texto a añadir
  private summation(Doc: jsPDF, Words: Array<string>): number {
    let lSummation = 0;
    Words.forEach((current) => {
      // La palabra es negrita (Esta entre @  (@Hola@))
      if (/^@[^\s]+@$/.test(current.replace(',', '').replace('.', ''))) {
        // Cambio el tipo de fuente a negrita para obtener el tamaño real de la palabra
        Doc.setFont(this.FONT, 'Bold');
        lSummation += Doc.getTextWidth(current.split('@').join(''));
      } else {
        // Cambio el tipo de fuente a normal para obtener el tamaño real
        Doc.setFont(this.FONT, 'Normal');
        lSummation += Doc.getTextWidth(current);
      }
    });
    return lSummation;
  }

  private _changePage(heightPage, startY, endY): boolean {
    return (startY >= heightPage || endY >= heightPage);
  }

  private _drawCenterTextWithLineUp(doc, text, y) {
    const textWidth = doc.getTextWidth(text);
    doc.rect((this.WIDTH / 2) - (textWidth / 2 + 10), y, textWidth + 20, 0.5, 'F');
    doc.text(text, (this.WIDTH / 2), y + 5, { align: 'center' });
  }

  private _drawUnderlineText(doc, text, y, textAlign) {
    const lineWidth = doc.getTextWidth(text);
    const align = textAlign.toLowerCase();
    const lineStart = this._selectStartLineByAlign(align, lineWidth);
    doc.text(text, align === 'center' ? lineStart + (lineWidth / 2) : lineStart, y,
      { align: align, maxWidth: (this.WIDTH - (this.MARGIN.LEFT + this.MARGIN.RIGHT)) });
  }

  private _selectStartLineByAlign(align, lineWidth): number {
    switch (align.toLowerCase()) {
      case 'left': return this.MARGIN.LEFT;
      case 'center': return (this.WIDTH / 2) - (lineWidth / 2);
      case 'right': return this.WIDTH - this.MARGIN.RIGHT;
      case 'justify': return this.MARGIN.LEFT;
    }
  }

  private newDocumentTec(header = true, footer = true): jsPDF {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'letter'
    });
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');
    if (header) {
      this.addHeaderTec(doc);
    }
    if (footer) {
      this.addFooterTec(doc);
    }
    return doc;
  }

  private addHeaderTec(document: jsPDF) {
    const tecnmHeight = 15;
    const sepHeight = tecnmHeight * 100 / 53;
    document.setFont(this.FONT, 'Bold');
    document.setFontSize(8);
    document.setTextColor(189, 189, 189);
    // Logo Izquierdo
    document.addImage(this.sepLogo, 'PNG', this.MARGIN.LEFT - 5, 1, 35 * 3, sepHeight);
    // Logo Derecho
    document.addImage(this.tecNacLogoTitle, 'PNG', 155, 5, 40, tecnmHeight);
    document.text('Instituto Tecnólogico de Tepic', 160, 23, { align: 'left' });
  }

  private addFooterTec(document: jsPDF) {
    document.setFont(this.FONT, 'Bold');
    document.setFontSize(8);
    document.setTextColor(189, 189, 189);
    document.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
    // document.setTextColor(183, 178, 178);
    document.text('Av. Tecnológico #2595 Fracc. Lagos del Country C.P. 63175', (this.WIDTH / 2), 260, { align: 'center' });
    document.text('Tepic, Nayarit Tel. 01 (311) 211 94 00 y 211 94 01. email: info@ittepic.edu.mx',
      (this.WIDTH / 2), 265, { align: 'center' });
    document.text('www.ittepic.edu.mx', (this.WIDTH / 2), 270, { align: 'center' });
  }

  // @ts-ignore
  private addTable(document: jsPDF,
                   data: Array<Object>,
                   startY: number,
                   startX: number = this.MARGIN.LEFT,
                   Size: number = 11,
                   isBold: boolean = false,
                   columnStyles = { 0: { cellWidth: 30 }, 1: { cellWidth: 100 }, 2: { cellWidth: 0 } }) {
    // @ts-ignore
    document.autoTable({
      theme: 'grid',
      startY: startY,
      margin: { left: startX },
      // @ts-ignore
      bodyStyles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], font: this.FONT, fontStyle: (isBold ? 'Bold' : 'Normal'), fontSize: Size },
      columnStyles: columnStyles,
      body: data
    });
  }
}
