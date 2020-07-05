const jsPDF = require('jspdf');
import 'jspdf-autotable';
import * as moment from 'moment';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { IBoss } from '../reception-act/boss.model';
import * as JsBarcode from 'jsbarcode';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';

moment.locale('es');

export class uInscription {
    private ENCABEZADO = '"2020, Año de Leona Vicario, Benemérita Madre de la Patria"';
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
    private JDeptoDiv: IBoss;
    private CDeptoDiv: IBoss;
    private JDeptoEsc: IBoss;
    private Director: IBoss;
    private bosses: any;
    private _qrCode: any;
    private _stamp: any;
    private frontBase64;
    private backBase64;
    caratulaExpediente
    private _student;
    constructor(
         public _getImage: ImageToBase64Service, 
         public _CookiesService: CookiesService,
         public inscriptionsProv: InscriptionsProvider
         ) {
        this.bosses = this._CookiesService.getBosses();
        this.JDeptoDiv = this.bosses.JDeptoDiv;
        this.CDeptoDiv = this.bosses.CDeptoDiv;
        this.JDeptoEsc = this.bosses.JDeptoEsc;
        this.Director = this.bosses.Director;
        
        this._getImageToPdf();
    }

    public setStudent(student) {
        this._student = student;
    }

    public setCode(qrCode: any, eStamp: any) {
        this._qrCode = qrCode;
        this._stamp = eStamp;
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
        this._getImage.getBase64('assets/imgs/front45A.jpg').then(res1 => {
            this.frontBase64 = res1;
        });

        this._getImage.getBase64('assets/imgs/back3.jpg').then(res2 => {
            this.backBase64 = res2;
        });
        this._getImage.getBase64('assets/imgs/CaratulaExpediente.png').then(res4 => {
            this.caratulaExpediente = res4;
        });
    }  

    bufferToBase64(buffer) {
        return btoa(new Uint8Array(buffer).reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, ''));
    }
    generateCovers(listCovers,activPeriod){
        const doc = new jsPDF();
        var pageWidth = doc.internal.pageSize.width;
        for(let i = 0; i < listCovers.length; i++){
            doc.addImage(this.caratulaExpediente, 'jpg',6, 0, 200, 295);
            doc.setFontSize(10);
            doc.setFontType('bold');
            doc.text('TECNM/02Z/SE/02S.03/'+listCovers[i].controlNumber+'/'+activPeriod,(pageWidth / 2)+30, 112,'center');

            doc.setFontSize(19);
            doc.setFontType('bold');
            doc.text(listCovers[i].fatherLastName+' '+listCovers[i].motherLastName+' '+listCovers[i].firstName, pageWidth / 2, 167,'center');
            if(i != (listCovers.length)-1){
            doc.addPage();
            }
        }
        return doc;
    }
    
    generateLabels(listCovers,activPeriod){
        const doc = new jsPDF('l', 'mm', [33.84, 479.4]);
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        for(let i = 0; i < listCovers.length; i++){
            doc.setFontSize(10);
            doc.setFontType('bold');
            //Identificador
            doc.text('TECNM/02Z/SE/02S.03/'+listCovers[i].controlNumber+'/'+activPeriod,2.5,(pageHeight/2)+1.5);

            doc.setFontSize(9.5);
            doc.setFontType('bold');
            //Nombre
            doc.text(listCovers[i].fatherLastName+' '+listCovers[i].motherLastName+' '+listCovers[i].firstName,70,(pageHeight/2)+1.5);

            doc.setFontSize(10);
            doc.setFontType('bold');
            //Carrera
            switch(listCovers[i].career){
                case "ARQUITECTURA":
                doc.text('ARQ',pageWidth-15,(pageHeight/2)+1.5);
                break;
                case "INGENIERÍA CIVIL":
                doc.text('IC',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA BIOQUÍMICA":
                doc.text('IBQ',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA EN GESTIÓN EMPRESARIAL":
                doc.text('IGE',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA QUÍMICA":
                doc.text('IQ',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA MECATRÓNICA":
                doc.text('IM',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA ELÉCTRICA":
                doc.text('IE',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES":
                doc.text('ITICS',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA EN SISTEMAS COMPUTACIONALES":
                doc.text('ISC',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "INGENIERÍA INDUSTRIAL":
                doc.text('II',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "LICENCIATURA EN ADMINISTRACIÓN":
                doc.text('LA',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "MAESTRÍA EN CIENCIAS EN ALIMENTOS":
                doc.text('MCA',pageWidth-15,(pageHeight/2)+1.5)
                break;
                case "DOCTORADO EN CIENCIAS EN ALIMENTOS":
                doc.text('DCA',pageWidth-15,(pageHeight/2)+1.5)
                break;
                default:
                doc.text('CAR',pageWidth-15,(pageHeight/2)+1.5)
                break;
            }
            //doc.text('CAR',56.6,2.5);

            if(i != (listCovers.length)-1){
                doc.addPage();
            }
        }
        return doc;
    }

    async generateCredentials(credentialStudents){
        var numCredentials = 0;
        var tempStudents = [];
        const doc = new jsPDF({
            unit: 'mm',
            format: [251, 158], // Medidas correctas: [88.6, 56]
            orientation: 'landscape'
          });
    
          for(var i = 0; i < credentialStudents.length; i++){
            if(credentialStudents[i].documents != ''){
              var docFoto = credentialStudents[i].documents.filter( docc => docc.filename ? docc.filename.indexOf('FOTO') !== -1 : false)[0] ? credentialStudents[i].documents.filter( docc => docc.filename ? docc.filename.indexOf('FOTO') !== -1 : false)[0] : '';
              if(docFoto != ''){
                // VERIFICAR SI LA FOTO ESTÁ EN ESTATUS ACEPTADO
                if(docFoto.status[docFoto.status.length-1].name == "ACEPTADO" || docFoto.status[docFoto.status.length-1].name == "VALIDADO"){
                  // VERIFICAR SI LA CREDENCIAL AUN NO ESTÁ IMPRESA
                  if(credentialStudents[i].printCredential != true){
                    tempStudents.push(credentialStudents[i]);
                    numCredentials ++;
                    // cara frontal de la credencial
                    doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);
    
                    //FOTOGRAFIA DEL ALUMNO
                    var foto = await this.findFoto(docFoto);
                    doc.addImage(foto, 'JPEG', 3.6, 7.1, 25.8, 31);
    
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(7);
                    doc.setFont('helvetica');
                    doc.setFontType('bold');
                    doc.text(49, 30.75, doc.splitTextToSize(credentialStudents[i].fullName ? credentialStudents[i].fullName : '', 35));
                    doc.text(49, 38.6, doc.splitTextToSize(this.reduceCareerString(credentialStudents[i].career ? credentialStudents[i].career : ''), 35));
                    doc.text(49, 46.5, doc.splitTextToSize(credentialStudents[i].nss ? credentialStudents[i].nss : '', 35));
    
                    // cara trasera de la credencial
                    doc.addPage();
                    doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);
    
                    // Agregar años a la credencial
                    const year = new Date();
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(4);
                    doc.setFont('helvetica');
                    doc.setFontType('bold');
                    doc.text(9.5, 41.3,year.getFullYear()+'');
                    doc.text(16.5, 41.3,(year.getFullYear()+1)+'');
                    doc.text(23.5, 41.3,(year.getFullYear()+2)+'');
                    doc.text(30.5, 41.3,(year.getFullYear()+3)+'');
                    doc.text(37.5, 41.3,(year.getFullYear()+4)+'');
    
                    // Numero de control con codigo de barra
                    doc.addImage(this.textToBase64Barcode(credentialStudents[i].controlNumber ? credentialStudents[i].controlNumber : ''), 'PNG', 46.8, 39.2, 33, 12);
                    doc.setTextColor(0, 0, 0);
                    doc.setFontSize(8);
                    doc.text(57, 53.5, doc.splitTextToSize(credentialStudents[i].controlNumber ? credentialStudents[i].controlNumber : '', 35));
    
                    //OTRA CREDENCIAL
                    if(i != (credentialStudents.length)-1){
                      doc.addPage();
                    }
                  } 
                } 
              } 
            } 
          }
          var pageCount = doc.internal.getNumberOfPages();
          if(pageCount%2 != 0){
            doc.deletePage(pageCount);
          }
          return {doc,numCredentials,tempStudents};
    }

    async generateCredential(student,docFoto){
        const doc = new jsPDF({
            unit: 'mm',
            format: [251, 158], // Medidas correctas: [88.6, 56]
            orientation: 'landscape'
          });
           // cara frontal de la credencial
           doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);

           //FOTOGRAFIA DEL ALUMNO
           var foto = await this.findFoto(docFoto);
           doc.addImage(foto, 'JPEG', 3.6, 7.1, 25.8, 31);

           doc.setTextColor(255, 255, 255);
           doc.setFontSize(7);
           doc.setFont('helvetica');
           doc.setFontType('bold');
           doc.text(49, 30.75, doc.splitTextToSize(student.fullName ? student.fullName : '', 35));
           doc.text(49, 38.6, doc.splitTextToSize(this.reduceCareerString(student.career ? student.career : ''), 35));
           doc.text(49, 46.5, doc.splitTextToSize(student.nss ? student.nss : '', 35));

           // cara trasera de la credencial
           doc.addPage();
           doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

           // Agregar años a la credencial
           const year = new Date();
           doc.setTextColor(255, 255, 255);
           doc.setFontSize(4);
           doc.setFont('helvetica');
           doc.setFontType('bold');
           doc.text(9.5, 41.3,year.getFullYear()+'');
           doc.text(16.5, 41.3,(year.getFullYear()+1)+'');
           doc.text(23.5, 41.3,(year.getFullYear()+2)+'');
           doc.text(30.5, 41.3,(year.getFullYear()+3)+'');
           doc.text(37.5, 41.3,(year.getFullYear()+4)+'');

           // Numero de control con codigo de barra
           doc.addImage(this.textToBase64Barcode(student.controlNumber ? student.controlNumber : ''), 'PNG', 46.8, 39.2, 33, 12);
           doc.setTextColor(0, 0, 0);
           doc.setFontSize(8);
           doc.text(57, 53.5, doc.splitTextToSize(student.controlNumber ? student.controlNumber : '', 35));
           return doc;
    }

    generateScheduleStep1(){
        const doc = new jsPDF('p', 'pt', 'letter');
        // Header
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        doc.addImage(this.sepLogo, 'PNG', 36, 10, 110, 27); // Logo SEP
        doc.addImage(this.tecNacLogo, 'PNG', pageWidth - 120, 6, 55, 48); // Logo TecNM

        let header = 'Derecho a Horario';
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(15);
        doc.setFontStyle('bold');
        doc.text(header, pageWidth / 2, 50, 'center');        
        
        return doc;
    }
    generateScheduleStep2(doc){
        // FOOTER
        var today = new Date();
        var m = today.getMonth() + 1;
        var mes = (m < 10) ? '0' + m : m;
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        doc.addImage(this.tecLogo, 'PNG', (pageWidth / 2) - 15, pageHeight - 47, 30, 30); // Logo SEP
        let footer = '© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n';
        doc.setTextColor(0, 0, 0);
        doc.setFontStyle('bold');
        doc.setFontSize(7);
        doc.text(footer, pageWidth / 2, pageHeight - 12, 'center');

        // Hour PDF
        let hour = today.getDate() + '/' + mes + '/' + today.getFullYear()
        + ' - ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        doc.setTextColor(100);
        doc.setFontStyle('bold');
        doc.setFontSize(7);
        doc.text(hour, pageWidth - 45, pageHeight - 5, 'center');
        return doc;
    }
    generateSolicitud(student){
        var day = student.curp.substring(8, 10);
        var month = student.curp.substring(6, 8);
        var year = student.curp.substring(4, 6);
        var fechaNacimiento = day + "/" + month + "/" + year;

        const doc = new jsPDF();

        // @ts-ignore
        doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
        // @ts-ignore
        doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
        doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
        doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

        // Header        
        var pageWidth = doc.internal.pageSize.width;

        doc.addImage(this.sepLogo, 'PNG', 5, 5, 74, 15); // Logo SEP
        doc.addImage(this.tecNacLogo, 'PNG', pageWidth - 47, 2, 27, 19); // Logo TecNM

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(15);
        doc.text("Instituto Tecnológico de Tepic", pageWidth / 2, 30, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Solicitud de Inscripción", pageWidth / 2, 37, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Código: ITT-POE-01-02      Revisión: 0", pageWidth / 2, 42, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Referencia a la Norma ISO 9001-2015:    8.2.2, 8.2.3, 8.2.1, 8.5.2", pageWidth / 2, 47, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(15);
        doc.text("SOLICITUD DE INSCRIPCIÓN", pageWidth / 2, 60, 'center');

        // Cuadro 1
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 65, 190, 10, 'f');

        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 75, 190, 45, 'f');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 72, 'Datos Generales');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Nombre: ', 15, 80);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.fatherLastName + ' ' + student.motherLastName + ' ' + student.firstName, 70, 80);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Lugar de nacimiento: ', 15, 85);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.birthPlace, 70, 85);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Fecha de nacimiento: ', 15, 90);
        doc.setFont('Montserrat', 'Normal');
        doc.text(fechaNacimiento, 70, 90);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Estado Civil: ', 15, 95);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.civilStatus, 70, 95);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Correo Electrónico: ', 15, 100);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.email, 70, 100);

        doc.setFont('Montserrat', 'Bold');
        doc.text('CURP: ', 15, 105);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.curp, 70, 105);

        doc.setFont('Montserrat', 'Bold');
        doc.text('NSS: ', 15, 110);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.nss, 70, 110);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Número de control: ', 15, 115);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.controlNumber, 70, 115);

        // Cuadro 2
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 125, 190, 10, 'f');

        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 135, 190, 35, 'f');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 132, 'Dirección');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Calle: ', 15, 140);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.street, 70, 140);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Colonia: ', 15, 145);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.suburb, 70, 145);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Ciudad: ', 15, 150);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.city, 70, 150);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Estado: ', 15, 155);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.state, 70, 155);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Código Postal: ', 15, 160);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.cp + '', 70, 160);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Teléfono: ', 15, 165);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.phone + '', 70, 165);

        // Cuadro 3
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 175, 190, 10, 'f');

        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 185, 190, 25, 'f');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 182, 'Datos académicos');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Escuela de procedencia: ', 15, 190);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(9);
        doc.text(student.originSchool + ': ' + student.nameOriginSchool, 70, 190);

        doc.setFontSize(12);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Otra: ', 15, 195);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.otherSchool, 70, 195);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Promedio: ', 15, 200);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.averageOriginSchool + '', 70, 200);

        doc.setFont('Montserrat', 'Bold');
        doc.text('Carrera a cursar: ', 15, 205);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.career, 70, 205);

        // Cuadro 4
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 215, 190, 10, 'f');

        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 225, 190, 25, 'f');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 222, 'Datos extras');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Perteneces a alguna Etnia? ', 15, 230);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.etnia, 85, 230);

        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Cuál?', 15, 235);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.typeEtnia, 85, 235);

        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Tienes alguna discapacidad? ', 15, 240);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.disability, 85, 240);

        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Cuál?', 15, 245);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.typeDisability, 85, 245);

        doc.line((pageWidth / 2)-35, 270, (pageWidth / 2)+35, 270);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text("Firma del Estudiante", pageWidth / 2, 280, 'center');
        return doc;
    }

    reduceCareerString(career: string): string {
        if (career.length < 33) {
          return career;
        }
    
        switch (career) {
          case 'DOCTORADO EN CIENCIAS EN ALIMENTOS':
            return 'DOC. EN CIENCIAS EN ALIMENTOS';
    
          case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
            return 'ING. EN GESTION EMPRESARIAL';
    
    
          case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
            return 'ING. EN SISTEMAS COMPUTACIONALES';
    
          case 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN':
            return 'MAESTRÍA EN TEC. DE LA INFORMACIÓN';
    
          case 'MAESTRÍA EN CIENCIAS EN ALIMENTOS':
            return 'MAEST. EN CIENCIAS EN ALIMENTOS';
    
          default:
            return 'ING. EN TEC. DE LA INF. Y COM.';
        }
    
    }
    async findFoto(docFoto) {
        return new Promise(resolve => {
          this.inscriptionsProv.getFile(docFoto.fileIdInDrive, docFoto.filename).subscribe(
            data => {
              var pub = data.file;
              var image = 'data:image/png;base64,' + pub;
              resolve(image);
            },
            err => {
              console.log(err);
            }
          )
        });
    }

    textToBase64Barcode(text) {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, text, { format: 'CODE128', displayValue: false });
        return canvas.toDataURL('image/png');
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
    private addTextRight(doc, text: string, positionY: number) {
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
    private justifyText(Doc, Text: string, Point: { x: number, y: number }, Size: number, lineBreak: number = 5, fontSize: number, afterParagraph: boolean = false) {
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
        for( let i = 0, index=0; i < rows.length; i++,index++){
            
            // Posicion X,Y para poner la palabra
            let tmpIncX = Point.x;
            let tmpIncY = Point.y + (index * lineBreak); 
            
            if( afterParagraph && rows.length > 1 &&  i > 0 && !includedToParagraph){                
                tmpIncX = this.MARGIN.LEFT + 32;                                
                rows.shift();
                rows = Doc.splitTextToSize(rows.join(' '),138);   
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
        return {lastX,lastY,lastRowWidth:Doc.getTextWidth(rows[lastRow])};
    }
    // Retorna la longitud del texto a añadir
    private summation(Doc, Words: Array<string>): number {
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

    private newDocumentTec(header = true, footer = true) {
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

    private addHeaderTec(document) {
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

    private addFooterTec(document) {
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

    private addLineCenter(document, text: string, startY: number) {
        const tmn = document.getTextWidth(text);
        document.setFont(this.FONT, 'Bold');
        document.setDrawColor(0, 0, 0);
        document.line((this.WIDTH / 2) - (tmn / 2), startY, (this.WIDTH / 2) + (tmn / 2), startY);
        document.text(text, (this.WIDTH / 2), startY + 5, { align: 'center' });
    }

    // @ts-ignore
    private addTable(document, data: Array<Object>, startY: number, startX: number = this.MARGIN.LEFT,
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

    gradeMax(employee): String {
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
