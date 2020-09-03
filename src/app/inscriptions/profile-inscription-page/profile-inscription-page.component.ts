import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropzoneComponent, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { ExtendViewerComponent } from 'src/app/commons/extend-viewer/extend-viewer.component';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import { DocumentsHelpComponent } from '../documents-help/documents-help.component';
import { LoadingBarService } from 'ngx-loading-bar';

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

  //Observaciones Análisis
  observationsA;

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
  docCompromiso;


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

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  //Font Montserrat
  montserratNormal: any;
  montserratBold: any;

  // Validar Tipo de Carrera (Maestria o Doctorado)
  public mastersDegree = false;
  public doctorate = false;

  folderId;
  selectedFile: File = null;
  imageChangedEvent: any = '';
  closeResult: string;
  photoStudent = '';
  imgForSend: boolean;
  croppedImage: any = '';
  croppedImageBase64: any = '';
  showImg = false;
   /* Dropzone conf */
   @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;

   public config1: DropzoneConfigInterface;
   public config2: DropzoneConfigInterface;
   public config3: DropzoneConfigInterface;
   public config4: DropzoneConfigInterface;
   public config5: DropzoneConfigInterface;
   public config6: DropzoneConfigInterface;
   public config7: DropzoneConfigInterface;
   



  // MAESTRIA
  public config8: DropzoneConfigInterface;
  public config9: DropzoneConfigInterface;
  public config10: DropzoneConfigInterface;
  public config11: DropzoneConfigInterface;
  public config12: DropzoneConfigInterface;
  public config13: DropzoneConfigInterface;
  public config14: DropzoneConfigInterface;
  public config15: DropzoneConfigInterface;

  // DOCTORADO
  public config16: DropzoneConfigInterface;
  public config17: DropzoneConfigInterface;
  public config18: DropzoneConfigInterface;
  public config19: DropzoneConfigInterface;
  public config20: DropzoneConfigInterface;
  public config21: DropzoneConfigInterface;
  public config22: DropzoneConfigInterface;
  public config23: DropzoneConfigInterface;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private studentProv: StudentProvider,
    private modalService: NgbModal,
    private imageToBase64Serv: ImageToBase64Service,
    private loadingService: LoadingService,
    private loadingBar: LoadingBarService,
  ){
    this.getFonts();
    this.getIdStudent();
    this.getStudentData(this._idStudent);
    this.studentProv.refreshNeeded$.subscribe(
      ()=>{
        this.getIdDocuments();
      }
    );
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
    this.doctorate = (this.data.career === 'DOCTORADO EN CIENCIAS DE ALIMENTOS') ? true : false;
    this.mastersDegree = (this.data.career === 'MAESTRÍA EN CIENCIAS DE ALIMENTOS' || this.data.career === 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN') ? true : false;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      this.observationsA = this.studentData.observationsAnalysis ? this.studentData.observationsAnalysis:'';

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

      this.obtenerFechaNacimiento(this.curp);

      if(this.step == 7){
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
    await this.inscriptionsProv.getFile(this.docFoto.fileIdInDrive, this.docFoto.filename).subscribe(
      data => {
        this.pub = data.file;
        this.image = this.pub ? 'data:image/png;base64,' + this.pub :  'assets/imgs/profileImgNotFound.jpg';
        this.pub = true;
        this.showImg=true;
      },
      err => {
        console.log(err);
      }
    )
  }

  getIdDocuments() {
    this.studentProv.getDriveDocuments(this._idStudent.toString()).subscribe(
      files=>{
        let documents = files.documents;

        this.docSolicitud = documents.filter(docc => docc.filename == this.data.email+'-SOLICITUD.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-SOLICITUD.pdf')[0] : '';
        this.docContrato = documents.filter(docc => docc.filename == this.data.email+'-CONTRATO.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CONTRATO.pdf')[0] : '';
        this.docAcuse = documents.filter(docc => docc.filename == this.data.email+'-ACUSE.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-ACUSE.pdf')[0] : '';        
        this.docCurp = documents.filter(docc => docc.filename == this.data.email+'-CURP.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CURP.pdf')[0] : '';
        this.docNss = documents.filter(docc => docc.filename == this.data.email+'-NSS.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-NSS.pdf')[0] : '';
        this.docFoto = documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0] ? documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0] : '';
        this.docComprobante = documents.filter(docc => docc.filename == this.data.email+'-COMPROBANTE.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROBANTE.pdf')[0] : '';
        this.docCertificado = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO.pdf')[0] : '';
        this.docActa = documents.filter(docc => docc.filename == this.data.email+'-ACTA.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-ACTA.pdf')[0] : '';
        this.docAnalisis = documents.filter(docc => docc.filename == this.data.email+'-CLINICOS.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CLINICOS.pdf')[0] : '';
        this.docCompromiso = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO.pdf')[0] : '';
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

        this.checkFolders();

        if (this.docFoto) this.docFoto.status = this.docFoto ? this.docFoto.status.filter(st => st.active === true)[0] : '';

        if (this.docCurp) this.docCurp.status = this.docCurp ? this.docCurp.status.filter(st => st.active === true)[0] : '';

        if (this.docActa) this.docActa.status = this.docActa ? this.docActa.status.filter(st => st.active === true)[0] : '';

        if (this.docAnalisis) this.docAnalisis.status = this.docAnalisis ? this.docAnalisis.status.filter(st => st.active === true)[0] : '';

        if (this.docCertificado) this.docCertificado.status = this.docCertificado ? this.docCertificado.status.filter(st => st.active === true)[0] : '';

        if (this.docComprobante) this.docComprobante.status = this.docComprobante ? this.docComprobante.status.filter(st => st.active === true)[0] : '';

        if (this.docNss) this.docNss.status = this.docNss ? this.docNss.status.filter(st => st.active === true)[0] : '';

        if (this.docCompromiso) this.docCompromiso.status = this.docCompromiso ? this.docCompromiso.status.filter(st => st.active === true)[0] : '';

        if(this.docSolicitud) this.docSolicitud.status = this.docSolicitud ? this.docSolicitud.status.filter( st=> st.active===true)[0] : '';

        if(this.docContrato) this.docContrato.status = this.docContrato ? this.docContrato.status.filter( st=> st.active===true)[0] : '';
        if(this.docAcuse) this.docAcuse.status = this.docAcuse ? this.docAcuse.status.filter( st=> st.active===true)[0] : '';        
        
        // MAESTRIA
        if (this.certificateLDoc) this.certificateLDoc.status = this.certificateLDoc ? this.certificateLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.titledLDoc) this.titledLDoc.status = this.titledLDoc ? this.titledLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cedulaLDoc) this.cedulaLDoc.status = this.cedulaLDoc ? this.cedulaLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.examActLDoc) this.examActLDoc.status = this.examActLDoc ? this.examActLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cccertificateLDoc) this.cccertificateLDoc.status = this.cccertificateLDoc ? this.cccertificateLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cctitledLDoc) this.cctitledLDoc.status = this.cctitledLDoc ? this.cctitledLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cccedulaLDoc) this.cccedulaLDoc.status = this.cccedulaLDoc ? this.cccedulaLDoc.status.filter(st => st.active === true)[0] : '';
        if (this.ccexamActLDoc) this.ccexamActLDoc.status = this.ccexamActLDoc ? this.ccexamActLDoc.status.filter(st => st.active === true)[0] : '';

        // DOCTORADO
        if (this.certificateMDoc) this.certificateMDoc.status = this.certificateMDoc ? this.certificateMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.titledMDoc) this.titledMDoc.status = this.titledMDoc ? this.titledMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cedulaMDoc) this.cedulaMDoc.status = this.cedulaMDoc ? this.cedulaMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.examActMDoc) this.examActMDoc.status = this.examActMDoc ? this.examActMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cccertificateMDoc) this.cccertificateMDoc.status = this.cccertificateMDoc ? this.cccertificateMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cctitledMDoc) this.cctitledMDoc.status = this.cctitledMDoc ? this.cctitledMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.cccedulaMDoc) this.cccedulaMDoc.status = this.cccedulaMDoc ? this.cccedulaMDoc.status.filter(st => st.active === true)[0] : '';
        if (this.ccexamActMDoc) this.ccexamActMDoc.status = this.ccexamActMDoc ? this.ccexamActMDoc.status.filter(st => st.active === true)[0] : '';


        this.showImg=false;
        if(this.docFoto){
          this.findFoto();
        }else{
          this.image = 'assets/imgs/profileImgNotFound.jpg';
          this.showImg=true;
        }
      }
    );

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
        this.inscriptionsProv.getFile(this.docCompromiso.fileIdInDrive, this.docCompromiso.filename).subscribe(data => {
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

      case "Solicitud": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Solicitud.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docSolicitud.fileIdInDrive, this.docSolicitud.filename).subscribe(data => {
          var pubSolicitud = data.file;
          let buffSolicitud = new Buffer(pubSolicitud.data);
          var pdfSrcSolicitud = buffSolicitud;
          var blob = new Blob([pdfSrcSolicitud], {type: "application/pdf"});
          this.loadingService.setLoading(false);
          window.open( URL.createObjectURL(blob) );
        }, error => {
          console.log(error);
        });
        break;
      }

      case "Contrato": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Contrato.', '');
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docContrato.fileIdInDrive, this.docContrato.filename).subscribe(data => {
          var pubContrato = data.file;
          let buffContrato = new Buffer(pubContrato.data);
          var pdfSrcContrato = buffContrato;
          var blob = new Blob([pdfSrcContrato], {type: "application/pdf"});
          this.loadingService.setLoading(false);
          window.open( URL.createObjectURL(blob) );
        }, error => {
          console.log(error);
        });
        break;
      }
      case "Acuse": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acuse.', '');
        this.generatePDFAcuse();
        break;
      }
      case "AcuseDrive": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Acuse.', '');        
        this.loadingService.setLoading(true);
        this.inscriptionsProv.getFile(this.docAcuse.fileIdInDrive, this.docAcuse.filename).subscribe(data => {
          var pubContrato = data.file;
          let buffContrato = new Buffer(pubContrato.data);
          var pdfSrcContrato = buffContrato;
          var blob = new Blob([pdfSrcContrato], {type: "application/pdf"});
          this.loadingService.setLoading(false);
          window.open( URL.createObjectURL(blob) );
        }, error => {
          console.log(error);
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

    doc.line((pageWidth / 2)-35, 250, (pageWidth / 2)+35, 250);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(10);
    doc.text("Firma del Estudiante", pageWidth / 2, 260, 'center');

    var columns = ["No", "Documento", "Estatus"];

    var data = [];
    if(this.doctorate){
      data = [
        [1, "COMPROBANTE DE PAGO",""],
        [2, "CERTIFICADO DE MAESTRIA",""],
        [3, "TÍTULO DE MAESTRIA",""],
        [4, "CÉDULA DE MAESTRIA",""],
        [5, "ACTA DE EXAMEN DE MAESTRIA",""],
        [6, "CURP",""],
        [7, "ACTA DE NACIMIENTO",""],
        [8, "ANÁLISIS CLÍNICOS",""],
        [9, "FOTOGRAFÍA",""],
        [10, "NÚMERO DE SEGURO SOCIAL",""],
        [11, "CARTA COMPROMISO CERTIFICADO DE MAESTRIA",""] ,
        [12, "CARTA COMPROMISO TÍTULO DE MAESTRIA",""] ,
        [13, "CARTA COMPROMISO CÉDULA DE MAESTRIA",""] ,
        [14, "CARTA COMPROMISO ACTA DE EXAMEN DE MAESTRIA",""]
      ];

      doc.autoTable(columns,data,{
        headStyles: {fillColor: [20, 43, 88]},
        margin:{ top: 60 }
      });

      // COMPROBANTE DE PAGO
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

      // CERTIFICADO MAESTRIA
      if(this.certificateMDoc != ''){
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

      // TITULO MAESTRIA
      if(this.titledMDoc != ''){
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

      // CEDULA MAESTRIA
      if(this.cedulaMDoc != ''){
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

      // ACTA DE EXAMEN MAESTRIA
      if(this.examActMDoc != ''){
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

      // CURP
      if(this.docCurp != ''){
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

      // ACTA NACIMIENTO
      if(this.docActa != ''){
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

      // ANALISIS CLINICOS
      if(this.docAnalisis != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 121, 35, 7, 1, 1, 'FD'); // +7.6
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 125.45); // + 7.6
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 121, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 125.45);
      }

      // FOTOGRAFIA
      if(this.docFoto != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 128.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 133.05);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 128.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 133.05);
      }

      // NSS
      if(this.docNss != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 136.2, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 140.65);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 136.2, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 140.65);
      }

      // CC CERTIFICADO DE MAESTRIA
      if(this.cccertificateMDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 143.8, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 148.25);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 143.8, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 148.25);
      }

      // CC TITULO DE MAESTRIA
      if(this.cctitledMDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 151.4, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 155.85);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 151.4, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 155.85);
      }

      // CC CEDULA DE MAESTRIA
      if(this.cccedulaMDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 159, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 163.45);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 159, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 163.45);
      }

      // CC ACTA EXAMEN DE MAESTRIA
      if(this.ccexamActMDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 166.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 171.05);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 166.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 171.05);
      }

    }

    if(this.mastersDegree){
      data = [
        [1, "COMPROBANTE DE PAGO",""],
        [2, "CERTIFICADO DE LICENCIATURA",""],
        [3, "TÍTULO DE LICENCIATURA",""],
        [4, "CÉDULA DE LICENCIATURA",""],
        [5, "ACTA DE EXAMEN DE LICENCIATURA",""],
        [6, "CURP",""],
        [7, "ACTA DE NACIMIENTO",""],
        [8, "ANÁLISIS CLÍNICOS",""],
        [9, "FOTOGRAFÍA",""],
        [10, "NÚMERO DE SEGURO SOCIAL",""],
        [11, "CARTA COMPROMISO CERTIFICADO DE LICENCIATURA",""] ,
        [12, "CARTA COMPROMISO TÍTULO DE LICENCIATURA",""] ,
        [13, "CARTA COMPROMISO CÉDULA DE LICENCIATURA",""] ,
        [14, "CARTA COMPROMISO ACTA DE EXAMEN DE LICENCIATURA",""]
      ];

      doc.autoTable(columns,data,{
        headStyles: {fillColor: [20, 43, 88]},
        margin:{ top: 60 }
      });

      // COMPROBANTE DE PAGO
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

      // CERTIFICADO LICENCIATURA
      if(this.certificateLDoc != ''){
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

      // TITULO LICENCIATURA
      if(this.titledLDoc != ''){
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

      // CEDULA LICENCIATURA
      if(this.cedulaLDoc != ''){
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

      // ACTA DE EXAMEN LICENCIATURA
      if(this.examActLDoc != ''){
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

      // CURP
      if(this.docCurp != ''){
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

      // ACTA NACIMIENTO
      if(this.docActa != ''){
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

      // ANALISIS CLINICOS
      if(this.docAnalisis != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 121, 35, 7, 1, 1, 'FD'); // +7.6
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 125.45); // + 7.6
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 121, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 125.45);
      }

      // FOTOGRAFIA
      if(this.docFoto != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 128.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 133.05);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 128.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 133.05);
      }

      // NSS
      if(this.docNss != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 136.2, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 140.65);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 136.2, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 140.65);
      }

      // CC CERTIFICADO DE LICENCIATURA
      if(this.cccertificateLDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 143.8, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 148.25);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 143.8, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 148.25);
      }

      // CC TITULO DE LICENCIATURA
      if(this.cctitledLDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 151.4, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 155.85);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 151.4, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 155.85);
      }

      // CC CEDULA DE LICENCIATURA
      if(this.cccedulaLDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 159, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 163.45);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 159, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 163.45);
      }

      // CC ACTA EXAMEN DE LICENCIATURA
      if(this.ccexamActLDoc != ''){
        doc.setTextColor(0,0,0);
        doc.setFillColor(255, 245, 204);
        doc.roundedRect(155, 166.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('ENVIADO', 161, 171.05);
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setTextColor(0,0,0);
        doc.roundedRect(155, 166.6, 35, 7, 1, 1, 'FD');
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text('NO ENVIADO', 161, 171.05);
      }

    }
    if(!this.doctorate && !this.mastersDegree){
      data = [
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
    }

    this.loadingService.setLoading(false);
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

  checkFolders(){
    this.studentProv.getFolderId(this._idStudent).subscribe(
      folder=>{
        if(folder.folder.idFolderInDrive){// folder exists
          this.folderId = folder.folder.idFolderInDrive;
          this.assingConfigForDropzone();
        }
      });
  }

  assingConfigForDropzone(){

    /*Dropzone*/

    this.config1 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-ACTA.pdf', 'mimeType': 'application/pdf', newF: this.docActa ? false :true, fileId:this.docActa ? this.docActa.fileIdInDrive :''},
        acceptedFiles:'application/pdf',
    };
    this.config2 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CERTIFICADO.pdf', 'mimeType': 'application/pdf', newF: this.docCertificado ? false :true, fileId: this.docCertificado ? this.docCertificado.fileIdInDrive : ''},
      acceptedFiles:'application/pdf',
    };
    this.config3 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CLINICOS.pdf', 'mimeType': 'application/pdf', newF: this.docAnalisis ? false :true, fileId:this.docAnalisis ? this.docAnalisis.fileIdInDrive :''},
      acceptedFiles:'application/pdf',
    };
    this.config4 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROBANTE.pdf', 'mimeType': 'application/pdf', newF: this.docComprobante? false : true, fileId: this.docComprobante ? this.docComprobante.fileIdInDrive : ''},
      acceptedFiles:'application/pdf',
    };
    this.config5 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CURP.pdf', 'mimeType': 'application/pdf', newF: this.docCurp ? false :true, fileId:this.docCurp ? this.docCurp.fileIdInDrive :''},
      acceptedFiles:'application/pdf',
    };

    this.config6 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-NSS.pdf','mimeType': 'application/pdf', newF: this.docNss ? false :true, fileId:this.docNss ? this.docNss.fileIdInDrive :''},
      acceptedFiles:'application/pdf',
    };

    this.config7 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO.pdf', 'mimeType': 'application/pdf', newF: this.docCompromiso ? false :true, fileId:this.docCompromiso ? this.docCompromiso.fileIdInDrive :''},
      acceptedFiles:'application/pdf',
    };    

    // DROPZONE MAESTRIA
    this.config8 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CERTIFICADO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.certificateLDoc ? false :true, fileId:this.certificateLDoc ? this.certificateLDoc.fileIdInDrive :''},
      acceptedFiles:'application/pdf',
    };
    this.config9 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-TITULO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.titledLDoc ? false :true, fileId:this.titledLDoc ? this.titledLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config10 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CEDULA_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cedulaLDoc ? false :true, fileId:this.cedulaLDoc ? this.cedulaLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config11 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-EXAMEN_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.examActLDoc ? false :true, fileId:this.examActLDoc ? this.examActLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config12 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_CERTIFICADO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cccertificateLDoc ? false :true, fileId:this.cccertificateLDoc ? this.cccertificateLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config13 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_TITULO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cctitledLDoc ? false :true, fileId:this.cctitledLDoc ? this.cctitledLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config14 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_CEDULA_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cccedulaLDoc ? false :true, fileId:this.cccedulaLDoc ? this.cccedulaLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config15 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_EXAMEN_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.ccexamActLDoc ? false :true, fileId:this.ccexamActLDoc ? this.ccexamActLDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };

    // DROPZONE DOCTORADO
    this.config16 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CERTIFICADO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.certificateMDoc ? false :true, fileId:this.certificateMDoc ? this.certificateMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config17 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-TITULO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.titledMDoc ? false :true, fileId:this.titledMDoc ? this.titledMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config18 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CEDULA_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cedulaMDoc ? false :true, fileId:this.cedulaMDoc ? this.cedulaMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config19 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-EXAMEN_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.examActMDoc ? false :true, fileId:this.examActMDoc ? this.examActMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config20 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_CERTIFICADO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cccertificateMDoc ? false :true, fileId:this.cccertificateMDoc ? this.cccertificateMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config21 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_TITULO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cctitledMDoc ? false :true, fileId:this.cctitledMDoc ? this.cctitledMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config22 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_CEDULA_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cccedulaMDoc ? false :true, fileId:this.cccedulaMDoc ? this.cccedulaMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
    this.config23 = {
      clickable: true, maxFiles: 2,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROMISO_EXAMEN_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.ccexamActMDoc ? false :true, fileId:this.ccexamActMDoc ? this.ccexamActMDoc.fileIdInDrive :''},
      acceptedFiles: 'application/pdf',
    };
  }
  /*  DROPZONE 1 METHODS  */
  public resetDropzoneUploads(): void {
    this.componentRef.directiveRef.reset();
  }

  public onUploadSuccess(args: any): void {
    if(args[1].action !== 'create file'){
      const documentInfo = {
        filename:args[1].name,
        status : {
        name:'EN PROCESO',
        active:true,
        message:'Se actualizo el documento'
      }
    };
    this.studentProv.updateDocumentStatus(this.data._id,documentInfo).subscribe(
      res=>{
        this.notificationsServices.showNotification(eNotificationType.SUCCESS,
        'Exito', 'Documento actualizado correctamente.');
      },
      err=>console.log(err)
    );
    }else{
      const documentInfo = {
        doc:{
          filename:args[1].name,
          type:'DRIVE',
          fileIdInDrive:args[1].fileId,
        },
          status : {
          name:'EN PROCESO',
          active:true,
          message:'Se envio por primera vez'
        }
      };
      this.studentProv.uploadDocumentDrive(this.data._id,documentInfo).subscribe(
        updated=>{
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
            'Exito', 'Documento cargado correctamente.');
        },
        err=>{
          console.log(err);
        }
      );
    }
    this.resetDropzoneUploads();
  }

  onErrorCommon(args: any) {
    if (args[1] === `You can't upload files of this type.`) {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos con esa extensión!\n Las extensiones permitidas son .pdf");
        
    } else {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos tan pesados!\nEl límite es 3MB");
    }
    this.resetDropzoneUploads();
    this.resetDropzoneUploads();
  }

  onErrored(error: any) {
    // do anything
  }

  /*Se lanza cuando se cambia la foto*/
  fileChangeEvent(event: any, content) {
    if (event) {
      this.selectedFile = <File>event.target.files[0];
      this.imageChangedEvent = event;

      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;

        this.photoStudent = this.croppedImageBase64;
        this.imgForSend = true;

        this.uploadFile();
        event.target.value = '';
      }, (reason) => {
        event.target.value = '';
        this.imgForSend = false;
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  showSelectFileDialog() {
    const input = document.getElementById('fileButton');
    input.click();
  }
  uploadFile() {
    this.loadingService.setLoading(true);
    const red = new FileReader;
    red.addEventListener('load', () => {
      let file = {
        mimeType:this.selectedFile.type,
        nameInDrive:this.data.email+'-FOTO.'+this.selectedFile.type.substr(6,this.selectedFile.type.length-1),
        bodyMedia:red.result.toString().split(',')[1],
        folderId:this.folderId,
        newF: this.docFoto ? false:true, fileId: this.docFoto ? this.docFoto.fileIdInDrive:''};

      this.inscriptionsProv.uploadFile2(file).subscribe(
        resp=>{
          if(resp.action !== 'create file'){
            const documentInfo = {
                filename:resp.filename,
                status : {
                name:'EN PROCESO',
                active:true,
                message:'Se actualizo el documento'
              }
            };
            this.studentProv.updateDocumentStatus(this.data._id,documentInfo).subscribe(
              res=>{
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,
                'Exito', 'Documento actualizado correctamente.');
              },
              err=>console.log(err)
            );
          }else{
            const documentInfo = {

              doc:{
                filename:resp.name,
                type:'DRIVE',
                fileIdInDrive:resp.fileId
              },
              status : {
                name:'EN PROCESO',
                active:true,
                message:'Se envio por primera vez'
              }
            };
            this.studentProv.uploadDocumentDrive(this.data._id,documentInfo).subscribe(
              updated=>{
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,
                  'Exito', 'Documento cargado correctamente.');

              },
              err=>{
                console.log(err);

              },()=> this.loadingService.setLoading(false)
            );
          }
          this.loadingService.setLoading(false);
        },
        err=>{console.log(err); this.loadingService.setLoading(false);
        }
      )
    }, false);
    red.readAsDataURL(this.croppedImage);
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
    this.croppedImageBase64 = event.base64;
  }
  imageLoaded() {
    // show cropper
  }

  showObservationsAnalysis(){
    Swal.fire({
      title: 'Observaciones',
      text: this.observationsA,
      type: 'info',
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => {});
  }

  help(documentName: string, path: string) {
    const linkModal = this.dialog.open(DocumentsHelpComponent, {
      data: {
        document: documentName,
        pdf: path
      },
      disableClose: true,
      hasBackdrop: true,
      width: '70em',
      height: '90vh'
    });
  }

  helpPhoto(){
    Swal.fire({
      html:
        `
        <p style="text-align: left;">La fotografía debe ser:</p>
                  <ol style="text-align: left;">
                    <li>Fondo blanco.</li>
                    <li>De frente.</li>
                    <li>Que se visualice claramente de los hombros hacia arriba.</li>
                    <li>Hombres sin aretes.</li>
                    <li>Evitar accesorios (Lentes oscuros, audífonos, gorros, sombreros, gorras,...).</li>
                  </ol>
                  <b>NOTA: Se revisará la fotografía antes de la impresión de la credencial.</b>
        `,
      allowOutsideClick: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => { });
  }
  onMessage(message: string){
    Swal.fire({
      type: 'error',
      title: '¡Observaciones!',
      text: message,
      showCloseButton: true,
    });
  }
}
