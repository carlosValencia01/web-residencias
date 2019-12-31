import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { MatStepper } from '@angular/material/stepper';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
declare var jsPDF: any;

@Component({
  selector: 'app-confirmation-student-page',
  templateUrl: './confirmation-student-page.component.html',
  styleUrls: ['./confirmation-student-page.component.scss']
})
export class ConfirmationStudentPageComponent implements OnInit {
  _idStudent: String;
  data: any;
  studentData: any;
  loading = false; 

   //Documentos
   docActa;
   docCertificado;
   docAnalisis;
   docComprobante;
   docCurp;
   docNss;
   docFoto;
   docSolicitud;
   docContrato;
   docAcuse;
   docCompromiso;

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  // Font Montserrat
  montserratNormal: any;
  montserratBold: any;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private router: Router,
    private imageToBase64Serv: ImageToBase64Service,
  ) {
    this.getFonts();
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {
    Swal.fire({
      title: 'ATENCIÓN',
      text: 'Recuerda que debes descargar la "Solicitud" , "Contrato" y "Acuse", mismos que debes entregar en el Departamento de Servicios Escolares.',
      type: 'info',
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => { });
    // Convertir imágenes a base 64 para los reportes
    this.imageToBase64Serv.getBase64('assets/imgs/logoTecNM.png').then(res1 => {
      this.logoTecNM = res1;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoEducacionSEP.png').then(res2 => {
      this.logoSep = res2;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoITTepic.png').then(res3 => {
      this.logoTecTepic = res3;
    });
  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      this.getIdDocuments();
    });
  }

  async getIdDocuments() {
    this.docActa = await this.filterDocuments('ACTA');
    this.docCertificado = await this.filterDocuments('CERTIFICADO');
    this.docAnalisis = await this.filterDocuments('CLINICOS');
    this.docComprobante = await this.filterDocuments('COMPROBANTE');
    this.docCurp = await this.filterDocuments('CURP');
    this.docNss = await this.filterDocuments('NSS');
    this.docFoto = await this.filterDocuments('FOTO');
    this.docSolicitud = await this.filterDocuments('SOLICITUD');
    this.docContrato = await this.filterDocuments('CONTRATO');
    this.docAcuse = await this.filterDocuments('ACUSE');
    this.docCompromiso = await this.filterDocuments('COMPROMISO');

  }

  filterDocuments(filename) {
    return this.studentData.documents.filter(function (alumno) {
      return alumno.filename.toLowerCase().indexOf(filename.toLowerCase()) > -1;
    });
  }

  onView(file) {
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando '+file+'.', '');
    this.loading = true; 
    switch (file) {
      case "Solicitud": {
        this.inscriptionsProv.getFile(this.docSolicitud[0].fileIdInDrive, this.docSolicitud[0].filename).subscribe(data => {
          var pubSolicitud = data.file;
          let buffSolicitud = new Buffer(pubSolicitud.data);
          var pdfSrcSolicitud = buffSolicitud;
          this.loading = false; 
          var blob = new Blob([pdfSrcSolicitud], {type: "application/pdf"});
          
          //FileSaver.saveAs(blob,this.data.email+'-Solicitud.pdf');
          window.open( URL.createObjectURL(blob) );

        }, error => {
          console.log(error);
        });
        break;
      }
      case "Contrato": {
        this.inscriptionsProv.getFile(this.docContrato[0].fileIdInDrive, this.docContrato[0].filename).subscribe(data => {
          var pubContrato = data.file;
          let buffContrato = new Buffer(pubContrato.data);
          var pdfSrcContrato = buffContrato;
          this.loading = false; 
          var blob = new Blob([pdfSrcContrato], {type: "application/pdf"});
          
          //FileSaver.saveAs(blob,this.data.email+'-Contrato.pdf');
          window.open( URL.createObjectURL(blob) );

        }, error => {
          console.log(error);
        });
        break;
      }
      case "Acuse": {
        this.generatePDFAcuse();
        break;
      }
    }
  }

  mostrarAdvertencia() {
    Swal.fire({
      title: 'ATENCIÓN',
      text: 'Está a punto de finalizar el proceso.',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Regresar',
      confirmButtonText: 'Finalizar'
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          type: 'success',
          title: 'Proceso Finalizado',
          showConfirmButton: false,
          timer: 2000
        })
        this.continue();
      }
     });
  }

  async continue() {
    var newStep = { stepWizard: 6, inscriptionStatus: 'Enviado', printCredential: false, warningAnalysis: false}
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      //this.router.navigate(['/wizardInscription']);
      window.location.assign("/profileInscription");
    });    
  }

  generatePDFAcuse() {
    const doc = new jsPDF();

    // @ts-ignore
    doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

    // Header
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;

    doc.addImage(this.logoSep, 'PNG', 5, 5, 74, 15); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 47, 2, 39, 17); // Logo TecNM

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(15);
    doc.text("Instituto Tecnológico de Tepic", pageWidth / 2, 30, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(12);
    doc.text("Acuse de entrega de documentación para integración de expediente", pageWidth / 2, 37, 'center');
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(12);
    doc.text("Inscripción", pageWidth / 2, 42, 'center');
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(10);
    doc.text("Nombre del Alumno:",15,55,'left');
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(10);
    doc.text(this.studentData.fullName,57,55,'left');
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(10);
    doc.text("Número de contról:",137,55,'left');
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(10);
    doc.text(this.studentData.controlNumber,177,55,'left');

    doc.line((pageWidth / 2)-35, 150, (pageWidth / 2)+35, 150);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(10);
    doc.text("Firma del Estudiante", pageWidth / 2, 160, 'center');

    var columns = ["No", "Documento", "Estatus"];
    var data = [
      [1, "COMPROBANTE DE PAGO",""],
      [2, "CERTIFICADO DE ESTUDIOS",""],
      [3, "CURP",""],
      [4, "ACTA DE NACIMIENTO",""],
      [5, "ANÁLISIS CLÍNICOS",""],
      [6, "FOTOGRAFÍA",""],
      [7, "NÚMERO DE SEGURO SOCIAL",""],
      [8, "CARTA COMPROMISO",""] 
    ];

    doc.autoTable(columns,data,{ 
      headStyles: {fillColor: [20, 43, 88]},
      margin:{ top: 60 }
    });

    // docComprobante
    if(this.docComprobante != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 67.8, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 72.25);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 67.8, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 72.25);
    }

    // docCertificado
    if(this.docCertificado != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 75.4, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 79.85);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 75.4, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 79.85);
    }

    // docCurp 
    if(this.docCurp != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 83, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 87.45);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 83, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 87.45);
    }

    // docActa
    if(this.docActa != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 90.6, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 95.05);  
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 90.6, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 95.05);
    }

    // docAnalisis
    if(this.docAnalisis != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);   
      doc.roundedRect(155, 98.2, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 102.65);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 98.2, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 102.65);
    }

    // docFoto
    if(this.docFoto != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 105.8, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 110.25);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 105.8, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 110.25);
    }

    // docNss
    if(this.docNss != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 113.4, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 117.85);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 113.4, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 117.85);
    }   

    // docCompromiso
    if(this.docCompromiso != ''){
      doc.setTextColor(0,0,0);
      doc.setFillColor(255, 245, 204);
      doc.roundedRect(155, 121, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('ENVIADO', 161, 125.45);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0,0,0);
      doc.roundedRect(155, 121, 35, 7, 1, 1, 'FD');
      doc.setFont('Montserrat', 'Bold');
      doc.setFontSize(10);
      doc.text('NO ENVIADO', 161, 125.45);
    }   

    this.loading = false; 
    window.open(doc.output('bloburl'), '_blank');
  }

  getFonts() {
    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Regular.ttf').then(base64 => {
        this.montserratNormal = base64.toString().split(',')[1];
    });

    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Bold.ttf').then(base64 => {
        this.montserratBold = base64.toString().split(',')[1];
    });
  }


}
