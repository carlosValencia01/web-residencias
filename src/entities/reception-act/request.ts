import { iRequest } from './request.model';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';

moment.locale('es');

export class uRequest {
    private ENCABEZADO = "2020, Año de Leona Vicario, Benemérita Madre de la Patria";
    private FONT_SIZE: {
        BODY: 9,
        BOLD: 10,
        MIN: 8
    };
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
    private tecNacLogo: any;
    private tecNacLogoTitle: any;
    private tecLogo: any;
    private serviceFirm: any;
    private directorFirm: any;
    private montserratNormal: any;
    private montserratBold: any;

    constructor(public _request: iRequest, public _getImage: ImageToBase64Service) {
        this._getImageToPdf();
    }

    public setRequest(request: iRequest) {
        this._request = request;
    }

    private _getImageToPdf() {
        this._getImage.getBase64('assets/imgs/logo.jpg').then(logo => {
            this.tecNacLogo = logo;
        });

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

    protocolActRequest(): jsPDF {
        const doc = this.newDocumentTec();
        const sentHistory = this._request.history.filter(x => x.phase === 'Capturado' && x.status === 'Accept').reverse()[0];
        console.log('Listas', doc.getFontList());
        doc.setTextColor(0, 0, 0);
        // Title
        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(11);
        doc.text('SOLICITUD   DEL   ESTUDIANTE', (this.WIDTH / 2), 35, { align: 'center' });
        doc.text('PARA  LA TITULACIÓN  INTEGRAL', (this.WIDTH / 2), 40, { align: 'center' });

        // Fecha
        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(11);
        doc.text(doc.splitTextToSize(`Tepic, Nayarit, ${moment(sentHistory ? sentHistory.achievementDate : new Date()).format('LL')}`, 80),
            this.WIDTH - this.MARGIN.RIGHT, 55, { align: 'right' });

        // Saludos
        doc.setFont(this.FONT, 'Bold');
        const jefe = 'Lic. LAURA ELENA CASILLAS CASTAÑEDA';
        // let tmn = doc.getTextWidth(jefe);
        // doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 75, { align: 'left' });
        doc.text(jefe, this.MARGIN.LEFT, 75, { align: 'left' });
        // doc.text(doc.splitTextToSize('Jefe(a) de la división de estudios profesionales', 150), this.MARGIN.LEFT, 80, { align: 'left' });
        doc.text('JEFE DE LA DIVISÓN DE ESTUDIOS PROFESIONALES', this.MARGIN.LEFT, 80, { align: 'left' });
        doc.text('P R E S E N T E', this.MARGIN.LEFT, 85, { align: 'left' });

        // doc.text(doc.splitTextToSize('AT´N. ANA GUADALUPE RAMIREZ LOPEZ', 150), (this.WIDTH / 2), 100, { align: 'left' });
        // doc.text(doc.splitTextToSize('Coordinador(a) de apoyo a la titulación', 100), (this.WIDTH / 2), 105, { align: 'left' });}}
        doc.setFont(this.FONT, 'Bold');
        this.addTextRight(doc, this.addArroba('AT´N. ANA GUADALUPE RAMIREZ LOPEZ'), 100);
        this.addTextRight(doc, this.addArroba('COORDINADOR DE APOYO A TITULACION O EQUIVALENTE'), 105);

        doc.setFont(this.FONT, 'Normal');
        doc.text(doc.splitTextToSize('Por medio del presente solicito autorización para iniciar trámite de registro del ' +
            'proyecto de titulación integral:', 185), this.MARGIN.LEFT, 120, { align: 'left' });

        this.addTable(doc, [
            ['Nombre: ', this._request.student.fullName],
            ['Carrera: ', this._request.student.career],
            ['No. de control: ', this._request.student.controlNumber],
            ['Nombre del proyecto: ', this._request.projectName],
            ['Producto: ', this._request.product]
        ], 130);
        const nameProjectLines = 8 * Math.ceil(this._request.projectName.length / 60);
        doc.setFont(this.FONT, 'Normal');
        doc.text('En espera de la aceptación de esta solicitud, quedo a sus órdenes.', this.MARGIN.LEFT,
            176 + nameProjectLines, { align: 'left' });
        doc.setFont(this.FONT, 'Bold');
        doc.text('ATENTAMENTE', (this.WIDTH / 2), 213, { align: 'center' });

        doc.text(this._request.student.fullName, (this.WIDTH / 2), 220, { align: 'center' });
        doc.setFont(this.FONT, 'Normal');
        // tmn = doc.getTextWidth(this._request.student.fullName);
        doc.setFont(this.FONT, 'Bold');
        this.addLineCenter(doc, 'Nombre y firma del estudiante', 222);

        this.addTable(doc, [
            ['Teléfono particular o de contacto: ', this._request.telephone],
            ['Correo electrónico del estudiante: ', this._request.email]
        ], 235);
        return doc;
    }

    projectRegistrationOffice(): jsPDF {
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
        // doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 62, { align: 'left' });
        // doc.text(doc.splitTextToSize('Jefe(a) de la División de Estudios Profesionales', 150), this.MARGIN.LEFT, 67, { align: 'left' });
        doc.text("LIC. LAURA ELENA CASILLAS CASTAÑEDA", this.MARGIN.LEFT, 62);
        doc.text('Jefe(a) de la División de Estudios Profesionales', this.MARGIN.LEFT, 67, { align: 'left' });
        doc.text('P R E S E N T E', this.MARGIN.LEFT, 72, { align: 'left' });

        doc.setFont(this.FONT, 'Normal');
        // doc.text('Departamento de Sistemas Computacionales', this.MARGIN.LEFT, 83, { align: 'left' });
        doc.text(this._request.department.name, this.MARGIN.LEFT, 83, { align: 'left' });
        doc.text(`Lugar: Tepic, Nayarit y Fecha: ${moment(registerHistory ? registerHistory.achievementDate : new Date()).format('LL')}`,
            this.MARGIN.LEFT, 88, { align: 'left' });

        this.addTable(doc, [
            ['Nombre del proyecto: ', this._request.projectName],
            ['Nombre(s) del (de los) asesores(es): ', this._request.adviser],
            ['Número de estudiantes ', this._request.noIntegrants]
        ], 93);

        const aceptHistory = this._request.history
            .filter(x => x.phase === 'Enviado' && (x.status === 'Accept' || x.status === 'Aceptado'))[0];
        const nameProjectLines = 8 * Math.ceil(this._request.projectName.length / 50);
        const integrantsLines = 10 * (this._request.noIntegrants - 1);
        const observationsLines = 5 * Math.ceil(aceptHistory.observation.length / 60);

        doc.text('Datos del (de los) estudiante(s):', this.MARGIN.LEFT, 125 + nameProjectLines, { align: 'left' });
        const students: Array<Object> = [];
        students.push(['Nombre', 'No. de control', 'Carrera']);
        students.push([this._request.student.fullName, this._request.student.controlNumber, this._request.student.career]);
        if (this._request.noIntegrants > 1) {
            this._request.integrants.forEach(e => {
                students.push([e.name, e.controlNumber, e.career]);
            });
        }
        this.addTable(doc, students, 127 + nameProjectLines);

        doc.rect(this.MARGIN.LEFT, 160 + integrantsLines + nameProjectLines, this.WIDTH
            - (this.MARGIN.RIGHT + this.MARGIN.LEFT - 6), 7 + observationsLines);
        doc.text('Observaciones: ', this.MARGIN.LEFT + 3, 164 + integrantsLines + nameProjectLines, { align: 'left' });
        doc.text(doc.splitTextToSize(aceptHistory.observation, 150), this.MARGIN.LEFT + 3,
            170 + integrantsLines + nameProjectLines, { align: 'left' });

        doc.setFont(this.FONT, 'Bold');
        const observationY = 185 + observationsLines + (nameProjectLines - 5) + integrantsLines;
        doc.text('ATENTAMENTE', (this.WIDTH / 2), observationY < 220 ? 220 : observationY, { align: 'center' });
        doc.setFont(this.FONT, 'Normal');
        doc.text(this._request.department.boss, (this.WIDTH / 2), 240, { align: 'center' });
        this.addLineCenter(doc, 'Nombre y firma del (de la) Jefe(a) de Departamento Académico', 244);

        return doc;
    }

    projectRelease(): jsPDF {
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        // Title
        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(14);
        doc.setFontSize(11);
        doc.text('FORMATO DE LIBERACIÓN DE PROYECTO', (this.WIDTH / 2), 35, { align: 'center' });
        doc.text('PARA LA TITULACIÓN INTEGRAL', (this.WIDTH / 2), 40, { align: 'center' });

        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(12);
        doc.text(doc.splitTextToSize('Lugar y fecha:', 60), 147, 55, { align: 'left' });
        doc.text(doc.splitTextToSize('Tepic, Nayarit', 60), 174, 55, { align: 'left' });
        doc.text(doc.splitTextToSize(moment(new Date()).format('LL'), 60), 174, 60, { align: 'left' });
        doc.text('Asunto: Liberación de proyecto para la titulación integral', (this.WIDTH / 2) * 3, 77, { align: 'left' });
        // Saludos
        doc.setFont(this.FONT, 'Bold');
        const jefe = 'MDO LUIS ALBERTO GARNICA LOPEZ';
        const tmn = doc.getTextWidth(jefe);
        doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 85, { align: 'left' });
        doc.text(doc.splitTextToSize('Jefe(a) de la División de Estudios Profesionales', 150), this.MARGIN.LEFT, 92, { align: 'left' });
        doc.text('PRESENTE', this.MARGIN.LEFT, 100, { align: 'left' });
        doc.setFont(this.FONT, 'Normal');
        doc.text(doc.splitTextToSize('Por este medio informo que ha sido liberado el siguiente proyecto para la titulación:',
            176), this.MARGIN.LEFT, 107, { align: 'left' });

        this.addTable(doc, [
            ['Nombre del estudiante y/o egresado: ', this._request.student.fullName],
            ['Carrera: ', this._request.student.career],
            ['No. de control: ', this._request.student.controlNumber],
            ['Nombre del proyecto: ', this._request.projectName],
            ['Producto ', 'DEMO']
        ], 120);

        doc.text(doc.splitTextToSize('Agradezco de antemano su valioso apoyo en esta importante actividad para la ' +
            'formación profesional de nuestros egresados', 176), this.MARGIN.LEFT, 174, { align: 'left' });

        doc.setFont(this.FONT, 'Bold');
        doc.text('ATENTAMENTE', (this.WIDTH / 2), 190, { align: 'center' });

        doc.setFont(this.FONT, 'Normal');
        doc.text(jefe, (this.WIDTH / 2), 215, { align: 'center' });
        this.addLineCenter(doc, 'Nombre y firma del (de la) Jefe(a) de Departamento Académico', 217);

        this.addTable(doc, [
            [this._request.adviser],
            ['Nombre y firma del asesor']
        ], 227);
        return doc;
    }

    noInconvenience(): jsPDF {
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
        this.justityText(doc, 'Me permito informarle de acuerdo a su solicitud, que no existe inconveniente para que pueda Ud. Presentar su Acto de Recepción Profesional, ya que su expediente quedó integrado para tal efecto.', { x: this.MARGIN.LEFT, y: 130 }, 180);
        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(11);
        doc.text('ATENTAMENTE', this.MARGIN.LEFT, 155, { align: 'left' });
        doc.text('ISRAEL ARJONA VIZCAÍNO', this.MARGIN.LEFT, 170, { align: 'left' }); // Cambiar de forma dinámica
        doc.text('JEFE DE SERVICIOS ESCOLARES', this.MARGIN.LEFT, 176, { align: 'left' });

        doc.setFontSize(11);
        doc.text('"Sabiduría Tecnológica, Pasión de nuestro Espíritu" ®', this.MARGIN.LEFT, 186, { align: 'left' });
        doc.text('Clave del instituto 18DIT0002Z', this.MARGIN.LEFT, 196, { align: 'left' });

        return doc;
    }

    public professionalEthicsOath(): jsPDF {
        const doc = this.newDocumentTec(false, false);
        const initialHeight = 35;
        const lineHeight = 7;
        doc.setTextColor(0, 0, 0);
        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(18);
        this._drawUnderlineText(doc, 'JURAMENTO DE ÉTICA PROFESIONAL', initialHeight, 'center');
        doc.setFontSize(14);
        this._drawUnderlineText(doc, `YO: ${this._request.student.fullName}`, initialHeight + (lineHeight * 3), 'center');
        this._drawUnderlineText(doc, `COMO: ${this._request.student.career}`, initialHeight + (lineHeight * 5), 'center');
        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(17);
        // tslint:disable-next-line:max-line-length
        this.justityText(doc, `DEDICO MIS CONOCIMIENTOS PROFESIONALES AL PROGRESO Y MEJORAMIENTO DEL BIENESTAR HUMANO, ME COMPROMETO A DAR UN RENDIMIENTO MÁXIMO, A PARTICIPAR TAN SOLO EN EMPRESAS DIGNAS, A VIVIR Y TRABAJAR DE ACUERDO CON LAS LEYES PROPIAS DEL HOMBRE Y EL MÁS ELEVADO NIVEL DE CONDUCTA PROFESIONAL, A PREFERIR EL SERVICIO AL PROVECHO, EL HONOR Y LA CALIDAD PROFESIONAL A LA VENTAJA PERSONAL, EL BIEN PÚBLICO A TODA CONSIDERACIÓN, CON RESPETO Y HONRADEZ HAGO EL PRESENTE JURAMENTO.`,
            {x: this.MARGIN.LEFT + 15, y: initialHeight + (lineHeight * 9)},
            (this.WIDTH - ((this.MARGIN.LEFT + 13) + (this.MARGIN.RIGHT + 13))), 7);
        doc.setFontSize(14);
        this._drawCenterTextWithLineUp(doc, 'FIRMA', initialHeight + (lineHeight * 26.5));
        doc.text(moment(new Date()).format('LL').toUpperCase(), this.MARGIN.LEFT + 15, initialHeight + (lineHeight * 31));
        return doc;
    }

    public codeProfessionalEthics(): jsPDF {
        const doc = this.newDocumentTec(false, false);
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
            `IV.- REHUSARÁ COMPROMETERSE, CUALQUIERAQUE SEA LA REMUNERACIÓN, EN TRABAJOS QUE CREAN NO SERÁN BENEFICIOSOS PARA SUS CLIENTES, A NO SER QUE ADVIERTAN PRIMERO A ESTOS SOBRE LA IMPROBABILIDAD DE ÉXITO DE LOS RESULTADOS.`,
            // tslint:disable-next-line:max-line-length
            `V.- MANTENDRÁ EL PRINCIPIO DE QUE LOS HONORARIOS IRRAZONABLEMENTE BAJOS POR LABORES PROFESIONALES, PROPENDEN A UN TRABAJO INFERIOR Y SIN GARANTÍA.`,
            `VI.- RECHAZARÁ LA PRESTACIÓN DE SU NOMBRE A EMPRESAS EN ENTREDICHO.`,
            // tslint:disable-next-line:max-line-length
            `VII.- SERÁ CONSERVADOR EN TODOS SUS PRESUPUESTOS, INFORMES, TESTIMONIOS, ETC. PARTICULARMENTE EN LOS QUE SE RELACIONEN CON LA PROMOCION O IMPULSIÓN DE EMPRESAS.`,
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
            `XIII.- UN TITULO_DE_GRADO*, DEBE ESFORZARSE EN TODO MOMENTO PARA ACREDITAR TRABAJOS A QUIENES, TAN LEJOS COMO SU CONOCIMIENTO ALCANCE SEAN LOSO AUTORES REALES DE ELLOS.`,
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
        this._drawUnderlineText(doc, `${this._request.student.career}`, initialHeight + (lineHeight * 5), 'center');
        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(12);
        doc.text('EL INSTITUTO CONFÍA EN QUE LAS REGLAS SIGUIENTES GUIARÁN LOS ACTOS DE SUS EGRESADOS:',
            startLine, initialHeight + (lineHeight * 8), { maxWidth: lineWidth }, null, 'justify');
        let totalLines = 9.5;
        rules.slice(0, 14).forEach((rule, index, array) => {
            const ruleData = rule.replace('TITULO_DE_GRADO*', this._request.student.career);
            const linesRule = Math.ceil(ruleData.length / 60);
            totalLines += 1.5;
            let y = initialHeight + (lineHeight * totalLines);
            if (this._changePage(this.HEIGHT - this.MARGIN.BOTTOM, y, y + (lineHeight * linesRule))) {
                doc.addPage();
                totalLines = 0;
                y = initialHeight + (lineHeight * totalLines);
            }
            this.justityText(doc, ruleData, { x: startLine, y: y }, lineWidth, 7);
            totalLines += linesRule;
        });
        return doc;
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
        doc.text('FORMATO DE LIBERACION DEL PROYECTO PARA LA TITULACION INTEGRAL', (this.WIDTH / 2), 52, { align: 'center' });
        this.addTextRight(doc, `Tepic, Nayarit; ${moment(tmpDate).format('LL')}`, 58);
        this.addTextRight(doc, 'ASUNTO: @LIBERACION@ @DE@ @PROYECTO@', 64);
        this.addTextRight(doc, '@PARA@ @LA@ @TITULACION@ @INTEGRAL@', 68);
        doc.setFont(this.FONT, 'Bold');
        doc.text("LIC. LAURA ELENA CASILLAS CASTAÑEDA", this.MARGIN.LEFT, 74);
        doc.setFont(this.FONT, 'Normal');
        doc.text("JEFA DE LA DIVISION DE ESTUDIOS PROFESIONALES", this.MARGIN.LEFT, 78);
        doc.text("PRESENTE", this.MARGIN.LEFT, 82);
        this.addTextRight(doc, `CON AT’N.: ${this.addArroba("COORD. DE TITULACION O EQUIVALENTE")}`, 86);
        doc.setFont(this.FONT, 'Normal');
        doc.text("Por este medio le informo que ha sido liberado el siguiente proyecto para la Titulación Integral:", this.MARGIN.LEFT, 94);
        this.addTable(doc, [
            ['a) Nombre del egresado:', this._request.student.fullName],
            ['b) Carrera:', this._request.student.career],
            ['c) No. Control:', this._request.student.controlNumber],
            ['d) Nombre del Proyecto:', this._request.projectName],
            ['e) Producto:', this._request.product]
        ], 100, this.MARGIN.LEFT, 8, true);

        // tslint:disable-next-line: max-line-length
        doc.text("Agradezco de antemano su valioso apoyo en esta importante actividad para la formación profesional de nuestros egresados.", this.MARGIN.LEFT, 144);
        doc.setFontSize(9);
        doc.setFont(this.FONT, 'Bold');
        doc.text("ATENTAMENTE", this.MARGIN.LEFT, 154);
        doc.setFontSize(6);
        doc.text("Excelencia en Educación Tecnológica®", this.MARGIN.LEFT, 158);
        doc.text("Sabiduría Tecnológica, Pasión de nuestro espíritu®", this.MARGIN.LEFT, 162);

        doc.setFontSize(9);
        doc.setFont(this.FONT, 'Bold');
        console.log("SOLICITUD REQ", this._request);
        doc.text(this._request.department.boss, this.MARGIN.LEFT, 170);
        doc.setFont(this.FONT, 'Normal');
        doc.text("JEFE " + this._request.department.name, this.MARGIN.LEFT, 174);

        doc.setDrawColor(0, 0, 0);
        const widthRect: number = (this.WIDTH - (this.MARGIN.RIGHT + this.MARGIN.LEFT));
        const heightRect: number = this.HEIGHT - (185 + this.MARGIN.BOTTOM);
        const widthLine: number = widthRect / 4;
        doc.rect(this.MARGIN.LEFT, 178, widthRect, heightRect, "S");
        doc.line(this.MARGIN.LEFT + widthLine, 178, this.MARGIN.LEFT + widthLine, 178 + heightRect);
        doc.line(this.MARGIN.LEFT + widthLine * 2, 178, this.MARGIN.LEFT + widthLine * 2, 178 + heightRect);
        doc.line(this.MARGIN.LEFT + widthLine * 3, 178, this.MARGIN.LEFT + widthLine * 3, 178 + heightRect);

        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(6);
        doc.text(doc.splitTextToSize(this._request.jury[0].name, widthLine), this.MARGIN.LEFT + (widthLine * 1 / 2), 185 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize("Asesor", widthLine), this.MARGIN.LEFT + (widthLine * 1 / 2), 193 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(this._request.jury[0].title, widthLine), this.MARGIN.LEFT + (widthLine * 1 / 2), 196 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(`NO. CEDULA PROF. ${this._request.jury[0].cedula}`, widthLine), this.MARGIN.LEFT + (widthLine * 1 / 2), 202 + (heightRect / 2), { align: "center" });

        doc.text(doc.splitTextToSize(this._request.jury[1].name, widthLine), this.MARGIN.LEFT + (widthLine * 3 / 2), 185 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize("Revisor", widthLine), this.MARGIN.LEFT + (widthLine * 3 / 2), 193 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(this._request.jury[1].title, widthLine), this.MARGIN.LEFT + (widthLine * 3 / 2), 196 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(`NO. CEDULA PROF. ${this._request.jury[1].cedula}`, widthLine), this.MARGIN.LEFT + (widthLine * 3 / 2), 202 + (heightRect / 2), { align: "center" });

        doc.text(doc.splitTextToSize(this._request.jury[2].name, widthLine), this.MARGIN.LEFT + (widthLine * 5 / 2), 185 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize("Revisor", widthLine), this.MARGIN.LEFT + (widthLine * 5 / 2), 193 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(this._request.jury[2].title, widthLine), this.MARGIN.LEFT + (widthLine * 5 / 2), 196 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(`NO. CEDULA PROF. ${this._request.jury[2].cedula}`, widthLine), this.MARGIN.LEFT + (widthLine * 5 / 2), 202 + (heightRect / 2), { align: "center" });

        doc.text(doc.splitTextToSize(this._request.jury[3].name, widthLine), this.MARGIN.LEFT + (widthLine * 7 / 2), 185 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize("Revisor Suplente", widthLine), this.MARGIN.LEFT + (widthLine * 7 / 2), 193 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(this._request.jury[3].title, widthLine), this.MARGIN.LEFT + (widthLine * 7 / 2), 196 + (heightRect / 2), { align: "center" });
        doc.text(doc.splitTextToSize(`NO. CEDULA PROF. ${this._request.jury[3].cedula}`, widthLine), this.MARGIN.LEFT + (widthLine * 7 / 2), 202 + (heightRect / 2), { align: "center" });

        let appointment: Date = new Date(this._request.proposedDate);
        appointment.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0)
        doc.setFontSize(9);
        // tslint:disable-next-line: max-line-length
        doc.text(`NOTA: Se le solicita que la fecha del acto sea programado en el horario de las ${moment(appointment).format('HH:mm')} hrs.`, this.MARGIN.LEFT, heightRect + 182);
        return doc;
    }

    public notificationOffice(): jsPDF {
        let tmpDate = new Date(this._request.proposedDate);
        tmpDate.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(8);
        doc.text(`${this.ENCABEZADO}`, (this.WIDTH / 2), 45, { align: 'center' });
        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(10);
        doc.text('TEPIC, NAYARIT;', (this.WIDTH / 2), 55, { align: 'center' });
        this.addTextRight(doc, moment(new Date()).format('LL').toUpperCase(), 55)
        doc.text('ACTO DE RECEPCION PROFESIONAL', (this.WIDTH / 2), 70, { align: 'center' });
        doc.text('INTEGRANTES DEL JURADO', (this.WIDTH / 2), 85, { align: 'center' });
        doc.setFont(this.FONT, 'Normal');
        doc.text('PRESIDENTE', this.MARGIN.LEFT, 95);
        this.addJury(doc, this._request.jury[0], 95); // 100,105,110
        doc.text('SECRETARIO', this.MARGIN.LEFT, 110);
        this.addJury(doc, this._request.jury[1], 110); // 115,120,125
        doc.text('VOCAL', this.MARGIN.LEFT, 125);
        this.addJury(doc, this._request.jury[2], 125); // 130,135,140
        doc.text('VOCAL SUPLENTE', this.MARGIN.LEFT, 140);
        this.addJury(doc, this._request.jury[3], 140); // 145,150,155

        // tslint:disable-next-line: max-line-length
        let contenido = `Por este conducto le informo que el Acto de Recepción Profesional de C. @ESTUDIANTE con número de control @NUMERO egresado del Instituto Tecnológico de Tepic, de la carrera de @CARRERA por la Opción, XI (TITULACION INTEGRAL) INFORME TECNICO DE RESIDENCIA PROFESIONAL, con el proyecto @PROYECTO. El cual se realizará el día @FECHA , a las @HORA Hrs. En la Sala @LUGAR de este Instituto.`;

        contenido = contenido.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())}`);
        contenido = contenido.replace('@NUMERO', `${this.addArroba(this._request.student.controlNumber.toUpperCase())}`);
        contenido = contenido.replace('@CARRERA', `${this.addArroba(this._request.student.career.toUpperCase())}`);
        contenido = contenido.replace('@PROYECTO', `${this.addArroba(this._request.projectName.toUpperCase())}`);
        // tslint:disable-next-line: max-line-length
        contenido = contenido.replace('@FECHA', `${this.addArroba(`${tmpDate.getDate()} de ${this.letterCapital(moment(tmpDate).format('MMMM'))}`)}`);
        contenido = contenido.replace('@HORA', `${this.addArroba(moment(tmpDate).format('LT'))}`);
        contenido = contenido.replace('@LUGAR', `${this.addArroba(this._request.place.toUpperCase())}`);
        this.justityText(doc, contenido, { x: this.MARGIN.LEFT, y: 160 }, 180);

        doc.text('Por lo que se le pide su puntual asistencia.', this.MARGIN.LEFT, 210);
        doc.text('ATENTAMENTE', this.MARGIN.LEFT, 225);
        doc.text('L.A. LAURA ELENA CASILLAS CASTAÑEDA', this.MARGIN.LEFT, 240);
        doc.text('JEFA DE LA DIV. DE EST. PROFESIONALES', this.MARGIN.LEFT, 245);
        return doc;
    }

    public juryDuty(duty: string, position: string, employee: string): jsPDF {
        const doc = this.newDocumentTec();
        let tmpDate = new Date(this._request.proposedDate);
        tmpDate.setHours(this._request.proposedHour / 60, this._request.proposedHour % 60, 0, 0);
        doc.setTextColor(0, 0, 0);
        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(10);
        this.addTextRight(doc, `Tepic, Nayarit a ${moment(new Date()).format('LL').toUpperCase()}`, 45);
        this.addTextRight(doc, `OFICIO No. ${duty}`, 50);
        doc.setFont(this.FONT, 'Normal');
        this.addTextRight(doc, `ASUNTO: ${position} Acto de Recepcion Profesional`, 65);
        doc.setFont(this.FONT, 'Bold');
        doc.text(`C. ${employee.toUpperCase()}`, this.MARGIN.LEFT, 90);
        doc.text(`CATEDRÁTICO DE ESTE INSTITUTO`, this.MARGIN.LEFT, 95);
        doc.text(`P R E S E N T E`, this.MARGIN.LEFT, 100);
        // tslint:disable-next-line: max-line-length
        let contenido = `En atención a lo marcado por el Artículo 22o. del Reglamento de Examen Profesional, me permito notificarle que ha sido designado (a) @PUESTO del Jurado del Acto de Recepción Profesional del (la) Pasante C. @ESTUDIANTE, egresado (a) de la Carrera de @CARRERA, por la Opción XI, TITULACIÓN INTEGRAL (INFORME TÉCNICO DE RESIDENCIA PROFESIONAL) con el proyecto @PROYECTO, quien presentará el Acto de Recepción Profesional el día @FECHA del presente año, a las @HORA hrs. en la Sala @LUGAR de este Instituto.`;
        contenido = contenido.replace('@PUESTO', `${this.addArroba(position.toUpperCase())}`);
        contenido = contenido.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())}`);
        contenido = contenido.replace('@CARRERA', `${this.addArroba(this._request.student.career.toUpperCase())}`);
        contenido = contenido.replace('@PROYECTO', `${this.addArroba(this._request.projectName.toUpperCase())}`);
        // tslint:disable-next-line: max-line-length
        contenido = contenido.replace('@FECHA', `${this.addArroba(`${tmpDate.getDate()} de ${this.letterCapital(moment(tmpDate).format('MMMM'))}`)}`);
        contenido = contenido.replace('@HORA', `${this.addArroba(moment(tmpDate).format('LT'))}`);
        contenido = contenido.replace('@LUGAR', `${this.addArroba(this._request.place.toUpperCase())}`);
        this.justityText(doc, contenido, { x: this.MARGIN.LEFT, y: 120 }, 180);
        doc.setFontSize(10);
        doc.text('A T E N T A M E N T E.', this.MARGIN.LEFT, 190);
        doc.text('“SABIDURÍA TECNOLÓGICA, PASIÓN DE NUESTRO ESPÍRITU”®', this.MARGIN.LEFT, 195);
        doc.text('MARTHA ANGÉLICA PARRA URÍAS', this.MARGIN.LEFT, 225);
        doc.text('JEFA DEL DEPARTAMENTO DE SISTEMAS COMPUTACIONALES', this.MARGIN.LEFT, 230);
        return doc;
    }
    public testReport(): jsPDF {
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        doc.setFont(this.FONT, 'Bold');
        doc.setFontSize(10);
        doc.text('INSTITUTO TECNOLÓGICO DE TEPIC', (this.WIDTH / 2), 45, { align: 'center' });
        doc.text('CERTIFICACIÓN DE CONSTANCIA DE EXENCIÓN DE EXAMEN PROFESIONAL', (this.WIDTH / 2), 53, { align: 'center' });
        doc.setFont(this.FONT, 'Normal');
        doc.setFontSize(8);
        let tmpDate = new Date();
        // tslint:disable-next-line: max-line-length
        let content = 'El (la) suscrito (a) Director (a) del Instituto Tecnológico de Tepic, certifica que en el libro para Constancias de Exención de Examen Profesional, referente a la carrera de @CARRERA No.2 Autorizado el día @AUTORIZACION, por la Dirección de Asuntos Escolares y Apoyo a Estudiantes del Tecnológico Nacional de México, se encuentra asentada en la foja número @NUMERO la constancia que a le letra dice:';
        content = content.replace('@CARRERA', this.letterCapital(this._request.student.career));
        content = content.replace('@AUTORIZACION', moment(tmpDate).format('LL'));
        content = content.replace('@NUMERO', '180');
        this.justityText(doc, content, { x: this.MARGIN.LEFT + 32, y: 60 }, 138, 4);
        doc.ellipse(28, 90, 20, 30);
        // tslint:disable-next-line: max-line-length
        content = 'De acuerdo con el instructivo vigente de Titulación, que no tiene como requisito la sustentación del Examen Profesional para Efecto de obtención de Título, en las opciones VIII, IX y Titulación Integral, el Jurado HACE CONSTAR: que al (la) C. @ESTUDIANTE con número de control @CONTROL egresado(a) del Instituto Tecnológico de Tepic, Clave 18DIT0002Z, que cursó la carrera de: @CARRERA.';
        content = content.replace('@ESTUDIANTE', `${this.addArroba(this._request.student.fullName.toUpperCase())}`);
        content = content.replace('@CONTROL', `${this.addArroba(this._request.student.controlNumber)}`);
        content = content.replace('@CARRERA', `${this.addArroba(this.letterCapital(this._request.student.career))}`);
        this.justityText(doc, content, { x: this.MARGIN.LEFT + 32, y: 86 }, 138, 4);
        // tslint:disable-next-line: max-line-length
        this.justityText(doc, 'Cumplió satisfactoriamente con lo estipulado en la opción: @Titulación@ @Integral.@', { x: this.MARGIN.LEFT + 32, y: 106 }, 138, 4);

        // tslint:disable-next-line: max-line-length
        content = 'El presidente (a) del jurado le hizo saber a el (la) el resultado obtenido, el Código de Ética Profesional y le tomó la Protesta de Ley, una vez escrita, leída la firmaron las personas que en el acto protocolario intervinieron, para los efectos legales a que haya lugar, se asienta la presente en la ciudad de Tepic Nayarit el @dia@ @HOY';
        // tslint:disable-next-line: max-line-length
        content = content.replace('@HOY', `@${String(tmpDate.getDate())}@ @del@ @mes@ @${this.letterCapital(moment(tmpDate).format('MMMM'))}@ @del@ @Año@ @${tmpDate.getFullYear()}@`);
        this.justityText(doc, content, { x: this.MARGIN.LEFT + 32, y: 116 }, 138, 4);

        doc.setFont(this.FONT, 'Normal');
        doc.text('Rubrican', this.MARGIN.LEFT + 32, 138, { align: 'left' });

        // tslint:disable-next-line: max-line-length
        this.justityText(doc, `@Presidente(a):@ ${this.letterCapital(this._request.jury[0].name)}`, { x: this.MARGIN.LEFT + 32, y: 142 }, 180);
        doc.text(this.letterCapital(this._request.jury[0].title), this.MARGIN.LEFT + 32, 146, { align: 'left' });
        doc.text(`No.Ced.Prof. : ${this._request.jury[0].cedula}`, this.MARGIN.LEFT + 32, 150, { align: 'left' });

        // tslint:disable-next-line: max-line-length
        this.justityText(doc, `@Secretario(a):@ ${this.letterCapital(this._request.jury[1].name)}`, { x: this.MARGIN.LEFT + 32, y: 155 }, 180);
        doc.text(this.letterCapital(this._request.jury[1].title), this.MARGIN.LEFT + 32, 159, { align: 'left' });
        doc.text(`No.Ced.Prof. : ${this._request.jury[1].cedula}`, this.MARGIN.LEFT + 32, 163, { align: 'left' });

        this.justityText(doc, `@Vocal:@ ${this.letterCapital(this._request.jury[2].name)}`, { x: this.MARGIN.LEFT + 32, y: 168 }, 180);
        doc.text(this.letterCapital(this._request.jury[2].title), this.MARGIN.LEFT + 32, 172, { align: 'left' });
        doc.text(`No.Ced.Prof. : ${this._request.jury[2].cedula}`, this.MARGIN.LEFT + 32, 176, { align: 'left' });

        // tslint:disable-next-line: max-line-length
        doc.text(`Se extiende esta certificación a los ${tmpDate.getDate()} del mes ${this.letterCapital(moment(tmpDate).format('MMMM'))} del Año ${tmpDate.getFullYear()}`, this.MARGIN.LEFT + 32, 184, { align: 'left' });

        let servicios = 'M.C. Israel Arjona Vizcaíno';
        let director = 'LIC. MANUEL ÁNGEL URIBE VÁZQUEZ';
        doc.setFont(this.FONT, 'Bold');

        doc.text(`COTEJO`, this.MARGIN.LEFT + 32, 190, { align: 'left' });

        doc.addImage(this.serviceFirm, 'PNG', this.MARGIN.LEFT + 32, 193, 60, 25);
        doc.text(`Jefe del Departamento de Servicios Escolares`, this.MARGIN.LEFT + 32, 220, { maxWidth: 50, align: 'left' });
        doc.text(servicios, this.MARGIN.LEFT + 32, 226, { maxWidth: 50, align: 'left' });

        doc.addImage(this.directorFirm, 'PNG', this.WIDTH / 2, 213, 60, 25);
        doc.text(`${director}`, this.WIDTH / 2, 240, { align: 'left' });
        doc.text(`Director`, (this.WIDTH / 2) + ((doc.getStringUnitWidth(director) * 72 / 25.6) / 2), 244, { maxWidth: 50, align: 'left' });
        return doc;
    }

    private addJury(doc: jsPDF, jury: { title: string, name: string, cedula: number }, positionY) {
        doc.setFont(this.FONT, 'Bold');
        doc.text(doc.splitTextToSize(jury.title, 150), this.MARGIN.LEFT + 35, positionY);
        doc.text(jury.name, this.MARGIN.LEFT + 35, positionY + 5);
        doc.setFont(this.FONT, 'Normal');
        doc.text(`No.de Cedula Profesional: ${jury.cedula}`, this.MARGIN.LEFT + 35, positionY + 10);
    }
    // A una cadena de texto, le añade @ a cada palabra tanto al inicio y al final
    // Esto es para indicar que se le agregará texto en negritas
    private addArroba(Text: string): string {
        return Text.split(' ').map(word => { return '@' + word + '@'; }).join(' ');
    }

    private letterCapital(text: string): string {
        text = text.toLowerCase();
        if (text.trim().length>0)
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
        })
        // doc.text(text, this.WIDTH - (this.MARGIN.RIGHT + tmpCount), positionY);
    }
    // Justifica un texto
    private justityText(Doc: jsPDF, Text: string, Point: { x: number, y: number }, Size: number, lineBreak: number = 5) {
        // Texto sin @ (Negritas) para conocer más adelante las filas en las que será dividido
        const tmpText: string = Text.split('@').join('');
        // Texto original
        const aText: Array<string> = Text.split(/\s+/);
        // Indice global que indicará la palabra a dibujar
        let iWord: number = 0;
        // Filas en las cuales se dividirá el texto
        const rows: Array<string> = Doc.splitTextToSize(tmpText, Size);
        const lastRow = rows.length - 1;
        rows.forEach((row, index) => {
            // Cantidad de palabras que tiene la fila
            let longitud = row.split(/\s+/).length;
            // Sumatoria del tamaño total de la frase
            const summation: number = this.summation(Doc, aText.slice(iWord, iWord + longitud));
            // Espacio que se pondrá entre cada palabra
            let space: number = index === lastRow ? 1.5 : (Size - summation) / (longitud - 1);
            // Posicion X,Y para poner la palabra
            let tmpIncX = Point.x;
            let tmpIncY = Point.y + (index * lineBreak);
            while (longitud > 0) {
                // Se obtiene la palabra del texto original a escribiri
                let tmpWord = aText[iWord];
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
                // Se prosigue con la otra palabra
                longitud--;
                // Se incrementa el indice global
                iWord++;
            }
        });
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
        doc.text(text, align === 'center' ? lineStart + (lineWidth / 2) : lineStart, y, { align: align });
        doc.rect(align === 'right' ? lineStart - lineWidth : lineStart, y + 1, lineWidth, 0.5, 'F');
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

    private addLineCenter(document: jsPDF, text: string, startY: number) {
        const tmn = document.getTextWidth(text);
        document.setFont(this.FONT, 'Bold');
        document.setDrawColor(0, 0, 0);
        document.line((this.WIDTH / 2) - (tmn / 2), startY, (this.WIDTH / 2) + (tmn / 2), startY);
        document.text(text, (this.WIDTH / 2), startY + 5, { align: 'center' });
    }

    // @ts-ignore
    private addTable(document: jsPDF, data: Array<Object>, startY: number, startX: number = this.MARGIN.LEFT, Size: number = 11, isBold: boolean = false) {
        // @ts-ignore
        document.autoTable({
            theme: 'grid',
            startY: startY,
            margin: { left: startX },
            // @ts-ignore
            bodyStyles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], font: this.FONT, fontStyle: (isBold ? 'Bold' : 'Normal'), fontSize: Size },
            body: data
        });
    }
}
