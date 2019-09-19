import { iRequest } from './request.model';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';
import { ImageToBase64Service } from 'src/services/img.to.base63.service';

moment.locale('es');

export class uRequest {
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
    private montserratNormal: any;
    private montserratBold: any;

    constructor(public _request: iRequest, public _getImage: ImageToBase64Service) {
        this.getImageToPdf();
    }

    getImageToPdf() {
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
    }

    protocolActRequest(): jsPDF {
        const doc = this.newDocumentTec();
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
        doc.text(doc.splitTextToSize('Lugar y fecha:', 60), 140, 55, { align: 'left' });
        doc.text(doc.splitTextToSize('Tepic, Nayarit', 60), 170, 55, { align: 'left' });
        doc.text(doc.splitTextToSize(moment(new Date()).format('LL'), 60), 155, 60, { align: 'left' });

        // Saludos
        doc.setFont(this.FONT, 'Bold');
        const jefe = 'MDO LUIS ALBERTO GARNICA LOPEZ';
        let tmn = doc.getTextWidth(jefe);
        doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 75, { align: 'left' });
        doc.text(doc.splitTextToSize('Jefe(a) de la división de estudios profesionales', 150), this.MARGIN.LEFT, 80, { align: 'left' });
        doc.text('P R E S E N T E', this.MARGIN.LEFT, 85, { align: 'left' });

        doc.text(doc.splitTextToSize('AT´N. ' + jefe, 150), (this.WIDTH / 2), 100, { align: 'left' });
        doc.text(doc.splitTextToSize('Coordinador(a) de apoyo a la titulación', 100), (this.WIDTH / 2), 105, { align: 'left' });

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
        tmn = doc.getTextWidth(this._request.student.fullName);
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
        const jefe = 'MDO LUIS ALBERTO GARNICA LOPEZ';
        doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 62, { align: 'left' });
        doc.text(doc.splitTextToSize('Jefe(a) de la División de Estudios Profesionales', 150), this.MARGIN.LEFT, 67, { align: 'left' });
        doc.text('P R E S E N T E', this.MARGIN.LEFT, 72, { align: 'left' });

        doc.setFont(this.FONT, 'Normal');
        doc.text('Departamento de Sistemas Computacionales', this.MARGIN.LEFT, 83, { align: 'left' });
        doc.text(`Lugar: Tepic, Nayarit y Fecha: ${moment(new Date()).format('LL')}`, this.MARGIN.LEFT, 88, { align: 'left' });

        this.addTable(doc, [
            ['Nombre del proyecto: ', this._request.projectName],
            ['Nombre(s) del (de los) asesores(es): ', this._request.adviser],
            ['Número de estudiantes ', this._request.noIntegrants]
        ], 93);

        const nameProjectLines = 8 * Math.ceil(this._request.projectName.length / 50);
        const integrantsLines = 10 * (this._request.noIntegrants - 1);
        const observationsLines = 5 * Math.ceil(this._request.observation.length / 60);

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
        doc.text(doc.splitTextToSize(this._request.observation, 150), this.MARGIN.LEFT + 3,
          170 + integrantsLines + nameProjectLines, { align: 'left' });

        doc.setFont(this.FONT, 'Bold');
        const observationY = 185 + observationsLines + (nameProjectLines - 5) + integrantsLines;
        doc.text('ATENTAMENTE', (this.WIDTH / 2), observationY < 220 ? 220 : observationY, { align: 'center' });
        doc.setFont(this.FONT, 'Normal');
        doc.text(jefe, (this.WIDTH / 2), 240, { align: 'center' });
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
        doc.setFontSize(14);
        doc.text(doc.splitTextToSize('CONSTANCIA DE NO INCONVENIENCIA PARA EL ACTO DE RECEPCIÓN PROFESIONAL', 150),
          (this.WIDTH / 2), 65, { align: 'center' });

        doc.setFontSize(12);

        const date = new Date();
        doc.text(`Tepic, Nayarit a ${moment(date).format('LL')}`, this.MARGIN.LEFT, 100, { align: 'left' });

        doc.setFont(this.FONT, 'Bold');
        doc.text('C. ' + this._request.student.fullName, (this.WIDTH / 2), 115, { align: 'center' });

        doc.setFont(this.FONT, 'Normal');
        doc.text(doc.splitTextToSize('Me permito informarle de acuerdo a su solicitud, que no existe inconveniente para que pueda Ud. ' +
          'Presentar su Acto de Recepción Profesional, ya que su expediente quedo integrado para tal efecto.', 176),
          this.MARGIN.LEFT, 130, { align: 'left' });

        doc.setFont(this.FONT, 'Bold');
        doc.text('ATENTAMENTE', this.MARGIN.LEFT, 147, { align: 'left' });


        doc.text('KERVIN GARCIA CARLOS', this.MARGIN.LEFT, 197, { align: 'left' });
        doc.text('JEFE DE SERVICIOS ESCOLARES', this.MARGIN.LEFT, 203, { align: 'left' });
        doc.text('Sabiduría Tecnológic, Pasión de nuestro Espíritu', this.MARGIN.LEFT, 210, { align: 'left' });
        doc.text('Clave del instituto 18DIT0002Z', this.MARGIN.LEFT, 217, { align: 'left' });

        return doc;
    }

    private newDocumentTec(): jsPDF {
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
        this.addHeaderTec(doc);
        this.addFooterTec(doc);
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

    private addTable(document: jsPDF, data: Array<Object>, startY: number) {
        // @ts-ignore
        document.autoTable({
            theme: 'grid',
            startY: startY,
            margin: { left: this.MARGIN.LEFT },
            bodyStyles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], font: this.FONT, fontStyle: 'Normal', fontSize: 11 },
            body: data
        });
    }
}
