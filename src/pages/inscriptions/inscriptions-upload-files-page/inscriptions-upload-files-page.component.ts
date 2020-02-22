import { Component, OnInit, ViewChild } from '@angular/core';
import { DropzoneComponent, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Router, ActivatedRoute } from '@angular/router';

import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { DocumentsHelpComponent } from 'src/modals/inscriptions/documents-help/documents-help.component';

import { MatStepper } from '@angular/material/stepper';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';
import * as jsPDF from 'jspdf';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-inscriptions-upload-files-page',
  templateUrl: './inscriptions-upload-files-page.component.html',
  styleUrls: ['./inscriptions-upload-files-page.component.scss']
})
export class InscriptionsUploadFilesPageComponent implements OnInit {
  _idStudent: String;
  data;

  activePeriod;
  folderId;
  foldersByPeriod = [];

  curpDoc;
  nssDoc;
  imageDoc;
  payDoc;
  certificateDoc;
  actaDoc;
  clinicDoc;
  pdfSrc;
  pub;
  image;
  ccDoc;
  hasCert : boolean;

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
  hasCerL : boolean;
  hasTL : boolean;
  hasCedL : boolean;
  hasEL : boolean;


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
  hasCerM : boolean;
  hasTM : boolean;
  hasCedM : boolean;
  hasEM : boolean;


  selectedFile: File = null;
  imageChangedEvent: any = '';
  closeResult: string;
  photoStudent = '';
  imgForSend: boolean;
  croppedImage: any = '';
  croppedImageBase64: any = '';
  loading: boolean;
  currentStudent = {
    nss: '',
    fullName: '',
    career: '',
    _id: '',
    controlNumber: ''
  };
  search: any;
  certificateDeliveryDate;

  //CONFIGURACIONES JSPDF
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

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;

  // Validar Tipo de Carrera (Maestria o Doctorado)
  public mastersDegree = false;
  public doctorate = false;

  //Font Montserrat
  montserratNormal: any;
  montserratBold: any;

  nombre = '';
  numeroControl ='';
  telefono = '';


  /* Dropzone conf */
  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;

  public config: DropzoneConfigInterface;
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


  dropzoneFileNameCERTIFICADO: any;
  dropzoneFileNameACTA: any;
  dropzoneFileNameCURP: any;
  dropzoneFileNameCOMPROBANTE: any;
  dropzoneFileNameANALISIS: any;
  dropzoneFileNamePhoto: any;
  dropzoneFileNameNSS: any;
  dropzoneFileNameCC: any;

  // MAESTRIA
  dropzoneFileNameCERTIFICADOMAESTRIA: any;
  dropzoneFileNameTITULOMAESTRIA: any;
  dropzoneFileNameCEDULAMAESTRIA: any;
  dropzoneFileNameEXAMENMAESTRIA: any;
  dropzoneFileNameCCCERTIFICADOMAESTRIA: any;
  dropzoneFileNameCCTITULOMAESTRIA: any;
  dropzoneFileNameCCCEDULAMAESTRIA: any;
  dropzoneFileNameCCEXAMENMAESTRIA: any;

  // DOCTORADO
  dropzoneFileNameCERTIFICADODOCTORADO: any;
  dropzoneFileNameTITULODOCTORADO: any;
  dropzoneFileNameCEDULADOCTORADO: any;
  dropzoneFileNameEXAMENDOCTORADO: any;
  dropzoneFileNameCCCERTIFICADODOCTORADO: any;
  dropzoneFileNameCCTITULODOCTORADO: any;
  dropzoneFileNameCCCEDULADOCTORADO: any;
  dropzoneFileNameCCEXAMENDOCTORADO: any;

  constructor(
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionsProv: InscriptionsProvider,
    private studentProv: StudentProvider,
    private stepper: MatStepper,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private imageToBase64Serv: ImageToBase64Service,

  ) {
    this.data = this.cookiesService.getData().user;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.studentProv.refreshNeeded$.subscribe(
      () => {
        this.getDocuments();
      }
    );
    this.getDocuments();
    this.getIdStudent();
    this.getFonts();
  }
  ngOnInit() {
    // Convertir imágenes a base 64 para los reportes
    this.imageToBase64Serv.getBase64('assets/imgs/logoTecNM.png').then(res1 => {
      this.logoTecNM = res1;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoEducacionSEP.png').then(res2 => {
      this.logoSep = res2;
    });
    this.getCertificateDeliveryDate();
  }

  getIdStudent() {
    this.data = this.cookiesService.getData().user;
    this._idStudent = this.data._id;
    console.log(this.data.career);
    this.doctorate = (this.data.career === 'DCA') ? true : false;
    this.mastersDegree = (this.data.career === 'MCA' || this.data.career === 'MTI') ? true : false;
    console.log("Doctorado: "+this.doctorate);
    console.log("Maestria: "+this.mastersDegree);
    this.inscriptionsProv.getStudent(this.data._id).subscribe(res => {
      var studentData = res.student[0];
      this.nombre = studentData.fullName ? studentData.fullName : '';
      this.numeroControl = studentData.controlNumber ? studentData.controlNumber : '';
      this.telefono = studentData.phone ? studentData.phone : '';
    });
  }

  getFonts() {
    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Regular.ttf').then(base64 => {
        this.montserratNormal = base64.toString().split(',')[1];
    });

    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Bold.ttf').then(base64 => {
        this.montserratBold = base64.toString().split(',')[1];
    });
  }


  getDocuments() {
    this.studentProv.getDriveDocuments(this.data._id).subscribe(
      docs => {
        let documents = docs.documents;
        this.curpDoc = documents.filter(docc => docc.filename == this.data.email+'-CURP.pdf')[0];
        this.nssDoc = documents.filter(docc => docc.filename == this.data.email+'-NSS.pdf')[0];
        this.imageDoc = documents.filter(docc => docc.filename.indexOf('FOTO') !== -1)[0];
        this.payDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROBANTE.pdf')[0];
        this.certificateDoc = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO.pdf')[0];
        this.actaDoc = documents.filter(docc => docc.filename == this.data.email+'-ACTA.pdf')[0];
        this.clinicDoc = documents.filter(docc => docc.filename == this.data.email+'-CLINICOS.pdf')[0];
        this.ccDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO.pdf')[0];
        
        //MESTRIA
        this.certificateLDoc = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO_LICENCIATURA.pdf')[0];
        this.titledLDoc = documents.filter(docc => docc.filename == this.data.email+'-TITULO_LICENCIATURA.pdf')[0];
        this.cedulaLDoc = documents.filter(docc => docc.filename == this.data.email+'-CEDULA_LICENCIATURA.pdf')[0];
        this.examActLDoc = documents.filter(docc => docc.filename == this.data.email+'-EXAMEN_LICENCIATURA.pdf')[0];
        this.cccertificateLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CERTIFICADO_LICENCIATURA.pdf')[0];
        this.cctitledLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_TITULO_LICENCIATURA.pdf')[0];
        this.cccedulaLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CEDULA_LICENCIATURA.pdf')[0];
        this.ccexamActLDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_EXAMEN_LICENCIATURA.pdf')[0];

        //DOCTORADO
        this.certificateMDoc = documents.filter(docc => docc.filename == this.data.email+'-CERTIFICADO_MAESTRIA.pdf')[0];
        this.titledMDoc = documents.filter(docc => docc.filename == this.data.email+'-TITULO_MAESTRIA.pdf')[0];
        this.cedulaMDoc = documents.filter(docc => docc.filename == this.data.email+'-CEDULA_MAESTRIA.pdf')[0];
        this.examActMDoc = documents.filter(docc => docc.filename == this.data.email+'-EXAMEN_MAESTRIA.pdf')[0];
        this.cccertificateMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CERTIFICADO_MAESTRIA.pdf')[0];
        this.cctitledMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_TITULO_MAESTRIA.pdf')[0];
        this.cccedulaMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_CEDULA_MAESTRIA.pdf')[0];
        this.ccexamActMDoc = documents.filter(docc => docc.filename == this.data.email+'-COMPROMISO_EXAMEN_MAESTRIA.pdf')[0];

        if (this.imageDoc) this.imageDoc.status = this.imageDoc ? this.imageDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.curpDoc) this.curpDoc.status = this.curpDoc ? this.curpDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.actaDoc) this.actaDoc.status = this.actaDoc ? this.actaDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.clinicDoc) this.clinicDoc.status = this.clinicDoc ? this.clinicDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.certificateDoc) this.certificateDoc.status = this.certificateDoc ? this.certificateDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.payDoc) this.payDoc.status = this.payDoc ? this.payDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.nssDoc) this.nssDoc.status = this.nssDoc ? this.nssDoc.status.filter(st => st.active === true)[0].name : '';

        if (this.ccDoc) this.ccDoc.status = this.ccDoc ? this.ccDoc.status.filter(st => st.active === true)[0].name : '';

        // MAESTRIA
        if (this.certificateLDoc) this.certificateLDoc.status = this.certificateLDoc ? this.certificateLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.titledLDoc) this.titledLDoc.status = this.titledLDoc ? this.titledLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cedulaLDoc) this.cedulaLDoc.status = this.cedulaLDoc ? this.cedulaLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.examActLDoc) this.examActLDoc.status = this.examActLDoc ? this.examActLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cccertificateLDoc) this.cccertificateLDoc.status = this.cccertificateLDoc ? this.cccertificateLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cctitledLDoc) this.cctitledLDoc.status = this.cctitledLDoc ? this.cctitledLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cccedulaLDoc) this.cccedulaLDoc.status = this.cccedulaLDoc ? this.cccedulaLDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.ccexamActLDoc) this.ccexamActLDoc.status = this.ccexamActLDoc ? this.ccexamActLDoc.status.filter(st => st.active === true)[0].name : '';
        
        // DOCTORADO
        if (this.certificateMDoc) this.certificateMDoc.status = this.certificateMDoc ? this.certificateMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.titledMDoc) this.titledMDoc.status = this.titledMDoc ? this.titledMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cedulaMDoc) this.cedulaMDoc.status = this.cedulaMDoc ? this.cedulaMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.examActMDoc) this.examActMDoc.status = this.examActMDoc ? this.examActMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cccertificateMDoc) this.cccertificateMDoc.status = this.cccertificateMDoc ? this.cccertificateMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cctitledMDoc) this.cctitledMDoc.status = this.cctitledMDoc ? this.cctitledMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.cccedulaMDoc) this.cccedulaMDoc.status = this.cccedulaMDoc ? this.cccedulaMDoc.status.filter(st => st.active === true)[0].name : '';
        if (this.ccexamActMDoc) this.ccexamActMDoc.status = this.ccexamActMDoc ? this.ccexamActMDoc.status.filter(st => st.active === true)[0].name : '';

        this.checkFolders();

        if (this.imageDoc) {
          this.inscriptionsProv.getFile(this.imageDoc.fileIdInDrive, this.imageDoc.filename).subscribe(
            succss => {
              this.photoStudent = 'data:image/jpg;base64,' + succss.file;
            },
            err => { this.photoStudent = 'assets/imgs/imgNotFound.png'; }
          )
        } else {
          this.photoStudent = 'assets/imgs/imgNotFound.png';
        }
      }
    );
  }
  checkFolders() {
    
    this.studentProv.getDriveFolderId(this.cookiesService.getData().user.email,eFOLDER.INSCRIPCIONES).subscribe(
      (folder)=>{
         this.folderId =  folder.folderIdInDrive;
         this.assingConfigForDropzone();
       },
       err=>{console.log(err);
       }
       );
    // this.studentProv.getFolderId(this._idStudent).subscribe(
    //   folder => {

    //     if (folder.folder) {// folder exists
    //       if (folder.folder.idFolderInDrive) {
    //         this.folderId = folder.folder.idFolderInDrive;
    //         this.assingConfigForDropzone();
    //       }
    //     }
    //   });
  }

  assingConfigForDropzone() {

    /*Dropzone*/
    this.config = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CERTIFICADO.pdf', 'mimeType': 'application/pdf', newF: this.certificateDoc ? false : true, fileId: this.certificateDoc ? this.certificateDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCERTIFICADO = file.name; done(); },
      acceptedFiles: 'application/pdf',

    };

    this.config1 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-ACTA.pdf', 'mimeType': 'application/pdf', newF: this.actaDoc ? false : true, fileId: this.actaDoc ? this.actaDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameACTA = file.name; done(); },
      acceptedFiles: 'application/pdf',

    };

    this.config2 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CURP.pdf', 'mimeType': 'application/pdf', newF: this.curpDoc ? false : true, fileId: this.curpDoc ? this.curpDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCURP = file.name; done(); },
      acceptedFiles: 'application/pdf',

    };

    this.config3 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROBANTE.pdf', 'mimeType': 'application/pdf', newF: this.payDoc ? false : true, fileId: this.payDoc ? this.payDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCOMPROBANTE = file.name; done(); },
      acceptedFiles: 'application/pdf',

    };

    this.config4 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CLINICOS.pdf', 'mimeType': 'application/pdf', newF: this.clinicDoc ? false : true, fileId: this.clinicDoc ? this.clinicDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameANALISIS = file.name; done(); },
      acceptedFiles: 'application/pdf',

    };

    this.config5 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-FOTO', 'mimeType': 'image/png,image/jpg', newF: this.imageDoc ? false : true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNamePhoto = file.name; done(); },
      acceptedFiles: '.png,.jpg'
    };

    this.config6 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-NSS.pdf', 'mimeType': 'application/pdf', newF: this.nssDoc ? false : true, fileId: this.nssDoc ? this.nssDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameNSS = file.name; done(); },
      acceptedFiles: 'application/pdf',
    };

    this.config7 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO.pdf', 'mimeType': 'application/pdf', newF: this.ccDoc ? false : true, fileId: this.ccDoc ? this.ccDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCC = file.name; done(); },
      acceptedFiles: 'application/pdf',
    };

    // DROPZONE MAESTRIA
    this.config8 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CERTIFICADO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.certificateLDoc ? false : true, fileId: this.certificateLDoc ? this.certificateLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCERTIFICADOMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config9 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-TITULO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.titledLDoc ? false : true, fileId: this.titledLDoc ? this.titledLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameTITULOMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config10 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CEDULA_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cedulaLDoc ? false : true, fileId: this.cedulaLDoc ? this.cedulaLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCEDULAMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config11 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-EXAMEN_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.examActLDoc ? false : true, fileId: this.examActLDoc ? this.examActLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameEXAMENMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config12 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_CERTIFICADO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cccertificateLDoc ? false : true, fileId: this.cccertificateLDoc ? this.cccertificateLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCCERTIFICADOMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config13 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_TITULO_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cctitledLDoc ? false : true, fileId: this.cctitledLDoc ? this.cctitledLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCTITULOMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config14 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_CEDULA_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.cccedulaLDoc ? false : true, fileId: this.cccedulaLDoc ? this.cccedulaLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCCEDULAMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config15 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_EXAMEN_LICENCIATURA.pdf', 'mimeType': 'application/pdf', newF: this.ccexamActLDoc ? false : true, fileId: this.ccexamActLDoc ? this.ccexamActLDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCEXAMENMAESTRIA = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };

    // DROPZONE DOCTORADO
    this.config16 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CERTIFICADO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.certificateMDoc ? false : true, fileId: this.certificateMDoc ? this.certificateMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCERTIFICADODOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config17 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-TITULO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.titledMDoc ? false : true, fileId: this.titledMDoc ? this.titledMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameTITULODOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config18 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-CEDULA_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cedulaMDoc ? false : true, fileId: this.cedulaMDoc ? this.cedulaMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCEDULADOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config19 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-EXAMEN_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.examActMDoc ? false : true, fileId: this.examActMDoc ? this.examActMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameEXAMENDOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config20 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_CERTIFICADO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cccertificateMDoc ? false : true, fileId: this.cccertificateMDoc ? this.cccertificateMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCCERTIFICADODOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config21 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_TITULO_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cctitledMDoc ? false : true, fileId: this.cctitledMDoc ? this.cctitledMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCTITULODOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config22 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_CEDULA_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.cccedulaMDoc ? false : true, fileId: this.cccedulaMDoc ? this.cccedulaMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCCEDULADOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };
    this.config23 = {
      clickable: true, maxFiles: 2,
      params: { 'usuario': this.data.name.fullName, folderId: this.folderId, 'filename': this.data.email + '-COMPROMISO_EXAMEN_MAESTRIA.pdf', 'mimeType': 'application/pdf', newF: this.ccexamActMDoc ? false : true, fileId: this.ccexamActMDoc ? this.ccexamActMDoc.fileIdInDrive : '' },
      accept: (file, done) => { this.dropzoneFileNameCCEXAMENDOCTORADO = file.name; done(); },
      acceptedFiles: 'application/pdf',    
    };


  }

  /*  DROPZONE 1 METHODS  */
  public resetDropzoneUploads(): void {
    this.componentRef.directiveRef.reset();
  }

  public onUploadSuccess(args: any): void {

    if (args[1].action == 'create file') {

      const documentInfo = {
        doc: {
          filename: args[1].name,
          type: 'DRIVE',
          fileIdInDrive: args[1].fileId,
        },
        status: {
          name: 'EN PROCESO',
          active: true,
          message: 'Se envio por primera vez'
        }
      };

      this.studentProv.uploadDocumentDrive(this.data._id, documentInfo).subscribe(
        updated => {

          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
            'Exito', 'Documento cargado correctamente.');

        },
        err => {
          console.log(err);

        }
      );
    } else {
      const documentInfo = {
        filename: args[1].name,
        status: {
          name: 'EN PROCESO',
          active: true,
          message: 'Se actualizo el documento'
        }
      };
      this.studentProv.updateDocumentStatus(this.data._id, documentInfo).subscribe(
        res => {
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
            'Exito', 'Documento actualizado correctamente.');
        },
        err => console.log(err)
      );
    }
    this.resetDropzoneUploads();

  }

  onErrorCommon(args: any) {
    this.resetDropzoneUploads();
    if (args[1] === `You can't upload files of this type.`) {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos con esa extensión!\n Las extensiones permitidas son .pdf");

    } else {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos tan pesados!\nEl límite es 3MB");
    }
  }



  collapse(ev, disabled) {

    let coll = document.getElementById(ev);
    if (coll.style.maxHeight) {
      coll.style.maxHeight = null;
      coll.style.padding = null;
    } else {
      coll.style.maxHeight = coll.scrollHeight + 80 + "px";
      coll.style.padding = '10px';
    }
    // if(!disabled){
    // }else{
    //   coll.style.maxHeight = null;
    //   coll.style.padding = null;
    // }
  }



  async continue() {
    var newStep = { stepWizard: 3 }
    this.loading = true;
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      this.loading = false;
      this.stepper.next();
      //window.location.assign("/wizardInscription");

    });
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
    this.loading = true;
    const red = new FileReader;
    red.addEventListener('load', () => {
      let file = { mimeType: this.selectedFile.type, nameInDrive: this.data.email + '-FOTO.jpg' , bodyMedia: red.result.toString().split(',')[1], folderId: this.folderId, newF: this.imageDoc ? false : true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive : '' };

      this.inscriptionsProv.uploadFile2(file).subscribe(
        resp => {
          if (resp.action == 'create file') {

            const documentInfo = {

              doc: {
                filename: resp.name,
                type: 'DRIVE',
                fileIdInDrive: resp.fileId
              },
              status: {
                name: 'EN PROCESO',
                active: true,
                message: 'Se envio por primera vez'
              }
            };
            this.studentProv.uploadDocumentDrive(this.data._id, documentInfo).subscribe(
              updated => {
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,
                  'Exito', 'Documento cargado correctamente.');

              },
              err => {
                console.log(err);

              }, () => this.loading = false
            );
          } else {

            const documentInfo = {
              filename: resp.filename,
              status: {
                name: 'EN PROCESO',
                active: true,
                message: 'Se actualizo el documento'
              }
            };
            this.studentProv.updateDocumentStatus(this.data._id, documentInfo).subscribe(
              res => {
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,
                  'Exito', 'Documento actualizado correctamente.');
              },
              err => console.log(err)
            );
          }
          this.loading = false;
        },
        err => {
          console.log(err); this.loading = false;
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

  getCertificateDeliveryDate(){
    let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    this.inscriptionsProv.getActivePeriod().subscribe(
      period=>{
        if(period.period){
          this.certificateDeliveryDate = new Date(period.period.certificateDeliveryDate).toLocaleDateString("es-MX", dateOptions) 
        }  
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

  hasCertificate(ev){
    this.hasCert = ev.checked;
  }

  // MAESTRIA
  hasCertificateL(ev){
    this.hasCerL = ev.checked;
  }

  hasTitledL(ev){
    this.hasTL = ev.checked;
  }

  hasCedulaL(ev){
    this.hasCedL = ev.checked;
  }

  hasExamL(ev){
    this.hasEL = ev.checked;
  }

  // DOCTORADO
  hasCertificateM(ev){
    this.hasCerM = ev.checked;
  }

  hasTitledM(ev){
    this.hasTM = ev.checked;
  }

  hasCedulaM(ev){
    this.hasCedM = ev.checked;
  }

  hasExamM(ev){
    this.hasEM = ev.checked;
  }

  //public generateCommitmentLetter(duty: string, position: string, employee: string): jsPDF {
  public generateCommitmentLetter(DOC){
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

    doc.setTextColor(0, 0, 0);

    doc.setFont(this.FONT, 'BOLD');
    doc.text('CARTA COMPROMISO', (this.WIDTH / 2), 30, { align: 'center' });

    doc.setFont(this.FONT, 'Normal');
    doc.setFontSize(10);
    this.addTextRight(doc, `Tepic, Nayarit a ${moment(new Date()).format('LL')}`, 45);
    
    doc.setFont(this.FONT, 'Bold');
    doc.text(`LIC. MANUEL ANGEL URIBE VÁZQUEZ`, this.MARGIN.LEFT, 55);
    doc.text(`DIRECTOR`, this.MARGIN.LEFT, 60);
    doc.text(`INSTITUTO TECNOLÓGICO DE TEPIC`, this.MARGIN.LEFT, 65);
    doc.text(`P R E S E N T E.`, this.MARGIN.LEFT, 70);

    this.addTextRight(doc, this.addArroba(`AT’N. M.C. ISRAEL ARJONA VIZCAÍNO`), 80);
    this.addTextRight(doc, this.addArroba(`JEFE DEL DEPTO. DE SERVS. ESCOLARES`), 85);
    this.addTextRight(doc, this.addArroba(`INSTITUTO TECNOLÓGICO DE TEPIC`), 90);

    // tslint:disable-next-line: max-line-length
    let contenido = `Por medio de la presente me @COMPROMETO@ a entregar en el ${this.addArroba('Departamento de Servicios Escolares')} mi ${this.addArroba(DOC)}. Estoy consciente que de ${this.addArroba('omitir dicha entrega')}, o entregarlo después de la fecha límite establecida, se me dará de baja definitiva de la institución, aunque haya realizado el pago del semestre, por cometer violación de ciclo.`;
    
    this.justifyText(doc, contenido, { x: this.MARGIN.LEFT, y: 120 }, 180);
    
    doc.setFontSize(10);
    doc.setFont(this.FONT, 'Bold');
    doc.text(`La fecha límite para entrega del documento es el ${this.certificateDeliveryDate}.`, this.MARGIN.LEFT, 150);

    doc.setFont(this.FONT, 'Normal');
    doc.text(`Sin otro particular, reciba un cordial saludo.`, this.MARGIN.LEFT, 155);
    doc.text(`Atentamente,`, this.MARGIN.LEFT, 175);
    doc.text(this.nombre, this.MARGIN.LEFT+10, 184);
    doc.text(`C. _______________________________________________`, this.MARGIN.LEFT, 185);
    doc.text(`(Nombre y Firma)`, this.MARGIN.LEFT+23, 190);
    doc.text(this.numeroControl, this.MARGIN.LEFT+30, 204);
    doc.text(`No. de contról: ____________________`, this.MARGIN.LEFT, 205);
    doc.text(this.telefono, this.MARGIN.LEFT+20, 214);
    doc.text(`Teléfono: ____________________`, this.MARGIN.LEFT, 215);

    window.open(doc.output('bloburl'), '_blank');
}

  private justifyText(Doc: jsPDF, Text: string, Point: { x: number, y: number }, Size: number, lineBreak: number = 5) {
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
        let longitud = row.trim().split(/\s+/).length;
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
            }
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
    });
    // doc.text(text, this.WIDTH - (this.MARGIN.RIGHT + tmpCount), positionY);
    }

  private addArroba(Text: string): string {
    return Text.split(' ').map(word => { return '@' + word + '@'; }).join(' ');
  }

}