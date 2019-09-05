import { iRequest } from "./request.model";
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ImageToBase64Service } from 'src/services/img.to.base63.service';
import autoTable from 'jspdf-autotable';
export class uRequest {
    // private Configuration = {
    //     dimension: {
    //         width: 216,
    //         height: 279
    //     },
    //     margin: {
    //         left: 20,
    //         right: 20,
    //         top: 25,
    //         bottom: 25,
    //     },
    //     font: 'Times'
    // };

    private WIDTH: number = 216;
    private HEIGHT: number = 279;
    private FONT: string = 'Times';
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
        }
    // private WIDTH: number = this.SIZE.width - (this.SIZE.leftMargin + this.SIZE.rightMargin);
    // private HEIGHT: number = this.SIZE.height - (this.SIZE.topMargin + this.SIZE.bottomMargin);
    private sepLogo: any;
    private tecNacLogo: any;
    private tecNacLogoTitle: any;
    private tecLogo: any;

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
    }

    protocolActRequest(): jsPDF {
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        //Title        
        doc.setFont("Times", "Bold");
        //doc.setFontSize(14);
        //doc.text("Registro ITT-POS-02-01", (this.WIDTH / 2), 30, { align: 'center' });
        doc.setFontSize(11);
        doc.text("SOLICITUD   DEL   ESTUDIANTE", (this.WIDTH / 2), 35, { align: 'center' });
        doc.text("PARA  LA TITULACIÓN  INTEGRAL", (this.WIDTH / 2), 40, { align: 'center' });

        //Fecha
        doc.setFont("Times", "Roman");
        doc.setFontSize(12);
        doc.text(doc.splitTextToSize("Lugar y fecha:", 60), 147, 55, { align: 'left' });
        doc.text(doc.splitTextToSize("Tepic, Nayarit", 60), 174, 55, { align: 'left' });
        doc.text(doc.splitTextToSize(this.getDate(), 60), 155, 60, { align: 'left' });

        //Saludos
        doc.setFont("Times", "Bold");
        let jefe = "MDO LUIS ALBERTO GARNICA LOPEZ";
        let tmn = doc.getTextWidth(jefe);
        doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 67, { align: 'left' });
        //doc.line(35, 68, 35 + tmn, 68);
        doc.text(doc.splitTextToSize("JEFE DE LA DIVISION DE ESTUDIOS PROFESIONALES", 150), this.MARGIN.LEFT, 74, { align: 'left' });
        doc.text("PRESENTE", this.MARGIN.LEFT, 80, { align: 'left' });

        doc.text(doc.splitTextToSize("AT´N. " + jefe, 150), (this.WIDTH / 2), 89, { align: 'left' });
        //doc.line((this.WIDTH / 2) + 10, 89, (this.WIDTH / 2) + 10 + tmn, 89);
        doc.text(doc.splitTextToSize("COORDINADOR DE APOYO A TITULACION", 100), (this.WIDTH / 2), 97, { align: 'left' });

        doc.setFont("Times", "Roman");
        doc.text(doc.splitTextToSize("Por medio del presente solicito autorización para iniciar trámite de registro del proyecto de titulación integral", 185), this.MARGIN.LEFT, 125, { align: 'left' });
        
        // doc.text("Por medio del presente solicito autorización para iniciar trámite de registro del proyecto", this.MARGIN.LEFT, 117, { align: 'left' });
        // doc.text("de titulación integral:", this.MARGIN.LEFT, 125, { align: 'left' });

        this.addTable(doc, [
            ['Nombre: ', this._request.student.fullName],
            ['Carrera: ', this._request.student.career],
            ['No. de control: ', this._request.student.controlNumber],
            ['Nombre del proyecto: ', this._request.projectName],
            ['Producto: ', this._request.product]
        ], 137);

        doc.text("En espera de la aceptación de esta solicitud, quedo a sus órdenes", this.MARGIN.LEFT, 180, { align: 'left' });
        doc.setFont("Times", "Bold");
        doc.text("ATENTAMENTE", (this.WIDTH / 2), 200, { align: 'center' });

        doc.text(this._request.student.fullName, (this.WIDTH / 2), 207, { align: 'center' });
        doc.setFont("Times", "Roman");
        tmn = doc.getTextWidth(this._request.student.fullName);
        doc.setFont("Times", "Bold");
        this.addLineCenter(doc, "Nombre y firma del estudiante", 209);

        this.addTable(doc, [
            ['Telefóno particular o de contacto: ', this._request.telephone],
            ['Correo electrónico del estudiante: ', this._request.email]
        ], 224);
        return doc;
    }
    projectRegistrationOffice(): jsPDF {
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        //Title        
        doc.setFont("Times", "Bold");
        doc.setFontSize(14);
        //doc.text("Registro ITT-POS-02-01", (this.SIZE.width / 2), 30, { align: 'center' });
        doc.setFontSize(11);
        doc.text("FORMATO DE REGISTRO DE PROYECTO", (this.WIDTH / 2), 35, { align: 'center' });
        doc.text("PARA LA TITULACIÓN INTEGRAL", (this.WIDTH / 2), 40, { align: 'center' });

        doc.setFont("Times", "Roman");
        doc.setFontSize(12);
        doc.text("Asunto: Registro de proyecto para la titulación integral", (this.WIDTH / 2) * 3, 55, { align: 'left' });

        //Saludos
        doc.setFont("Times", "Bold");
        let jefe = "MDO LUIS ALBERTO GARNICA LOPEZ";
        let tmn = doc.getTextWidth(jefe);
        doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 62, { align: 'left' });
        //doc.line(30, 64, 35 + tmn, 64);
        doc.text(doc.splitTextToSize("Jefe(a) de la División de Estudios Profesionales", 150), this.MARGIN.LEFT, 70, { align: 'left' });

        doc.text("PRESENTE", this.MARGIN.LEFT, 80, { align: 'left' });

        doc.setFont("Times", "Roman");
        doc.text("Departamento de Sistemas Computacionales", this.MARGIN.LEFT, 87, { align: 'left' });
        doc.text("Lugar: Tepic, Nayarit y Fecha:" + this.getDate(), this.MARGIN.LEFT, 94, { align: 'left' });

        this.addTable(doc, [
            ['Nombre del proyecto: ', this._request.projectName],
            ['Nombre(s) del (de los) asesores(es): ', this._request.adviser],
            ['Número de estudiantes ', this._request.noIntegrants]
        ], 101);

        doc.text("Datos del (de los) estudiante(s):", this.MARGIN.LEFT, 130, { align: 'left' });


        let students: Array<Object> = [];
        students.push(['Nombre', 'No. de control', 'Carrera']);
        students.push([this._request.student.fullName, this._request.student.controlNumber, this._request.student.career]);
        if (this._request.noIntegrants > 1) {
            this._request.integrants.forEach(e => {
                students.push([e.name, e.controlNumber, e.career]);
            });
        }
        // this.addTable(doc, [
        //     ['Nombre', 'No. de control', 'Carrera'],
        //     [this._request.student.fullName, this._request.student.controlNumber, this._request.student.career]
        // ], 137)
        this.addTable(doc, students, 137)
        doc.rect(this.MARGIN.LEFT, 160+(10 * (this._request.noIntegrants - 1)), this.WIDTH - (this.MARGIN.RIGHT + this.MARGIN.LEFT - 8), 50);
        doc.text("Observaciones: ", this.MARGIN.LEFT + 3, 165 + (10 * (this._request.noIntegrants - 1)), { align: 'left' });
        doc.text(doc.splitTextToSize(this._request.observation, 150), this.MARGIN.LEFT + 3, 170, { align: 'left' });

        doc.setFont("Times", "Bold");
        doc.text("ATENTAMENTE", (this.WIDTH / 2), 215, { align: 'center' });

        doc.setFont("Times", "Roman");
        doc.text(jefe, (this.WIDTH / 2), 237, { align: 'center' });
        // tmn = doc.getTextWidth(jefe);
        // doc.line((this.WIDTH / 2) - (tmn / 2), 239, (this.WIDTH / 2) + (tmn / 2), 209);        
        //this.addLineCenter(doc,jefe,237);
        //doc.setFont("Times", "Bold");
        //doc.text("Nombre y firma del (de la) Jefe(a) de Departamento Académico", (this.WIDTH / 2), 244, { align: 'center' });
        this.addLineCenter(doc, "Nombre y firma del (de la) Jefe(a) de Departamento Académico", 244);

        return doc;
    }


    projectRelease(): jsPDF {
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        //Title        
        doc.setFont("Times", "Bold");
        doc.setFontSize(14);
        //doc.text("Registro ITT-POS-02-01", (this.SIZE.width / 2), 30, { align: 'center' });
        doc.setFontSize(11);
        doc.text("FORMATO DE LIBERACIÓN DE PROYECTO", (this.WIDTH / 2), 35, { align: 'center' });
        doc.text("PARA LA TITULACIÓN INTEGRAL", (this.WIDTH / 2), 40, { align: 'center' });

        doc.setFont("Times", "Roman");
        doc.setFontSize(12);
        //doc.text("Lugar: Tepic, Nayarit y Fecha:" + this.getDate(), 147, 70, { align: 'left' });
        doc.text(doc.splitTextToSize("Lugar y fecha:", 60), 147, 55, { align: 'left' });
        doc.text(doc.splitTextToSize("Tepic, Nayarit", 60), 174, 55, { align: 'left' });
        doc.text(doc.splitTextToSize(this.getDate(), 60), 174, 60, { align: 'left' });


        doc.text("Asunto: Liberación de proyecto para la titulación integral", (this.WIDTH / 2) * 3, 77, { align: 'left' });

        //Saludos
        doc.setFont("Times", "Bold");
        let jefe = "MDO LUIS ALBERTO GARNICA LOPEZ";
        let tmn = doc.getTextWidth(jefe);
        doc.text(doc.splitTextToSize(jefe, 150), this.MARGIN.LEFT, 85, { align: 'left' });
        //doc.line(30, 64, 35 + tmn, 64);
        doc.text(doc.splitTextToSize("Jefe(a) de la División de Estudios Profesionales", 150), this.MARGIN.LEFT, 92, { align: 'left' });

        doc.text("PRESENTE", this.MARGIN.LEFT, 100, { align: 'left' });

        doc.setFont("Times", "Roman");
        doc.text(doc.splitTextToSize("Por este medio informo que ha sido liberado el siguiente proyecto para la titulación:", 176), this.MARGIN.LEFT, 107, { align: 'left' });
        //doc.text("", this.MARGIN.LEFT, 114, { align: 'left' });            

        this.addTable(doc, [
            ['Nombre del estudiante y/o egresado: ', this._request.student.fullName],
            ['Carrera: ', this._request.student.career],
            ['No. de control: ', this._request.student.controlNumber],
            ['Nombre del proyecto: ', this._request.projectName],
            ['Producto ', 'DEMO']
        ], 120);

        doc.text(doc.splitTextToSize("Agradezco de antemano su valioso apoyo en esta importante actividad para la formación profesional de nuestros egresados", 176), this.MARGIN.LEFT, 174, { align: 'left' });
        //doc.text("formación profesional de nuestros egresados", this.MARGIN.LEFT, 174, { align: 'left' });      

        doc.setFont("Times", "Bold");
        doc.text("ATENTAMENTE", (this.WIDTH / 2), 190, { align: 'center' });

        doc.setFont("Times", "Roman");
        doc.text(jefe, (this.WIDTH / 2), 215, { align: 'center' });
        this.addLineCenter(doc, "Nombre y firma del (de la) Jefe(a) de Departamento Académico", 217);

        this.addTable(doc, [
            [this._request.adviser],
            ['Nombre y firma del asesor']
        ], 227)
        return doc;
    }

    noInconvenience(): jsPDF {
        const doc = this.newDocumentTec();
        doc.setTextColor(0, 0, 0);
        doc.setFont("Times", "Bold");
        doc.setFontSize(14);
        doc.text(doc.splitTextToSize("CONSTANCIA DE NO INCONVENIENCIA PARA EL ACTO DE RECEPCIÓN PROFESIONAL", 150), (this.WIDTH / 2), 65, { align: 'center' });

        doc.setFontSize(12);

        let date = new Date();
        doc.text("Tepic, Nayarit a " + date.getDate() + " de " + this.getMonth(date.getMonth()) + " de " + date.getFullYear(), this.MARGIN.LEFT, 100, { align: 'left' });

        doc.setFont("Times", "Bold");
        doc.text("C. " + this._request.student.fullName, (this.WIDTH / 2), 115, { align: 'center' });

        doc.setFont("Times", "Roman");
        doc.text(doc.splitTextToSize("Me permito informarle de acuerdo a su solicitud, que no existe inconveniente para que pueda Ud. Presentar su Acto de Recepción Profesional, ya que su expediente quedo integrado para tal efecto.", 176), this.MARGIN.LEFT, 130, { align: 'left' });

        doc.setFont("Times", "Bold");
        doc.text("ATENTAMENTE", this.MARGIN.LEFT, 147, { align: 'left' });


        doc.text("KERVIN GARCIA CARLOS", this.MARGIN.LEFT, 197, { align: 'left' });
        doc.text("JEFE DE SERVICIOS ESCOLARES", this.MARGIN.LEFT, 203, { align: 'left' });
        doc.text("Sabiduría Tecnológic, Pasión de nuestro Espíritu", this.MARGIN.LEFT, 210, { align: 'left' });
        doc.text("Clave del instituto 18DIT0002Z", this.MARGIN.LEFT, 217, { align: 'left' });

        return doc;
    }


    private newDocumentTec(): jsPDF {
        const doc = new jsPDF({
            unit: 'mm',
            format: 'letter'
        });
        doc.setTextColor(0, 0, 0);
        this.addHeaderTec(doc);
        doc.setTextColor(0, 0, 0);
        this.addFooterTec(doc);
        return doc;
    }
    private addHeaderTec(document: jsPDF) {
        document.setFont(this.FONT, "Roman");
        document.setFontSize(9);
        //Logo Izquierdo 
        document.addImage(this.sepLogo, 'PNG', this.MARGIN.LEFT, 10, 22, 14);
        //Logo Derecho
        document.addImage(this.tecNacLogoTitle, 'PNG', 165, 10, 20, 12);
        document.text("Instituto Tecnólogico de Tepic", 165, 25, { align: 'left' });
    }

    private addFooterTec(document: jsPDF) {
        document.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
        //document.setTextColor(183, 178, 178);
        document.text("Av. Tecnológico #2595 Fracc. Lagos del Country C.P. 63175", (this.WIDTH / 2), 260, { align: 'center' });
        document.text("Tepic, Nayarit Tel. 01 (311) 211 94 00 y 211 94 01. email: info@ittepic.edu.mx", (this.WIDTH / 2), 265, { align: 'center' });
        document.text("www.ittepic.edu.mx", (this.WIDTH / 2), 270, { align: 'center' });
    }

    private addLineCenter(document: jsPDF, text: string, startY: number) {
        let tmn = document.getTextWidth(text);
        document.setFont("Times", "Bold");
        document.setDrawColor(0, 0, 0);
        document.line((this.WIDTH / 2) - (tmn / 2), startY, (this.WIDTH / 2) + (tmn / 2), startY);
        document.text(text, (this.WIDTH / 2), startY + 5, { align: 'center' });
    }

    private addTable(document: jsPDF, data: Array<Object>, startY: number) {
        document.autoTable({
            theme: 'grid',
            startY: startY,
            margin: { left: this.MARGIN.LEFT },
            bodyStyles: { textColor: [0, 0, 0], lineColor: [0, 0, 0] },
            body: data
        });
    }
    private getDate(): string {
        let date = new Date();
        let m = date.getMonth(), d = date.getDate(), a = date.getFullYear();
        let dateString = "";
        return dateString.concat(this.getMonth(m), ' ', (d < 10 ? ("0" + d.toString()) : d.toString()), ", ", a.toString(), ".");
    }
    private getMonth(m: number) {
        let month = "";
        switch (m) {
            case 0: {
                month = "Enero";
                break;
            }
            case 1: {
                month = "Febrero";
                break;
            }
            case 2: {
                month = "Marzo";
                break;
            }
            case 3: {
                month = "Abril";
                break;
            }
            case 4: {
                month = "Mayo";
                break;
            }
            case 5: {
                month = "Junio";
                break;
            }
            case 6: {
                month = "Julio";
                break;
            }
            case 7: {
                month = "Agosto";
                break;
            }
            case 8: {
                month = "Septiembre";
                break;
            }
            case 9: {
                month = "Octubre";
                break;
            }
            case 10: {
                month = "Noviembre";
                break;
            }
            case 11: {
                month = "Diciembre";
                break;
            }
            default: {
                month = "";
            }
        }
        return month;
    }


    // requirementsSheet(): jsPDF {
    //     const doc = this.newDocumentTec();
    //     doc.setTextColor(0, 0, 0);
    //     let lMARGIN = {
    //         LEFT: 15,
    //         TOP: 10,
    //         RIGHT: 15,
    //         BOTTOM: .3,
    //     };

    //     doc.setFont("Times", "Bold");
    //     doc.setFontSize(14);
    //     doc.text("INSTITUTO TECNOLÓGICO DE TEPIC", (this.WIDTH / 2), 35, { align: 'center' });
    //     doc.text("DEPARTAMENTO DE SERVICIOS ESCOLARES", (this.WIDTH / 2), 42, { align: 'center' });
    //     doc.text("OFICINA DE SERVICIOS ESTUDIANTILES", (this.WIDTH / 2), 49, { align: 'center' });

    //     // doc.setFont("Times", "Roman");
    //     doc.setFontSize(10);
    //     doc.text(doc.splitTextToSize("REQUISITOS PARA GESTIÓN DE TÍTULO  PROFESIONAL, ANTE EL TECNOLÓGICO NACIONAL DE MÉXICO.", 176), lMARGIN.LEFT, 57, { align: 'left' });

    //     doc.setTextColor(255, 0, 0);
    //     doc.text(doc.splitTextToSize("PARA LA ENTREGAR  DE EXPEDIENTE  CONSULTAR CALENDARIO  ESCOLAR", 176), lMARGIN.LEFT, 67, { align: 'left' });


    //     doc.setTextColor(0, 0, 0);
    //     doc.setFontSize(9);
    //     doc.text("OPCIONES I, II, III, IV, V, VI, VII, X y TITULACIÓN INTEGRAL", (this.WIDTH / 2), 75, { align: 'center' });

    //     return doc;
    // }
    // generatePdf(): jsPDF {
    //     const doc = new jsPDF({
    //         unit: 'mm',
    //         format: 'letter'
    //     });
    //     let depto = "DEPARTAMENTO DE CIENCIAS ECONOMICO ADMINISTRATIVAS";
    //     console.log("REQUEST", this._request);
    //     console.log("Lista", doc.getFontList());

    //     doc.setFont("Times", "Roman");
    //     doc.setFontSize(9);
    //     //Logo Izquierdo 
    //     doc.addImage(this.sepLogo, 'PNG', this.SIZE.leftMargin, this.SIZE.topMargin, 38, 17);

    //     //Logo Derecho
    //     doc.addImage(this.tecNacLogo, 'JPG', this.SIZE.width * (2 / 3) - this.SIZE.rightMargin, this.SIZE.topMargin, 11, 17);
    //     doc.text("TECNOLÓGICO NACIONAL DE MÉXICO", 137, 33, { align: 'left' });
    //     doc.text("Instituto Tecnólogico de Tepic", 147, 40, { align: 'left' });

    //     //Nombre del documentos
    //     doc.setFont("Times", "Bold");
    //     doc.text("FORMATO DE REGISTRO DE PROYECTO", (this.SIZE.width / 2), 59, { align: 'center' });

    //     //Lugar y fecha
    //     doc.text("TEPIC, NAYARIT; " + this.getDate(), 147, 68, { align: 'left' });

    //     //Emisor
    //     doc.setFont("Times", "Roman");
    //     doc.text(doc.splitTextToSize(this._request.department.name, 60), 147, 72, { align: 'left' });

    //     //Cuerpo del documento

    //     //Datos del Proyecto
    //     doc.text(doc.splitTextToSize("NOMBRE DEL PROYECTO", 25), this.SIZE.leftMargin + 10, 85, { align: 'left' });
    //     doc.text(doc.splitTextToSize(this._request.projectName, 115), (this.SIZE.width / 2) - 30, 85, { align: 'left' });


    //     doc.text(doc.splitTextToSize("NOMBRE DEL ASESOR", 25), this.SIZE.leftMargin + 10, 95, { align: 'left' });
    //     doc.text(doc.splitTextToSize(this._request.adviser, 115), (this.SIZE.width / 2) - 30, 95, { align: 'left' });


    //     doc.text(doc.splitTextToSize("NÚMERO DE ESTUDIANTES", 25), this.SIZE.leftMargin + 10, 105, { align: 'left' });
    //     doc.text(this._request.noIntegrants.toString(), (this.SIZE.width / 2) - 30, 105, { align: 'left' });
    //     //Datos del estudiante
    //     doc.setFont("Times", "Bold");
    //     doc.text("DATOS DEL ESTUDIANTE", (this.SIZE.width / 2), 115, { align: 'center' });

    //     doc.setFont("Times", "Roman");

    //     doc.text("NOMBRE", this.SIZE.leftMargin + 10, 125, { align: 'left' });
    //     doc.text(doc.splitTextToSize(this._request.student.fullName, 115), (this.SIZE.width / 2) - 30, 125, { align: 'left' });

    //     doc.text("NO. CONTROL", this.SIZE.leftMargin + 10, 135, { align: 'left' });
    //     doc.text(this._request.student.controlNumber, (this.SIZE.width / 2) - 30, 135, { align: 'left' });

    //     doc.text("CARRERA", this.SIZE.leftMargin + 10, 145, { align: 'left' });
    //     doc.text(doc.splitTextToSize(this._request.student.career, 115), (this.SIZE.width / 2) - 30, 145, { align: 'left' });

    //     doc.text("OBSERVACIONES", this.SIZE.leftMargin + 10, 155, { align: 'left' });
    //     doc.text(doc.splitTextToSize(this._request.observation, 115), (this.SIZE.width / 2) - 30, 155, { align: 'left' });

    //     //Tipo de titulacion
    //     doc.setFont("Times", "Bold");
    //     doc.text("TITULACIÓN INTEGRAL", (this.SIZE.width / 2), 165, { align: 'center' });

    //     doc.text("ATENTAMENTE", this.SIZE.leftMargin, 185, { align: 'left' });

    //     doc.setFont("Times", "Italic");
    //     doc.text("Excelencia en Educación Tecnológica.", this.SIZE.leftMargin, 190, { align: 'left' });
    //     doc.text("Sabiduria Tecnologica, Pasión de nuestro espíritu.", this.SIZE.leftMargin, 195, { align: 'left' });

    //     doc.setFont("Times", "Bold");
    //     doc.text(this._request.department.boss, this.SIZE.leftMargin, 235, { align: 'left' });
    //     doc.text("JEFE " + this._request.department.name, this.SIZE.leftMargin, 240, { align: 'left' });


    //     doc.addImage(this.tecLogo, 'PNG', this.SIZE.leftMargin, this.SIZE.height - this.SIZE.bottomMargin, 17, 17);
    //     doc.text("Av. Tecnológico #2595 Fracc. Lagos del Country C.P. 63175", (this.SIZE.width / 2), 260, { align: 'center' });
    //     doc.text("Tepic, Nayarit Tel. 01 (311) 211 94 00 y 211 94 01. info@ittepic.edu.mx", (this.SIZE.width / 2), 265, { align: 'center' });
    //     return doc;
    // }

}
