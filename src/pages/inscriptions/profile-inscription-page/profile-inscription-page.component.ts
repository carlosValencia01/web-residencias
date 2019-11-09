import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import Swal from 'sweetalert2';

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

  constructor( 
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
  ){
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {

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
    await this.inscriptionsProv.getFile(this.docFoto.fileIdInDrive, this.docFoto.filename).subscribe(
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
    this.docActa = this.filterDocuments('ACTA')[0];
    this.docCertificado = this.filterDocuments('CERTIFICADO')[0];
    this.docAnalisis = this.filterDocuments('CLINICOS')[0];
    this.docComprobante = this.filterDocuments('COMPROBANTE')[0];
    this.docCurp = this.filterDocuments('CURP')[0];
    this.docNss = this.filterDocuments('NSS')[0];
    this.docFoto = this.filterDocuments('FOTO')[0];
console.log(this.docActa);

    if(this.docFoto) this.docFoto.status = this.docFoto ? this.docFoto.status.filter( st=> st.active===true)[0].name : '';

    if(this.docCurp)this.docCurp.status = this.docCurp ? this.docCurp.status.filter( st=> st.active===true)[0].name : '';
     
    if(this.docActa)this.docActa.status = this.docActa ? this.docActa.status.filter( st=> st.active===true)[0].name : '';

    if(this.docAnalisis)this.docAnalisis.status = this.docAnalisis ? this.docAnalisis.status.filter( st=> st.active===true)[0].name : '';

    if(this.docCertificado) this.docCertificado.status = this.docCertificado ? this.docCertificado.status.filter( st=> st.active===true)[0].name : '';

    if(this.docComprobante)    this.docComprobante.status = this.docComprobante ? this.docComprobante.status.filter( st=> st.active===true)[0].name : '';

    if(this.docNss) this.docNss.status = this.docNss ? this.docNss.status.filter( st=> st.active===true)[0].name : '';
   
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

}
