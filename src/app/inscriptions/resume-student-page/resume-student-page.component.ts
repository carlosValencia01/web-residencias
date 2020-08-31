import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MatStepper } from '@angular/material/stepper';
import { ExtendViewerComponent } from 'src/app/commons/extend-viewer/extend-viewer.component';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resume-student-page',
  templateUrl: './resume-student-page.component.html',
  styleUrls: ['./resume-student-page.component.scss']
})
export class ResumeStudentPageComponent implements OnInit {
  _idStudent: String;
  data: any;
  studentData: any;

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
  docCC;

  // Maestria
  certificateLDoc;
  titledLDoc;
  cedulaLDoc;
  examActLDoc;
  // Maestria Cartas Comprimiso
  cccertificateLDoc;
  cctitledLDoc;
  cccedulaLDoc;
  ccexamActLDoc;

  // Doctorado
  certificateMDoc;
  titledMDoc;
  cedulaMDoc;
  examActMDoc;
  // Doctorado Cartas Compromiso
  cccertificateMDoc;
  cctitledMDoc;
  cccedulaMDoc;
  ccexamActMDoc;

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


  // Validar Tipo de Carrera (Maestria o Doctorado)
  public mastersDegree = false;
  public doctorate = false;


  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private loadingService: LoadingService,
  ) {
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {
  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
    this.doctorate = (this.data.career === 'DOCTORADO EN CIENCIAS DE ALIMENTOS') ? true : false;
    this.mastersDegree = (this.data.career === 'MAESTRÍA EN CIENCIAS DE ALIMENTOS' || this.data.career === 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN') ? true : false;
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

      if (this.etnia == 'No') {
        this.tipoEtnia = ' ';
      }
      if (this.discapacidad == 'No') {
        this.tipoDiscapacidad = ' ';
      }
      if (this.escuelaProcedencia != 'OTRO') {
        this.nombreEP == ' ';
      }
      this.obtenerFechaNacimiento(this.curp);
      this.getIdDocuments();
    });
  }

  obtenerFechaNacimiento(curp) {
    var day = curp.substring(8, 10);
    var month = curp.substring(6, 8);
    var year = curp.substring(4, 6);

    this.fechaNacimiento = day + "/" + month + "/" + year;
  }

  async continue() {
    var newStep = { stepWizard: 6 }
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      //this.stepper.next();
      window.location.assign("/inscriptions/wizardInscription");
    });
  }

  async findFoto() {

    await this.inscriptionsProv.getFile(this.docFoto.fileIdInDrive, this.docFoto.filename).subscribe(
      data => {
        this.pub = data.file;
        this.image = this.pub ? 'data:image/png;base64,' + this.pub :  'assets/imgs/profileImgNotFound.jpg';
        this.pub = true;
      },
      err => {
        console.log(err);
      }
    )
  }

  async getIdDocuments() {
    let documents = this.studentData.documents;

    this.docCurp = documents.filter(docc => docc.filename == this.data.email+'-CURP.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CURP.pdf')[0] : '';
    this.docNss = documents.filter(docc => docc.filename == this.data.email+'-NSS.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-NSS.pdf')[0] : '';
    this.docFoto = documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0] ? documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0] : '';
    this.docComprobante = documents.filter(docc => docc.filename == this.data.email+'-COMPROBANTE.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROBANTE.pdf')[0] : '';
    this.docCertificado = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO.pdf')[0] : '';
    this.docActa = documents.filter(docc => docc.filename == this.data.email+'-ACTA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-ACTA.pdf')[0] : '';
    this.docAnalisis = documents.filter(docc => docc.filename == this.data.email+'-CLINICOS.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CLINICOS.pdf')[0] : '';
    this.docCC = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO.pdf')[0] : '';

    //MESTRIA
    this.certificateLDoc = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO_LICENCIATURA.pdf')[0] : '';
    this.titledLDoc = documents.filter(docc => docc.filename == this.data.email+'-TITULO_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-TITULO_LICENCIATURA.pdf')[0] : '';
    this.cedulaLDoc = documents.filter(docc => docc.filename == this.data.email+'-CEDULA_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CEDULA_LICENCIATURA.pdf')[0] : '';
    this.examActLDoc = documents.filter(docc => docc.filename == this.data.email+'-EXAMEN_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-EXAMEN_LICENCIATURA.pdf')[0] : '';
    this.cccertificateLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CERTIFICADO_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CERTIFICADO_LICENCIATURA.pdf')[0] : '';;
    this.cctitledLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_TITULO_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_TITULO_LICENCIATURA.pdf')[0] : '';
    this.cccedulaLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CEDULA_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CEDULA_LICENCIATURA.pdf')[0] : '';
    this.ccexamActLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_EXAMEN_LICENCIATURA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_EXAMEN_LICENCIATURA.pdf')[0] : '';

    //DOCTORADO
    this.certificateMDoc = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO_MAESTRIA.pdf')[0] : '';
    this.titledMDoc = documents.filter(docc => docc.filename == this.data.email+'-TITULO_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-TITULO_MAESTRIA.pdf')[0] : '';
    this.cedulaMDoc = documents.filter(docc => docc.filename == this.data.email+'-CEDULA_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CEDULA_MAESTRIA.pdf')[0] : '';
    this.examActMDoc = documents.filter(docc => docc.filename == this.data.email+'-EXAMEN_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-EXAMEN_MAESTRIA.pdf')[0] : '';
    this.cccertificateMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CERTIFICADO_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CERTIFICADO_MAESTRIA.pdf')[0] : '';
    this.cctitledMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_TITULO_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_TITULO_MAESTRIA.pdf')[0] : '';
    this.cccedulaMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CEDULA_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CEDULA_MAESTRIA.pdf')[0] : '';
    this.ccexamActMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_EXAMEN_MAESTRIA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_EXAMEN_MAESTRIA.pdf')[0] : '';

    if(this.docFoto){
      this.findFoto();
    }else{
      this.image = 'assets/imgs/profileImgNotFound.jpg';
    }
  }

  onView(file) {
    switch (file) {
      case "Acta": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acta de Nacimiento.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docActa.fileIdInDrive, this.docActa.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }
      case "CURP": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CURP.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docCurp.fileIdInDrive, this.docCurp.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });
        break;
      }
      case "NSS": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando NSS.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docNss.fileIdInDrive, this.docNss.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });
        break;
      }
      case "Certificado": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Certificado de Estudios.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docCertificado.fileIdInDrive, this.docCertificado.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });
        break;
      }
      case "Analisis": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Análisis Clínicos.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docAnalisis.fileIdInDrive, this.docAnalisis.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });
        break;
      }
      case "Comprobante": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Comprobante de Pago.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docComprobante.fileIdInDrive, this.docComprobante.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });
        break;
      }
      case "Compromiso": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Carta Compromiso.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docCC.fileIdInDrive, this.docCC.filename).subscribe(data => {
          var pubCC = data.file;
          let buffCC = new Buffer(pubCC.data);
          var pdfSrcCC = buffCC;
          this.dialog.open(ExtendViewerComponent, {
            data: {
              source: pdfSrcCC,
              isBase64: true
            },
            disableClose: true,
            hasBackdrop: true,
            width: '60em',
            height: '600px'
          });
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });
        break;
      }
      // MAESTRIA
      case "Certificado_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Certificado Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.certificateLDoc.fileIdInDrive, this.certificateLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Titulo_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Titulo Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.titledLDoc.fileIdInDrive, this.titledLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cedula_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Cedula Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cedulaLDoc.fileIdInDrive, this.cedulaLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Examen_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acta Examen Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.examActLDoc.fileIdInDrive, this.examActLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Certificado_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Certificado Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cccertificateLDoc.fileIdInDrive, this.cccertificateLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Titulo_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Titulo Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cctitledLDoc.fileIdInDrive, this.cctitledLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Cedula_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Cedula Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cccedulaLDoc.fileIdInDrive, this.cccedulaLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Examen_Licenciatura": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Acta Examen Licenciatura.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.ccexamActLDoc.fileIdInDrive, this.ccexamActLDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      // DOCTORADO
      case "Certificado_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Certificado Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.certificateMDoc.fileIdInDrive, this.certificateMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Titulo_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Titulo Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.titledMDoc.fileIdInDrive, this.titledMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cedula_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Cedula Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cedulaMDoc.fileIdInDrive, this.cedulaMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Examen_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acta Examen Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.examActMDoc.fileIdInDrive, this.examActMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Certificado_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Certificado Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cccertificateMDoc.fileIdInDrive, this.cccertificateMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Titulo_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Titulo Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cctitledMDoc.fileIdInDrive, this.cctitledMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Cedula_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Cedula Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.cccedulaMDoc.fileIdInDrive, this.cccedulaMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

        break;
      }

      case "Cc_Examen_Maestria": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CC Acta Examen Maestria.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.ccexamActMDoc.fileIdInDrive, this.ccexamActMDoc.filename).subscribe(data => {
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
          this.loadingService.setLoading(false);
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            'Inscripción App', error);
        });

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

}
