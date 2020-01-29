import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import TableToExcel from '@linways/table-to-excel';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { FirebaseService } from 'src/services/graduation/firebase.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { GraduationProvider } from 'src/providers/graduation/graduation.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import * as firebase from 'firebase/app';


declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-list-graduates-page',
  templateUrl: './list-graduates-page.component.html',
  styleUrls: ['./list-graduates-page.component.scss']
})
export class ListGraduatesPageComponent implements OnInit {
  public searchText: string;
  public searchTextDocumentation: string;

  // Variables para filtrar alumnos y generar reporte
  public searchSurvey = '';
  public searchCarreer = '';
  public searchCarreerDocumentation = '';
  public searchStatusDocumentation = '';

  public searchSRC = false;
  public searchSVC = false;
  public searchSAC = false;
  public searchSMC = false;

  public searchSR = '';
  public searchSV = '';
  public searchSA = '';
  public searchSM = '';

  public showTotal = true;

  public totalEgresados;
  public certificadosPendientes;
  public certificadosImpresos;
  public certificadosListos;
  public certificadosEntregados;

  public totalVerificados;
  public boletosTotales;
  public boletosRestantes;
  public boletosRegistrados;
  public boletosXAlumno;


  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;
  public firmaDirector: any;

  // Variable donde se almacenan todos los alumnos
  public alumnos = [];

  // Variable donde se almacenan los alumnos filtrados
  public alumnosReport = []; // Variable donde se almacenan los alumnos para el reporte
  public totalAlumnos; // Obtener total de alumnos con filtros de estatus y carrera
  public totalAlumnosFilter; // Obtener total de alumnos con filto de busqueda de alumno
  public alumnosReportDocumentation;
  // Variable para almacenar los alumnos verificados e imprimir papeletas
  public alumnosBallotPaper = [];
  public alumnosConstancia = [];


  public role: string;
  public no = 0;
  page = 1;
  pag;
  pageSize = 10;

  page2 = 1;
  pag2;
  pageSize2 = 10;

  collection = null;
  public status = 0;

  studentsBestAverage = [];
  studentIn = [];
  studentOut = [];
  careersPosition = [];

  loading = false;

  //Font Montserrat
  montserratNormal: any;
  montserratBold: any;

  dateGraduation;
  

  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv: GraduationProvider,
    private cookiesService: CookiesService,
    private router: Router,    
    private imageToBase64Serv: ImageToBase64Service,
    private studentProv: StudentProvider
  ) {
    this.getFonts();
    const rol = this.cookiesService.getData().user.role;
    if (rol !== 0 && rol !== 1 && rol !== 5 && rol !== 6 &&
      rol !== 9) {
      this.router.navigate(['/']);
    }
    this.collection = this.router.url.split('/')[2];
    const sub = this.firestoreService.getEvent(this.collection).subscribe(
      ev => { 
        sub.unsubscribe(); 
        this.status = ev.payload.get('estatus'); 
        this.dateGraduation = ev.payload.get('date');
        this.boletosTotales = ev.payload.get('totalTickets');
        this.boletosXAlumno = ev.payload.get('studentTickets');
     }
    );

    this.firestoreService.getBestAverages(this.collection).subscribe(
      (alumnos) => {
        const sub = this.firestoreService.getCareers().subscribe(
          (carreras) => {
            sub.unsubscribe();

            this.careersPosition = carreras.map((carrera: any) => {
              return { carrera: carrera.nombre, posicion: carrera.posicion };
            });
            this.studentsBestAverage = this.sortGraduates(alumnos);
            this.studentIn = this.studentsBestAverage.filter((student: any) =>
              student.data.estatus === 'Asistió' || student.data.estatus === 'Mencionado');

            this.studentOut = this.studentsBestAverage.filter((student: any) =>
              student.data.estatus === 'Registrado' || student.data.estatus === 'Pagado' || student.data.estatus === 'Verificado');
            //console.log(this.studentOut);
          },
          err => console.log(err)
        );
      },
      err => {
        console.log(err, 'error');
      }
    );
  }

  ngOnInit() {
    
    switch (this.cookiesService.getData().user.role) {
      case 0:
        this.role = 'administration';
        break;
      case 1:
        this.role = 'secretary';
        break;
      case 2:
        this.role = 'student';
        break;
      case 3:
        this.role = 'employee';
        break;
      case 4:
        this.role = 'rechumanos';
        break;
      case 5:
        this.role = 'comunication';
        break;
      case 6:
        this.role = 'coordinator';
        break;
      case 9:
        this.role = 'recfinancieros';
        break;
    }
    this.readEmail();

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
    this.imageToBase64Serv.getBase64('assets/imgs/firmaDirector.png').then(res4 => {
      this.firmaDirector = res4;
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

  readEmail() {
    this.firestoreService.getGraduates(this.collection).subscribe(async (alumnosSnapshot) => {
      this.alumnos = alumnosSnapshot.map((alumno) => {
        return {
          id: alumno.payload.doc.id,
          nc: alumno.payload.doc.get('nc'),
          name: alumno.payload.doc.get('nombre'),
          nameLastName: alumno.payload.doc.get('nombreApellidos'),
          carreer: alumno.payload.doc.get('carrera'),
          carreerComplete: alumno.payload.doc.get('carreraCompleta'),
          email: alumno.payload.doc.get('correo'),
          status: alumno.payload.doc.get('estatus'),
          degree: alumno.payload.doc.get('degree') ? true : false,
          observations: alumno.payload.doc.get('observations'),
          survey: alumno.payload.doc.get('survey'),
          bestAverage: alumno.payload.doc.get('mejorPromedio') ? alumno.payload.doc.get('mejorPromedio') : false,
          average: alumno.payload.doc.get('promedio') ? alumno.payload.doc.get('promedio') : 0,
          documentationStatus: alumno.payload.doc.get('documentationStatus') ? alumno.payload.doc.get('documentationStatus') : ' ',
          specialty: alumno.payload.doc.get('especialidad') ? alumno.payload.doc.get('especialidad') : '<<Especialidad>>',
          numInvitados: alumno.payload.doc.get('numInvitados') ? alumno.payload.doc.get('numInvitados') : 0,
          invitados: alumno.payload.doc.get('invitados') ? alumno.payload.doc.get('invitados') : [{}],
        };
      });
      this.getTicketsRegistered();
      // Ordenar Alumnos por Apellidos
      this.alumnos.sort(function (a, b) {
        return a.nameLastName.localeCompare(b.nameLastName);
      });

      this.alumnosReport = this.alumnos;
      this.totalAlumnos = this.alumnosReport.length;
      this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer, '');
      this.alumnosConstancia = this.filterItemsVerified(this.searchCarreerDocumentation,'');
      this.alumnosReportDocumentation = this.alumnos;
      this.eventFilterReport();
      // Contar total de alumnos
      this.totalEgresados = this.alumnos.length;
      this.certificadosImpresos = this.filterCountItemsStatus('Impreso').length;
      this.certificadosListos = this.filterCountItemsStatus('Listo').length;
      this.certificadosEntregados = this.filterCountItemsStatus('Entregado').length;
      this.certificadosPendientes = this.filterCountItemsStatus('Fotos y Recibo').length;
      // this.certificadosPendientes = [this.totalEgresados-(this.certificadosImpresos+this.certificadosEntregados+this.certificadosListos)];

      this.totalVerificados = this.filterCountItemsVerified().length;
      this.boletosRestantes = (this.boletosTotales-this.boletosRegistrados);
    });
  }

  getTicketsRegistered(){
    this.boletosRegistrados = 0;
    for(var i = 0 ; i < this.alumnos.length; i++){
      this.boletosRegistrados = (this.boletosRegistrados+this.alumnos[i].numInvitados);
    }
  }

  // Cambias estatus a Registrado
  removePaidEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id,{estatus: 'Registrado'},this.collection).then(() =>{
      this.eventFilterReport();
      this.notificationsServices.showNotification(0, 'Pago removido para:', item.nc);
    });
  }

  // Cambias estatus a Asistió
  asistenceEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id,{estatus: 'Asistió'},this.collection).then(() =>{
      this.eventFilterReport();
      this.notificationsServices.showNotification(0, 'Asistencia registrada para:', item.nc);
    });
  }

  // Cambias estatus a Verificado
  verifyEvent(item) {
      const invitados = [];
      for(var i = 0; i < this.boletosXAlumno; i++){
        invitados.push({['invitado'+(i+1)]:'verificado'})
      }
      this.firestoreService.updateFieldGraduate(item.id, {estatus: 'Verificado',numInvitados:this.boletosXAlumno,invitados},this.collection).then(() =>{
        this.eventFilterReport();
        this.notificationsServices.showNotification(0, 'Verificación registrada para:', item.nc);
      });
      //this.sendSurveyGraduate(item);
  }

  // Enviar encuesta al verificar alumno desde la web
  sendSurveyGraduate(item) {
    this.graduationProv.sendSurvey(item.email, item.id, item.name, item.nc, item.carreerComplete).subscribe(
      res => {
        this.notificationsServices.showNotification(0, 'Encuesta enviada a:', item.nc);
      },
      err => {
        this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:', item.nc);
      }
    );
  }

  // Confirmar verificar alumno
  verifyStudent(item) {
    Swal.fire({
      title: 'Verificar Alumno',
      text: item.name,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.verifyEvent(item);
      }
    });
  }
  // Confirmar remover pago
  confirmRemovePaidEvent(item) {
    Swal.fire({
      title: 'Remover Pago',
      text: 'Para ' + item.name,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.removePaidEvent(item);
      }
    });
  }

  // Confirmar asistencia
  confirmPresenceEvent(item) {
    Swal.fire({
      title: 'Confirmar Asistencia',
      text: 'Para ' + item.name,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.asistenceEvent(item);
      }
    });
  }

  // Confirmar envio de invitación
  confirmSendEmail(item) {
    Swal.fire({
      title: 'Enviar Invitación',
      imageUrl: '../../../assets/icons/sendEmail.svg',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Custom image',
      text: item.nameLastName,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar'
    }).then((result) => {
      if (result.value) {
        this.sendOneMail(item);
      }
    });
  }

  // Enviar invitación al alumno seleccionado (status == Verificado)
  sendOneMail(item) {
    if (item.survey) {
      this.graduationProv.sendQR(item.email, item.id, item.name).subscribe(
        res => {
          this.notificationsServices.showNotification(0, 'Invitación enviada a:', item.nc);
        },
        err => {
          this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:', item.nc);
        }
      );
    } else {
      this.notificationsServices.showNotification(2, item.nc, 'Encuesta de Egresados aun no ha sido respondida');
    }
  }

  // Confirmar envio de encuesta de egresados
  confirmSendEmailSurvey(item) {
    Swal.fire({
      title: 'Enviar Encuesta',
      imageUrl: '../../../assets/icons/survey.svg',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Custom image',
      text: item.nameLastName,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar'
    }).then((result) => {
      if (result.value) {
        this.sendOneMailSurvey(item);
      }
    });
  }

  // Enviar encuesta al alumno seleccionado (status == Verificado)
  sendOneMailSurvey(item) {
    if (item.status === 'Verificado') {
      this.graduationProv.sendSurvey(item.email, item.id, item.name, item.nc, item.carreerComplete).subscribe(
        res => {
          this.notificationsServices.showNotification(0, 'Encuesta enviada a:', item.nc);
        },
        err => {
          this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:', item.nc);
        }
      );
    } else {
      this.notificationsServices.showNotification(2, item.nc, 'Aun no se realiza el pago correspondiente');
    }
  }

  // Confirmar envio de invitación
  confirmSendEmailAll() {
    Swal.fire({
      title: 'Enviar Invitación',
      text: 'Para todos los alumnos',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar'
    }).then((result) => {
      if (result.value) {
        this.sendMailAll();
      }
    });
  }

  // Enviar invitación a todos los alumnos
  sendMailAll() {
    this.alumnos.forEach(async student => {
      if (student.email) {
        await this.sendOneMail(student);
      }
    });
  }

  // Obetener Valor del checkbox de Estatus
  eventFilterReport() {
    if (this.searchSRC) {
      this.searchSR = 'Registrado';
    } else {
      this.searchSR = '~';
    }
    if (this.searchSVC) {
      this.searchSV = 'Verificado';
    } else {
      this.searchSV = '~';
    }
    if (this.searchSAC) {
      this.searchSA = 'Asistió';
    } else {
      this.searchSA = '~';
    }
    if (this.searchSMC) {
      this.searchSM = 'Mencionado';
    } else {
      this.searchSM = '~';
    }
    this.alumnosReport = this.filterItems(
      this.searchCarreer,
      this.searchSR,
      this.searchSV,
      this.searchSA,
      this.searchSM
    );

    const cantidadStatus = this.filterItems(
      this.searchCarreer,
      this.searchSR,
      this.searchSV,
      this.searchSA,
      this.searchSM
    ).length;

    const cantidadCarrera = this.filterItemsCarreer(this.searchCarreer).length;

    if (cantidadStatus === 0) {
      if (this.searchSRC || this.searchSVC || this.searchSAC || this.searchSMC) {
        this.totalAlumnos = 0;
      } else {
        this.totalAlumnos = cantidadCarrera;
      }
    } else {
      if (this.searchSRC || this.searchSVC || this.searchSAC || this.searchSMC) {
        this.totalAlumnos = cantidadStatus;
      } else {
        this.totalAlumnos = cantidadCarrera;
      }
    }

    if (Object.keys(this.alumnosReport).length === 0) {
      if (!this.searchSRC && !this.searchSVC && !this.searchSAC && !this.searchSMC) {
        this.alumnosReport = this.alumnos;
      }
    }
    this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer, '');
  }

  eventFilterReportDocumentation(){
    this.alumnosConstancia = this.filterItemsVerified(this.searchCarreerDocumentation, '');
  }

  // FILTRADO POR CARRERA O ESTATUS
  filterItems(carreer, sR, sV, sA, sM) {
    return this.alumnos.filter(function (alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1 && (
        alumno.status.toLowerCase().indexOf(sR.toLowerCase()) > -1 ||
        alumno.status.toLowerCase().indexOf(sV.toLowerCase()) > -1 ||
        alumno.status.toLowerCase().indexOf(sA.toLowerCase()) > -1 ||
        alumno.status.toLowerCase().indexOf(sM.toLowerCase()) > -1);
    });
  }

  filterItemsCarreer(carreer) {
    return this.alumnos.filter(function (alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1;
    });
  }

  filterItemsVerified(carreer, status) {
    return this.alumnos.filter(function (alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1 &&
        alumno.status.toLowerCase().indexOf(status.toLowerCase()) > -1;
    });
  }

  filterCountItemsStatus(status) {
    return this.alumnos.filter(function (alumno) {
      return alumno.documentationStatus.toLowerCase().indexOf(status.toLowerCase()) > -1;
    });
  }

  filterCountItemsVerified() {
    return this.alumnos.filter(function (alumno) {
      return alumno.status.toLowerCase().indexOf(('Verificado').toLocaleLowerCase()) > -1 || alumno.status.toLowerCase().indexOf(('Asistió').toLocaleLowerCase()) > -1 || alumno.status.toLowerCase().indexOf(('Mencionado').toLocaleLowerCase()) > -1;
    });
  }

  // Generar reporte de alumnos
  generateReport() {
    var doc = new jsPDF('l', 'pt');

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 5, 110, 27); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 120, 2, 82, 35); // Logo TecNM

    let header = 'Reporte Alumnos Graduados ' + this.searchCarreer;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text(header, pageWidth / 2, 30, 'center');

    doc.autoTable({
      html: '#tableReport',
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 'wrap' },
        1: { cellWidth: 'wrap' },
        2: { cellWidth: 'wrap' },
        3: { cellWidth: 'wrap' },
        4: { cellWidth: 'wrap' },
        5: { cellWidth: 270 }
      },
      didParseCell: function (data) {
        if (data.row.cells[4].text[0] === 'Registrado') {
          data.cell.styles.fillColor = [71, 178, 218];
          data.cell.styles.textColor = [255, 255, 255];
        }
        if (data.row.cells[4].text[0] === 'Pagado') {
          data.cell.styles.fillColor = [250, 157, 0];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 10;
        }
        if (data.row.cells[4].text[0] === 'Verificado') {
          data.cell.styles.fillColor = [202, 0, 10];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 10;
        }
        if (data.row.cells[4].text[0] === 'Asistió') {
          data.cell.styles.fillColor = [26, 111, 0];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 10;
        }
        if (data.row.cells[4].text[0] === 'Mencionado') {
          data.cell.styles.fillColor = [0, 0, 116];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 10;
        }
        if (data.row.cells[4].text[0] === 'Estatus') {
          data.cell.styles.fillColor = [17, 32, 67];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 10;
        }
      }
    });

    // FOOTER
    var today = new Date();
    var m = today.getMonth() + 1;
    var mes = (m < 10) ? '0' + m : m;
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 15, pageHeight - 47, 30, 30); // Logo SEP
    let footer = '© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n';
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(footer, pageWidth / 2, pageHeight - 12, 'center');

    // Hour PDF
    let hour = today.getDate() + '/' + mes + '/' + today.getFullYear() + ' - ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    doc.setTextColor(100);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(hour, pageWidth - 45, pageHeight - 5, 'center');

    window.open(doc.output('bloburl'), '_blank');
    // doc.save("Reporte Graduacion "+this.searchCarreer+".pdf");
  }

  // Exportar alumnos a excel
  excelExport() {
    this.notificationsServices.showNotification(0, 'Datos Exportados', 'Los datos se exportaron con éxito');
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte Graduación.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
  }

  // Generar papeletas de alumnos verificados
  generateBallotPaper() {
    if (this.alumnosBallotPaper.length !== 0) {
      // Obtener alumnos cuyo estatus sea 'Verificado' && Carrera = al filtro seleccionado
      this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer, '');

      // Dividir total de alumnos verificados en segmentos de 4
      let divAlumnosBallotPaper = [];

      // 4 Alumnos por hoja
      const LONGITUD_PEDAZOS = 4;
      for (let i = 0; i < this.alumnosBallotPaper.length; i += LONGITUD_PEDAZOS) {
        let pedazo = this.alumnosBallotPaper.slice(i, i + LONGITUD_PEDAZOS);
        divAlumnosBallotPaper.push(pedazo);
      }

      var doc = new jsPDF('p', 'mm');

      // Obtener Ancho y Alto de la hoja
      var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      // Dividir Alto de hoja entre 4 para dibujar recta divisora
      var divLine = pageHeight / 4;
      var cont = 1;
      for (var i = 0; i < divAlumnosBallotPaper.length; i++) { // Recorrer cada segmento de alumnos
        for (var j = 0; j < divAlumnosBallotPaper[i].length; j++) { // Recorrer los alumnos del segmento actual
          if (j == 0) {
            doc.addImage(this.logoSep, 'PNG', 5, 2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth - 58, 2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 7.5, divLine - 20, 15, 15); // Logo TecTepic

            // Numero de alumno
            doc.setLineWidth(.3);
            doc.setDrawColor(0);
            doc.setFillColor(20, 43, 88);
            doc.circle(pageWidth - 25, divLine - 20, 10, 'FD');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(30);
            doc.text(cont.toString(), pageWidth - 25, divLine - 16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2, 30, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2, 45, 'center');
            doc.line(0, divLine, pageWidth, divLine);
          }
          if (j == 1) {
            doc.addImage(this.logoSep, 'PNG', 5, (divLine) + 2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth - 58, (divLine) + 2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 7.5, (divLine * 2) - 20, 15, 15); // Logo TecTepic

            // Numero de alumno
            doc.setLineWidth(.3);
            doc.setDrawColor(0);
            doc.setFillColor(20, 43, 88);
            doc.circle(pageWidth - 25, (divLine * 2) - 20, 10, 'FD');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(30);
            doc.text((cont).toString(), pageWidth - 25, (divLine * 2) - 16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2, 104.25, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2, 119.25, 'center');
            doc.line(0, divLine * 2, pageWidth, divLine * 2);
          }
          if (j == 2) {
            doc.addImage(this.logoSep, 'PNG', 5, (divLine * 2) + 2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth - 58, (divLine * 2) + 2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 7.5, (divLine * 3) - 20, 15, 15); // Logo TecTepic

            // Numero de alumno
            doc.setLineWidth(.3);
            doc.setDrawColor(0);
            doc.setFillColor(20, 43, 88);
            doc.circle(pageWidth - 25, (divLine * 3) - 20, 10, 'FD');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(30);
            doc.text((cont).toString(), pageWidth - 25, (divLine * 3) - 16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2, 178.5, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2, 193.5, 'center');
            doc.line(0, divLine * 3, pageWidth, divLine * 3);
          }
          if (j == 3) {
            doc.addImage(this.logoSep, 'PNG', 5, (divLine * 3) + 2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth - 58, (divLine * 3) + 2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 7.5, (divLine * 4) - 20, 15, 15); // Logo TecTepic

            // Numero de alumno
            doc.setLineWidth(.3);
            doc.setDrawColor(0);
            doc.setFillColor(20, 43, 88);
            doc.circle(pageWidth - 25, (divLine * 4) - 20, 10, 'FD');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(30);
            doc.text((cont).toString(), pageWidth - 25, (divLine * 4) - 16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2, 252.75, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2, 267.75, 'center');
          }
        }
        if (i < divAlumnosBallotPaper.length - 1) {
          doc.addPage(); // Agregar una nueva página al documento cuando cambie el segmento de alumnos
        }
      }
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Error', 'No hay alumnos  en estatus Verificado');
    }
  }

  confirmDegree(item) {
    Swal.fire({
      title: 'Asignar Título',
      imageUrl: '../../../assets/imgs/asignarTitulo.png',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Custom image',
      text: item.nameLastName,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Asignar'
    }).then((result) => {
      if (result.value) {
        this.degreeEvent(item);
      }
    });
  }

  confirmRemoveDegree(item) {
    Swal.fire({
      title: 'Remover Título',
      imageUrl: '../../../assets/imgs/removerTitulo.png',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Custom image',
      text: item.nameLastName,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Remover'
    }).then((result) => {
      if (result.value) {
        this.degreeRemoveEvent(item);
      }
    });
  }

  // Asignar titulo
  degreeEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id,{degree: true},this.collection).then(() =>{
      this.eventFilterReport();
      Swal.fire('Título Asignado', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  // Remover titulo
  degreeRemoveEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id,{degree: false},this.collection).then(() =>{
      this.eventFilterReport();
      Swal.fire('Título Removido', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  // Mostar modal para agregar y visualizar observaciones
  observationsModal(item) {
    if (this.role === 'administration') {
      const id = 'observaciones';
      if (item.observations) {
        Swal.fire({
          title: 'Observaciones',
          imageUrl: '../../../assets/imgs/logros.png',
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: 'Custom image',
          html:
            '<textarea rows="4" cols="30" id="observaciones">' + item.observations + '</textarea>  ',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Guardar'
        }).then((result) => {
          if (result.value) {
            const observations = (<HTMLInputElement>document.getElementById(id)).value;
            this.saveObservations(item, observations);
          }
        });
      } else {
        Swal.fire({
          title: 'Observaciones',
          imageUrl: '../../../assets/imgs/logros.png',
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: 'Custom image',
          html:
            '<textarea rows="4" cols="30" id="observaciones"></textarea>  ',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Guardar'
        }).then((result) => {
          if (result.value) {
            const observations = (<HTMLInputElement>document.getElementById(id)).value;
            this.saveObservations(item, observations);
          }
        });
      }
    }
  }

  // Guardar observaciones
  saveObservations(item, newObservations) {
    this.firestoreService.updateFieldGraduate(item.id,{observations: newObservations},this.collection).then(() =>{
      this.eventFilterReport();
      Swal.fire('Observaciones Guardadas', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  pageChanged(ev) {
    this.page = ev;
  }

  pageChanged2(ev) {
    this.page2 = ev;
  }

  eventFilter(item) {
    if (item != '') {
      this.showTotal = false;
      const total = this.getNumberFilterItems(item).length;
      this.totalAlumnosFilter = total;
    } else {
      this.showTotal = true;
    }
  }

  getNumberFilterItems(item) {
    return this.alumnos.filter(function (alumno) {
      return alumno.nc.toLowerCase().indexOf(item.toLowerCase()) > -1 ||
        alumno.name.toLowerCase().indexOf(item.toLowerCase()) > -1 ||
        alumno.email.toLowerCase().indexOf(item.toLowerCase()) > -1;
    });
  }

  confirmBestAverage(item) {
    const id = 'inputAverage';
    Swal.fire({
      title: 'Asignar Mejor Promedio',
      imageUrl: '../../../assets/icons/bestAverage.svg',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Custom image',
      html:
        '<input id="inputAverage"></input>  ',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Asignar'
    }).then((result) => {
      if (result.value) {
        const average = (<HTMLInputElement>document.getElementById(id)).value;
        this.asignBestAverage(item, average);
      }
    });
  }

  asignBestAverage(item, average) {
    this.firestoreService.updateFieldGraduate(item.id,{mejorPromedio: true,promedio: average},this.collection).then(() =>{
      this.eventFilterReport();
      Swal.fire('Promedio Asignado', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  generateReportBestAverage() {
    var doc = new jsPDF('p', 'pt');

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 10, 110, 27); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 120, 6, 82, 35); // Logo TecNM

    let header = 'Reporte Alumnos Mejor Promedio';
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text(header, pageWidth / 2, 50, 'center');

    doc.autoTable({
      html: '#tableReportBestAverageIn',
      theme: 'striped',
      margin: { top: 100 },
      headStyles: { fillColor: [34, 178, 37], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 200 },
        2: { cellWidth: 60, halign: 'center' }
      }
    });

    doc.autoTable({
      html: '#tableReportBestAverageOut',
      theme: 'striped',
      headStyles: { fillColor: [218, 12, 12], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 200 },
        2: { cellWidth: 60, halign: 'center' }
      }
    });

    // FOOTER
    var today = new Date();
    var m = today.getMonth() + 1;
    var mes = (m < 10) ? '0' + m : m;
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 15, pageHeight - 47, 30, 30); // Logo SEP
    let footer = '© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n';
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(footer, pageWidth / 2, pageHeight - 12, 'center');

    // Hour PDF
    let hour = today.getDate() + '/' + mes + '/' + today.getFullYear() + ' - ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    doc.setTextColor(100);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(hour, pageWidth - 45, pageHeight - 5, 'center');

    window.open(doc.output('bloburl'), '_blank');
    // doc.save("Reporte Graduacion "+this.searchCarreer+".pdf");
  }

  // ordenar los alumnos con mejor promedio por la posicion de la carrera
  sortGraduates(graduates: any[]) {
    let graduatesSorted = [];
    for (let i = 0; i < this.careersPosition.length; i++) {
      for (let j = 0; j < graduates.length; j++) {
        if (graduates[j].data.carrera == this.careersPosition[i].carrera) {
          graduatesSorted.push(graduates[j]);
          this.careersPosition.filter((graduate: any) => graduate.carrera !== graduates[j].data.carrera);
          break;
        }
      }
    }

    return graduatesSorted;
  }

  // Confirmar regresar status de mencionado a asistió por alumno
  confirmReturnStatusA(item) {
    Swal.fire({
      title: 'Regresar Estatus a Asistió',
      text: 'Para ' + item.name,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then(async (result) => {
      if (result.value) {
        await this.returnAsistenceEvent(item);
        // this.firestoreService.resetActiveCareer();
      }
    });
  }

  // Confirmar regresar status de mencionado a asistió por carrera
  confirmReturnStatusCarreerA() {
    Swal.fire({
      title: 'Regresar Estatus \n Mencionado → Asistió',
      text: 'Para ' + this.searchCarreer,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.asistenceEventCarreer();

      }
    });
  }

  asistenceEventCarreer() {

    let changeStatus = false;
    this.alumnos.forEach(async student => {
      if (student.carreer === this.searchCarreer) {
        if (student.status === 'Mencionado') {
          changeStatus = true;
          await this.returnAsistenceEvent(student);
        }
      }
    });
    // this.firestoreService.resetActiveCareer();

  }

  returnAsistenceEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id,{estatus: 'Asistió'},this.collection).then(() =>{
      this.eventFilterReport();
    }, (error) => {
      console.log(error);
    });
  }

  // Mostar modal para actualizar email de un alumno
  emailModal(item) {
    console.log(item);
    if (this.role === 'administration') {
      const id = 'newEmailInput';
      if (item.email) {
        Swal.fire({
          title: 'Actualizar Correo',
          imageUrl: '../../../assets/icons/sendEmail.svg',
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: 'Custom image',
          html:
            '<textarea rows="1" cols="30" id="newEmailInput">' + item.email + '</textarea>  ',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Guardar'
        }).then((result) => {
          if (result.value) {
            const correoNuevo = (<HTMLInputElement>document.getElementById(id)).value;
            this.saveEmail(item, correoNuevo);
          }
        });
      } else {
        Swal.fire({
          title: 'Actualizar Correo',
          imageUrl: '../../../assets/icons/sendEmail.svg',
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: 'Custom image',
          html:
            '<textarea rows="1" cols="30" id="newEmailInput"></textarea>  ',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Guardar'
        }).then((result) => {
          if (result.value) {
            const correoNuevo = (<HTMLInputElement>document.getElementById(id)).value;
            this.saveEmail(item, correoNuevo);
          }
        });
      }
    }
  }

  saveEmail(item, newEmail) {
    this.firestoreService.updateFieldGraduate(item.id,{correo: newEmail},this.collection).then(() =>{
      this.eventFilterReport();
      Swal.fire('Correo Actualizado', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  // Confirmar regresar status de asistió a verificado por alumno
  confirmReturnStatusV(item) {
    Swal.fire({
      title: 'Regresar Estatus a Verificado',
      text: 'Para ' + item.name,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then(async (result) => {
      if (result.value) {
        await this.returnVerifiedEvent(item);
      }
    });
  }

  returnVerifiedEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id,{estatus: 'Verificado'},this.collection).then(() =>{
      this.eventFilterReport();
    }, (error) => {
      console.log(error);
    });
  }

  // Confirmar regresar status de asistió a verificado por carrera
  confirmReturnStatusCarreerV() {
    Swal.fire({
      title: 'Regresar Estatus \n Asistió → Verificado',
      text: 'Para ' + this.searchCarreer,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.verifiedEventCarreer();
      }
    });
  }

  verifiedEventCarreer() {
    this.alumnos.forEach(async student => {
      if (student.carreer === this.searchCarreer) {
        if (student.status === 'Asistió') {
          await this.returnVerifiedEvent(student);
        }
      }
    });
  }

  getSurvey() {
    window.setTimeout('functionName()', 10000);
    const cant = (<HTMLTableElement>document.getElementById('tableReport')).rows.length - 1;
    this.totalAlumnos = cant;
  }

  // Confirmar cambiar todos los verificados a asistió
  confirmAllAsistence() {
    Swal.fire({
      title: 'Cambiar Estatus \n Verificado → Asistió',
      text: 'Para Todos Los Alumnos',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.registerAllAsistence();
      }
    });
  }

  registerAllAsistence() {
    const alumnosVerificados = [];
    this.alumnos.forEach(async student => {
      if (student.status === 'Verificado') {
        alumnosVerificados.push(student.id);
        this.firestoreService.updateFieldGraduate(student.id, { estatus: 'Asistió' }, this.collection);
      }
    });
    console.log(alumnosVerificados);
  }

  changeStatusDocumentation(student,status){
    //console.log(student);
    switch (status){
      case "Fotos y Recibo":
        this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:status}, this.collection);        
        
        this.sendNotification('Fotos y Recibo', 'Tus fotos han sido recibidas',student.nc);
        
        break;
      case "Impreso":
        this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:status}, this.collection);

        // this.sendNotification('Certificado', 'Tus certificado ha sido impreso',student.nc);
        break;
      case "Listo":
        this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:status}, this.collection);

        this.sendNotification('Certificado', 'Tu certificado ya está listo',student.nc);
        break;
      case "Entregado":
        this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:status}, this.collection);

        this.sendNotification('Certificado', 'Tu certificado fue entregado',student.nc);
        break;
      case "Regresar":
        switch (student.documentationStatus){
          case "Fotos y Recibo":
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:' '}, this.collection);

            // this.sendNotification('Fotos y Recibo', 'Tus fotos han sido recibidas',student.nc);
            break;
          case "Impreso":
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:'Fotos y Recibo'}, this.collection);

            // this.sendNotification('Fotos y Recibo', 'Tus fotos han sido recibidas',student.nc);
            break;
          case "Listo":
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:'Impreso'}, this.collection);

            // this.sendNotification('Fotos y Recibo', 'Tus fotos han sido recibidas',student.nc);
            break;
          case "Entregado":
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus:'Listo'}, this.collection);

            // this.sendNotification('Fotos y Recibo', 'Tus fotos han sido recibidas',student.nc);
            break;
        }
    }
  }

  generateConstancy(student){
    this.loading = true;
    let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    var doc = new jsPDF();
    
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    
    //Nombre
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(18);
    doc.text(student.name, pageWidth / 2, 120, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(14);
    doc.text("Por haber concluído íntegramente la especialidad de:", pageWidth / 2, 140, 'center');
    
    //Especialidad
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(16);
    doc.text(student.specialty, pageWidth / 2, 160, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(14);
    doc.text("En la carrera de: ", pageWidth / 2, 180, 'center');

    //Carrera
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(16);
    doc.text(student.carreerComplete, pageWidth / 2, 200, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(13);
    doc.text("Tepic, Nayarit., "+new Date(this.dateGraduation.seconds*1000).toLocaleDateString("es-MX", dateOptions), pageWidth / 2, 220, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(16);
    doc.text("LIC. MANUEL ANGEL URIBE VÁZQUEZ", pageWidth / 2, 240, 'center');
    doc.text("DIRECTOR", pageWidth / 2, 247, 'center');

    doc.addImage(this.firmaDirector, 'jpg', (pageWidth / 2)-50, 197, 100, 53.75);
    this.loading = false;
    window.open(doc.output('bloburl'), '_blank');
  }

  generateConstancys(){
    if (this.alumnosConstancia.length !== 0) {
      this.loading = true;
      var doc = new jsPDF();
      let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
      doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

      var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
      
      for(var i = 0; i < this.alumnosConstancia.length; i++){
        //Nombre
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(18);
        doc.text(this.alumnosConstancia[i].name, pageWidth / 2, 120, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text("Por haber concluído íntegramente la especialidad de:", pageWidth / 2, 140, 'center');
        
        //Especialidad
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstancia[i].specialty, pageWidth / 2, 160, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text("En la carrera de: ", pageWidth / 2, 180, 'center');

        //Carrera
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstancia[i].carreerComplete, pageWidth / 2, 200, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Tepic, Nayarit., "+new Date(this.dateGraduation.seconds*1000).toLocaleDateString("es-MX", dateOptions), pageWidth / 2, 220, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text("LIC. MANUEL ANGEL URIBE VÁZQUEZ", pageWidth / 2, 240, 'center');
        doc.text("DIRECTOR", pageWidth / 2, 247, 'center');
        doc.addImage(this.firmaDirector, 'jpg', (pageWidth / 2)-50, 197, 100, 53.75);


        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(9);
        doc.text((i+1)+'',10,pageHeight-10, 'center');
        if (i < this.alumnosConstancia.length - 1) {
          doc.addPage();
        }
      }
      this.loading = false;
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  addTicket(item){
    if(this.boletosRestantes > 0){
      this.firestoreService.updateFieldGraduate(item.id, { numInvitados:(item.numInvitados+1),invitados: firebase.firestore.FieldValue.arrayUnion({['invitado'+(item.numInvitados+1)]:'verificado'})},this.collection);
    } else{
      this.notificationsServices.showNotification(2, 'Atención', 'Se Terminaron los Boletos.');
    }
  }

  delTicket(item){
    if(item.numInvitados == 0){
      this.notificationsServices.showNotification(2, 'Atención', 'El número de boletos no debe ser menor a 0.');
    } else {
      const invitados = item.invitados;
      invitados.pop();
      this.firestoreService.updateFieldGraduate(item.id, { numInvitados:(item.numInvitados-1),invitados},this.collection);
    }
  }

  assignTicketsStudent(){
    console.log(this.boletosXAlumno);
  }

  sendNotification(title: string, body: string, nc: string){
    const subTok = this.firestoreService.getStudentToken(nc).subscribe(
      (token)=>{
        subTok.unsubscribe();
        // console.log(token);
        
        const infoToken = token[0];
        const notification = {
          "titulo":title,
          "descripcion": body,
          "fecha": new Date()
        };
        
        if(infoToken){
          // student device exist              
          if(infoToken.token){
            // student has token device 
            // send notification        
            console.log(infoToken.token);
                                    
            this.firestoreService.sendNotification(infoToken.id,notification).then(
              (sended)=>{
                this.studentProv.sendNotification({title,body,token:infoToken.token, screen:'graduation'}).subscribe(
                  (send)=>{
                    console.log(send, 'Enviado');
                    this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Notificación enviada','');
                  }
                );
              }
            );
          }else{
            // only save notification in firebase                
            this.firestoreService.sendNotification(infoToken.id,notification).then(
              (sended)=>{
                console.log('Enviado');
                
              }
            );
          }
          this.firestoreService.updateDeviceStudent(infoToken.id,{pendientes:(infoToken.pendientes+1)}).then(
            (updated)=>{}
          );
        }else{
          // create register for notifications
          //only save notification in firebase
          this.firestoreService.createDeviceToken(nc).then(
            (created)=>{
              const subST = this.firestoreService.getStudentToken(nc).subscribe(
                (token)=>{
                  subST.unsubscribe();                      
                  this.firestoreService.sendNotification(infoToken.id,notification).then(
                    (sended)=>{
                      console.log('Enviado');
                      this.firestoreService.updateDeviceStudent(infoToken.id,{pendientes:(infoToken.pendientes+1)}).then(
                        (updated)=>{}
                      );
                    }
                  );                  
                }
              );
            }
          );
        }
      }
    );
  }

  // Generar Pestañas
generateLabels() {
  if (this.alumnosConstancia.length !== 0) {
    this.loading = true;
    const doc = new jsPDF('l', 'mm', [33.84, 479.4]);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    
    for(var i = 0; i < this.alumnosConstancia.length; i++){
      var titulo = '';
      doc.setFontSize(10);
      doc.setFontType('bold');
      //Identificador
      doc.text((i+1)+'',2.5,(pageHeight/2)+1.5);
      doc.setFontSize(9.5);
      doc.setFontType('bold');

      //Titulo
      if(this.alumnosConstancia[i].degree == true){
        switch(this.alumnosConstancia[i].carreerComplete){
          case "ARQUITECTURA":
            titulo = 'ARQ.'
            break;
          case "INGENIERÍA CIVIL":
            titulo = 'ING.'
            break;
          case "INGENIERÍA BIOQUÍMICA":
            titulo = 'ING.'
            break;
          case "INGENIERÍA EN GESTIÓN EMPRESARIAL":
            titulo = 'ING.'
            break;
          case "INGENIERÍA QUÍMICA":
            titulo = 'ING.'
            break;
          case "INGENIERÍA MECATRÓNICA":
            titulo = 'ING.'
            break;
          case "INGENIERÍA ELÉCTRICA":
            titulo = 'ING.'
            break;
          case "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES":
            titulo = 'ING.'
            break;
          case "INGENIERÍA EN SISTEMAS COMPUTACIONALES":
            titulo = 'ING.'
            break;
          case "INGENIERÍA INDUSTRIAL":
            titulo = 'ING.'
            break;
          case "LICENCIATURA EN ADMINISTRACIÓN":
            titulo = 'LIC.'
            break;
          case "MAESTRÍA EN CIENCIAS DE LOS ALIMENTOS":
            titulo = 'MCA.'
            break;
          case "DOCTORADO EN CIENCIAS DE LOS ALIMENTOS":
            titulo = 'DCA.'
            break;
          default:
            titulo = ''
            break; 
          }
          doc.text(titulo,23,(pageHeight/2)+1.5);
      }

      //Nombre
      doc.text(this.alumnosConstancia[i].name,35,(pageHeight/2)+1.5);

      //Carrera
      doc.text(this.alumnosConstancia[i].carreer,150,(pageHeight/2)+1.5);

      doc.setFontSize(10);
      doc.setFontType('bold');
      
      if (i < this.alumnosConstancia.length - 1) {
        doc.addPage();
      }
    }
    this.loading = false;
    window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

}