import * as jsPDF from 'jspdf';
import * as moment from 'moment';

import 'jspdf-autotable';
import {ImageToBase64Service} from '../../services/app/img.to.base63.service';
import {CookiesService} from '../../services/app/cookie.service';
import {eSocialFiles} from '../../enumerators/social-service/document.enum';
import {InitRequestModel} from './initRequest.model';

moment.locale('es');

export class InitPresentationDocument {
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
  public _request: InitRequestModel;

  constructor(
    public _getImage: ImageToBase64Service,
    public _CookiesService: CookiesService
  ) {
    this._getImageToPdf();
  }

  public setPresentationRequest(request: InitRequestModel) {
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
  }

  public documentSend(file: eSocialFiles) {
    let document;
    let binary;
    switch (file) {
      case eSocialFiles.PRESENTACION: {
        document = this.socialServicePresentation().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eSocialFiles.ASIGNACION: {
        document = this.socialServiceWorkProject().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eSocialFiles.COMPROMISO: {
        document = this.socialServiceCommitment().output('arraybuffer');
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

  // ************** CARTA DE PRESENTACION PARA LA REALIZACION DEL SERVICIO SOCIAL
  public socialServicePresentation(): jsPDF {
    const doc = this.newDocumentTec(true, false);

    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(8);
    doc.text('CARTA DE PRESENTACIÓN PARA LA REALIZACIÓN DEL SERVICIO SOCIAL', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('ITT-POC-08-03', (this.WIDTH / 2), 40, { align: 'center' });

    // Cuadro de Datos personales
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(10);
    this.addTextRight(doc, 'Departamento Académico: Departamento de Gestión Tecnológica y Vinculación', 55);
    this.addTextRight(doc, `No. de Oficio: ${this._request.tradeDocumentNumber}`, 60);
    this.addTextRight(doc, 'Asunto: Carta de Presentación', 65);

    doc.text('C. ' + this._request.dependencyDepartmentManager, this.MARGIN.LEFT, 75, { align: 'left' });
    doc.text(this._request.dependencyName, this.MARGIN.LEFT, 80, { align: 'left' });

    doc.text('PRESENTE', this.MARGIN.LEFT, 105, { align: 'left' });
    const body = `Por este conducto, presentamos a sus finas atenciones al C. ${this._request.student.fullName}, con número de control escolar:  ${this._request.student.controlNumber}, estudiante de la carrera de: ${this._request.student.career}, quien desea realizar su Servicio Social en esa Dependencia, cubriendo un total de mínimo 480 horas y máximo 500 horas en el programa ${this._request.dependencyProgramName} en un período mínimo de seis meses y no mayor de dos años.`;
    this.justifyText(doc,
      body,
      {x: this.MARGIN.LEFT, y: 110}, this.WIDTH - (this.MARGIN.LEFT * 2), 7, 10);

    doc.text('Agradezco las atenciones que se sirva brindar al portador de la presente.', this.MARGIN.LEFT, 160, { align: 'left' });

    // Firma de la Jefa del Departamento de Gestion y Vinculacion
    doc.setFontSize(9);
    doc.text('ATENTAMENTE', (this.WIDTH / 2), 205, { align: 'center' });
    doc.text('Firma', (this.WIDTH / 2), 217, { align: 'center' });
    doc.text('_______________________________________________', (this.WIDTH / 2), 220, { align: 'center' });
    doc.text('Jefe(a) de Departamento de Gestión Tecnológica y Vinculación', (this.WIDTH / 2), 225, { align: 'center' });

    // Footer
    doc.setFont(this.FONT, 'Bold');
    doc.setTextColor(189, 189, 189);
    doc.setFontSize(8);
    doc.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
    doc.text('Código ITT-POC-08-03', (this.WIDTH / 2), 262, { align: 'center' });
    doc.text('Rev. 0', (this.WIDTH / 2), 267, { align: 'center' });
    doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 272, { align: 'center' });
    return doc;
  }


  // ************** Plan de trabajo PARA LA REALIZACION DEL SERVICIO SOCIAL
  public socialServiceWorkProject(): jsPDF {
    const doc = this.newDocumentTec(true, false);

    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(8);
    doc.text('CARTA DE ASIGNACIÓN /', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('PLAN DE TRABAJO DEL PRESTADOR DE SERVICIO SOCIAL ITT-POC-08-04', (this.WIDTH / 2), 40, { align: 'center' });
    // Cuadro de Datos personales
    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Bold');
    doc.text('DATOS DEL PRESTADOR DE SERVICIO SOCIAL', this.MARGIN.LEFT, 55, { align: 'left' });
    doc.rect(this.MARGIN.LEFT, 58, this.WIDTH - (this.MARGIN.RIGHT * 2), 35);
    doc.setFont(this.FONT, 'Normal');
    const nombre = `NOMBRE COMPLETO: ${this._request.student.fullName}    EDAD: XX    SEXO:X`;
    doc.text(nombre, this.MARGIN.LEFT + 2, 62, { align: 'left' });
    const direccion = `DIRECCION: Calle siempreviva #123 colonia abcdefg Tepic, Nayarit   TEL: 1234567890`
    doc.text(direccion, this.MARGIN.LEFT + 2, 69, { align: 'left' });
    doc.text(`                    CALLE Y NUMERO     COLONIA       CIUDAD Y ESTADO`, this.MARGIN.LEFT + 2, 76, { align: 'left' });
    const carrera = `CARRERA: ${this._request.student.career}     SEMESTRE: ${this._request.student.semester}`;
    doc.text(carrera, this.MARGIN.LEFT + 2, 83, { align: 'left' });
    const noCtrol = `No. DE CONTROL:   ${this._request.student.controlNumber}     No. DE CREDITOS CUBIERTOS:  XX.X%`;
    doc.text(noCtrol, this.MARGIN.LEFT + 2, 90, { align: 'left' });

    // Cuadro de Datos del programa


    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Bold');
    doc.text('DATOS DEL PROGRAMA', this.MARGIN.LEFT, 99, { align: 'left' });
    doc.rect(this.MARGIN.LEFT, 102, this.WIDTH - (this.MARGIN.RIGHT * 2), 138); // rectangulo completo
    doc.rect(this.MARGIN.LEFT, 102, (this.WIDTH - (this.MARGIN.RIGHT * 2)) / 2, 40); // ya esta bien
    doc.rect(this.MARGIN.LEFT, 102, (this.WIDTH - (this.MARGIN.RIGHT * 2)), 40); // ya esta bien
    doc.setFont(this.FONT, 'Normal');
    doc.text('NOMBRE', this.MARGIN.LEFT + 2, 107, { align: 'left' });
    doc.text('OBJETIVO', ((this.WIDTH - (this.MARGIN.RIGHT * 2)) / 2) + 22, 107, { align: 'left' });

    const programName = this._request.dependencyProgramName;
    this.justifyText(doc,
      programName,
      {x: this.MARGIN.LEFT + 2, y: 112}, ((this.WIDTH - (this.MARGIN.LEFT * 2)) / 2) - 5, 5, 10);

    const programObjective = this._request.dependencyProgramObjective;
    this.justifyText(doc,
      programObjective,
      {x: ((this.WIDTH - (this.MARGIN.RIGHT * 2)) / 2) + 22, y: 112}, ((this.WIDTH - (this.MARGIN.LEFT * 2)) / 2) - 5 , 5, 10);
      const actDesc = 'ACTIVIDADES A DESARROLLAR (Preguntar al responsable del programa acerca de las actividades que realizará y use el espacio necesario para describir adecuadamente, no se limite):';
      this.justifyText(doc,
        actDesc,
        {x: this.MARGIN.LEFT + 2, y: 147}, this.WIDTH - (this.MARGIN.LEFT * 2) - 5 , 4, 9);
    doc.text(this._request.dependencyActivities, this.MARGIN.LEFT + 2, 157, { align: 'left' });
      
    doc.rect(this.MARGIN.LEFT + 2, 192, this.WIDTH - (this.MARGIN.RIGHT * 2) - 4, 33); // HORARIO  225

    doc.line(this.MARGIN.LEFT + 2, 201, this.WIDTH - (this.MARGIN.RIGHT) - 25 , 201); // 1 horizontal
    doc.line(this.MARGIN.LEFT + 2, 206, this.WIDTH - (this.MARGIN.RIGHT) - 2 , 206); // 2 horizontal
    doc.line(this.MARGIN.LEFT + 2, 212, this.WIDTH - (this.MARGIN.RIGHT) - 2 , 212); // 3 horizontal
    doc.line(this.MARGIN.LEFT + 2, 218, this.WIDTH - (this.MARGIN.RIGHT) - 2 , 218); // ultima horizontal
        // Lineas verticales de la tabla
    doc.line(this.MARGIN.LEFT + 13, 201, this.MARGIN.LEFT + 13 , 212); // 1 vertical
    doc.line(this.MARGIN.LEFT + 33, 201, this.MARGIN.LEFT + 33 , 212); // 2 vertical
    doc.line(this.MARGIN.LEFT + 53, 201, this.MARGIN.LEFT + 53 , 212); // 3 vertical
    doc.line(this.MARGIN.LEFT + 73, 201, this.MARGIN.LEFT + 73 , 212); // 4 vertical
    doc.line(this.MARGIN.LEFT + 93, 201, this.MARGIN.LEFT + 93 , 212); // 5 vertical
    doc.line(this.MARGIN.LEFT + 113, 201, this.MARGIN.LEFT + 113 , 212); // 6 vertical
    doc.line(this.MARGIN.LEFT + 132, 201, this.MARGIN.LEFT + 132 , 212); // 7 vertical
    doc.line(this.MARGIN.LEFT + 151, 192, this.MARGIN.LEFT + 151 , 212); // 8 vertical

        // Verticales de los meses
    doc.line(this.MARGIN.LEFT + 23, 218, this.MARGIN.LEFT + 23 , 225); // 1 vertical
    doc.line(this.MARGIN.LEFT + 43, 218, this.MARGIN.LEFT + 43 , 225); // 2 vertical
    doc.line(this.MARGIN.LEFT + 63, 218, this.MARGIN.LEFT + 63 , 225); // 3 vertical
    doc.line(this.MARGIN.LEFT + 83, 218, this.MARGIN.LEFT + 83 , 225); // 4 vertical
    doc.line(this.MARGIN.LEFT + 103, 218, this.MARGIN.LEFT + 103 , 225); // 5 vertical
    doc.line(this.MARGIN.LEFT + 123, 218, this.MARGIN.LEFT + 123 , 225); // 6 vertical
    doc.line(this.MARGIN.LEFT + 151, 218, this.MARGIN.LEFT + 151 , 225); // ultmina vertical


    doc.text(`HORARIO`, this.MARGIN.LEFT + 55, 198, { align: 'left' });
    doc.setFontSize(8);
    doc.text(`Total`, this.MARGIN.LEFT + 156, 200, { align: 'left' });

    doc.text(`Día`, this.MARGIN.LEFT + 4, 204, { align: 'left' });
    doc.text(`Lunes`, this.MARGIN.LEFT + 14, 204, { align: 'left' });
    doc.text(`Martes`, this.MARGIN.LEFT + 34, 204, { align: 'left' });
    doc.text(`Miércoles`, this.MARGIN.LEFT + 54, 204, { align: 'left' });
    doc.text(`Jueves`, this.MARGIN.LEFT + 74, 204, { align: 'left' });
    doc.text(`Viernes`, this.MARGIN.LEFT + 94, 204, { align: 'left' });
    doc.text(`Sábado`, this.MARGIN.LEFT + 114, 204, { align: 'left' });
    doc.text(`Domingo`, this.MARGIN.LEFT + 133, 204, { align: 'left' });
    doc.text(`Horas/Semana`, this.MARGIN.LEFT + 152, 204, { align: 'left' });

    doc.setFontSize(9);
    doc.text(`Hora`, this.MARGIN.LEFT + 4, 210, { align: 'left' });
    doc.text(this._request.schedule[0], this.MARGIN.LEFT + 14, 210, { align: 'left' });
    doc.text(this._request.schedule[1], this.MARGIN.LEFT + 34, 210, { align: 'left' });
    doc.text(this._request.schedule[2], this.MARGIN.LEFT + 54, 210, { align: 'left' });
    doc.text(this._request.schedule[3], this.MARGIN.LEFT + 74, 210, { align: 'left' });
    doc.text(this._request.schedule[4], this.MARGIN.LEFT + 94, 210, { align: 'left' });
    doc.text(this._request.schedule[5], this.MARGIN.LEFT + 114, 210, { align: 'left' });
    doc.text(this._request.schedule[6], this.MARGIN.LEFT + 133, 210, { align: 'left' });
    doc.text(`21 horas`, this.MARGIN.LEFT + 154, 210, { align: 'left' });

    doc.text(`PERIODO DE REALIZACIÓN (MESES)`, ((this.WIDTH - (this.MARGIN.RIGHT * 2)) / 2) - 10 , 216, { align: 'left' });
    doc.text(this._request.months[0], this.MARGIN.LEFT + 4, 223, { align: 'left' });
    doc.text(this._request.months[1], this.MARGIN.LEFT + 24, 223, { align: 'left' });
    doc.text(this._request.months[2], this.MARGIN.LEFT + 44, 223, { align: 'left' });
    doc.text(this._request.months[3], this.MARGIN.LEFT + 64, 223, { align: 'left' });
    doc.text(this._request.months[4], this.MARGIN.LEFT + 84, 223, { align: 'left' });
    doc.text(this._request.months[5], this.MARGIN.LEFT + 104, 223, { align: 'left' });
    doc.text(`24 semanas`, this.MARGIN.LEFT + 153, 223, { align: 'left' });
        //225
    let inside = 'no';
    if (this._request.dependencyProgramLocationInside) {inside = 'si'; }
    doc.text(`EL SERVICIO SOCIAL LO REALIZARA DENTRO DE LAS INSTALACIONES DE LA DEPENDENCIA:` , this.MARGIN.LEFT + 2, 228, { align: 'left' });
    doc.text(`              ${inside}` , this.MARGIN.LEFT + 2, 233, { align: 'left' });
    doc.text(`DONDE:  ${this._request.dependencyProgramLocation}` , this.MARGIN.LEFT + 2, 238, { align: 'left' });
    // 240
    // Footer
    doc.setFont(this.FONT, 'Bold');
    doc.setTextColor(189, 189, 189);
    doc.setFontSize(8);
    doc.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
    doc.text('Código ITT-POC-08-04', (this.WIDTH / 2), 262, { align: 'center' });
    doc.text('Rev. 0', (this.WIDTH / 2), 267, { align: 'center' });
    doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 272, { align: 'center' });
    return doc;
  }

    // ************** Carta compromiso de servicio social
    public socialServiceCommitment(): jsPDF {
      const doc = this.newDocumentTec(true, false);
      doc.setTextColor(0, 0, 0);
      // Title
      doc.setFont(this.FONT, 'Bold');
      doc.setFontSize(12);
      doc.text('CARTA COMPROMISO DE SERVICIO SOCIAL', (this.WIDTH / 2), 35, { align: 'center' });
      doc.text('Departamento de Gestión Tecnológica y Vinculación', (this.WIDTH / 2), 42, { align: 'center' });
      doc.text('Carta compromiso de Servicio Social ITT-POC-08-05', (this.WIDTH / 2), 49, { align: 'center' });
      // Primer parrafo
      doc.setFontSize(12);
      doc.setFont(this.FONT, 'normal');
      this.justifyText(doc,
        'Con  el  fin  de  dar  cumplimiento  con  lo  establecido  en  la  Ley  Reglamentaria  del  Artículo  5º  Constitucional  relativo  al  ejercicio  de  profesiones,  el  suscrito: ',
        {x: this.MARGIN.LEFT, y: 70}, this.WIDTH - (this.MARGIN.RIGHT * 2), 6, 11);
      // Datos del prestador de servicio
      doc.text(`Nombre del prestante del Servicio Social: ${this._request.student.fullName}`, this.MARGIN.LEFT, 90, { align: 'left' });
      doc.text(`Número de control: ${this._request.student.controlNumber}  Domicilio: `, this.MARGIN.LEFT, 100, { align: 'left' });
      doc.text(`Teléfono: ${this._request.student.phone} Carrera: ${this._request.student.career} Semestre: ${this._request.student.semester}`, this.MARGIN.LEFT, 110, { align: 'left' });
      doc.text(`Dependencia u organismo: ${this._request.dependencyName}`, this.MARGIN.LEFT, 120, { align: 'left' });
      doc.text(`Domicilio de la dependencia: ${this._request.dependencyAddress}`, this.MARGIN.LEFT, 130, { align: 'left' });
      doc.text(`Responsable del programa: ${this._request.dependencyDepartmentManager}`, this.MARGIN.LEFT, 140, { align: 'left' });
      doc.text(`Fecha de inicio: *fecha de inicio* Fecha de terminación: *fecha final*`, this.MARGIN.LEFT, 150, { align: 'left' });
      
      // Segundo parrafo
      this.justifyText(doc,
        'Me comprometo a realizar el Servicio Social acatando el reglamento emitido por el Tecnológico Nacional de México y llevarlo a cabo en el lugar y periodos manifestados, así como, a participar con mis conocimientos e iniciativas en las actividades que desempeñe, ' + 
        'procurando dar una imagen positiva del instituto en el Organizmo o Dependencia oficial, de no hacerlo así, quedo enterado(a) de la cancelación respectiva a la cual procedera automáticamente.',
        {x: this.MARGIN.LEFT, y: 160}, this.WIDTH - (this.MARGIN.RIGHT * 2), 5, 12);
      
      doc.text('En la ciudad de: Tepic el día *dia* del mes *mes* de *año*', (this.WIDTH / 2), 200, { align: 'center' });
      doc.setFont(this.FONT, 'Bold');
      doc.text('CONFORMIDAD', (this.WIDTH / 2), 210, { align: 'center' });
      doc.text(`Firmado digitalmente por ${this._request.student.fullName}`, (this.WIDTH / 2), 225, { align: 'center' });
      doc.text('Firma del prestante del Servicio Social', (this.WIDTH / 2), 233, { align: 'center' });

      // Footer
      doc.setFont(this.FONT, 'Bold');
      doc.setTextColor(189, 189, 189);
      doc.setFontSize(8);
      doc.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
      doc.text('Código ITT-POC-08-05', (this.WIDTH / 2), 262, { align: 'center' });
      doc.text('Rev. 0', (this.WIDTH / 2), 267, { align: 'center' });
      doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 272, { align: 'center' });
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
