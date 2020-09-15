const jsPDF = require('jspdf');
import 'jspdf-autotable';
import * as moment from 'moment';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { CookiesService } from 'src/app/services/app/cookie.service';

import * as JsBarcode from 'jsbarcode';

moment.locale('es');

export class PDFEnglish {

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

    private directorFirm: any;
    private montserratNormal: any;
    private montserratBold: any;

    private frontBase64;
    private backBase64;
    private caratulaExpediente;
    private contratoEstudiante;

    constructor(
         public _getImage: ImageToBase64Service, 
         public _CookiesService: CookiesService
         ) {

        
        this._getImageToPdf();
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

        this._getImage.getBase64('assets/imgs/front45A.jpg').then(res1 => {
            this.frontBase64 = res1;
        });

        this._getImage.getBase64('assets/imgs/back3.jpg').then(res2 => {
            this.backBase64 = res2;
        });
        this._getImage.getBase64('assets/imgs/CaratulaExpediente.png').then(res4 => {
            this.caratulaExpediente = res4;
        });
        this._getImage.getBase64('https://i.ibb.co/yy0GrBq/Contrato-Estudiante-ITT.jpg').then(res4 => {
            this.contratoEstudiante = res4;
        });
    }  

    bufferToBase64(buffer) {
        return btoa(new Uint8Array(buffer).reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, ''));
    }
    
    generateGroupStudentsListStep1(){
        var doc = new jsPDF('p', 'pt');

        // Header
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        doc.addImage(this.sepLogo, 'PNG', 36, 5, 163, 40); // Logo SEP
        doc.addImage(this.tecNacLogo, 'PNG', pageWidth - 145, 2, 103, 44); // Logo TecNM

        let header = 'Lista de Alumnos';
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(15);
        doc.setFontStyle('bold');
        doc.text(header, pageWidth / 2, 59, 'center');
        return doc;
    }
    generateGroupStudentsListStep2(doc){
        // FOOTER
        var today = new Date();
        var m = today.getMonth() + 1;
        var mes = (m < 10) ? '0' + m : m;
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        doc.addImage(this.tecLogo, 'PNG', (pageWidth / 2) - 25, pageHeight - 60, 50, 50); // Logo Tec
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

    generateActaCalificacionesStep1(actData){
        var doc = new jsPDF('p', 'pt');

        // Header        
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    
        doc.addImage(this.sepLogo, 'PNG', 36, 5, 163, 40); // Logo SEP
        doc.addImage(this.tecNacLogo, 'PNG', pageWidth - 145, 2, 103, 44); // Logo TecNM
    
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(15);
        doc.setFontStyle('bold');
        doc.text('Instituto Tecnológico de Tepic', pageWidth / 2, 59, 'center');
        doc.setFontSize(10);
        doc.text('ACTA DE CALIFICACIONES', 40, 75, 'left');
    
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFontStyle('normal');
        doc.text('CURSO:', 40, 85, 'left');
        doc.text('BLOQUE:', 40, 95, 'left');
        doc.text('PROFESOR:', 40, 105, 'left');
        doc.text('GRUPO:', pageWidth - 145, 105, 'left');
        doc.text('PERIODO:', 40, 115, 'left');
        doc.text('ALUMNOS:', pageWidth - 145, 115, 'left');
    
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFontStyle('bold');
        doc.text(actData.group.course.name, 100, 85, 'left');
        doc.text(actData.group.level.toString(), 100, 95, 'left');
        doc.text(actData.teacher.name.fullName, 100, 105, 'left');
        doc.text(actData.group.name, pageWidth - 85, 105, 'left');
        doc.text(actData.group.period.periodName+'/'+actData.group.period.year, 100, 115, 'left');
        doc.text(actData.group.numberStudents.toString(), pageWidth - 85, 115, 'left');

        return doc;
    }
    generateActaCalificacionesStep2(doc){
        var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        // FOOTER
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFontStyle('normal');
        doc.text('Este documento no es válido si tiene tachaduras o enmendaduras', 40, pageHeight - 60, 'left');
        doc.text('Tepic, Nay., a '+moment(new Date()).format('LL'), 40, pageHeight - 50, 'left');
        doc.text("Firma del Profesor:",(pageWidth/2)+40, pageHeight - 60, 'left');
        doc.setDrawColor(0, 0, 0);
        doc.line((pageWidth/2)+120, (pageHeight - 60), (pageWidth / 2)+257, (pageHeight - 60));

        doc.addImage(this.tecLogo, 'PNG', (pageWidth / 2) - 25, pageHeight - 60, 50, 50); // Logo SEP
        let footer = '© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n';
        doc.setTextColor(0, 0, 0);
        doc.setFontStyle('bold');
        doc.setFontSize(7);
        doc.text(footer, pageWidth / 2, pageHeight - 12, 'center');
        return doc;
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
