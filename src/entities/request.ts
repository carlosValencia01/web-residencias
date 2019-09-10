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
        console.log("Listas",doc.getFontList());
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
                
        // doc.addFileToVFS("montserrat.ttf",this.getFont64);
        // doc.addFont("montserrat.ttf", "Montserrat","Normal");
        //doc.setFont("Montserrat","Normal");
        
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

    getFont64():String {
        return "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FyIVFDMyNjU0ByIGFRQWMzI1NCbLRFA9JixbTU5bLihAT0RNTSQoTSovLytZLwK/OjI7HA43JDdBQDckOA4dPTE4OTg3HRo4rSEeHyFAHiEAAgAhARsBbQK/ABUAIQAAEyInNxYzMjYnBiMiJjU0NjMyFhUUBicyNjU0JiMiBhUUFrBHPSEoNjs7BRtXPktURlNfZ0onLSkoJSooARshPBpMRUBIPUBLbF9id9MoHxwpJSIhJAAAAAAAABoBPgABAAAAAAAAADsAeAABAAAAAAABAAoAygABAAAAAAACAAcA5QABAAAAAAADAB0BKQABAAAAAAAEAAoBXQABAAAAAAAFAEgB+gABAAAAAAAGABICaQABAAAAAAAIABECoAABAAAAAAAJABEC1gABAAAAAAALABkDHAABAAAAAAAMABkDagABAAAAAAANAJAEpgABAAAAAAAOABoFbQADAAEECQAAAHYAAAADAAEECQABABQAtAADAAEECQACAA4A1QADAAEECQADADoA7QADAAEECQAEABQBRwADAAEECQAFAJABaAADAAEECQAGACQCQwADAAEECQAIACICfAADAAEECQAJACICsgADAAEECQALADIC6AADAAEECQAMADIDNgADAAEECQANASADhAADAAEECQAOADQFNwBDAG8AcAB5AHIAaQBnAGgAdAAgAKkAIAAyADAAMQA0ACAAYgB5ACAASgB1AGwAaQBlAHQAYQAgAFUAbABhAG4AbwB2AHMAawB5AC4AIABBAGwAbAAgAHIAaQBnAGgAdABzACAAcgBlAHMAZQByAHYAZQBkAC4AAENvcHlyaWdodCCpIDIwMTQgYnkgSnVsaWV0YSBVbGFub3Zza3kuIEFsbCByaWdodHMgcmVzZXJ2ZWQuAABNAG8AbgB0AHMAZQByAHIAYQB0AABNb250c2VycmF0AABSAGUAZwB1AGwAYQByAABSZWd1bGFyAAAxAC4AMAAwADAAOwBVAEsAVwBOADsATQBvAG4AdABzAGUAcgByAGEAdAAtAFIAZQBnAHUAbABhAHIAADEuMDAwO1VLV047TW9udHNlcnJhdC1SZWd1bGFyAABNAG8AbgB0AHMAZQByAHIAYQB0AABNb250c2VycmF0AABWAGUAcgBzAGkAbwBuACAAMQAuADAAMAAwADsAUABTACAAMAAwADIALgAwADAAMAA7AGgAbwB0AGMAbwBuAHYAIAAxAC4AMAAuADcAMAA7AG0AYQBrAGUAbwB0AGYALgBsAGkAYgAyAC4ANQAuADUAOAAzADIAOQAgAEQARQBWAEUATABPAFAATQBFAE4AVAAAVmVyc2lvbiAxLjAwMDtQUyAwMDIuMDAwO2hvdGNvbnYgMS4wLjcwO21ha2VvdGYubGliMi41LjU4MzI5IERFVkVMT1BNRU5UAABNAG8AbgB0AHMAZQByAHIAYQB0AC0AUgBlAGcAdQBsAGEAcgAATW9udHNlcnJhdC1SZWd1bGFyAABKAHUAbABpAGUAdABhACAAVQBsAGEAbgBvAHYAcwBrAHkAAEp1bGlldGEgVWxhbm92c2t5AABKAHUAbABpAGUAdABhACAAVQBsAGEAbgBvAHYAcwBrAHkAAEp1bGlldGEgVWxhbm92c2t5AABoAHQAdABwADoALwAvAHcAdwB3AC4AegBrAHkAcwBrAHkALgBjAG8AbQAuAGEAcgAvAABodHRwOi8vd3d3LnpreXNreS5jb20uYXIvAABoAHQAdABwADoALwAvAHcAdwB3AC4AegBrAHkAcwBrAHkALgBjAG8AbQAuAGEAcgAvAABodHRwOi8vd3d3LnpreXNreS5jb20uYXIvAABUAGgAaQBzACAARgBvAG4AdAAgAFMAbwBmAHQAdwBhAHIAZQAgAGkAcwAgAGwAaQBjAGUAbgBzAGUAZAAgAHUAbgBkAGUAcgAgAHQAaABlACAAUwBJAEwAIABPAHAAZQBuACAARgBvAG4AdAAgAEwAaQBjAGUAbgBzAGUALAAgAFYAZQByAHMAaQBvAG4AIAAxAC4AMQAuACAAVABoAGkAcwAgAGwAaQBjAGUAbgBzAGUAIABpAHMAIABhAHYAYQBpAGwAYQBiAGwAZQAgAHcAaQB0AGgAIABhACAARgBBAFEAIABhAHQAOgAgAGgAdAB0AHAAOgAvAC8AcwBjAHIAaQBwAHQAcwAuAHMAaQBsAC4AbwByAGcALwBPAEYATAAAVGhpcyBGb250IFNvZnR3YXJlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBTSUwgT3BlbiBGb250IExpY2Vuc2UsIFZlcnNpb24gMS4xLiBUaGlzIGxpY2Vuc2UgaXMgYXZhaWxhYmxlIHdpdGggYSBGQVEgYXQ6IGh0dHA6Ly9zY3JpcHRzLnNpbC5vcmcvT0ZMAABoAHQAdABwADoALwAvAHMAYwByAGkAcAB0AHMALgBzAGkAbAAuAG8AcgBnAC8ATwBGAEwAAGh0dHA6Ly9zY3JpcHRzLnNpbC5vcmcvT0ZMAAAAAAIAAAAAAAD/tQAyAAAAAAAAAAAAAAAAAAAAAAAAAAABfAAAAAEAAgADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEBAgCjAIQAhQC9AJYA6ACGAI4AiwCdAKkApAEDAIoA2gCDAJMA8gDzAI0AlwCIAMMA3gDxAJ4AqgD1APQA9gCiAK0AyQDHAK4AYgBjAJAAZADLAGUAyADKAM8AzADNAM4A6QBmANMA0ADRAK8AZwDwAJEA1gDUANUAaADrAO0AiQBqAGkAawBtAGwAbgCgAG8AcQBwAHIAcwB1AHQAdgB3AOoAeAB6AHkAewB9AHwAuAChAH8AfgCAAIEA7ADuALoBBAEFAQYBBwEIAQkA/QD+AP8BAAEKAQsBDAEBAQ0BDgEPARABEQESARMBFAD4APkBFQEWARcBGAEZARoBGwEcAR0A+gDXAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAOIA4wEtAS4BLwEwATEBMgEzATQBNQE2ALAAsQE3ATgBOQE6ATsBPAE9AT4A+wD8AOQA5QE/AUABQQFCAUMBRAFFAUYBRwFIAUkBSgFLAUwBTQFOALsBTwFQAVEBUgDmAOcApgFTAVQBVQFWAVcA2ADhAVgA2wDcAN0A4ADZAN8BWQCoAJsBWgFbAVwBXQFeAV8BYAFhALIAswC2ALcAxAC0ALUAxQCCAMIAhwCrAMYAvgC/ALwBYgFjAIwAnwFkAWUBZgFnAWgAmACaAJkA7wFpAWoApQCSAJwApwCPAJQAlQC5AMAAwQFrAWwBbQFuAW8BcAFxAXIBcwF0AXUBdgF3AXgBeQF6AXsBfAF9AX4HbmJzcGFjZQpzb2Z0aHlwaGVuB0FtYWNyb24HYW1hY3JvbgZBYnJldmUGYWJyZXZlB0FvZ29uZWsHYW9nb25lawZEY2Fyb24GZGNhcm9uBkRjcm9hdAdFbWFjcm9uB2VtYWNyb24KRWRvdGFjY2VudAplZG90YWNjZW50B0VvZ29uZWsHZW9nb25lawZFY2Fyb24GZWNhcm9uDEdjb21tYWFjY2VudAxnY29tbWFhY2NlbnQEaGJhcgZJdGlsZGUGaXRpbGRlB0ltYWNyb24HaW1hY3JvbgdJb2dvbmVrB2lvZ29uZWsCSUoCaWoLSmNpcmN1bWZsZXgLamNpcmN1bWZsZXgMS2NvbW1hYWNjZW50CGtjZWRpbGxhDGtncmVlbmxhbmRpYwZMYWN1dGUGbGFjdXRlDExjb21tYWFjY2VudAxsY29tbWFhY2NlbnQGTGNhcm9uBmxjYXJvbgRMZG90BGxkb3QGTmFjdXRlBm5hY3V0ZQxOY29tbWFhY2NlbnQMbmNvbW1hYWNjZW50Bk5jYXJvbgZuY2Fyb24HT21hY3JvbgdvbWFjcm9uDU9odW5nYXJ1bWxhdXQNb2h1bmdhcnVtbGF1dAZSYWN1dGUGcmFjdXRlDFJjb21tYWFjY2VudAxyY29tbWFhY2NlbnQGUmNhcm9uBnJjYXJvbgZTYWN1dGUGc2FjdXRlCFRjZWRpbGxhCHRjZWRpbGxhBlRjYXJvbgZ0Y2Fyb24HVW1hY3Jvbgd1bWFjcm9uBVVyaW5nBXVyaW5nDVVodW5nYXJ1bWxhdXQNdWh1bmdhcnVtbGF1dAdVb2dvbmVrB3VvZ29uZWsLV2NpcmN1bWZsZXgLd2NpcmN1bWZsZXgLWWNpcmN1bWZsZXgLeWNpcmN1bWZsZXgGWmFjdXRlBnphY3V0ZQpaZG90YWNjZW50Cnpkb3RhY2NlbnQMU2NvbW1hYWNjZW50DHNjb21tYWFjY2VudAxUY29tbWFhY2NlbnQMdGNvbW1hYWNjZW50CGRvdGxlc3NqEGZpcnN0dG9uZWNoaW5lc2ULY29tbWFhY2NlbnQGV2dyYXZlBndncmF2ZQZXYWN1dGUGd2FjdXRlCVdkaWVyZXNpcwl3ZGllcmVzaXMGWWdyYXZlBnlncmF2ZQRFdXJvCWxpdGVyU2lnbgllc3Rp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AMYAyADKAMwAzgDQANIA1ADWANgA2gDdAN8A4QDjAOUA5wDpAOwA7gDwAPIA9AD2APgA+gD8AP4BAAECAQQBBgEIAQoBDAEOARABEgEUARYBGAEaARwBHgEfASEBIwEmASgBNQE3ATkBOwE9AVIAAQJmAAQAAABnANgA3gDkAOoA8AD2AQAA8ADwAUoBUAFaAWwA5AHGAdgB3gHsAewB7AHYAdgB9gH2AfwA8ADwAPAA8ADwAPAA8AFKAUoBSgFKAVACCgHsAewB7AHsAewB7AHYAdgB2AHYAPAB7AHYAdgB2AHYAdgB2AH2AdgB9gHsAewB7ADwAPAB2AHYAdgB7AFKAUoB7AHsAewA8AHYAPAB2AFKAUoBSgFKAVAB9gFQAfYBUAFQAfYBUAH2AVAB9gFQAfYCEAIWAiACQgJIAk4CVAJaAmAAAQAR/8UAAQAc//cAAQAc/+4AAQAR/+IAAQA8//0AAgAR//sALf/5ABIAJv/pACr/6QAy/+kANP/pAIn/6QCU/+kAlf/pAJb/6QCX/+kAmP/pAJr/6QDI/+kAyv/pANj/6QDa/+kA/P/pAP7/6QEA/+kAAQAt//kAAgAt//8AMv/8AAQACf/yABH/+gAt//8AMv/8ABYACf/gABH//wAm/+IAKv/iAC3/5AAy/+IANP/iAIn/4gCU/+IAlf/iAJb/4gCX/+IAmP/iAJr/4gDI/+IAyv/iANj/4gDa/+IA5//kAPz/4gD+/+IBAP/iAAQALf/5ADL//wA///kAYP/fAAEALf/VAAMALf/VAD//9ABg/9cAAgAt//kAMv//AAEALf/1AAMAEf/2AC3/+wDn//sAAQA8//EAAQAR/9YAAgAJ/+sAEf/aAAgBaQAmAWoAMQFrAEUBbAAQAW0AOwFvADsBcAAUAXEADgABAU4AQQABAU4AQAABAU4AIgABAU4ALAABAU4AHgABAU4AJAABAGcACgALABIAGgAnAC0ALgAyADQAOAA5ADoAPAA+AEQARQBIAEsAUABRAFIAUwBZAFoAXACSAJQAlQCWAJcAmACaAJsAnACdAJ4AnwCgAKIAowCkAKUApgCnAKoAqwCsAK0AsgCzALQAtQC2ALcAuAC6AL8AwADBAMMAxQDHAMwAzgDRANMA1wDcAOUA5wD3APkA+wD8AP0A/gD/ARIBFAEWARgBGgEbARwBHQEeATcBOAE5AToBOwE8AT0BPgFBAUIBTgFzAXQBdQF2AXcBeAACCz4ABAAABewIegAeABkAAP/7//f/uv/s//r/8P/m//b/yv/iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/q//sAAAAAAAAAAP/s//cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+wAAAAAAAP/x//EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//EAAAAAAAD/9gAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+//s//b/zwAAAAD/7P/z/8r/0f/s//r/+P/n/+cAAP/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAD/5wAAAAD/+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/aAAAAAP/5AAAAAAAAAAD/7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//L/+gAA/+L/7gAA//b/9v/kAAAAAAAAAAD/6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/6AAAAAAAAAAD/7AAA//b/5//m//cAAAAAAAAAAAAAAAD/7AAAAAAAAAAAAAAAAAAAAAAAAAAA//oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9oAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAABfAB4AAP/o//cAAAAlAAAAGf/2/+EAAAAAAAoAAAAJAAAAAAAKAA4AHAAAAAAAAP/KAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAD/+wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/i/9QAAAAAAAAAAAAAAAAAAAAA/+QAAAAAAAAAAAAAAAAAAAAAAAAAAP/a/7v/6AAAAAAAAAAA/88AAP/u/+YAAAAAAAAAAAAA/+YAAAAA/+wAAAAA//oAAAAAAAAAAAAAAAD/8wAAAAD//QAAAAAAAAAAAAAAAP/dAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9r/4P/y/7sAAAAAAAD/1v+6AAD/8AAA/8j/2v/a/9gAAAAA/8sAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+4AAP/w/+v/6gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/97/2v/w//b/4gAA//r/2QAA//oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGgAAAAD/9gAA//IAAAAAAAD/6wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2gAAAAD/5v/oAAD/+//6//r/7P/x//sAAP/rAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/3AAAAAAAA//sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/7AAAAAD/+v/2AAAAAAAA//YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/v/+QAAAAAAAAAAAAAAAAAAAAA/+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+//7AAAAAD/7AAAAAAAAAAAAAD/8gAAAAAAAAAAAAAAAAAAAAAAAQAkAUQAEQAaAAIACAAAABwAAAAAAAAAHQAWAA4AAAAAAAgAEAAIAAMACgATAB0ABQAFABYABQAAAAAAAAAAAAAAAAAAABUAAAAUAAQAAAANAAAAFQAMAA8ACQAEABUAFQAAAAAACwAXAAEABgAHABgAGAAJABgAGwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARABEAEQARABEAEQAAAAIAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAgACAAIAAgAAAAIAB0AHQAdAB0ABQASABoAFQAVABUAFQAVABUAAAAUAAAAAAAAAAAABwAHAAcABwAIABUAAAAAAAAAAAAAAAAAAAAHAAcABwAHABgAAAAYABEAFQARABUAEQAVAAIAFAACABQACAAEAAgABAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAADwAVAAAABwAAAAcAAAAHAAAABwAdAA8AHQAPABYAGQAZAA4ABAAOAAQADgAEAA4ABAAOAAAAAAAVAAAAFQAAABUACAAAAAgAAAAAAAAAAwAXAAMAFwADABcACgABAAoAAQAKAAEAEwAGABMABgAdAAcAHQAHAB0ABwAdAAAABQAYAAUAGAAFAAAAGwAAABsAAAAbAAAACgABABMABgAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAGAAFABgABQAYAAUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAQAAQAJAV8AEwAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAXAAsAFwAXABcACwAXABcABgAXABcAFwAXAAsAFwALABcAGAADABUACQAJAAAACQAAAAAAAgAAAAAAAAAAAA0AFgAMAAwADAABAAwAFgAPAAAAFgAWABEAEQAMABQADAARAA4AEgASAAQABAAKAAQABQAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAHAAcABwAHAAsAFwAXABcAFwAXABcAFwAXABcAFwALAAsACwALAAsAAAALABUAFQAVABUACQAXAAEADQANAA0ADQANAA0ADQAMAAwADAAMAAwAAAAAAAAAAAAMABEADAAMAAwADAAMAAAADAASABIAEgASAAQAFgAEAAcADQAHAA0ABwANAAsADAALAAwAFwAMABcADAAXAAwAFwAMABcADAAXAAwACwAMAAsADAAWABcAAAAXAAAAFwAAABcAAAAXAAAABgAAABcAFgAWABcAFgAXABYAFwAWABcAFgAXAAAAFwARABcAEQAXABEACwAM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";
    }
}
