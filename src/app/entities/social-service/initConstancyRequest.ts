import * as jsPDF from 'jspdf';
import * as moment from 'moment';

import 'jspdf-autotable';
import {ImageToBase64Service} from '../../services/app/img.to.base63.service';
import {CookiesService} from '../../services/app/cookie.service';
import {eSocialFiles} from '../../enumerators/social-service/document.enum';
import {InitConstancyModel} from './initConstancy.model';

moment.locale('es');

export class InitConstancy {
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
  private departmentSignature: any;
  private subPlanDirectorSignature: any;
  private stampTec: any;
  private montserratNormal: any;
  private montserratBold: any;
  public _request: InitConstancyModel;

  constructor(
    public _getImage: ImageToBase64Service,
    public _CookiesService: CookiesService
  ) {
    this._getImageToPdf();
  }

  public setConstancyRequest(request: InitConstancyModel) {
    this._request = request;
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

    this._getImage.getBase64('assets/imgs/firms/departamentoVinculacion.png').then(firm => {
      this.departmentSignature = firm;
    });

    this._getImage.getBase64('assets/imgs/firms/subplaneacion.png').then(firm => {
      this.subPlanDirectorSignature = firm;
    });

    this._getImage.getBase64('assets/imgs/firms/sello25.png').then(firm => {
      this.stampTec = firm;
    });
  }

  public documentSend() {
    const document = this.socialServiceConstancy().output('arraybuffer');
    return this.bufferToBase64(document);
  }

  public bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  // ************** Constancia del Servicio Social
  public socialServiceConstancy(): jsPDF {
    const doc = this.newDocumentTec(true, false);
    const today = new Date();
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);
    // doc.text('CONSTANCIA DE SERVICIO SOCIAL ITT-POC-08-08', (this.WIDTH / 2), 35, { align: 'center' });

    // doc.setFontSize(10);
    const header1 = 'DEPARTAMENTO: GESTIÓN TECNOLÓGICA Y VINCULACIÓN';
    const header2 = `No. DE OFICIO: ${this._request.tradeConstancyDocumentNumber}`;
    const header3 = 'ASUNTO: Constancia de liberación de Servicio Social';
    doc.text(header1, this.WIDTH - (this.MARGIN.RIGHT + doc.getTextWidth(header1)),  45, { align: 'left' });
    doc.text(header2, this.WIDTH - (this.MARGIN.RIGHT + doc.getTextWidth(header2)),  50, { align: 'left' });
    doc.text(header3, this.WIDTH - (this.MARGIN.RIGHT + doc.getTextWidth(header3)),  55, { align: 'left' });


    doc.text('A QUIEN CORRESPONDA:', this.MARGIN.LEFT, 65, { align: 'left' });
    doc.setFont(this.FONT, 'Normal');
    let grade;
    doc.text('Por medio de la presente se hace constar que:', this.MARGIN.LEFT, 70, { align: 'left' });
    switch (this._request.performanceLevelConstancyDocument) {
      case 'Excelente':
        grade = '100';
        break;
      case 'Notable':
        grade = '90';
        break;
      case 'Bueno':
        grade = '80';
        break;
      case 'Suficiente':
        grade = '70';
        break;
      case 'Insuficiente':
        grade = '60';
        break;
    }
    const ph1 = `Según documentos en los archivos de esta Institución, al C. ${this.addArroba(this._request.student.fullName)}, con número de control ${this.addArroba(this._request.student.controlNumber)} de la carrera de ${this.addArroba(this._request.student.career)} realizó su Servicio Social en la Dependencia ${this.addArroba(this._request.dependencyName)}, en el programa: ${this.addArroba(this._request.dependencyProgramName)}, cubriendo un total de 500 horas, durante el período comprendido del ${this.addArroba(moment(this._request.initialDate).format('LL').toUpperCase())} al ${this.addArroba(moment(this._request.initialDate).format('LL').toUpperCase())} obteniendo un nivel de desempeño de ${this.addArroba(grade)}.`;
    const ph2 = 'Este Servicio Social fue realizado de acuerdo con lo establecido en la Ley Reglamentaria del Artículo 5o. Constitucional relativo al ejercicio de las Profesiones y los Reglamentos que rigen la Sistema Nacional de Educación Superior Tecnológica.';
    const ph3 = `Se extiende la presente para los fines legales que al interesado convengan, en la Ciudad de Tepic, Nayarit a los ${moment(today).format('D [días del mes de] MMMM [del] YYYY').toUpperCase()}`;

    this.justifyText(doc, ph1, {x: this.MARGIN.LEFT, y: 75}, this.WIDTH - (this.MARGIN.LEFT * 2 + 10), 4, 10);
    this.justifyText(doc, ph2, {x: this.MARGIN.LEFT, y: 100}, this.WIDTH - (this.MARGIN.LEFT * 2 + 10), 4, 10);
    this.justifyText(doc, ph3, {x: this.MARGIN.LEFT, y: 120}, this.WIDTH - (this.MARGIN.LEFT * 2 + 10), 4, 10);

    doc.setFont(this.FONT, 'Bold');

    doc.text('ATENTAMENTE.', this.MARGIN.LEFT, 140, { align: 'left' });
    doc.text('EXCELENCIA EN EDUCACIÓN TECNOLÓGICA', this.MARGIN.LEFT, 145, { align: 'left' });
    doc.text('\"SABIDURÍA TECNOLÓGICA, PASIÓN DE NUESTRO ESPÍRITU\"', this.MARGIN.LEFT, 150, { align: 'left' });

    const firstSign = this.addArroba(`${this._request.departmentSignName} JEFE(A) DEL DEPARTAMENTO DE GESTIÓN TECNOLÓGICA Y VINCULACIÓN`);
    const secondSign = this.addArroba(`${this._CookiesService.getData().user.name.fullName} SUBDIRECTOR(A) DE PLANEACIÓN Y VINCULACIÓN`);

    doc.addImage(this.departmentSignature, 'PNG', this.MARGIN.LEFT + 25, 160, 30, 30);
    doc.addImage(this.subPlanDirectorSignature, 'PNG', this.MARGIN.LEFT + 110, 165, 40, 20);

    this.justifyText(doc, firstSign, {x: this.MARGIN.LEFT + 20, y: 200}, 60, 4, 9);
    this.justifyText(doc, secondSign, {x: this.MARGIN.LEFT + 100, y: 200}, 60, 4, 9);
    doc.addImage(this.stampTec, 'PNG', this.WIDTH - (this.WIDTH / 4), 210, 40, 40);

    doc.text('EMM/ZRAG/ahn', this.MARGIN.LEFT, 240, {align: 'left'});
    doc.text('C.c.p. Expediente del estudiante.', this.MARGIN.LEFT, 245, {align: 'left'});

    // Footer
    this.addFooterTec(doc);
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
