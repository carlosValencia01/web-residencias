import { Component, OnInit  } from '@angular/core';
import { MatDialog } from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import { uInscription } from 'src/app/entities/inscriptions/inscriptions';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { UserProvider } from 'src/app/providers/app/user.prov';

@Component({
  selector: 'app-confirmation-student-page',
  templateUrl: './confirmation-student-page.component.html',
  styleUrls: ['./confirmation-student-page.component.scss']
})
export class ConfirmationStudentPageComponent implements OnInit {
  
  _idStudent: String;
  data: any;
  studentData: any;

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


  // Validar Tipo de Carrera (Maestria o Doctorado)
  public mastersDegree = false;
  public doctorate = false;

  emptyUInscription: uInscription;
  folderId;
  currentDate: Date;
  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private imageToBase64Serv: ImageToBase64Service,
    private loadingService: LoadingService,
    private studentProv: StudentProvider,
    private userProv: UserProvider,
  ) {
    
    this.getIdStudent();
    this.getStudentData(this._idStudent);
    this.getFolderId();
  }

  ngOnInit() {
    setTimeout(() => {      
      this.emptyUInscription = new uInscription(this.imageToBase64Serv,this.cookiesServ,this.inscriptionsProv);
    }, 300);
    Swal.fire({
      title: 'ATENCIÓN',
      text: 'El envío de esta documentación está sujeto a observaciones, debes estar al pendiente de la plataforma o bien descarga la app (solo Android) Soy Tigre Tec Tepic, desde donde podrás visualizar el seguimiento de tu documentación',
      type: 'info',
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => { });
   
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
      this.getIdDocuments();
    });
  }

  getFolderId() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
    this.studentProv.getDriveFolderId(this.cookiesServ.getData().user.email,eFOLDER.INSCRIPCIONES).subscribe(
      (folder)=>{
         this.folderId =  folder.folderIdInDrive;
       },
       err=>{console.log(err);
       }
       );
  }

  async getIdDocuments() {
    let documents = this.studentData.documents;
    this.docSolicitud = documents.filter(docc => docc.filename == this.data.email+'-SOLICITUD.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-SOLICITUD.pdf')[0] : '';
    this.docContrato = documents.filter(docc => docc.filename == this.data.email+'-CONTRATO.pdf')[0] ? documents.filter(docc => docc.filename == this.data.email+'-CONTRATO.pdf')[0] : '';
    console.log(documents);
    
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

  }

  async onView(file) {
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Cargando '+file+'.', '');
    this.loadingService.setLoading(true);
    switch (file) {
      case "Solicitud": {
        this.inscriptionsProv.getFile(this.docSolicitud.fileIdInDrive, this.docSolicitud.filename).subscribe(data => {
          var pubSolicitud = data.file;
          let buffSolicitud = new Buffer(pubSolicitud.data);
          var pdfSrcSolicitud = buffSolicitud;
          this.loadingService.setLoading(false);
          var blob = new Blob([pdfSrcSolicitud], {type: "application/pdf"});

          //FileSaver.saveAs(blob,this.data.email+'-Solicitud.pdf');
          window.open( URL.createObjectURL(blob) );

        }, error => {
          console.log(error);
        });
        
        break;
      }
      case "Contrato": {
        this.inscriptionsProv.getFile(this.docContrato.fileIdInDrive, this.docContrato.filename).subscribe(data => {
          var pubContrato = data.file;
          let buffContrato = new Buffer(pubContrato.data);
          var pdfSrcContrato = buffContrato;
          this.loadingService.setLoading(false);
          var blob = new Blob([pdfSrcContrato], {type: "application/pdf"});
         
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
    Swal.mixin({
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar',     
      showCancelButton: true,
      progressSteps: ['1', '2','3'],
      type: 'warning'
    }).queue([
      {
        title: 'ATENCIÓN',
        text: 'Al dar clic en aceptar aceptas el Contrato, Solicitud y Acuse de documentos entregados',
        type:'info'
      },
      {
        title: 'Confirmación requerida',
        text: 'Número de control',
        confirmButtonText: 'Continuar &rarr;',
        showCancelButton: false,
        input:'text',
        inputPlaceholder:'Ingresa tu número de control',
        inputAttributes:{          
          autocapitalize: 'off',
          autocorrect: 'off'
        },        
        inputValidator: (value) => {
          if (!value) {//validar que no este vacio
            return '¡Ingresa tu número de control!';
          }else{            
            if(value != this.studentData.controlNumber){//validar numero de control
              return '¡Tu número de control no coincide!';
            }                        
          }
        }
      },
      {
        title: 'Confirmación requerida',
        text: 'Tu número de control '+this.studentData.controlNumber,
        input:'password',
        inputPlaceholder:'Ingresa tu nip',
        inputAttributes:{
          maxlength:'4',
          autocapitalize: 'off',
          autocorrect: 'off'
        },        
        inputValidator: async (value) => {
          if (!value) {//validar que no este vacio
            return '¡Ingresa tu nip!';
          }else{
            if(!value.match((/^[0-9]+$/))){//validar numeros
              return '¡Ingresa solo números!';
            }else{
              //comprobar si el nip coincide con el numero de control
              let ok = false;
              await new Promise((resolve)=>{
                this.userProv.login({
                  email: this.studentData.controlNumber,
                  password: value
                })
                  .subscribe((res) => {
                    ok=true;                   
                    resolve(true);
                  }, (error) => {                                
                    resolve(false);
                  });
              });
              if(!ok){
                return '¡Nip incorrecto!';
              }
            }
            
          }
        }
      },      
    ]).then((result) => {
      if (result.value) {
        Swal.fire({
          title: 'ATENCIÓN',
          text: 'El envío de esta documentación esta sujeto a observaciones, debes estar al pendiente de la plataforma o bien descarga la app (solo Android) Soy Tigre Tec Tepic, desde donde podrás visualizar el seguimiento de tu documentación.',
          type: 'info',
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',          
          confirmButtonText: 'Estoy enterado'
        }).then((result) => {
          if (result.value) {
            this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Firmando Contrato, Solicitud y Acuse', 'Este proceso puede tardar varios minutos.');   
            this.continue();
          }
         });
                
      }
    });
    
  }

  async continue() {
    this.loadingService.setLoading(true);
    this.currentDate = new Date();
    this.studentProv.updateStudent(this.data._id,{signDocuments:true,signDocumentsDate:this.currentDate}).subscribe((updated)=>{});
    const solicitud = this.emptyUInscription.generateSolicitud(this.studentData, true, this.currentDate);
    let binary = this.bufferToBase64(solicitud.output('arraybuffer'));    
    await this.saveDocument(binary,this.docSolicitud.filename,false,this.docSolicitud.fileIdInDrive,'Firmada electrónicamente');
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Inscripciones', 'Firmando los documentos. No cierre y no recargue esta pestaña '); 

    const contrato = this.emptyUInscription.generateContrato(this.studentData.fullName,this.currentDate, true);
    binary = this.bufferToBase64(contrato.output('arraybuffer'));
    await this.saveDocument(binary,this.docContrato.filename,false,this.docContrato.fileIdInDrive);
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Inscripciones', 'Firmando los documentos. No cierre y no recargue esta pestaña ');

    await this.generatePDFAcuse('sign');
    binary = this.bufferToBase64(this.docAcuse);
    await this.saveDocument(binary,this.studentData.controlNumber+'-ACUSE.pdf');

    this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Inscripciones', 'Documentos firmados correctamente.');
    this.loadingService.setLoading(false);
    var newStep = { stepWizard: 7, inscriptionStatus: 'Enviado', printCredential: false, warningAnalysis: false}
    this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      //this.router.navigate(['/wizardInscription']);
      window.location.assign("/inscriptions/profileInscription");      
    });

  }

  generatePDFAcuse(action='view') {
    return new Promise((resolve)=>{
      
      const doc = this.emptyUInscription.generateAcuse(this.studentData,action == 'view' ? false :true,this.currentDate);
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
  
      this.docAcuse = doc.output('arraybuffer');
      resolve(true);
      if(action == 'view'){
        this.loadingService.setLoading(false);
        window.open(doc.output('bloburl'), '_blank');
      }
    });
  }

  bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }
  async saveDocument(document, nameInDrive, newF=true,fileId='', message='Firmado electrónicamente') {
    return new Promise((resolve)=>{

      const documentInfo = {
        mimeType: "application/pdf",
        nameInDrive,
        bodyMedia: document,
        folderId: this.folderId,
        newF,
        fileId
      };      
      this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
        updated=>{                    
          const documentInfo2 = {
            doc:{
              filename: newF ? updated.name : nameInDrive ,
              type:'DRIVE',
              fileIdInDrive: newF ? updated.fileId : fileId
            },
              status : {
              name:'ACEPTADO',
              active:true,
              message
            }
          };
          if(!newF){            
            this.studentProv.updateDocumentStatus(this.data._id,{filename:nameInDrive,status:documentInfo2.status}).subscribe(res=>resolve(true), err=>resolve(false));
          }else{
            this.studentProv.uploadDocumentDrive(this.data._id,documentInfo2).subscribe(
              updated=> resolve(true),
              err=> resolve(false)
            );
          }
        },
        err=>{
          console.log(err);          
        }
      );
    });
  }

}
