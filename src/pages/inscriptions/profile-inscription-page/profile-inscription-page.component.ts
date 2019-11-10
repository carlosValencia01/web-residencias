import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import Swal from 'sweetalert2';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
declare var jsPDF: any;

@Component({
  selector: 'app-profile-inscription-page',
  templateUrl: './profile-inscription-page.component.html',
  styleUrls: ['./profile-inscription-page.component.scss']
})
export class ProfileInscriptionPageComponent implements OnInit {
  _idStudent: String;
  data: any;
  studentData: any;

  step;

  //Foto del Estudiante
  pub;
  image;
  pdfSrc;

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

  // Datos Alumno
  nombre: String;
  numeroControl: any;
  fechaNacimiento: String;
  lugarNacimiento: String;
  estadoCivil: String;
  correoElectronico: String;
  curp: String;
  nss: any;

  // Dirección
  calle: String;
  colonia: String;
  ciudad: String;
  estado: String;
  cp: any;
  telefono: any;
  etnia: String;
  tipoEtnia: String;
  discapacidad: String;
  tipoDiscapacidad: String;

  // Datos Académicos
  escuelaProcedencia: String;
  otraEscuela: String;
  nombreEP: String;
  promedioEP: Number;
  carreraCursar: String;

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  //Font Montserrat
  montserratNormal: any;
  montserratBold: any;

  constructor( 
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private imageToBase64Serv: ImageToBase64Service,

  ){
    this.getFonts();
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {
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

      // Datos Alumno
      this.nombre = this.studentData.fullName ? this.studentData.fullName : '';
      this.numeroControl = this.studentData.controlNumber ? this.studentData.controlNumber : '';
      this.lugarNacimiento = this.studentData.birthPlace ? this.studentData.birthPlace : '';
      this.estadoCivil = this.studentData.civilStatus ? this.studentData.civilStatus : '';
      this.correoElectronico = this.studentData.email ? this.studentData.email : '';
      this.curp = this.studentData.curp ? this.studentData.curp : '';
      this.nss = this.studentData.nss ? this.studentData.nss : '';
      // Dirección
      this.calle = this.studentData.street ? this.studentData.street : '';
      this.colonia = this.studentData.suburb ? this.studentData.suburb : '';
      this.ciudad = this.studentData.city ? this.studentData.city : '';
      this.estado = this.studentData.state ? this.studentData.state : '';
      this.cp = this.studentData.cp ? this.studentData.cp : '';
      this.telefono = this.studentData.phone ? this.studentData.phone : '';
      this.etnia = this.studentData.etnia ? this.studentData.etnia : '';
      this.tipoEtnia = this.studentData.typeEtnia ? this.studentData.typeEtnia : '';
      this.discapacidad = this.studentData.disability ? this.studentData.disability : '';
      this.tipoDiscapacidad = this.studentData.typeDisability ? this.studentData.typeDisability : '';
      // Datos Académicos
      this.escuelaProcedencia = this.studentData.originSchool ? this.studentData.originSchool : '';
      this.otraEscuela = this.studentData.otherSchool ? this.studentData.otherSchool : '';
      this.nombreEP = this.studentData.nameOriginSchool ? this.studentData.nameOriginSchool : '';
      this.promedioEP = this.studentData.averageOriginSchool ? this.studentData.averageOriginSchool : '';
      this.carreraCursar = this.studentData.career ? this.studentData.career : '';

      this.step = this.studentData.stepWizard;
      console.log("Paso: "+this.step);

      this.obtenerFechaNacimiento(this.curp);


      if(this.step == 6){
        this.getIdDocuments();
      }

    });
  }

  obtenerFechaNacimiento(curp) {
    var day = curp.substring(8, 10);
    var month = curp.substring(6, 8);
    var year = curp.substring(4, 6);

    this.fechaNacimiento = day + "/" + month + "/" + year;
  }

  async findFoto() {
    await this.inscriptionsProv.getFile(this.docFoto[0].fileIdInDrive, this.docFoto[0].filename).subscribe(
      data => {
        this.pub = data.file;
        this.image = 'data:image/png;base64,' + this.pub;
        this.pub = true;
      },
      err => {
        console.log(err);
      }
    )
  }

  getIdDocuments() {
    this.docActa = this.filterDocuments('ACTA');
    this.docCertificado = this.filterDocuments('CERTIFICADO');
    this.docAnalisis = this.filterDocuments('CLINICOS');
    this.docComprobante = this.filterDocuments('COMPROBANTE');
    this.docCurp = this.filterDocuments('CURP');
    this.docNss = this.filterDocuments('NSS');
    this.docFoto = this.filterDocuments('FOTO');
    this.docSolicitud = this.filterDocuments('SOLICITUD');
    this.docContrato = this.filterDocuments('CONTRATO');
    this.docAcuse = this.filterDocuments('ACUSE');

    setTimeout(() => {this.findFoto()}, 3000);

  }

  filterDocuments(filename) {
    return this.studentData.documents.filter(function (alumno) {
      return alumno.filename.toLowerCase().indexOf(filename.toLowerCase()) > -1;
    });
  }

  onView(file) {
    switch (file) {
      case "Acta": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acta de Nacimiento.', '');
        this.inscriptionsProv.getFile(this.docActa[0].fileIdInDrive, this.docActa[0].filename).subscribe(data => {
          var pubCurp = data.file;
          let buffCurp = new Buffer(pubCurp.data);
          var pdfSrcCurp = buffCurp;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrcCurp,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "CURP": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CURP.', '');
        this.inscriptionsProv.getFile(this.docCurp[0].fileIdInDrive, this.docCurp[0].filename).subscribe(data => {
          var pub = data.file;
          let buff = new Buffer(pub.data);
          var pdfSrc = buff;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrc,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "NSS": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando NSS.', '');
        this.inscriptionsProv.getFile(this.docNss[0].fileIdInDrive, this.docNss[0].filename).subscribe(data => {
          var pubCurp = data.file;
          let buffCurp = new Buffer(pubCurp.data);
          var pdfSrcCurp = buffCurp;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrcCurp,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Certificado": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Certificado de Estudios.', '');
        this.inscriptionsProv.getFile(this.docCertificado[0].fileIdInDrive, this.docCertificado[0].filename).subscribe(data => {
          var pubCurp = data.file;
          let buffCurp = new Buffer(pubCurp.data);
          var pdfSrcCurp = buffCurp;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrcCurp,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Analisis": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Análisis Clínicos.', '');
        this.inscriptionsProv.getFile(this.docAnalisis[0].fileIdInDrive, this.docAnalisis[0].filename).subscribe(data => {
          var pubCurp = data.file;
          let buffCurp = new Buffer(pubCurp.data);
          var pdfSrcCurp = buffCurp;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrcCurp,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Comprobante": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Comprobante de Pago.', '');
        this.inscriptionsProv.getFile(this.docComprobante[0].fileIdInDrive, this.docComprobante[0].filename).subscribe(data => {
          var pubCurp = data.file;
          let buffCurp = new Buffer(pubCurp.data);
          var pdfSrcCurp = buffCurp;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrcCurp,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Foto": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Fotografía.', '');
        this.inscriptionsProv.getFile(this.docFoto[0].fileIdInDrive, this.docFoto[0].filename).subscribe(data => {
            let pub = data.file;
            let image = 'data:image/png;base64,' +pub;
            pub = true;
            Swal.fire({
              imageUrl: image,
              imageWidth: 200,
              imageHeight: 200,
              imageAlt: 'Custom image',
              confirmButtonText: 'Aceptar'
            })
          },
          error => {
            this.notificationService.showNotification(eNotificationType.ERROR,'', error);
          }
        )
        break;
      }
      case "Solicitud": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Solicitud.', '');
        this.inscriptionsProv.getFile(this.docSolicitud[0].fileIdInDrive, this.docSolicitud[0].filename).subscribe(data => {
          var pub = data.file;
          let buff = new Buffer(pub.data);
          var pdfSrc = buff;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrc,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Contrato": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Contrato.', '');
        this.inscriptionsProv.getFile(this.docContrato[0].fileIdInDrive, this.docContrato[0].filename).subscribe(data => {
          var pub = data.file;
          let buff = new Buffer(pub.data);
          var pdfSrc = buff;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrc,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Acuse": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acuse.', '');
        var pdfSrc = this.generatePDFAcuse();
        this.dialog.open(ExtendViewerComponent, {
          data: {
            source: pdfSrc,
            isBase64: true
          },
          disableClose: true,
          hasBackdrop: true,
          width: '60em',
          height: '600px'
        });
        
        break;
      }
    }
  }

  updateDocument(file) {
    switch (file) {
      case "Acta": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','ACTA');
        break;
      }
      case "CURP": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','CURP');
        break;
      }
      case "NSS": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','NSS');
        break;
      }
      case "Certificado": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','CERTIFICADO');
        break;
      }
      case "Analisis": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','ANÁLISIS');
        break;
      }
      case "Comprobante": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','COMPROBANTE');
        break;
      }
      case "Foto": {
        this.notificationService.showNotification(eNotificationType.INFORMATION,'MODIFICAR','FOTO');
        break;
      }
    }
  }

  showMoreInformation(){
    Swal.fire({
      html:
        '<h4>Dirección</h4>'+
        '<p style="text-align="left"">'+
        '<h6><b>Calle:</b> '+this.calle+'</h6>'+
        '<h6><b>Colonia:</b> '+this.colonia+'</h6>'+
        '<h6><b>Código Postal:</b> '+this.cp+'</h6>'+
        '<h6><b>Ciudad:</b> '+this.ciudad+'</h6>'+
        '<h6><b>Estado:</b> '+this.estado+'</h6><br>'+
        '</p>'+
        '<h4>Datos Académicos</h4>'+
        '<h6><b>Escuela Procedencia:</b>'+this.nombreEP+'</h6>'+
        '<h6><b>Promedio:</b>'+this.promedioEP+'</h6>'+
        '<h6><b>Carrera a Cursar:</b>'+this.carreraCursar+'</h6>',
      allowOutsideClick: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Regresar'
    }).then((result) => { });
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
    doc.setFontSize(15);
    doc.text("ACUSE DE DOCUMENTOS ", pageWidth / 2, 40, 'center');

    var columns = ["No", "Documento", "Estatus"];
    var data = [
      [1, "ACTA DE NACIMIENTO", (this.docActa != '') ? this.docActa[0].status:'NO ENVIADO'],
      [2, "CERTIFICADO DE ESTUDIOS", (this.docCertificado != '') ? this.docCertificado[0].status:'NO ENVIADO'],
      [3, "ANÁLISIS CLÍNICOS", (this.docAnalisis != '') ? this.docAnalisis[0].status:'NO ENVIADO'],
      [4, "COMPROBANTE DE PAGO", (this.docComprobante != '') ? this.docComprobante[0].status:'NO ENVIADO'],
      [5, "CURP", (this.docCurp != '') ? this.docCurp[0].status:'NO ENVIADO'],
      [6, "NÚMERO DE SEGURO SOCIAL", (this.docNss != '') ? this.docNss[0].status:'NO ENVIADO'],
      [7, "FOTOGRAFÍA", (this.docFoto != '') ? this.docFoto[0].status:'NO ENVIADO'] 
    ];

    doc.autoTable(columns,data,
    { 
      headStyles: {fillColor: [20, 43, 88]},
      margin:{ top: 50 }
    }
    );

    let document = doc.output('arraybuffer');
    return document;
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
