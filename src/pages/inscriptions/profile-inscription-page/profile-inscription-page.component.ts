import { Component, OnInit,ViewChild } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { DropzoneComponent , DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import {NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
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

  folderId;
  selectedFile: File = null;
  imageChangedEvent: any = '';
  closeResult: string;
  photoStudent = '';
  imgForSend: boolean;
  croppedImage: any = '';
  croppedImageBase64: any = '';
  loading = false;
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

  constructor( 
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private studentProv: StudentProvider,    
    private modalService: NgbModal,
    private imageToBase64Serv: ImageToBase64Service,
  ){
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

      console.log(this.step,'stpsp');
      
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
    await this.inscriptionsProv.getFile(this.docFoto.fileIdInDrive, this.docFoto.filename).subscribe(
      data => {
        this.pub = data.file;
        this.image = 'data:image/png;base64,' + this.pub;
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
        
        this.docCurp = documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0];
       
        this.docNss = documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0];
       
        this.docFoto = documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0];
        
        this.docComprobante = documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0];
        
        this.docCertificado = documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0];
        
       
        this.docActa = documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0];
       console.log(this.docActa);
       
        this.docAnalisis = documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0];

        this.checkFolders();

        if(this.docFoto) this.docFoto.status = this.docFoto ? this.docFoto.status.filter( st=> st.active===true)[0] : '';

        if(this.docCurp)this.docCurp.status = this.docCurp ? this.docCurp.status.filter( st=> st.active===true)[0] : '';
        
        if(this.docActa)this.docActa.status = this.docActa ? this.docActa.status.filter( st=> st.active===true)[0] : '';

        if(this.docAnalisis)this.docAnalisis.status = this.docAnalisis ? this.docAnalisis.status.filter( st=> st.active===true)[0] : '';

        if(this.docCertificado) this.docCertificado.status = this.docCertificado ? this.docCertificado.status.filter( st=> st.active===true)[0] : '';

        if(this.docComprobante)    this.docComprobante.status = this.docComprobante ? this.docComprobante.status.filter( st=> st.active===true)[0] : '';

        if(this.docNss) this.docNss.status = this.docNss ? this.docNss.status.filter( st=> st.active===true)[0] : '';
        this.showImg=false;
        this.findFoto();
      }
    );    


    
   
    // setTimeout(() => {this.findFoto()}, 3000);

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
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "CURP": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando CURP.', '');
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
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "NSS": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando NSS.', '');
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
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Certificado": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Certificado de Estudios.', '');
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
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Analisis": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Análisis Clínicos.', '');
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
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Comprobante": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Comprobante de Pago.', '');
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
        }, error => {
          this.notificationService.showNotification(eNotificationType.ERROR,
            '', error);
        });
        break;
      }
      case "Foto": {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando Fotografía.', '');
        this.inscriptionsProv.getFile(this.docFoto.fileIdInDrive, this.docFoto.filename).subscribe(data => {
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

  checkFolders(){
    this.studentProv.getFolderId(this._idStudent).subscribe(
      folder=>{
        console.log(folder.folder,'asldaosfhasjfnksjdfnlkasnfjnk');
        
        if(folder.folder.idFolderInDrive){// folder exists
          this.folderId = folder.folder.idFolderInDrive;
          console.log(this.folderId,'folder student exists');
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
    console.log(this.config1);
    
    
    this.config2 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CERTIFICADO.pdf', 'mimeType': 'application/pdf', newF: false, fileId: this.docCertificado.fileIdInDrive},
      acceptedFiles:'application/pdf',      
    };
    this.config3 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-CLINICOS.pdf', 'mimeType': 'application/pdf', newF: this.docAnalisis ? false :true, fileId:this.docAnalisis ? this.docAnalisis.fileIdInDrive :''},
      acceptedFiles:'application/pdf',      
    };
    this.config4 = {
      clickable: true, maxFiles: 1,
      params: {folderId:this.folderId, 'filename': this.data.email+'-COMPROBANTE.pdf', 'mimeType': 'application/pdf', newF:false, fileId: this.docComprobante.fileIdInDrive},    
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
      // console.log(documentInfo);
      
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
    this.resetDropzoneUploads();
    if (args[1] === `You can't upload files of this type.`) {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos con esa extensión!\n Las extensiones permitidas son .pdf");
     
    } else {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos tan pesados!\nEl límite es 3MB");
    }
  }

  onErrored(error: any) {
    // do anything
    // console.log(error);    
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
    // console.log('upload');
    const red = new FileReader;
    red.addEventListener('load', () => {      
      // console.log(red.result);
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
                
              },()=>this.loading=false
            );
          }
          this.loading = false; 
        },
        err=>{console.log(err); this.loading = false; 
        }
      )
    }, false);
    red.readAsDataURL(this.croppedImage);    
    
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
    this.croppedImageBase64 = event.base64;
    // console.log('crop');
    
  }
  imageLoaded() {
    // show cropper
  }
}
