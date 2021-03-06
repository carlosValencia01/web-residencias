import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { IBoss } from './boss.model';
import { iRequest } from './request.model';

moment.locale('es');

export class uRequest {
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
  private JDeptoDiv: IBoss;
  private CDeptoDiv: IBoss;
  private JDeptoEsc: IBoss;
  private Director: IBoss;
  private bosses: any;
  private _qrCode: any;
  private _stamp: any;

  constructor(
    public _request: iRequest,
    public _getImage: ImageToBase64Service,
    public _CookiesService: CookiesService,
    public juryGender?: any,
    public studentGender?: string,
    public careersPerBook?: number,
  ) {
    this.bosses = this._CookiesService.getBosses();
    this.JDeptoDiv = this.bosses.JDeptoDiv;
    this.CDeptoDiv = this.bosses.CDeptoDiv;
    this.JDeptoEsc = this.bosses.JDeptoEsc;
    this.Director = this.bosses.Director;

    this._getImageToPdf();
  }

  public setRequest(request: iRequest) {
    this._request = request;
  }

  public setCode(qrCode: any, eStamp: any) {
    this._qrCode = qrCode;
    this._stamp = eStamp;
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

  public documentSend(file: eFILES, qrCode?: any, eStamp?: any) {
    let document;
    let binary;
    switch (file) {
      case eFILES.SOLICITUD: {
        document = this.protocolActRequest().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eFILES.REGISTRO: {
        document = this.projectRegistrationOffice(qrCode, eStamp).output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eFILES.INCONVENIENCE: {
        document = this.noInconvenience(qrCode, eStamp).output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eFILES.OFICIO: {
        document = this.notificationOffice(qrCode, eStamp).output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eFILES.JURAMENTO_ETICA: {
        document = this.professionalEthicsAndCode().output('arraybuffer');
        binary = this.bufferToBase64(document);
        break;
      }
      case eFILES.ACTA_EXAMEN: {
        document = this.testReport(true).output('arraybuffer');
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

  public protocolActRequest(isPreview: boolean = true): jsPDF {
    const doc = this.newDocumentTec();

    const sentHistory = this._request.history.filter(x => x.phase === (isPreview ? 'Capturado' : 'Enviado') && x.status === (isPreview ? 'Accept' : 'None')).reverse()[0];
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    doc.text('SOLICITUD   DEL   ESTUDIANTE', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('PARA  LA TITULACIÓN  INTEGRAL', (this.WIDTH / 2), 40, { align: 'center' });

    // Fecha
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(11);
    this.addTextRight(doc, `Tepic, Nayarit, ${moment(sentHistory ? sentHistory.achievementDate : new Date()).format('LLL')}`, 50);
    // Saludos
    doc.setFont(this.FONT, 'Bold');
    const jefe = this.JDeptoDiv.name;
    doc.text(jefe, this.MARGIN.LEFT, 60, { align: 'left' });
    let positionGender = this.JDeptoDiv.gender === 'FEMENINO' ? 'JEFA' : 'JEFE';
    doc.text(`${positionGender} DE LA DIVISIÓN DE ESTUDIOS PROFESIONALES`, this.MARGIN.LEFT, 65, { align: 'left' });
    doc.text('P R E S E N T E', this.MARGIN.LEFT, 70, { align: 'left' });
    doc.setFont(this.FONT, 'Bold');
    this.addTextRight(doc, this.addArroba(`AT´N. ${this.CDeptoDiv.name}`), 80);
    positionGender = this.CDeptoDiv.gender === 'FEMENINO' ? 'COORDINADORA' : 'COORDINADOR';
    this.addTextRight(doc, this.addArroba(`${positionGender} DE APOYO A TITULACIÓN O EQUIVALENTE`), 85);

    doc.setFont(this.FONT, 'Normal');
    doc.text(doc.splitTextToSize('Por medio del presente solicito autorización para iniciar trámite de registro del ' +
      'proyecto de titulación integral:', 185), this.MARGIN.LEFT, 95, { align: 'left' });
    const nameProjectRows: Array<string> = doc.splitTextToSize(this._request.projectName, 145);
    this.addTable(doc, [
      ['Nombre:', this._request.student.fullName],
      ['Carrera:', this._request.student.career],
      ['No. de control:', this._request.student.controlNumber],
      ['Nombre del proyecto:', nameProjectRows.join(' ')],
      ['Opción titulación:', this._request.titulationOption],
      ['Producto:', this._request.product]
    ], 105, undefined, 9, false, { 0: { cellWidth: 35 }, 1: { cellWidth: 100 }, 2: { cellWidth: 0 } });
    const nameProjectLines = (nameProjectRows.length - 1) * 3.6;
    doc.setFont(this.FONT, 'Normal');
    doc.text('En espera de la aceptación de esta solicitud, quedo a sus órdenes.', this.MARGIN.LEFT,
      153 + nameProjectLines, { align: 'left' });
    doc.setFont(this.FONT, 'Bold');
    doc.text(this._request.student.fullName, (this.WIDTH / 2), 250, { align: 'center' });
    // doc.setFont(this.FONT, 'Normal');
    // this.addTable(doc, [
    //     ['Teléfono particular o de contacto: ', this._request.telephone],
    //     ['Correo electrónico del estudiante: ', this._request.email]
    // ], 235);
    return doc;
  }

  public projectRegistrationOffice(qrCode?, eStamp?): jsPDF {
    const doc = this.newDocumentTec();
    const registerHistory = this._request.history
      .filter(x => x.phase === 'Verificado' && (x.status === 'Accept' || x.status === 'Aceptado'))[0];
    doc.setTextColor(0, 0, 0);
    // Title
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    doc.text('FORMATO DE REGISTRO DE PROYECTO', (this.WIDTH / 2), 35, { align: 'center' });
    doc.text('PARA LA TITULACIÓN INTEGRAL', (this.WIDTH / 2), 40, { align: 'center' });

    doc.setFont(this.FONT, 'Normal');
    doc.text('Asunto: Registro de proyecto para la titulación integral', (this.WIDTH / 2.3), 52, { align: 'left' });

    // Saludos
    doc.setFont(this.FONT, 'Bold');
    // doc.text('LIC. LAURA ELENA CASILLAS CASTAÑEDA', this.MARGIN.LEFT, 62);
    doc.text(`${this.JDeptoDiv.name}`, this.MARGIN.LEFT, 62);
    const positionGender = this.JDeptoDiv.gender === 'FEMENINO' ? 'JEFA' : 'JEFE';
    doc.text(`${this.letterCapital(positionGender)} de la División de Estudios Profesionales`, this.MARGIN.LEFT, 67, { align: 'left' });
    doc.text('P R E S E N T E', this.MARGIN.LEFT, 72, { align: 'left' });

    doc.setFont(this.FONT, 'Normal');
    doc.text(this._request.department.name, this.MARGIN.LEFT, 83, { align: 'left' });
    doc.text(`Lugar: Tepic, Nayarit  Fecha: ${
      moment(registerHistory ? (registerHistory.achievementDate || new Date()) : new Date()).format('LL')
      }`, this.MARGIN.LEFT, 88, { align: 'left' });
    const nameProjectRows: Array<String> = doc.splitTextToSize(this._request.projectName, 150);
    this.addTable(doc, [
      ['Nombre del proyecto:', nameProjectRows.join(' ')],
      ['Nombre(s) del (de los) asesor(es):', this._request.adviser.name],
      ['Número de estudiantes:', this._request.noIntegrants]
    ], 93, undefined, 9);

    const nameProjectLines = 3.6 * (nameProjectRows.length - 1);
    const integrantsLines = 9 * (this._request.noIntegrants - 1);
    const observationRows: Array<String> = doc.splitTextToSize(registerHistory ? (registerHistory.observation || '') : '', 180);
    const observationsLines = 5 * observationRows.length;

    doc.text('Datos del (de los) estudiante(s):', this.MARGIN.LEFT, 123 + nameProjectLines, { align: 'left' });
    const students: Array<Object> = [];
    students.push(['Nombre', 'No. de control', 'Carrera']);
    students.push([this._request.student.fullName, this._request.student.controlNumber, this._request.student.career]);
    if (this._request.noIntegrants > 1) {
      this._request.integrants.forEach(e => {
        students.push([e.name, e.controlNumber, e.career]);
      });
    }
    this.addTable(doc, students, 125 + nameProjectLines, undefined, 9, false,
      { 0: { cellWidth: 80 }, 1: { cellWidth: 20 }, 2: { cellWidth: 80 } });

    doc.setFontSize(9);
    doc.rect(this.MARGIN.LEFT, 150 + integrantsLines + nameProjectLines, this.WIDTH
      - (this.MARGIN.RIGHT + this.MARGIN.LEFT - 6), 7 + observationsLines);
    doc.text('Observaciones: ', this.MARGIN.LEFT + 3, 154 + integrantsLines + nameProjectLines, { align: 'left' });
    doc.text(doc.splitTextToSize(registerHistory ? (registerHistory.observation || '') : '', 180), this.MARGIN.LEFT + 3,
      160 + integrantsLines + nameProjectLines, { align: 'left' });

    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    const qrwidth = 50;
    const qrHeight = 50;
    doc.addImage(((typeof (this._qrCode) !== 'undefined') ? this._qrCode : qrCode), 'PNG',
      this.MARGIN.LEFT - 5, this.HEIGHT - (this.MARGIN.BOTTOM + qrHeight), qrwidth, qrHeight);
    doc.text(doc.splitTextToSize(((typeof (this._stamp) !== 'undefined') ? this._stamp : eStamp) || '',
      this.WIDTH - (this.MARGIN.LEFT + this.MARGIN.RIGHT + (qrwidth - 5))),
      this.MARGIN.LEFT + (qrwidth - 5), this.HEIGHT - (this.MARGIN.BOTTOM + 10));

    return doc;
  }

  public noInconvenience(qrCode?, eStamp?): jsPDF {
    const doc = this.newDocumentTec();
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize('CONSTANCIA DE NO INCONVENIENCIA PARA EL ACTO DE RECEPCIÓN PROFESIONAL', 150),
      (this.WIDTH / 2), 65, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Normal');
    const date = new Date();
    doc.text(`Tepic, Nayarit a ${moment(date).format('LL')}`, this.MARGIN.LEFT, 100, { align: 'left' });

    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    doc.text('C. ' + this._request.student.fullName, (this.WIDTH / 2), 115, { align: 'center' });
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(10);
    // tslint:disable-next-line: max-line-length
    this.justifyText(doc, 'Me permito informarle de acuerdo a su solicitud, que no existe inconveniente para que pueda Ud. Presentar su Acto de Recepción Profesional, ya que su expediente quedó integrado para tal efecto.', { x: this.MARGIN.LEFT, y: 130 }, 180, 5, 10);
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(11);
    doc.text('ATENTAMENTE', this.MARGIN.LEFT, 155, { align: 'left' });
    doc.text(this.JDeptoEsc.name, this.MARGIN.LEFT, 170, { align: 'left' }); // Cambiar de forma dinámica
    doc.text('JEFE DEL DEPARTAMENTO DE SERVICIOS ESCOLARES', this.MARGIN.LEFT, 176, { align: 'left' });

    doc.addImage(qrCode, 'PNG', this.MARGIN.LEFT - 5, 195, 50, 50);
    doc.text(doc.splitTextToSize(eStamp || '', this.WIDTH - (this.MARGIN.LEFT + this.MARGIN.RIGHT + 45)), this.MARGIN.LEFT + 45, 235);

    doc.setFontSize(11);
    doc.text('"Sabiduría Tecnológica, Pasión de nuestro Espíritu" ®', this.MARGIN.LEFT, 186, { align: 'left' });
    doc.text('Clave del instituto 18DIT0002Z', this.MARGIN.LEFT, 196, { align: 'left' });

    return doc;
  }

  public professionalEthicsAndCode(): jsPDF {
    const doc = this.newDocumentTec(false, false);
    this._professionalEthicsOath(doc);
    doc.addPage();
    this._codeProfessionalEthics(doc);
    return doc;
  }

  private _professionalEthicsOath(doc: jsPDF) {
    const initialHeight = 35;
    const lineHeight = 7;
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(18);
    this._drawUnderlineText(doc, 'JURAMENTO DE ÉTICA PROFESIONAL', initialHeight, 'center');
    doc.setFontSize(14);
    this._drawUnderlineText(doc, `YO: ${this._request.student.fullName}`, initialHeight + (lineHeight * 3), 'center');
    this._drawUnderlineText(doc, `COMO: ${this._request.grade}`, initialHeight + (lineHeight * 5), 'center');
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(17);
    // tslint:disable-next-line:max-line-length
    this.justifyText(doc, `DEDICO MIS CONOCIMIENTOS PROFESIONALES AL PROGRESO Y MEJORAMIENTO DEL BIENESTAR HUMANO, ME COMPROMETO A DAR UN RENDIMIENTO MÁXIMO, A PARTICIPAR TAN SOLO EN EMPRESAS DIGNAS, A VIVIR Y TRABAJAR DE ACUERDO CON LAS LEYES PROPIAS DEL HOMBRE Y EL MÁS ELEVADO NIVEL DE CONDUCTA PROFESIONAL, A PREFERIR EL SERVICIO AL PROVECHO, EL HONOR Y LA CALIDAD PROFESIONAL A LA VENTAJA PERSONAL, EL BIEN PÚBLICO A TODA CONSIDERACIÓN, CON RESPETO Y HONRADEZ HAGO EL PRESENTE JURAMENTO.`,
      { x: this.MARGIN.LEFT + 15, y: initialHeight + (lineHeight * 9) },
      (this.WIDTH - ((this.MARGIN.LEFT + 13) + (this.MARGIN.RIGHT + 13))), 7, 17);
    doc.setFontSize(14);
    this._drawCenterTextWithLineUp(doc, 'FIRMA', initialHeight + (lineHeight * 26.5));
    doc.text(moment(this._request.proposedDate).format('LL').toUpperCase(), this.MARGIN.LEFT + 15, initialHeight + (lineHeight * 31));
  }

  private _codeProfessionalEthics(doc: jsPDF) {
    const initialHeight = 30;
    const lineHeight = 7;
    const startLine = this.MARGIN.LEFT + 10;
    const endLine = this.MARGIN.RIGHT + 10;
    const lineWidth = this.WIDTH - (startLine + endLine);
    const rules = [
      `I.- LAS NORMAS MÁS ELEVADAS DE INTEGRIDAD Y LIMPIA CONDUCTA DEBERÁN GUIARLOS EN TODAS SUS RELACIONES.`,
      `II.- MANTENDRÁ EN TODO MOMENTO ANTE EL PÚBLICO LA DIGNIDAD DE LA PROFESIÓN EN GENERAL Y LA REPUTACIÓN DEL INSTITUTO.`,
      `III.- DEBE EVITAR Y DESALENTAR DECLARACIONES SENSACIONALISTAS, EXAGERADAS Y SIN GARANTÍA.`,
      // tslint:disable-next-line:max-line-length
      `IV.- REHUSARÁ COMPROMETERSE, CUALQUIERA QUE SEA LA REMUNERACIÓN, EN TRABAJOS QUE CREAN NO SERÁN BENEFICIOSOS PARA SUS CLIENTES, A NO SER QUE ADVIERTAN PRIMERO A ESTOS SOBRE LA IMPROBABILIDAD DE ÉXITO DE LOS RESULTADOS.`,
      // tslint:disable-next-line:max-line-length
      `V.- MANTENDRÁ EL PRINCIPIO DE QUE LOS HONORARIOS IRRAZONABLEMENTE BAJOS POR LABORES PROFESIONALES, PROPENDEN A UN TRABAJO INFERIOR Y SIN GARANTÍA.`,
      `VI.- RECHAZARÁ LA PRESTACIÓN DE SU NOMBRE A EMPRESAS EN ENTREDICHO.`,
      // tslint:disable-next-line:max-line-length
      `VII.- SERÁ CONSERVADOR EN TODOS SUS PRESUPUESTOS, INFORMES, TESTIMONIOS, ETC. PARTICULARMENTE EN LOS QUE SE RELACIONEN CON LA PROMOCIÓN O IMPULSIÓN DE EMPRESAS.`,
      `VIII.- NO ACEPTARÁ NINGÚN CARGO CONTRARIO A LA LEY O AL BIENESTAR PÚBLICO.`,
      // tslint:disable-next-line:max-line-length
      `IX.- CUANDO UN TITULO_DE_GRADO*, EMPRENDA TRABAJOS PARA OTROS, EN RELACIÓN CON LOS CUALES HAYA REALIZADO ASESORÍAS, MEJORAS O ACTIVIDADES EMPRESARIALES, SERÁ PREFERIBLE QUE CONSIGA UN ACUERDO QUE CONSIDERE DE SU PROPIEDAD.`,
      // tslint:disable-next-line:max-line-length
      `X.- UN TITULO_DE_GRADO*, NO PUEDE ACEPTAR HONORABLEMENTE REMUNERACIONES, COMPENSACIONES FINANCIERAS NI NADA SEMEJANTE MÁS QUE DE UNA SOLA DE LAS PARTES INTERESADAS, A NO SER QUE TENGA EL CONSENTIMIENTO DE TODAS LAS DEMÁS.`,
      // tslint:disable-next-line:max-line-length
      `XI.- UN TITULO_DE_GRADO* NO ACEPTARÁ COMPENSACIÓN DIRECTA NI INDIRECTA POR CUALQUIER, NI POR CONSULTA, NI OPERACIÓN DE PARTES QUE TRATEN CON SU CLIENTE O EMPRESARIO, SIN EL CONSENTIMIENTO O CONOCIMIENTO DE ÉSTE.`,
      // tslint:disable-next-line:max-line-length
      `XII.- CUANDO UN TITULO_DE_GRADO* SEA CONSULTADO PARA DECIDIR SOBRE EL USO DE PROCEDIMIENTOS EN LOS QUE TENGAN ALGÚN INTERÉS FINANCIERO DEBERÁ ESTABLECERSE CLARAMENTE SU SITUACIÓN EN LA MATERIA, ANTES DE COMPROMETERSE.`,
      // tslint:disable-next-line:max-line-length
      `XIII.- UN TITULO_DE_GRADO*, DEBE ESFORZARSE EN TODO MOMENTO PARA ACREDITAR TRABAJOS A QUIENES, TAN LEJOS COMO SU CONOCIMIENTO ALCANCE SEAN LOS AUTORES REALES DE ELLOS.`,
      // tslint:disable-next-line:max-line-length
      `XIV.- NO ADMITIRÁ ANUNCIOS INDIGNOS, SENSACIONALES NI ENGAÑOS, ASÍ COMO EL USO DE NOMBRES O FOTOGRAFÍAS DE LOS INTEGRANTES DEL INSTITUTO COMO AYUDA DE TALES ANUNCIOS, Y LA UTILIZACIÓN DEL NOMBRE DE ÉSTE INSTITUTO EN RELACIÓN CON ELLOS NO SE TOLERARÁ.`
    ];
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(14);
    doc.text('SECRETARÍA DE EDUCACIÓN PÚBLICA', this.WIDTH / 2, initialHeight, { align: 'center' });
    doc.setFont(this.FONT, 'Bold');
    doc.text('TECNOLÓGICO NACIONAL DE MÉXICO', this.WIDTH / 2, initialHeight + lineHeight, { align: 'center' });
    doc.setFontSize(16);
    this._drawUnderlineText(doc, 'CÓDIGO DE ÉTICA PROFESIONAL', initialHeight + (lineHeight * 4), 'center');
    this._drawUnderlineText(doc, `${this._request.grade}`, initialHeight + (lineHeight * 5), 'center');
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(12);
    doc.text('EL INSTITUTO CONFÍA EN QUE LAS REGLAS SIGUIENTES GUIARÁN LOS ACTOS DE SUS EGRESADOS:',
      startLine, initialHeight + (lineHeight * 8), { maxWidth: lineWidth }, null, 'justify');
    let totalLines = 9.5;
    rules.slice(0, 14).forEach((rule, index, array) => {
      const ruleData = rule.replace('TITULO_DE_GRADO*', this._request.grade);
      const linesRule = Math.ceil(ruleData.length / 60);
      totalLines += 1.5;
      let y = initialHeight + (lineHeight * totalLines);
      if (this._changePage(this.HEIGHT - this.MARGIN.BOTTOM, y, y + (lineHeight * linesRule))) {
        doc.addPage();
        totalLines = 0;
        y = initialHeight + (lineHeight * totalLines);
      }
      this.justifyText(doc, ruleData, { x: startLine, y: y }, lineWidth, 7, 12);
      totalLines += linesRule;
    });
  }

  public projectReleaseNew(): jsPDF {
    let tmpDate = new Date(this._request.proposedDate);
    tmpDate.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
    const doc = this.newDocumentTec();
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(7);
    doc.text(`${this.ENCABEZADO}`, (this.WIDTH / 2), 45, { align: 'center' });
    doc.setFontSize(8);
    doc.text('FORMATO DE LIBERACIÓN DEL PROYECTO PARA LA TITULACIÓN INTEGRAL', (this.WIDTH / 2), 52, { align: 'center' });
    this.addTextRight(doc, `Tepic, Nayarit; ${moment(tmpDate).format('LL')}`, 58);
    this.addTextRight(doc, 'ASUNTO: @LIBERACIÓN@ @DE@ @PROYECTO@', 64);
    this.addTextRight(doc, '@PARA@ @LA@ @TITULACIÓN@ @INTEGRAL@', 68);
    doc.setFont(this.FONT, 'Bold');
    // doc.text("LIC. LAURA ELENA CASILLAS CASTAÑEDA", this.MARGIN.LEFT, 74);
    doc.text(`${this.JDeptoDiv.name}`, this.MARGIN.LEFT, 74);
    doc.setFont(this.FONT, 'Normal');
    let positionGender = this.JDeptoDiv.gender === 'FEMENINO' ? 'JEFA' : 'JEFE';
    doc.text(`${positionGender} DE LA DIVISIÓN DE ESTUDIOS PROFESIONALES`, this.MARGIN.LEFT, 78);
    doc.text("PRESENTE", this.MARGIN.LEFT, 82);
    this.addTextRight(doc, `CON AT’N.: ${this.addArroba("COORD. DE TITULACIÓN O EQUIVALENTE")}`, 86);
    doc.setFont(this.FONT, 'Normal');
    doc.text("Por este medio le informo que ha sido liberado el siguiente proyecto para la Titulación Integral:", this.MARGIN.LEFT, 94);
    const rows: Array<string> = doc.splitTextToSize(this._request.projectName, 150);
    this.addTable(doc, [
      ['a) Nombre del egresado:', this._request.student.fullName],
      ['b) Carrera:', this._request.student.career],
      ['c) No. Control:', this._request.student.controlNumber],
      ['d) Nombre del Proyecto:', rows.join(' ')],
      ['e) Producto:', this._request.product]
    ], 100, this.MARGIN.LEFT, 8, true);

    const incremento = (rows.length - 1) * 3.2;
    // tslint:disable-next-line: max-line-length
    doc.text("Agradezco de antemano su valioso apoyo en esta importante actividad para la formación profesional de nuestros egresados.", this.MARGIN.LEFT, (144 + incremento));
    // tslint:disable-next-line: max-line-length

    doc.setFontSize(9);
    doc.setFont(this.FONT, 'Bold');
    doc.text("ATENTAMENTE", this.MARGIN.LEFT, (154 + incremento));
    doc.setFontSize(6);
    doc.text("Excelencia en Educación Tecnológica®", this.MARGIN.LEFT, (158 + incremento));
    doc.text("Sabiduría Tecnológica, Pasión de nuestro espíritu®", this.MARGIN.LEFT, (162 + incremento));

    doc.setFontSize(9);
    doc.setFont(this.FONT, 'Bold');
    doc.text(this._request.department.boss, this.MARGIN.LEFT, (188 + incremento));
    doc.setFont(this.FONT, 'Normal');
    doc.text("JEFE DE " + this._request.department.name, this.MARGIN.LEFT, (192 + incremento));

    doc.setDrawColor(0, 0, 0);
    const widthRect: number = (this.WIDTH - (this.MARGIN.RIGHT + this.MARGIN.LEFT));
    const heightRect: number = this.HEIGHT - (185 + this.MARGIN.BOTTOM);
    const widthLine: number = widthRect / 4;
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);

    let line = this._request.jury[0].name.split('').map((x) => { return '_'; }).join('');
    const sizeAdvisory = doc.getTextWidth(`Asesor: ${this._request.jury[0].name}`) - doc.getTextWidth('Firma: ');
    let sizeLine;
    do {
      line += "_";
      sizeLine = doc.getTextWidth(line);
    } while (sizeLine < sizeAdvisory);
    doc.text(`Firma: ${line}`, this.WIDTH / 2, 203 + (heightRect / 2), { align: "center" });
    doc.text(`Asesor: ${this._request.jury[0].name}`, this.WIDTH / 2, 207 + (heightRect / 2), { align: "center" });
    let appointment: Date = new Date(this._request.proposedDate);
    appointment.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
    doc.setFontSize(9);
    // tslint:disable-next-line: max-line-length
    doc.text(`NOTA: Se le solicita que la fecha del acto sea programado en el horario de las ${moment(appointment).format('LT')} hrs.`, this.MARGIN.LEFT, heightRect + 182);
    return doc;
  }

  public notificationAdvisory(officeNumber: string): jsPDF {
    const doc = this.newDocumentTec();
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(7);
    doc.text(`${this.ENCABEZADO}`, (this.WIDTH / 2), 45, { align: 'center' });
    doc.setFontSize(10);
    this.addTextRight(doc, `Tepic, Nayarit; ${moment(new Date()).format('LL')} `, 58);
    this.addTextRight(doc, `OFICIO No.${officeNumber} `, 63);
    this.addTextRight(doc, `ASUNTO: Asesor de Trabajo Profesional`, 70);
    doc.setFont(this.FONT, 'Bold');
    doc.text(`C.${this._request.adviser.name} `, this.MARGIN.LEFT, 75);
    doc.text('CATEDRÁTICO DE ESTE INSTITUTO', this.MARGIN.LEFT, 80);
    doc.text('PRESENTE', this.MARGIN.LEFT, 85);
    doc.setFont(this.FONT, 'Normal');

    let msn = `Me permito comunicarle que ha sido ratificado como @ASESOR@ del Trabajo Profesional con el nombre: ${this.addArroba(this._request.projectName)} `;
    const rows: Array<string> = doc.splitTextToSize(msn, 180);
    const increment: number = rows.length - 1;
    this.justifyText(doc, msn, { x: this.MARGIN.LEFT, y: 95 }, 180, 5, 10);
    msn = `Que presenta el(la) C. ${this.addArroba(this._request.student.fullName)} `;
    this.justifyText(doc, msn, { x: this.MARGIN.LEFT, y: 105 + (increment * 5) }, 180, 5, 10);
    msn = `Correspondiente a la opción ${this.addArroba(this._request.titulationOption)} ( ${this.addArroba(this._request.product)} )`;
    this.justifyText(doc, msn, { x: this.MARGIN.LEFT, y: 115 + (increment * 5) }, 180, 5, 10);
    msn = `Pasante de la carrera de ${this.addArroba(this._request.student.career)} `;
    this.justifyText(doc, msn, { x: this.MARGIN.LEFT, y: 130 + (increment * 5) }, 180, 5, 10);
    msn = `No. de control: ${this.addArroba(this._request.student.controlNumber)} `;
    this.justifyText(doc, msn, { x: this.MARGIN.LEFT, y: 140 + (increment * 5) }, 180, 5, 10);
    msn = `Sin más por el momento, me despido`;
    this.justifyText(doc, msn, { x: this.MARGIN.LEFT, y: 150 + (increment * 5) }, 180, 5, 10);

    doc.setFont(this.FONT, 'Bold');
    doc.text('ATENTAMENTE', this.MARGIN.LEFT, 185);
    doc.text('"SABIDURÍA TECNOLÓGICA, PASIÓN DE NUESTRO ESPÍRITU"®', this.MARGIN.LEFT, 190);

    doc.text(`${this._request.department.boss} `, this.MARGIN.LEFT, 230);
    doc.text(`${this._request.department.name} `, this.MARGIN.LEFT, 235);
    return doc;
  }

  public notificationOffice(qrCode?, eStamp?): jsPDF {
    let tmpDate = new Date(this._request.proposedDate);
    tmpDate.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
    const doc = this.newDocumentTec();
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(8);
    doc.text(`${this.ENCABEZADO} `, (this.WIDTH / 2), 35, { align: 'center' });
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);
    // doc.text('TEPIC, NAYARIT;', (this.WIDTH / 2), 55, { align: 'center' });
    this.addTextRight(doc, `TEPIC, NAYARIT; ${moment(new Date()).format('LL').toUpperCase()}`, 45)
    doc.text('ACTO DE RECEPCIÓN PROFESIONAL', (this.WIDTH / 2), 55, { align: 'center' });
    doc.text('INTEGRANTES DEL JURADO', (this.WIDTH / 2), 60, { align: 'center' });
    doc.setFont(this.FONT, 'Normal');
    doc.text(this.juryGender.president === 'MASCULINO' ? 'PRESIDENTE' : 'PRESIDENTA', this.MARGIN.LEFT, 65);
    this.addJury(doc, this._request.jury[0], 65); // 100,105,110
    doc.text(this.juryGender.secretary === 'MASCULINO' ? 'SECRETARIO' : 'SECRETARIA', this.MARGIN.LEFT, 80);
    this.addJury(doc, this._request.jury[1], 80); // 115,120,125
    doc.text('VOCAL', this.MARGIN.LEFT, 95);
    this.addJury(doc, this._request.jury[2], 95); // 130,135,140
    doc.text('VOCAL SUPLENTE', this.MARGIN.LEFT, 110);
    this.addJury(doc, this._request.jury[3], 110); // 145,150,155

    // tslint:disable-next-line: max-line-length
    // let contenido = `Por este conducto le informo que el Acto de Recepción Profesional de C. @ESTUDIANTE con número de control @NUMERO egresado del Instituto Tecnológico de Tepic, de la carrera de @CARRERA por la Opción, XI(TITULACIÓN INTEGRAL) INFORME TECNICO DE RESIDENCIA PROFESIONAL, con el proyecto @PROYECTO.El cual se realizará el día @FECHA , a las @HORA Hrs.En la Sala @LUGAR de este Instituto.`;
    let contenido = `Por este conducto le informo que el Acto de Recepción Profesional de@CIUDADANO C. @ESTUDIANTE con número de control @NUMERO @EGR del Instituto Tecnológico de Tepic, de la carrera de @CARRERA por la Opción, @OPCION @PRODUCTO, con el proyecto @PROYECTO El cual se realizará el día @FECHA, a las @HORA Hrs. En la Sala @LUGAR de este Instituto.`;

    contenido = contenido.replace('@CIUDADANO', this.studentGender === 'M' ? 'l' : ' la');
    contenido = contenido.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())} `);
    contenido = contenido.replace('@EGR', this.studentGender === 'M' ? 'egresado' : ' egresada');
    // contenido = contenido.replace('@ESTUDIANTE', `${this.addArroba('AGUSTIN BARAJAS VALDIVIA')} `);
    contenido = contenido.replace('@NUMERO', `${this.addArroba(this._request.student.controlNumber.toUpperCase())} `);
    contenido = contenido.replace('@CARRERA', `${this.addArroba(this._request.student.career.toUpperCase())} `);
    contenido = contenido.replace('@PROYECTO', `${this.addArroba(this._request.projectName.toUpperCase())}${this._request.projectName.substr(this._request.projectName.length - 1, 1) == '.' ? '' : '.'}`);
    // contenido = contenido.replace('@PROYECTO', `${this.addArroba('MÓDULO DE GENERACIÓN DE FIRMAS ELECTRÓNICAS, VALIDACIÓN DE DOCUMENTOS Y OPTIMIZACIÓN DE PROCEDIMIENTO DE TITULACIÓN')} `);
    contenido = contenido.replace('@OPCION', `${this.addArroba(this._request.titulationOption.toUpperCase())}`);
    contenido = contenido.replace('@PRODUCTO', `${this.addArroba(this._request.product.toUpperCase())} `);
    // tslint:disable-next-line: max-line-length
    contenido = contenido.replace('@FECHA', `${this.addArroba(`${tmpDate.getDate()} de ${this.letterCapital(moment(tmpDate).format('MMMM'))}`)}`);
    contenido = contenido.replace('@HORA', `${this.addArroba(moment(tmpDate).format('LT'))} `);
    contenido = contenido.replace('@LUGAR', `${this.addArroba(this._request.place.toUpperCase())} `);

    const lastParagraph = this.justifyText(doc, contenido, { x: this.MARGIN.LEFT, y: 130 }, 180, 5, 10);

    doc.text('Por lo que se le pide su puntual asistencia.', this.MARGIN.LEFT, lastParagraph.lastY + 8);
    doc.setFont(this.FONT, 'Bold');


    doc.text('ATENTAMENTE', this.MARGIN.LEFT, 223);
    doc.text(`${this.JDeptoDiv.name} `, this.MARGIN.LEFT, 228);
    let positionGender = this.JDeptoDiv.gender === 'FEMENINO' ? 'JEFA' : 'JEFE';
    doc.text(`${positionGender} DE LA DIV.DE EST.PROFESIONALES`, this.MARGIN.LEFT, 233);
    doc.addImage(qrCode, 'PNG', this.MARGIN.LEFT + 15, 235, 20, 20);
    doc.text(doc.splitTextToSize(eStamp || '', this.WIDTH - (this.MARGIN.LEFT + this.MARGIN.RIGHT + 50)), this.MARGIN.LEFT + 45, 245);
    return doc;
  }

  public juryDuty(duty: string, position: string, employee: string, juryGenderAndGrade?: any, studentGender?: string, bossGender?: string): jsPDF {
    const doc = this.newDocumentTec();

    let tmpDate = new Date(this._request.proposedDate);
    tmpDate.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(10);
    this.addTextRight(doc, `Tepic, Nayarit a ${moment(new Date()).format('LL').toUpperCase()} `, 45);
    this.addTextRight(doc, `OFICIO No. ${duty} `, 50);
    doc.setFont(this.FONT, 'Normal');
    // this.addTextRight(doc, `ASUNTO: ${ position } Acto de Recepcion Profesional`, 65);
    this.addTextRight(doc, `ASUNTO: Comisión, Acto de Recepción Profesional`, 65);
    doc.setFont(this.FONT, 'Bold');
    doc.text(`${juryGenderAndGrade.grade} ${employee.toUpperCase()} `, this.MARGIN.LEFT, 90);
    doc.text(`${juryGenderAndGrade.gender === 'MASCULINO' ? 'CATEDRÁTICO' : 'CATEDRÁTICA'} DE ESTE INSTITUTO`, this.MARGIN.LEFT, 95);
    doc.text(`P R E S E N T E`, this.MARGIN.LEFT, 100);
    // tslint:disable-next-line: max-line-length
    let contenido = `En atención a lo marcado por el Artículo 22 del Reglamento de Examen Profesional, me permito notificarle que ha sido @DESIGNED @PUESTO del Jurado del Acto de Recepción Profesional @STUDENT C. @ESTUDIANTE, @EGR de la Carrera de @CARRERA, por la opción @OPTION (@PRODUCT) con el proyecto @PROYECTO, quien presentará el Acto de Recepción Profesional el día @FECHA del presente año, a las @HORA hrs. en la Sala @LUGAR de este Instituto.`;
    contenido = contenido.replace('@DESIGNED', juryGenderAndGrade.gender === 'MASCULINO' ? 'designado' : 'designada');
    contenido = contenido.replace('@STUDENT', studentGender === 'M' ? 'del' : 'de la');
    contenido = contenido.replace('@EGR', studentGender === 'M' ? 'egresado' : 'egresada');
    contenido = contenido.replace('@OPTION', this._request.titulationOption.replace(' -', ','));
    contenido = contenido.replace('@PRODUCT', this._request.product);
    contenido = contenido.replace('@PUESTO', `${this.addArroba(position.toUpperCase())} `);
    contenido = contenido.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())}`);
    contenido = contenido.replace('@CARRERA', `${this.addArroba(this._request.student.career.toUpperCase())}`);
    contenido = contenido.replace('@PROYECTO', `${this.addArroba(this._request.projectName.toUpperCase())}`);
    // tslint:disable-next-line: max-line-length
    contenido = contenido.replace('@FECHA', `${this.addArroba(`${tmpDate.getDate()} de ${this.letterCapital(moment(tmpDate).format('MMMM'))}`)} `);
    contenido = contenido.replace('@HORA', `${this.addArroba(moment(tmpDate).format('LT'))} `);
    contenido = contenido.replace('@LUGAR', `${this.addArroba(this._request.place.toUpperCase())} `);
    const paragraph = this.justifyText(doc, contenido, { x: this.MARGIN.LEFT, y: 120 }, 180, 5, 10);
    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Bold');
    doc.text('A T E N T A M E N T E.', this.MARGIN.LEFT, paragraph.lastY + 25);
    doc.text('“SABIDURÍA TECNOLÓGICA, PASIÓN DE NUESTRO ESPÍRITU”®', this.MARGIN.LEFT, paragraph.lastY + 30);

    doc.text(this._request.department.boss, this.MARGIN.LEFT, paragraph.lastY + 55);

    const bossPosition = bossGender === 'MASCULINO' ? 'JEFE' : 'JEFA';
    doc.text(`${bossPosition} DEL ${this._request.department.name} `, this.MARGIN.LEFT, paragraph.lastY + 60);
    return doc;
  }

  public testReport(version: boolean, firmada?: boolean): jsPDF {
    const doc = this.newDocumentTec(true, false);
    const president = this.juryGender.president === 'MASCULINO' ? 'Presidente' : 'Presidenta';
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);
    doc.text('INSTITUTO TECNOLÓGICO DE TEPIC', ((this.WIDTH) / 2) + 14, 45, { align: 'center' });
    doc.text('CERTIFICACIÓN DE CONSTANCIA DE EXENCIÓN DE EXAMEN PROFESIONAL', (this.WIDTH / 2) + 13, 53, { align: 'center' });
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(8);
    let tmpDate = new Date();
    // tslint:disable-next-line: max-line-length
    let content = '@DIRECTOR del Instituto Tecnológico de Tepic, certifica que en el libro para Constancias de Exención de Examen Profesional, referente a @CAREERNUM de @CARRERA No. @LIBRO Autorizado el día @AUTORIZACION, por la @DIR del Tecnológico Nacional de México, se encuentra asentada en la foja número @NUMERO la constancia que a la letra dice:';
    content = content.replace('@DIRECTOR', this.Director.gender === 'MASCULINO' ? 'El suscrito Director' : 'La suscrita Directora');
    content = content.replace('@CAREERNUM', this.careersPerBook > 1 ? 'las carreras' : 'la carrera');
    content = content.replace('@CARRERA', this.letterCapital(this._request.registry.career));
    content = content.replace('@AUTORIZACION', moment(this._request.registry.date).format('LL'));
    content = version ? content.replace('@DIR', 'Dirección de Asuntos Escolares y Apoyo a Estudiantes') : content.replace('@DIR', 'Dirección de Servicios Escolares y Estudiantiles');
    content = content.replace('@NUMERO', this._request.registry.foja + '');
    content = content.replace('@LIBRO', this._request.registry.bookNumber + '');
    const firstP = this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: 60 }, 138, 4, 8);
    doc.ellipse(28, 90, 16, 20);
    // tslint:disable-next-line: max-line-length
    content = 'De acuerdo con el instructivo vigente de Titulación, que no tiene como requisito la sustentación del Examen Profesional para Efecto de obtención de Título, en las opciones VIII, IX y Titulación Integral, el Jurado HACE CONSTAR: que a@CIUDADANO C. @ESTUDIANTE con número de control @CONTROL @EGR del Instituto Tecnológico de Tepic, Clave 18DIT0002Z, que cursó la carrera de: @CARRERA.';
    content = content.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())}`);
    content = content.replace('@CONTROL', `${this.addArroba(this._request.student.controlNumber)} `);
    content = content.replace('@CIUDADANO', this.studentGender === 'M' ? 'l' : ' la');
    content = content.replace('@EGR', this.studentGender === 'M' ? 'egresado' : 'egresada');
    content = content.replace('@CARRERA', `${this.addArroba(this.letterCapital(this._request.student.career))}`);
    const secondP = this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: firstP.lastY + 5 }, 138, 4, 8);
    // tslint:disable-next-line: max-line-length
    this.justifyText(doc, 'Cumplió satisfactoriamente con lo estipulado en la opción: @Titulación@ @Integral.@', { x: this.MARGIN.LEFT + 32, y: secondP.lastY + 5 }, 138, 4, 8);

    // tslint:disable-next-line: max-line-length
    content = '@PRESIDENT del jurado le hizo saber a @SUSTENTANTE el resultado obtenido, el Código de Ética Profesional y le tomó la Protesta de Ley, una vez escrita, leída la firmaron las personas que en el acto protocolario intervinieron, para los efectos legales a que haya lugar, se asienta la presente en la ciudad de Tepic Nayarit el @día@ @HOY.';
    // tslint:disable-next-line: max-line-length
    content = content.replace('@PRESIDENT', president === 'Presidente' ? 'El presidente' : 'La presidenta');
    content = content.replace('@SUSTENTANTE', this.studentGender === 'M' ? 'el sustentate' : 'la sustentate');
    const proposedDate = new Date(this._request.proposedDate);
    content = content.replace('@HOY', `@${String(proposedDate.getDate())}@ @del@ @mes@ @${this.letterCapital(moment(proposedDate).format('MMMM'))}@ @del@ @Año@ @${proposedDate.getFullYear()}@`);
    const thirdP = this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: secondP.lastY + 10 }, 138, 4, 8);
    doc.setFont(this.FONT, 'Normal');
    doc.text('Rubrican', this.MARGIN.LEFT + 32, thirdP.lastY + 10, { align: 'left' });
    // tslint:disable-next-line: max-line-length
    this.justifyText(doc, `@${president}:@ ${this.letterCapital(this._request.jury[0].name)} `, { x: this.MARGIN.LEFT + 32, y: thirdP.lastY + 14 }, 180, 5, 8);
    doc.text(this.letterCapital(this._request.jury[0].title), this.MARGIN.LEFT + 32, thirdP.lastY + 18, { align: 'left' });
    doc.text(`No. Ced. Prof. : ${this._request.jury[0].cedula} `, this.MARGIN.LEFT + 32, thirdP.lastY + 22, { align: 'left' });

    // tslint:disable-next-line: max-line-length
    this.justifyText(doc, `@${this.juryGender.secretary === 'MASCULINO' ? 'Secretario' : 'Secretaria'}:@ ${this.letterCapital(this._request.jury[1].name)} `, { x: this.MARGIN.LEFT + 32, y: thirdP.lastY + 27 }, 180, 5, 8);
    doc.text(this.letterCapital(this._request.jury[1].title), this.MARGIN.LEFT + 32, thirdP.lastY + 31, { align: 'left' });
    doc.text(`No. Ced. Prof. : ${this._request.jury[1].cedula} `, this.MARGIN.LEFT + 32, thirdP.lastY + 35, { align: 'left' });

    this.justifyText(doc, `@Vocal:@ ${this.letterCapital(this._request.jury[2].name)} `, { x: this.MARGIN.LEFT + 32, y: thirdP.lastY + 40 }, 180, 5, 8);
    doc.text(this.letterCapital(this._request.jury[2].title), this.MARGIN.LEFT + 32, thirdP.lastY + 44, { align: 'left' });
    doc.text(`No. Ced. Prof. : ${this._request.jury[2].cedula} `, this.MARGIN.LEFT + 32, thirdP.lastY + 48, { align: 'left' });

    // tslint:disable-next-line: max-line-length
    const day = tmpDate.getDate() === 1 ? `al día 1` : `a los ${tmpDate.getDate()} días`;
    doc.text(`Se extiende esta certificación ${day} del mes ${this.letterCapital(moment(tmpDate).format('MMMM'))} del Año ${tmpDate.getFullYear()} `, this.MARGIN.LEFT + 32, 184, { align: 'left' });
    // let servicios = 'M.C. Israel Arjona Vizcaíno';
    // let director = 'LIC. MANUEL ÁNGEL URIBE VÁZQUEZ';
    let servicios = this.JDeptoEsc.name;
    let director = this.Director.name;
    doc.setFont(this.FONT, 'Bold');

    doc.text(`COTEJÓ`, this.MARGIN.LEFT + 32, 190, { align: 'left' });

    let positionGender = 'JEFE';
    // this.JDeptoDiv.gender === 'FEMENINO' ? 'JEFA' : 'JEFE';
    doc.text(`${this.letterCapital(positionGender)} del Departamento de Servicios Escolares`, this.MARGIN.LEFT + 32, 220, { maxWidth: 50, align: 'left' });
    // doc.text(this.gradeMax(this.JDeptoEsc)+' '+servicios, this.MARGIN.LEFT + 32, 226, { maxWidth: 50, align: 'left' });
    doc.text(servicios, this.MARGIN.LEFT + 32, 226, { maxWidth: 50, align: 'left' });

    if (firmada) {
      doc.addImage(this.serviceFirm, 'PNG', this.MARGIN.LEFT + 25, 198, 60, 20);
      doc.addImage(this.directorFirm, 'PNG', this.WIDTH / 2, 221, 60, 25);
    }

    doc.text(this.gradeMax(this.Director) + ' ' + director, this.WIDTH / 2, 240, { align: 'left' });
    doc.text(`Director`, (this.WIDTH / 2) + ((doc.getStringUnitWidth(director) * 72 / 25.6) / 2), 244, { maxWidth: 50, align: 'left' });
    return doc;
  }

  public testReportForTitulationNotIntegral(): jsPDF {
    const doc = this.newDocumentTec(true, false);

    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Bold');
    doc.setFontSize(10);
    doc.text('INSTITUTO TECNOLÓGICO DE TEPIC', ((this.WIDTH) / 2) + 14, 45, { align: 'center' });
    doc.text('CERTIFICACIÓN DE ACTA DE EXAMEN PROFESIONAL', (this.WIDTH / 2) + 13, 53, { align: 'center' });
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(8);
    let tmpDate = new Date();
    const titulationOption = this._request.titulationOption.split('-').join(' ');
    // tslint:disable-next-line: max-line-length
    let content = '@DIRECTOR del Instituto Tecnológico de Tepic, certifica que en el libro para Constancias de Exención de Examen Profesional, referente a @CAREERNUM de @CARRERA No. @LIBRO Autorizado el día @AUTORIZACION, por la Dirección de Servicios Escolares y Estudiantiles del Tecnológico Nacional de México, se encuentra asentada en la foja número @NUMERO la constancia que a la letra dice:';
    content = content.replace('@DIRECTOR', this.Director.gender === 'MASCULINO' ? 'El suscrito Director' : 'La suscrita Directora');
    content = content.replace('@CAREERNUM', this.careersPerBook > 1 ? 'las carreras' : 'la carrera');
    content = content.replace('@CARRERA', this.letterCapital(this._request.registry.career));
    content = content.replace('@AUTORIZACION', moment(this._request.registry.date).format('LL'));
    content = content.replace('@NUMERO', this._request.registry.foja + '');
    content = content.replace('@LIBRO', this._request.registry.bookNumber + '');
    const firstP = this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: 60 }, 138, 4, 8);
    doc.ellipse(28, 90, 16, 20);
    let tmpDateH = new Date(this._request.proposedDate).setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
    // tmpDateH.setHours( tmpDate);
    const tmpProposedD = moment(tmpDateH);

    const day = tmpProposedD.format('D');
    const month = tmpProposedD.format('MMMM');
    const year = tmpProposedD.format('YYYY');

    content = 'En la Ciudad de Tepic Nayarit @DAY @DATE siendo las @HOUR horas, se reunieron en la Sala de Titulación del Instituto Tecnológico de Tepic, clave 18DIT0002Z, el jurado integrado por:';

    content = content.replace('@DAY', this.addArroba(day === '1' ? `al día 1` : `a los ${day} días`));
    content = content.replace('@DATE', this.addArroba(`del mes de ${month} de ${year}`));
    content = content.replace('@HOUR', tmpProposedD.format('HH:mm'));

    this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: firstP.lastY + 5 }, 138, 4, 8);

    doc.setFont(this.FONT, 'Normal');
    const president = this.juryGender.president === 'MASCULINO' ? 'Presidente' : 'Presidenta';
    // tslint:disable-next-line: max-line-length
    this.justifyText(doc, `@${president}:@ ${this.letterCapital(this._request.jury[0].name)} `, { x: this.MARGIN.LEFT + 32, y: 98 }, 180, 5, 8);
    doc.text(this.letterCapital(this._request.jury[0].title), this.MARGIN.LEFT + 32, 102, { align: 'left' });
    doc.text(`No. Ced. Prof. : ${this._request.jury[0].cedula} `, this.MARGIN.LEFT + 32, 106, { align: 'left' });

    // tslint:disable-next-line: max-line-length

    this.justifyText(doc, `@${this.juryGender.secretary === 'MASCULINO' ? 'Secretario' : 'Secretaria'}:@ ${this.letterCapital(this._request.jury[1].name)} `, { x: this.MARGIN.LEFT + 32, y: 111 }, 180, 5, 8);
    doc.text(this.letterCapital(this._request.jury[1].title), this.MARGIN.LEFT + 32, 115, { align: 'left' });
    doc.text(`No. Ced. Prof. : ${this._request.jury[1].cedula} `, this.MARGIN.LEFT + 32, 119, { align: 'left' });

    this.justifyText(doc, `@Vocal:@ ${this.letterCapital(this._request.jury[2].name)} `, { x: this.MARGIN.LEFT + 32, y: 124 }, 180, 5, 8);
    doc.text(this.letterCapital(this._request.jury[2].title), this.MARGIN.LEFT + 32, 128, { align: 'left' });
    doc.text(`No. Ced. Prof. : ${this._request.jury[2].cedula} `, this.MARGIN.LEFT + 32, 132, { align: 'left' });

    content = 'Y de acuerdo con las disposiciones reglamentarias en vigor y la opción seleccionada: @OPTION, se procedió a efectuar el Acto de Recepción Profesional a@CIUDADANO C. @ESTUDIANTE, conforme al acta de nacimiento, número de control @CONTROL @EGR del Instituto Tecnológico de Tepic, pasante de la carrera de   @CARRERA.';
    content = content.replace('@OPTION', this.addArroba(titulationOption.replace(/\s+/g, ' ')));
    content = content.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())}`);
    content = content.replace('@EGR', this.studentGender === 'M' ? 'egresado' : 'egresada');
    content = content.replace('@CIUDADANO', this.studentGender === 'M' ? 'l' : ' la');
    content = content.replace('@CONTROL', `${this.addArroba(this._request.student.controlNumber)}`);
    content = content.replace('@CARRERA', `${this.addArroba(this.letterCapital(this._request.student.career))}`);
    const secondP = this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: 139 }, 138, 4, 8);


    content = 'El jurado tomando en cuenta el contenido del Trabajo Profesional cuyo tema es: ';
    this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: secondP.lastY + 5 }, 138, 4, 8);
    content = '@PROJECT';
    content = content.replace('@PROJECT', this.letterCapital(this._request.projectName.trim()));
    const proyRows = doc.splitTextToSize(this._request.projectName.trim(), 145);

    const proyPosition = this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: secondP.lastY + 10 }, 138, 4, (proyRows.length > 5 ? 6 : 8));
    content = ', y la réplica del mismo, dictaminó que fuera: @STATUS';
    content = content.replace('@STATUS', this.studentGender === 'M' ? this.addArroba('Aprobado') : this.addArroba('Aprobada'));

    const proyParagraph = this.justifyText(doc, content, { x: proyPosition.lastX - 1.6, y: proyPosition.lastY }, 129 - Math.floor(proyPosition.lastRowWidth), 4, 8, true);
    // tslint:disable-next-line: max-line-length


    const newH = tmpProposedD.add(this._request.duration, 'minutes');
    content = '@PRESIDENT del jurado le hizo saber a @SUSTENTANTE el resultado obtenido, el Código de Ética Profesional y le tomó la Protesta de Ley. Dándose por terminado el Acto a las @ENDH horas, y una vez escrita, leída y aprobada, fue firmada para constancia por las personas que en el acto intervinieron, para los efectos legales a que haya lugar se asienta la presente.'
    content = content.replace('@PRESIDENT', president === 'Presidente' ? 'El presidente' : 'La presidenta');
    content = content.replace('@SUSTENTANTE', this.studentGender === 'M' ? 'el sustentate' : 'la sustentate');
    content = content.replace('@ENDH', newH.format('HH:mm'));
    this.justifyText(doc, content, { x: this.MARGIN.LEFT + 32, y: proyParagraph.lastY + 5 }, 138, 4, 8);

    const today = tmpDate.getDate() === 1 ? `al día 1` : `a los ${tmpDate.getDate()} días`;
    doc.text(`Se extiende esta certificación ${today} del mes ${this.letterCapital(moment(tmpDate).format('MMMM'))} del Año ${tmpDate.getFullYear()} `, this.MARGIN.LEFT + 32, 209, { align: 'left' });
    // let servicios = 'M.C. Israel Arjona Vizcaíno';
    // let director = 'LIC. MANUEL ÁNGEL URIBE VÁZQUEZ';
    let servicios = this.JDeptoEsc.name;
    let director = this.Director.name;
    doc.setFont(this.FONT, 'Bold');

    doc.text(`COTEJÓ`, this.MARGIN.LEFT + 32, 215, { align: 'left' });

    // doc.addImage(this.serviceFirm, 'PNG', this.MARGIN.LEFT + 10, 198, 60, 20);
    let positionGender = this.JDeptoEsc.gender === 'FEMENINO' ? 'JEFA' : 'JEFE';
    doc.text(this.gradeMax(this.JDeptoEsc) + ' ' + servicios, this.MARGIN.LEFT + 32, 230, { maxWidth: 50, align: 'left' });
    doc.text(`${this.letterCapital(positionGender)} del Departamento de Servicios Escolares`, this.MARGIN.LEFT + 32, 234, { maxWidth: 50, align: 'left' });

    // doc.addImage(this.directorFirm, 'PNG', this.WIDTH / 2, 221, 60, 25);
    doc.text(`Director`, (this.WIDTH / 2) + ((doc.getStringUnitWidth(director) * 72 / 25.6) / 2) - 5, 247, { maxWidth: 50, align: 'left' });

    doc.text(this.gradeMax(this.Director) + ' ' + director, this.WIDTH / 2, this.HEIGHT - (this.MARGIN.BOTTOM), { align: 'left' });
    return doc;
  }

  public requestSummary(req) {
    let tmpDate;
    if (req.proposedDate) {
      tmpDate = new Date(req.proposedDate);
      tmpDate.setHours(req.proposedHour / 60, req.proposedHour % 60, 0, 0);
    }
    const doc = this.newDocumentTec(false, false);
    doc.setTextColor(0, 0, 0);
    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(req.student.fullName, 160), (this.WIDTH / 2), 35, { align: 'center' });
    doc.text(doc.splitTextToSize(req.student.controlNumber, 160), (this.WIDTH / 2), 40, { align: 'center' });
    doc.addImage(req.student.emailQr, 'PNG', (this.WIDTH / 2) - 30, 50, 60, 60);
    doc.text(doc.splitTextToSize(req.student.email, 160), (this.WIDTH / 2), 110, { align: 'center' });
    const splitedText = doc.splitTextToSize(`OPCIÓN DE TITULACIÓN: ${req.titulationOption}`, 160);
    doc.text(splitedText, (this.WIDTH / 2), 120, { align: 'center' });
    const newPosition = splitedText.length > 1 ? 135 : 130;
    doc.text(doc.splitTextToSize(`ENTREGABLE: ${req.product}`, 160), (this.WIDTH / 2), newPosition, { align: 'center' });
    doc.text(doc.splitTextToSize(`FECHA DE ACTO RECEPCIONAL: ${tmpDate ? moment(tmpDate).format('YYYY-MM-DD') : ''}`, 160), (this.WIDTH / 2), newPosition + 10, { align: 'center' });
    return doc;
  }

  private addJury(doc: jsPDF, jury: { title: string, name: string, cedula: number }, positionY) {
    doc.setFont(this.FONT, 'Bold');
    doc.text(doc.splitTextToSize(jury.title, 150), this.MARGIN.LEFT + 35, positionY);
    doc.text(jury.name, this.MARGIN.LEFT + 35, positionY + 5);
    doc.setFont(this.FONT, 'Normal');
    doc.text(`No.de Cédula Profesional: ${jury.cedula} `, this.MARGIN.LEFT + 35, positionY + 10);
  }
  // A una cadena de texto, le añade @ a cada palabra tanto al inicio y al final
  // Esto es para indicar que se le agregará texto en negritas
  private addArroba(Text: string): string {
    const text = Text.trim();
    return text.split(' ').map(word => { return '@' + word + '@'; }).join(' ');
  }

  private letterCapital(text: string): string {
    text = text.toLowerCase();
    if (text.trim().length > 0)
      return text.split(/\s+/).map((value) => { return value.replace(/^./, value[0].toUpperCase()) }).join(' ');
    return '';
  }

  // Alinea un texto a la derecha
  private addTextRight(doc: jsPDF, text: string, positionY: number) {
    // Obtengo el texto tal cual
    let tmpCount = doc.getTextWidth(text.split('@').join(''));
    let tmpPositionX = this.WIDTH - (this.MARGIN.RIGHT + tmpCount);
    let words: Array<string> = text.split(/\s+/);
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
    let aText: Array<string> = Text.split(/\s+/);
    // Indice global que indicará la palabra a dibujar
    let iWord: number = 0;
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
    let lSummation: number = 0;
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
  private addTable(document: jsPDF, data: Array<Object>, startY: number, startX: number = this.MARGIN.LEFT,
    Size: number = 11, isBold: boolean = false, columnStyles = { 0: { cellWidth: 30 }, 1: { cellWidth: 100 }, 2: { cellWidth: 0 } }) {
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

  private gradeMax(employee): String {
    if (typeof (employee.grade) === 'undefined' || employee.grade.length === 0) {
      return '';
    }
    let isGrade = employee.grade.find(x => x.level === 'DOCTORADO');

    if (typeof (isGrade) !== 'undefined') {
      return isGrade.abbreviation;
    }

    isGrade = employee.grade.find(x => x.level === 'MAESTRÍA');
    if (typeof (isGrade) !== 'undefined') {
      return isGrade.abbreviation;
    }

    isGrade = employee.grade.find(x => x.level === 'LICENCIATURA');
    if (typeof (isGrade) !== 'undefined') {
      return isGrade.abbreviation;
    }
    return '';
  }

}
