import * as jsPDF from 'jspdf';
import * as moment from 'moment';

import 'jspdf-autotable';
import {ImageToBase64Service} from '../../services/app/img.to.base63.service';
import {CookiesService} from '../../services/app/cookie.service';
import {eSocialFiles} from '../../enumerators/social-service/document.enum';
import {InitRequestModel} from './initRequest.model';
import { InitSelfEvaluationModel } from './initSelfEvaluation.model';
import { InitLastSelfEvaluationModel } from './initLastSelfEvaluation.model';
import { InitAsignationModel } from './initAsignation.model';

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
  private departmentSignature: any;
  private serviceFirm: any;
  private directorFirm: any;
  private stampTec: any;
  private montserratNormal: any;
  private montserratBold: any;
  public _request: InitRequestModel;
  public selfEvaluation: InitSelfEvaluationModel;
  public lastSelfEvaluation: InitLastSelfEvaluationModel;
  public asignation: InitAsignationModel;

  constructor(
    public _getImage: ImageToBase64Service,
    public _CookiesService: CookiesService
  ) {
    this._getImageToPdf();
  }

  public setPresentationRequest(request: InitRequestModel) {
    this._request = request;
  }

  public setAsignationRequest(request: InitAsignationModel) {
    this.asignation = request;
  }

  public setSelfEvaluationRequest(request: InitSelfEvaluationModel) {
    this.selfEvaluation = request;
  }

  public setLastSelfEvaluationRequest(request: InitLastSelfEvaluationModel) {
    this.lastSelfEvaluation = request;
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

    this._getImage.getBase64('assets/imgs/firms/sello25.png').then(firm => {
      this.stampTec = firm;
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
      case eSocialFiles.AUTOEVALUACION: {
        document = this.socialServiceSelfEvaluation().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eSocialFiles.EVALUACIONACTIVIDADES: {
        document = this.socialServiceLastSelfEvaluation().output('arraybuffer');
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
    // doc.setFont(this.FONT, 'Bold');
    // doc.setFontSize(8);
    // doc.text('CARTA DE PRESENTACIÓN PARA LA REALIZACIÓN DEL SERVICIO SOCIAL', (this.WIDTH / 2), 35, { align: 'center' });
    // doc.text('ITT-POC-08-03', (this.WIDTH / 2), 40, { align: 'center' });

    // Cuadro de Datos personales
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);
    this.addTextRight(doc, this.addArroba('DEPARTAMENTO: GESTIÓN TECNOLÓGICA Y VINCULACIÓN'), 50);
    this.addTextRight(doc, this.addArroba(`No. DE OFICIO: ${this._request.tradeDocumentNumber}`), 55);
    this.addTextRight(doc, this.addArroba('ASUNTO: Carta de Presentación'), 60);

    doc.text('Tepic, Nayarit.' + moment().format('D [DE] MMMM [DE] YYYY').toUpperCase(), this.MARGIN.LEFT, 70, { align: 'left' });

    doc.text('M.A. MANUEL ÁNGEL URIBE VÁZQUEZ', this.MARGIN.LEFT, 75, { align: 'left' });
    doc.text('DIRECTOR', this.MARGIN.LEFT, 80, { align: 'left' });
    doc.text('INSTITUTO TECNOLÓGICO DE TEPIC', this.MARGIN.LEFT, 85, { align: 'left' });

    doc.text('PRESENTE', this.MARGIN.LEFT, 95, { align: 'left' });
    this.addTextRight(doc, this._request.dependencyDepartmentManager, 100);
    this.addTextRight(doc, this._request.dependencyName, 105);

    doc.setFont(this.FONT, 'Normal');
    const body = `Por este conducto, presentamos a sus finas atenciones al C. ${this.addArroba(this._request.student.fullName)}, con número de control ${this.addArroba(this._request.student.controlNumber)}, alumno de la carrera de ${this.addArroba(this._request.student.career)}, quien desea realizar su Servicio Social en esa dependencia, cubriendo un total de 500 horas en el programa ${this.addArroba(this._request.dependencyProgramName)} en un período mínimo de seis meses y no mayor de dos años. Así mismo solicito de la manera más atenta nos haga llegar la carta de aceptación, donde mencione el día de inicio de su servicio social.`;
    this.justifyText(doc,
      body,
      {x: this.MARGIN.LEFT, y: 115}, this.WIDTH - (this.MARGIN.LEFT * 2), 7, 10);

    doc.text('Agradezco las atenciones que se sirva brindar al portador de la presente.', this.MARGIN.LEFT, 160, { align: 'left' });

    // Firma de la Jefa del Departamento de Gestion y Vinculacion
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);
    doc.text('ATENTAMENTE', this.MARGIN.LEFT, 170, { align: 'left' });
    doc.text('Excelencia en Educación Tecnológica', this.MARGIN.LEFT, 175, { align: 'left' });
    doc.text('\"SABIDURIA TECNOLÓGICA, PASIÓN DE NUESTRO ESPÍRITU\"', this.MARGIN.LEFT, 180, { align: 'left' });
    doc.addImage(this.departmentSignature, 'PNG', this.MARGIN.LEFT + 20, 200, 25, 25);
    doc.text('M.C. ZOILA RAQUEL AGUIRRE GONZÁLEZ', this.MARGIN.LEFT, 225, { align: 'left' });
    doc.text('JEFA DEL DEPARTAMENTO DE GESTIÓN TECNOLÓGICA Y VINCULACIÓN', this.MARGIN.LEFT, 230, { align: 'left' });
    doc.text('ZRGA/ahn', this.MARGIN.LEFT, 245, { align: 'left' });

    doc.addImage(this.stampTec, 'PNG', this.WIDTH - (this.WIDTH / 3), 175, 50, 50);

    // Footer
    this.addFooterTec(doc);
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
    const nombre = `NOMBRE COMPLETO: ${this.asignation.studentName}    EDAD: ${this.asignation.studentAge}    SEXO:${this.asignation.studentGender}`;
    doc.text(nombre, this.MARGIN.LEFT + 2, 62, { align: 'left' });
    const direccion = `DIRECCION: ${this.asignation.studentStreet} colonia ${this.asignation.studentSuburb} ${this.asignation.studentCity}, Nayarit   TEL: ${this.asignation.studentPhone}`
    doc.text(direccion, this.MARGIN.LEFT + 2, 69, { align: 'left' });
    doc.text(`                    CALLE Y NUMERO     COLONIA       CIUDAD Y ESTADO`, this.MARGIN.LEFT + 2, 76, { align: 'left' });
    const carrera = `CARRERA: ${this.asignation.studentCarrer}     SEMESTRE: ${this.asignation.semester}`;
    doc.text(carrera, this.MARGIN.LEFT + 2, 83, { align: 'left' });
    const noCtrol = `No. DE CONTROL:   ${this.asignation.studentControl}     No. DE CREDITOS CUBIERTOS:  ${this.asignation.studentProgress}`;
    doc.text(noCtrol, this.MARGIN.LEFT + 2, 90, { align: 'left' });
    //_request
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

    const programName = this.asignation.dependencyProgramName;
    this.justifyText(doc,
      programName,
      {x: this.MARGIN.LEFT + 2, y: 112}, ((this.WIDTH - (this.MARGIN.LEFT * 2)) / 2) - 5, 5, 10);

    const programObjective = this.asignation.dependencyProgramObjective;
    this.justifyText(doc,
      programObjective,
      {x: ((this.WIDTH - (this.MARGIN.RIGHT * 2)) / 2) + 22, y: 112}, ((this.WIDTH - (this.MARGIN.LEFT * 2)) / 2) - 5 , 5, 10);
      const actDesc = 'ACTIVIDADES A DESARROLLAR (Preguntar al responsable del programa acerca de las actividades que realizará y use el espacio necesario para describir adecuadamente, no se limite):';
      this.justifyText(doc,
        actDesc,
        {x: this.MARGIN.LEFT + 2, y: 147}, this.WIDTH - (this.MARGIN.LEFT * 2) - 5 , 4, 9);
      this.justifyText(doc,
        this.asignation.dependencyActivities,
        {x: this.MARGIN.LEFT + 2, y: 155}, this.WIDTH - (this.MARGIN.LEFT * 2) - 5 , 4, 9);
    //doc.text(this._request.dependencyActivities, this.MARGIN.LEFT + 2, 157, { align: 'left' });

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
    doc.text(this.asignation.schedule[0], this.MARGIN.LEFT + 14, 210, { align: 'left' });
    doc.text(this.asignation.schedule[1], this.MARGIN.LEFT + 34, 210, { align: 'left' });
    doc.text(this.asignation.schedule[2], this.MARGIN.LEFT + 54, 210, { align: 'left' });
    doc.text(this.asignation.schedule[3], this.MARGIN.LEFT + 74, 210, { align: 'left' });
    doc.text(this.asignation.schedule[4], this.MARGIN.LEFT + 94, 210, { align: 'left' });
    doc.text(this.asignation.schedule[5], this.MARGIN.LEFT + 114, 210, { align: 'left' });
    doc.text(this.asignation.schedule[6], this.MARGIN.LEFT + 133, 210, { align: 'left' });
    doc.text(`21 horas`, this.MARGIN.LEFT + 154, 210, { align: 'left' });

    doc.text(`PERIODO DE REALIZACIÓN (MESES)`, ((this.WIDTH - (this.MARGIN.RIGHT * 2)) / 2) - 10 , 216, { align: 'left' });
    doc.text(this.asignation.months[0], this.MARGIN.LEFT + 4, 223, { align: 'left' });
    doc.text(this.asignation.months[1], this.MARGIN.LEFT + 24, 223, { align: 'left' });
    doc.text(this.asignation.months[2], this.MARGIN.LEFT + 44, 223, { align: 'left' });
    doc.text(this.asignation.months[3], this.MARGIN.LEFT + 64, 223, { align: 'left' });
    doc.text(this.asignation.months[4], this.MARGIN.LEFT + 84, 223, { align: 'left' });
    doc.text(this.asignation.months[5], this.MARGIN.LEFT + 104, 223, { align: 'left' });
    doc.text(`24 semanas`, this.MARGIN.LEFT + 153, 223, { align: 'left' });
        //225
    let inside = 'no';
    if (this.asignation.dependencyProgramLocationInside) {inside = 'si'; }
    doc.text(`EL SERVICIO SOCIAL LO REALIZARA DENTRO DE LAS INSTALACIONES DE LA DEPENDENCIA: ${inside}` , this.MARGIN.LEFT + 2, 228, { align: 'left' });
    doc.text(`DONDE:  ${this.asignation.dependencyProgramLocation}` , this.MARGIN.LEFT + 2, 238, { align: 'left' });
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

      doc.text(`En la ciudad de: Tepic el día ${moment(new Date()).format('D [del mes] MMMM [de] YYYY').toUpperCase()}`, (this.WIDTH / 2), 200, { align: 'center' });
      doc.setFont(this.FONT, 'Bold');
      doc.text('CONFORMIDAD', (this.WIDTH / 2), 210, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Esta solicitud fue firmada electrónicamente por ${this._request.student.fullName} el ${moment(new Date()).format('D [de] MMMM [de] YYYY [a las] h:mm a')}`, (this.WIDTH / 2), 225, { align: 'center' });
      doc.text('Firma del prestante del Servicio Social', (this.WIDTH / 2), 230, { align: 'center' });

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



  // ************** Carta de autoevaluacion de servicio social
  public socialServiceSelfEvaluation(): jsPDF {
    const coordenadas = [this.MARGIN.LEFT + 78, this.MARGIN.LEFT + 105, this.MARGIN.LEFT + 128, this.MARGIN.LEFT + 145, this.MARGIN.LEFT + 167];
    const doc = this.newDocumentTec(true, false);
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    doc.text('FORMATO DE AUTOEVALUACIÓN CUALITATIVA DEL PRESTADOR DE SERVICIO SOCIAL', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('DEPARTAMENTO DE GESTIÓN TECNOLÓGICA Y VINCULACIÓN', (this.WIDTH / 2), 42, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Código: ITT-POC-08-11                     Revisión: 1', (this.WIDTH / 2), 47, { align: 'center' });
    doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 52, { align: 'center' });
    // Preguntas
    doc.setFontSize(11);
    doc.text('Nivel de desempeño del criterio', ((this.WIDTH / 4)*3) - 15, 62, { align: 'center' });
    doc.text('No.', this.MARGIN.LEFT +3 , 69, { align: 'center' });
    doc.text('Criterios a evaluar', this.MARGIN.LEFT + 35 , 69, { align: 'center' });
    doc.text('Insuficiente', this.MARGIN.LEFT + 78 , 69, { align: 'center' });
    doc.text('Suficiente', this.MARGIN.LEFT + 105 , 69, { align: 'center' });
    doc.text('Bueno', this.MARGIN.LEFT + 128 , 69, { align: 'center' });
    doc.text('Notable', this.MARGIN.LEFT + 145 , 69, { align: 'center' });
    doc.text('Excelente', this.MARGIN.LEFT + 167 , 69, { align: 'center' });

    doc.text('*', coordenadas[this.selfEvaluation.qs1] , 81, { align: 'center' }); //1
    doc.text('*', coordenadas[this.selfEvaluation.qs2] , 96, { align: 'center' }); //2
    doc.text('*', coordenadas[this.selfEvaluation.qs3] , 106, { align: 'center' }); //3
    doc.text('*', coordenadas[this.selfEvaluation.qs4] , 116, { align: 'center' }); //4
    doc.text('*', coordenadas[this.selfEvaluation.qs5] , 134, { align: 'center' }); //5
    doc.text('*', coordenadas[this.selfEvaluation.qs6] , 152, { align: 'center' }); //6
    doc.text('*', coordenadas[this.selfEvaluation.qs7] , 170, { align: 'center' }); //7

    doc.setFontSize(10);

    this.justifyText(doc,
      'Cumplí en tiempo y forma con las actividades encomendadas alcanzando los objetivos.',
      {x: this.MARGIN.LEFT + 10, y: 77}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('1', this.MARGIN.LEFT + 4 , 81, { align: 'center' });
    this.justifyText(doc,
      'Trabajé en equipo y me adapté a nuevas situaciones.',
      {x: this.MARGIN.LEFT + 10, y: 95}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('2', this.MARGIN.LEFT + 4 , 96, { align: 'center' });
    this.justifyText(doc,
      'Mostré liderazgo en las actividades encomendadas.',
      {x: this.MARGIN.LEFT + 10, y: 105}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('3', this.MARGIN.LEFT + 4 , 106, { align: 'center' });
    this.justifyText(doc,
      'Organicé mi tiempo y trabajé de manera proactiva.',
      {x: this.MARGIN.LEFT + 10, y: 115}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('4', this.MARGIN.LEFT + 4 , 116, { align: 'center' });
    this.justifyText(doc,
      'Interpreté la realidad y me sensibilicé aportando soluciones a la problemática con la actividad complementaria.',
      {x: this.MARGIN.LEFT + 10, y: 125}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('5', this.MARGIN.LEFT + 4 , 134, { align: 'center' });
    this.justifyText(doc,
      'Realicé sugerencias innovadoras para beneficio o mejora del programa en el que participa.',
      {x: this.MARGIN.LEFT + 10, y: 147}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('6', this.MARGIN.LEFT + 4 , 152, { align: 'center' });
    this.justifyText(doc,
      'Tuve iniciativa para ayudar en las actividades encomendadas y mostré espíritu de servicio. ',
      {x: this.MARGIN.LEFT + 10, y: 165}, this.MARGIN.LEFT + 32, 4, 10);
    doc.text('7', this.MARGIN.LEFT + 4 , 170, { align: 'center' });

    // doc.text('Observaciones: ', this.MARGIN.LEFT + 3 , 190, { align: 'left' });
    doc.setFontSize(10);
    this.justifyText(doc,
      `Observaciones: ${this.selfEvaluation.observations}` ,
      {x: this.MARGIN.LEFT + 3, y: 187}, 162, 4, 10);
      // Nombre, No. de control y firma del prestador de Servicio Social
    doc.text(`${this.selfEvaluation.studentName}, ${this.selfEvaluation.control}`, this.WIDTH/2 , 210, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Documento firmado electrónicamente por ${this.selfEvaluation.studentName}, el ${moment().format('D [de] MMMM [de] YYYY [a las] h:mm a')}`, this.WIDTH/2 , 215, { align: 'center' });
    doc.setFontSize(10);
    doc.line(this.MARGIN.LEFT +12, 217, this.MARGIN.LEFT + 170 , 217);
    doc.text('Nombre, No. de control y firma del prestador de Servicio Social', this.WIDTH/2, 221, { align: 'center' });
    doc.text('c.c.p. Oficina de Servicio Social ', this.MARGIN.LEFT + 3, 226, { align: 'left' });

    doc.setFont(this.FONT, 'Bold');
    doc.text(`Nombre del prestador de Servicio Social: ${this.selfEvaluation.studentName}`, this.MARGIN.LEFT + 10, 232, { align: 'left' });
    doc.text(`Programa: ${this.selfEvaluation.programName}`, this.MARGIN.LEFT + 10, 238, { align: 'left' });
    doc.text(`Periodo de realización: ${this.selfEvaluation.period}`, this.MARGIN.LEFT + 10, 245, { align: 'left' });
    doc.text('Indique a que bimestre corresponde:', this.MARGIN.LEFT + 10, 252, { align: 'left' });
    doc.text(`Bimestre: ${this.selfEvaluation.position}`, this.MARGIN.LEFT + 150, 252, { align: 'center' });
    // Footer
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(8);
    doc.text('Código ITT-POC-08-05', this.MARGIN.LEFT + 10, 262, { align: 'left' });
    doc.text('Revisión: 1', (this.WIDTH / 2 ) + 50, 262, { align: 'left' });
    doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', this.MARGIN.LEFT + 10, 267, { align: 'left' });

    //lineas y rectangulos
    doc.rect(this.MARGIN.LEFT -2, 64, this.WIDTH - (2 * this.MARGIN.RIGHT) + 4, 164); // rectangulo completo
    doc.rect(this.MARGIN.LEFT +65, 57, (this.WIDTH - (2 * this.MARGIN.RIGHT) + 4)-(67), 7); // primer rectangulo

    //Lineas horizontales
    doc.line(this.MARGIN.LEFT -2, 72, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 72);
    doc.line(this.MARGIN.LEFT -2, 91, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 91);
    doc.line(this.MARGIN.LEFT -2, 101, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 101);
    doc.line(this.MARGIN.LEFT -2, 111, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 111);
    doc.line(this.MARGIN.LEFT -2, 121, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 121);
    doc.line(this.MARGIN.LEFT -2, 143, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 143);
    doc.line(this.MARGIN.LEFT -2, 161, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 161);
    doc.line(this.MARGIN.LEFT -2, 181, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 181);
      //Lineas verticales
    doc.line(this.MARGIN.LEFT + 8, 64, this.MARGIN.LEFT + 8, 181);
    doc.line(this.MARGIN.LEFT + 65, 64, this.MARGIN.LEFT + 65, 181);
    doc.line(this.MARGIN.LEFT + 92, 64, this.MARGIN.LEFT + 92, 181);

    doc.line(this.MARGIN.LEFT + 118, 64, this.MARGIN.LEFT + 118, 181);
    doc.line(this.MARGIN.LEFT + 136, 64, this.MARGIN.LEFT + 136, 181);
    doc.line(this.MARGIN.LEFT + 155, 64, this.MARGIN.LEFT + 155, 181);


    /*
    doc.setFont(this.FONT, 'Bold');
    doc.setTextColor(189, 189, 189);
    doc.setFontSize(8);
    doc.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
    doc.text('Código ITT-POC-08-05', (this.WIDTH / 2), 262, { align: 'center' });
    doc.text('Rev. 0', (this.WIDTH / 2), 267, { align: 'center' });
    doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 272, { align: 'center' });
    */
    return doc;
  }

    // ************** FORMATO DE EVALUACIÓN DE LAS ACTIVIDADES POR EL PRESTADOR DE SERVICIO SOCIAL
    public socialServiceLastSelfEvaluation(): jsPDF {
      const coordenadas = [this.MARGIN.LEFT + 88, this.MARGIN.LEFT + 110, this.MARGIN.LEFT + 128, this.MARGIN.LEFT + 145, this.MARGIN.LEFT + 167];
      const doc = this.newDocumentTec(true, false);
      doc.setTextColor(0, 0, 0);
      // Title
      doc.setFont(this.FONT, 'Family');
      doc.setFontSize(11);
      doc.text('FORMATO DE EVALUACIÓN DE LAS ACTIVIDADES POR EL PRESTADOR DE SERVICIO SOCIAL', (this.WIDTH / 2), 35, { align: 'center' });
      doc.text('DEPARTAMENTO DE GESTIÓN TECNOLÓGICA Y VINCULACIÓN', (this.WIDTH / 2), 40, { align: 'center' });
      doc.setFontSize(9);
      doc.text('Código: ITT-POC-08-10                     Revisión: 1', (this.WIDTH / 2), 45, { align: 'center' });
      doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 49, { align: 'center' });
      // Preguntas
      doc.setFontSize(12);
      doc.setFont(this.FONT, 'Family');
      doc.text(`Nombre del prestador de Servicio Social: ${this.lastSelfEvaluation.studentName}`, this.MARGIN.LEFT + 10, 55, { align: 'left' });
      doc.text(`Programa: ${this.lastSelfEvaluation.programName}`, this.MARGIN.LEFT + 10, 60, { align: 'left' });
      doc.text(`Periodo de realización: ${this.lastSelfEvaluation.period}`, this.MARGIN.LEFT + 10, 65, { align: 'left' });
      doc.text('Indique a que bimestre corresponde:', this.MARGIN.LEFT + 10, 70, { align: 'left' });
      doc.text(`Final: *  `, this.MARGIN.LEFT + 150, 70, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Nivel de desempeño del criterio', ((this.WIDTH / 4)*3) - 15, 76, { align: 'center' });
      doc.text('No.', this.MARGIN.LEFT +3 , 83, { align: 'center' });
      doc.text('Criterios a evaluar', this.MARGIN.LEFT + 35 , 83, { align: 'center' });
      doc.text('Insuficiente', this.MARGIN.LEFT + 88 , 83, { align: 'center' });
      doc.text('Suficiente', this.MARGIN.LEFT + 110 , 83, { align: 'center' });
      doc.text('Bueno', this.MARGIN.LEFT + 128 , 83, { align: 'center' });
      doc.text('Notable', this.MARGIN.LEFT + 145 , 83, { align: 'center' });
      doc.text('Excelente', this.MARGIN.LEFT + 167 , 83, { align: 'center' });

       
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql1] , 90, { align: 'center' }); //1
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql2] , 101, { align: 'center' }); //2
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql3] , 115, { align: 'center' }); //3
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql4] , 127, { align: 'center' }); //4
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql5] , 137, { align: 'center' }); //5
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql6] , 153, { align: 'center' }); //6
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql7] , 177, { align: 'center' }); //7
      doc.text('*', coordenadas[this.lastSelfEvaluation.ql8] , 197, { align: 'center' }); //8
      
     doc.setFontSize(10);
     doc.setFont(this.FONT, 'arial');
     this.justifyText(doc,
       '¿Consideras   importante la   realización del  servicio social?',
       {x: this.MARGIN.LEFT + 10, y: 87}, this.MARGIN.LEFT + 44, 4, 9);
     doc.text('1', this.MARGIN.LEFT + 4 , 90, { align: 'center' });
     this.justifyText(doc,
       '¿Consideras que las actividades que realizaste son pertinentes a los fines del Servicio Social?',
       {x: this.MARGIN.LEFT + 10, y: 97}, this.MARGIN.LEFT + 44, 4, 9.5);
     doc.text('2', this.MARGIN.LEFT + 4 , 101, { align: 'center' });
     this.justifyText(doc,
       '¿Consideras que las actividades que realizaste contribuyen a tu formación integral?',
       {x: this.MARGIN.LEFT + 10, y: 111}, this.MARGIN.LEFT + 44, 4, 9.5);
     doc.text('3', this.MARGIN.LEFT + 4 , 115, { align: 'center' });
     this.justifyText(doc,
       '¿Contribuiste en actividades de beneficio social comunitario? ',
       {x: this.MARGIN.LEFT + 10, y: 125}, this.MARGIN.LEFT + 44, 4, 9.5);
     doc.text('4', this.MARGIN.LEFT + 4 , 127, { align: 'center' });
     this.justifyText(doc,
       '¿Contribuiste en actividades de protección al medio ambiente?', 
       {x: this.MARGIN.LEFT + 10, y: 135}, this.MARGIN.LEFT + 44, 4, 9.5);
     doc.text('5', this.MARGIN.LEFT + 4 , 137, { align: 'center' });
     this.justifyText(doc,
       '¿Cómo consideras que las competencias que adquiriste en la escuela contribuyeron a atender asertivamente las actividades de servicio social? ',
       {x: this.MARGIN.LEFT + 10, y: 145}, this.MARGIN.LEFT + 44, 4, 9);
     doc.text('6', this.MARGIN.LEFT + 4 , 153, { align: 'center' });
     this.justifyText(doc,
       '¿Consideras que sería factible continuar con este proyecto de Servicio Social a un proyecto de Residencias Profesionales, proyecto integrador, proyecto de investigación o desarrollo tecnológico? ',
       {x: this.MARGIN.LEFT + 10, y: 167}, this.MARGIN.LEFT + 44, 4, 9);
     doc.text('7', this.MARGIN.LEFT + 4 , 177, { align: 'center' });
     this.justifyText(doc,
      '¿Recomendarías a otro estudiante realizar su Servicio Social en la dependencia donde lo realizaste? ',
      {x: this.MARGIN.LEFT + 10, y: 193}, this.MARGIN.LEFT + 44, 4, 9);
    doc.text('8', this.MARGIN.LEFT + 4 , 197, { align: 'center' });
    
    // doc.setFontSize(9.5);
    this.justifyText(doc,
        `Observaciones: ${this.lastSelfEvaluation.observations}` ,
        {x: this.MARGIN.LEFT + 3, y: 208}, 162, 4, 10);
        // Nombre, No. de control y firma del prestador de Servicio Social
      doc.text(`${this.lastSelfEvaluation.studentName}, ${this.lastSelfEvaluation.control}`, this.WIDTH/2 , 233, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`Documento firmado electrónicamente por ${this.lastSelfEvaluation.studentName}, el ${moment().format('D [de] MMMM [de] YYYY [a las] h:mm a')}`, this.WIDTH/2 , 238, { align: 'center' });
      doc.setFontSize(10);
      doc.line(this.MARGIN.LEFT +12, 240, this.MARGIN.LEFT + 170 , 240);
      doc.text('Nombre, No. de control y firma del prestador de Servicio Social', this.WIDTH/2, 245, { align: 'center' });
      doc.text('c.c.p. Oficina de Servicio Social ', this.MARGIN.LEFT + 3, 250, { align: 'left' });
      
      
      // Footer
      doc.setFont(this.FONT, 'Bold');
      doc.setFontSize(8);
      doc.text('Código ITT-POC-08-10', this.MARGIN.LEFT + 10, 262, { align: 'left' });
      doc.text('Revisión: 1', (this.WIDTH / 2 ) + 50, 262, { align: 'left' });
      doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', this.MARGIN.LEFT + 10, 267, { align: 'left' });
  
      //lineas y rectangulos
      doc.rect(this.MARGIN.LEFT -2, 77, this.WIDTH - (2 * this.MARGIN.RIGHT) + 4, 177); // rectangulo completo
      doc.rect(this.MARGIN.LEFT +76, 72, (this.WIDTH - (2 * this.MARGIN.RIGHT) + 4)-(78), 5); // primer rectangulo
      //Lineas horizontales
      doc.line(this.MARGIN.LEFT -2, 84, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 84);
      doc.line(this.MARGIN.LEFT -2, 93, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 93);
      doc.line(this.MARGIN.LEFT -2, 107, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 107);
      doc.line(this.MARGIN.LEFT -2, 121, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 121);
      doc.line(this.MARGIN.LEFT -2, 131, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 131);
      doc.line(this.MARGIN.LEFT -2, 141, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 141);
      doc.line(this.MARGIN.LEFT -2, 163, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 163);
      doc.line(this.MARGIN.LEFT -2, 189, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 189);
      doc.line(this.MARGIN.LEFT -2, 203, this.WIDTH - (this.MARGIN.RIGHT) + 2 , 203);
      //Lineas verticales
      doc.line(this.MARGIN.LEFT + 8, 77, this.MARGIN.LEFT + 8, 203);
      doc.line(this.MARGIN.LEFT + 76, 77, this.MARGIN.LEFT + 76, 203);
      
      doc.line(this.MARGIN.LEFT + 98, 77, this.MARGIN.LEFT + 98, 203);
      doc.line(this.MARGIN.LEFT + 120, 77, this.MARGIN.LEFT + 120, 203);
      doc.line(this.MARGIN.LEFT + 136, 77, this.MARGIN.LEFT + 136, 203);
      doc.line(this.MARGIN.LEFT + 155, 77, this.MARGIN.LEFT + 155, 203);
      
  
      /*
      doc.setFont(this.FONT, 'Bold');
      doc.setTextColor(189, 189, 189);
      doc.setFontSize(8);
      doc.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
      doc.text('Código ITT-POC-08-05', (this.WIDTH / 2), 262, { align: 'center' });
      doc.text('Rev. 0', (this.WIDTH / 2), 267, { align: 'center' });
      doc.text('Referencia a la Norma ISO 9001:2015   8.2.3', (this.WIDTH / 2), 272, { align: 'center' });
      */
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
