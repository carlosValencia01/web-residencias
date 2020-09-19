import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';
import * as crypto from "crypto-js";
import * as firebase from 'firebase/app';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eQR } from 'src/app/enumerators/graduation/e-qr.enum';
import { GraduationProvider } from 'src/app/providers/graduation/graduation.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ICareer } from 'src/app/entities/app/career.model';
import { CareerProvider } from 'src/app/providers/shared/career.prov';
import { MatDialog } from '@angular/material';
import { ReviewPhotosPaydocModalComponent } from '../review-photos-paydoc-modal/review-photos-paydoc-modal.component';
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-list-graduates-page',
  templateUrl: './list-graduates-page.component.html',
  styleUrls: ['./list-graduates-page.component.scss']
})
export class ListGraduatesPageComponent implements OnInit {
  

  public showTotal = true;

  public totalEgresados;
  public totalEgresadosH;
  public totalEgresadosM;
  public certificadosPendientes;
  public certificadosImpresos;
  public certificadosListos;
  public certificadosEntregados;
  public certificadosNoSolicitados;
  public certificadosSolicitados;
  public certificadosConLineaAsignada;
  public certificadosEnviados;

  public totalVerificados;
  public boletosTotales;
  public boletosRestantes = 0;
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
  public alumnosConstanciaRegistrados = [];
  public alumnosConstanciaVerificados = [];
  bestStudents = [];

  public role: string;
  public no = 0;

  collection = null;
  public status = 0;

  studentsBestAverage = [];
  studentIn = [];
  studentOut = [];
  careersPosition = [];

  // Font Montserrat
  montserratNormal: any;
  montserratBold: any;

  dateGraduation;

  // Bucar boletos alumno
  public findStudentTickets = '';
  studentsTickets;
  guests = [];
  phoneStudent = null;

  displayedColumns: string[] = ['nc', 'name', 'carreer', 'numInvitados','status','actions'];
  dataSource: MatTableDataSource<any>;
  displayedColumnsDoc: string[] = ['nc', 'name', 'carreer','avance','status','actions'];
  dataSourceDoc: MatTableDataSource<any>;
  
  @ViewChild('paginator1') set paginator(paginator: MatPaginator){
    this.dataSource.paginator = paginator;    
  };
  @ViewChild(MatSort) set sort(sort: MatSort){
    this.dataSource.sort = sort;
    this.dataSourceDoc.sort = sort;  
  };
  @ViewChild('paginator2') set paginator2(paginator: MatPaginator){    
    this.dataSourceDoc.paginator = paginator;
  };

  careers: Array<ICareer>;
  filters = { //variable para controlar los filtros que estan activos del evento
    career:{
      status:false,
      value:''
    },
    checkR: false,
    checkV: false,
    checkA: false,
    checkM: false,    
    survey:{
      answered:false,      
      all:true      
    },    
    textSearch:{
      status:false,
      value:''
    }
  };
  filteredCareer: string;
  filtersDoc = { //variable para controlar los filtros que estan activos del evento
    career:{
      status:false,
      value:''
    },   
    status:{
      value:'',
      all:true      
    },    
    textSearch:{
      status:false,
      value:''
    }
  };
  filteredCareerDoc: string;
  doPdfReport = false;
  doExcelReport = false;
  doBestAvgReport = false;
  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv: GraduationProvider,
    private cookiesService: CookiesService,
    private router: Router,
    private imageToBase64Serv: ImageToBase64Service,
    private studentProv: StudentProvider,
    private loadingService: LoadingService,
    private careerProv: CareerProvider,
    public dialog: MatDialog,
  ) {
    this.getFonts();
    const rol = this.cookiesService.getData().user.role;
    if (rol !== 0 && rol !== 1 && rol !== 5 && rol !== 6 &&
      rol !== 9 && rol !== 20) {
      this.router.navigate(['/']);
    }
    this.init();
    
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
      case 20:
        this.role = 'asistenciaInvitados';
        break;
    }
    this.getCareers();
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
    this.imageToBase64Serv.getBase64('assets/imgs/firms/director.png').then(res4 => {
      this.firmaDirector = res4;
    });
  }
  init(){
    this.dataSource = new MatTableDataSource();
    this.dataSourceDoc = new MatTableDataSource();
    this.collection = this.router.url.split('/')[3];
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
          },
          err => console.log(err)
        );
      },
      err => {
        console.log(err, 'error');
      }
    );
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
    this.firestoreService.getGraduates(this.collection).subscribe((alumnosSnapshot) => {
      this.alumnos = alumnosSnapshot.reduce((prev, alumno) => {
        if(alumno.payload.doc.get('nc')){
          prev.push({
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
            genero: alumno.payload.doc.get('genero'),
            curp: alumno.payload.doc.get('curp'),
            bestAverage: alumno.payload.doc.get('mejorPromedio') ? alumno.payload.doc.get('mejorPromedio') : false,
            average: alumno.payload.doc.get('promedio') ? alumno.payload.doc.get('promedio') : 0,
            documentationStatus: alumno.payload.doc.get('documentationStatus') ? alumno.payload.doc.get('documentationStatus') : ' ',
            specialty: alumno.payload.doc.get('especialidad') ? alumno.payload.doc.get('especialidad') : '<<Especialidad>>',
            numInvitados: alumno.payload.doc.get('numInvitados') ? alumno.payload.doc.get('numInvitados') : 0,
            invitados: alumno.payload.doc.get('invitados') ? alumno.payload.doc.get('invitados') : [{}],
            nss: alumno.payload.doc.get('nss') ? alumno.payload.doc.get('nss') : '',
            comprobantePago: alumno.payload.doc.get('comprobantePago'),
            correoCertificado: alumno.payload.doc.get('correoCertificado'),
            entregaFotos: alumno.payload.doc.get('entregaFotos'),
            
  
          })       
        }
        return prev;
      },[]);
      // Ordenar Alumnos por Apellidos
      this.alumnos.sort(function (a, b) {
        return a.nameLastName.localeCompare(b.nameLastName);
      });
      this.getTicketsRegistered();

      this.alumnosReport = this.alumnos;
      this.dataSource = new MatTableDataSource(this.alumnosReport);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;       
      this.applyFilters();
      this.totalAlumnos = this.alumnosReport.length;      
      this.alumnosReportDocumentation = this.alumnos;
      this.dataSourceDoc = new MatTableDataSource(this.alumnosReportDocumentation);
      this.dataSourceDoc.paginator = this.paginator2;
      this.dataSourceDoc.sort = this.sort;
      this.applyFiltersDoc();
      // Contar total de alumnos
      this.totalEgresados = this.alumnos.length;
      this.totalEgresadosH = this.alumnos.filter(st => st.genero === 'M').length;
      this.totalEgresadosM = this.alumnos.filter(st => st.genero === 'F').length;
      this.certificadosImpresos = this.filterCountItemsStatus('impreso').length;
      this.certificadosListos = this.filterCountItemsStatus('listo').length;
      this.certificadosEntregados = this.filterCountItemsStatus('entregado').length;
      this.certificadosPendientes = this.filterCountItemsStatus('pendiente').length;
      this.certificadosConLineaAsignada = this.filterCountItemsStatus('linea asignada').length;
      this.certificadosEnviados = this.filterCountItemsStatus('enviado').length;
      this.certificadosSolicitados = this.filterCountItemsStatus('solicitado').length;
      this.certificadosNoSolicitados = this.filterCountItemsStatus('no solicitado').length;

      this.totalVerificados = this.filterCountItemsVerified().length;
      this.boletosRestantes = (this.boletosTotales - this.boletosRegistrados);
    });
  }

  getTicketsRegistered() {
    this.boletosRegistrados = 0;
    for (let i = 0 ; i < this.alumnos.length; i++) {
      this.boletosRegistrados = (this.boletosRegistrados + this.alumnos[i].numInvitados);
    }
  }

  // Cambias estatus a Registrado
  removePaidEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id, {estatus: 'Registrado'}, this.collection).then(() => {
      
      this.notificationsServices.showNotification(0, 'Pago removido para:', item.nc);
    });
  }

  // Cambias estatus a Asistió
  asistenceEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id, {estatus: 'Asistió'}, this.collection).then(() => {
      
      this.notificationsServices.showNotification(0, 'Asistencia registrada para:', item.nc);
    });
  }

  // Cambias estatus a Verificado
  verifyEvent(item) {
    const invitados = [];
    for (let i = 0; i < this.boletosXAlumno; i++) {
      invitados.push({['invitado' + (i + 1)]: 'verificado'});
    }
    this.firestoreService
      .updateFieldGraduate(item.id, {estatus: 'Verificado', numInvitados: this.boletosXAlumno, invitados}, this.collection)
      .then(() => {
        
        this.notificationsServices.showNotification(0, 'Verificación registrada para:', item.nc);
      });
  }

  // Enviar encuesta al verificar alumno desde la web
  sendSurveyGraduate(item) {
    this.graduationProv.sendSurvey(item.email, item.id, item.name, item.nc, item.carreerComplete).subscribe(
      _ => {
        this.notificationsServices.showNotification(0, 'Encuesta enviada a:', item.nc);
      },
      _ => {
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

  eventFilterReportDocumentation() {
    this.alumnosConstancia = this.filterItemsVerified(this.filteredCareerDoc, '');
    this.alumnosConstanciaRegistrados = this.filterItemsVerified(this.filteredCareerDoc, 'Registrado');
    this.alumnosConstanciaVerificados = this.filterItemsVerifiedForward(this.filteredCareerDoc);
  }

  filterItemsVerified(carreer, status) {
    return this.alumnos.filter(function (alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer) > -1 &&
        alumno.status.toLowerCase().indexOf(status.toLowerCase()) > -1;
    });
  }

  filterItemsVerifiedForward(carreer) {
    return this.alumnos.filter(function (alumno) {
      return (alumno.carreer.toLowerCase().indexOf(carreer) > -1
        && alumno.status.toLowerCase().indexOf('Verificado'.toLowerCase()) > -1)
        || (alumno.carreer.toLowerCase().indexOf(carreer) > -1
         && alumno.status.toLowerCase().indexOf('Asistió'.toLowerCase()) > -1)
        || (alumno.carreer.toLowerCase().indexOf(carreer) > -1
        && alumno.status.toLowerCase().indexOf('Mencionado'.toLowerCase()) > -1);
    });
  }

  filterCountItemsStatus(status: string) {
    return this.alumnos.filter(function (alumno) {
      return alumno.documentationStatus.toLowerCase().indexOf(status) > -1;
    });
  }

  filterCountItemsVerified() {
    return this.alumnos.filter(function (alumno) {
      return alumno.status.toLowerCase()
        .indexOf(('Verificado').toLocaleLowerCase()) > -1
          || alumno.status.toLowerCase().indexOf(('Asistió').toLocaleLowerCase()) > -1
          || alumno.status.toLowerCase().indexOf(('Mencionado').toLocaleLowerCase()) > -1;
    });
  }

  // Generar reporte de alumnos
  async generateReport() {
    this.doPdfReport = true;
    this.loadingService.setLoading(true);
    var doc = new jsPDF('l', 'pt');

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 5, 110, 27); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 120, 2, 82, 35); // Logo TecNM

    let header = 'Reporte Alumnos Graduados ' + this.filteredCareer;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text(header, pageWidth / 2, 30, 'center');
    await this.delay(500);
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
    let hour = today.getDate() + '/' + mes + '/' + today.getFullYear()
      + ' - ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    doc.setTextColor(100);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(hour, pageWidth - 45, pageHeight - 5, 'center');
    this.doPdfReport = false;
    window.open(doc.output('bloburl'), '_blank');
    this.loadingService.setLoading(false);
    // doc.save("Reporte Graduacion "+this.filteredCareer+".pdf");
  }

  // Exportar alumnos a excel
  async excelExport() {
    this.doExcelReport = true;
    this.loadingService.setLoading(true);
    await this.delay(1000);
    this.loadingService.setLoading(false);
    this.notificationsServices.showNotification(0, 'Datos Exportados', 'Los datos se exportaron con éxito');
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte Graduación.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    await this.delay(200);
    this.doExcelReport = false;
  }

  // Generar papeletas de alumnos verificados
  generateBallotPaper() {
    if (this.alumnosBallotPaper.length !== 0) {
      // Obtener alumnos cuyo estatus sea 'Verificado' && Carrera = al filtro seleccionado
      this.alumnosBallotPaper = this.filterItemsVerified(this.filteredCareer, 'Verificado');

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
      for (let i = 0; i < divAlumnosBallotPaper.length; i++) { // Recorrer cada segmento de alumnos
        for (let j = 0; j < divAlumnosBallotPaper[i].length; j++) { // Recorrer los alumnos del segmento actual
          if (j === 0) {
            doc.addImage(this.logoSep, 'PNG', 5, 2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth - 58, 2, 52, 14); // Logo TecNM
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
          if (j === 1) {
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
          if (j === 2) {
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
          if (j === 3) {
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
      this.notificationsServices
        .showNotification(2, 'Atención', 'No hay alumnos en estatus Verificado de la carrera ' + this.filteredCareer.toLocaleUpperCase());
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
    this.firestoreService.updateFieldGraduate(item.id, {degree: true}, this.collection).then(() => {
      
      Swal.fire('Título Asignado', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  // Remover titulo
  degreeRemoveEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id, {degree: false}, this.collection).then(() => {
      
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
    this.firestoreService.updateFieldGraduate(item.id, {observations: newObservations}, this.collection).then(() => {
      
      Swal.fire('Observaciones Guardadas', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
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
    this.firestoreService.updateFieldGraduate(item.id, {mejorPromedio: true, promedio: average}, this.collection).then(() => {
      
      Swal.fire('Promedio Asignado', 'Para: ' + item.nameLastName, 'success');
    }, (error) => {
      console.log(error);
    });
  }

  async generateReportBestAverage() {
    this.doBestAvgReport = true;
    this.loadingService.setLoading(true);
    await this.getBestAvgs();

    var doc = new jsPDF('p', 'pt');

    // Header
    // var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 10, 110, 27); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 120, 6, 82, 35); // Logo TecNM

    let header = 'Reporte Alumnos Mejor Promedio';
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text(header, pageWidth / 2, 50, 'center');
    await this.delay(1000);
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
    setTimeout(() => {
      doc.autoTable({
        html: '#tableReportBestAverage',
        theme: 'striped',
        headStyles: { fillColor: [24, 57, 105], halign: 'center' },
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
      let hour = today.getDate() + '/' + mes + '/' + today.getFullYear()
        + ' - ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      doc.setTextColor(100);
      doc.setFontStyle('bold');
      doc.setFontSize(7);
      doc.text(hour, pageWidth - 45, pageHeight - 5, 'center');
      this.loadingService.setLoading(false);
      this.doBestAvgReport = false;
      window.open(doc.output('bloburl'), '_blank');
    }, 500);
    // doc.save("Reporte Graduacion "+this.filteredCareer+".pdf");
  }

  // ordenar los alumnos con mejor promedio por la posicion de la carrera
  sortGraduates(graduates: any[]) {
    let graduatesSorted = [];
    for (let i = 0; i < this.careersPosition.length; i++) {
      for (let j = 0; j < graduates.length; j++) {
        if (graduates[j].data.carrera === this.careersPosition[i].carrera) {
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
      text: 'Para ' + this.filteredCareer.toUpperCase(),
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
      if (student.carreer.toLowerCase() === this.filteredCareer) {
        if (student.status === 'Mencionado') {
          changeStatus = true;
          await this.returnAsistenceEvent(student);
        }
      }
    });
  }

  returnAsistenceEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id, {estatus: 'Asistió'}, this.collection).then(() => {
      
    }, (error) => {
      console.log(error);
    });
  }

  // Mostar modal para actualizar email de un alumno
  emailModal(item) {
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
    this.firestoreService.updateFieldGraduate(item.id, {correo: newEmail}, this.collection).then(() => {
      
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
  // Confirmar regresar status de asistió a registrado por alumno
  confirmReturnStatusR(item) {
    Swal.fire({
      title: 'Regresar Estatus a Registrado',
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
        await this.returnRegisterEvent(item);
      }
    });
  }

  returnVerifiedEvent(item) {
    this.firestoreService.updateFieldGraduate(item.id, {estatus: 'Verificado'}, this.collection).then(() => {
      
    }, (error) => {
      console.log(error);
    });
  }
  returnRegisterEvent(item) {
    this.firestoreService
      .updateFieldGraduate(item.id, {estatus: 'Registrado', invitados: [], numInvitados: 0}, this.collection).then(() => {
      
    }, (error) => {
      console.log(error);
    });
  }

  // Confirmar regresar status de asistió a verificado por carrera
  confirmReturnStatusCarreerV() {
    Swal.fire({
      title: 'Regresar Estatus \n Asistió → Verificado',
      text: 'Para ' + this.filteredCareer.toUpperCase(),
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
      if (student.carreer.toLowerCase() === this.filteredCareer) {
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
  }

  changeStatusDocumentation(student, status) {
    switch (status) {

      case 'ENVIADO':
        this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: status }, this.collection);
        this.sendNotification('Certificado', 'Tu certificado fue enviado a tu correo', student.nc);
        break;
      case 'ENTREGADO':
        this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: status }, this.collection);
        this.sendNotification('Certificado', 'Tu certificado fue entregado', student.nc);
        break;
      case 'Regresar':{

        switch (student.documentationStatus) {
          case 'LINEA ASIGNADA':
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: 'SOLICITADO' }, this.collection);
            break;
          case 'PENDIENTE':
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: 'LINEA ASIGNADA' }, this.collection);
            break;
          case 'IMPRESO':
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: 'PENDIENTE' }, this.collection);

            break;
          case 'LISTO':
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: 'IMPRESO' }, this.collection);

            break;
          case 'ENVIADO':
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: 'LISTO' }, this.collection);

            break;         
          case 'ENTREGADO':
            this.firestoreService.updateFieldGraduate(student.id, { documentationStatus: 'ENVIADO' }, this.collection);

            break;         
        }
        break;
      }
      default: {
          this.firestoreService.updateFieldGraduate(student.id, {documentationStatus: status}, this.collection);
          break;
      }
    }
  }

  generateConstancy(student) {
    this.loadingService.setLoading(true);
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
    const MARGIN_LEFT = 20;
    const MARGIN_RIGHT = 20;

    // Nombre
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(18);
    doc.text(student.name, pageWidth / 2, 140, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(14);
    doc.text('Por haber concluído íntegramente la especialidad de:', pageWidth / 2, 160, 'center');

    // Especialidad
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(16);
    doc.text(student.specialty, pageWidth / 2, 180, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(14);
    doc.text('En la carrera de: ', pageWidth / 2, 200, 'center');

    // Carrera
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(16);
    doc.text(student.carreerComplete, pageWidth / 2, 220, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(13);
    doc.text('Tepic, Nayarit., ' + new Date(this.dateGraduation.seconds * 1000).toLocaleDateString('es-MX', dateOptions),
      pageWidth / 2, 240, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(16);
    doc.text('LIC. MANUEL ANGEL URIBE VÁZQUEZ', pageWidth / 2, 260, 'center');
    doc.text('DIRECTOR', pageWidth / 2, 267, 'center');

    doc.addImage(this.firmaDirector, 'jpg', (pageWidth / 2) - 50, 217, 100, 53.75);
    this.loadingService.setLoading(false);
    window.open(doc.output('bloburl'), '_blank');
  }

  generateAllConstancys() {
    if (this.alumnosConstancia.length !== 0) {
      this.loadingService.setLoading(true);
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
      const MARGIN_LEFT = 20;
      const MARGIN_RIGHT = 20;

      for (var i = 0; i < this.alumnosConstancia.length; i++) {
        // Nombre
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(18);
        doc.text(this.alumnosConstancia[i].name, pageWidth / 2, 140, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text('Por haber concluído íntegramente la especialidad de:', pageWidth / 2, 160, 'center');

        // Especialidad
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstancia[i].specialty, pageWidth / 2, 180, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text('En la carrera de: ', pageWidth / 2, 200, 'center');

        // Carrera
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstancia[i].carreerComplete, pageWidth / 2, 220, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text('Tepic, Nayarit., ' + new Date(this.dateGraduation.seconds * 1000).toLocaleDateString('es-MX', dateOptions),
          pageWidth / 2, 240, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text('LIC. MANUEL ANGEL URIBE VÁZQUEZ', pageWidth / 2, 260, 'center');
        doc.text('DIRECTOR', pageWidth / 2, 267, 'center');
        doc.addImage(this.firmaDirector, 'jpg', (pageWidth / 2) - 50, 217, 100, 53.75);


        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(9);
        // doc.text((i + 1) + '', 10, pageHeight - 10, 'center');
        if (i < this.alumnosConstancia.length - 1) {
          doc.addPage();
        }
      }
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  generateRegisteredConstancys() {
    if (this.alumnosConstanciaRegistrados.length !== 0) {
      this.loadingService.setLoading(true);
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
      const MARGIN_LEFT = 20;
      const MARGIN_RIGHT = 20;

      for (var i = 0; i < this.alumnosConstanciaRegistrados.length; i++) {
        // Nombre
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(18);
        doc.text(this.alumnosConstanciaRegistrados[i].name, pageWidth / 2, 140, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text('Por haber concluído íntegramente la especialidad de:', pageWidth / 2, 160, 'center');

        // Especialidad
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstanciaRegistrados[i].specialty, pageWidth / 2, 180, { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text('En la carrera de: ', pageWidth / 2, 200, 'center');

        // Carrera
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstanciaRegistrados[i].carreerComplete, pageWidth / 2, 220,  { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text('Tepic, Nayarit., ' + new Date(this.dateGraduation.seconds * 1000).toLocaleDateString('es-MX', dateOptions),
          pageWidth / 2, 240, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text('LIC. MANUEL ANGEL URIBE VÁZQUEZ', pageWidth / 2, 260, 'center');
        doc.text('DIRECTOR', pageWidth / 2, 267, 'center');
        doc.addImage(this.firmaDirector, 'jpg', (pageWidth / 2) - 50, 217, 100, 53.75);


        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(9);
        // doc.text((i + 1) + '', 10, pageHeight - 10, 'center');
        if (i < this.alumnosConstanciaRegistrados.length - 1) {
          doc.addPage();
        }
      }
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  generateVerifiedConstancys() {
    if (this.alumnosConstanciaVerificados.length !== 0) {
      this.loadingService.setLoading(true);
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
      const MARGIN_LEFT = 20;
      const MARGIN_RIGHT = 20;

      for (var i = 0; i < this.alumnosConstanciaVerificados.length; i++) {
        // Nombre
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(18);
        doc.text(this.alumnosConstanciaVerificados[i].name, pageWidth / 2, 140,{ align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text('Por haber concluído íntegramente la especialidad de:', pageWidth / 2, 160, 'center');

        // Especialidad
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstanciaVerificados[i].specialty, pageWidth / 2, 180,{ align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(14);
        doc.text('En la carrera de: ', pageWidth / 2, 200, 'center');

        // Carrera
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text(this.alumnosConstanciaVerificados[i].carreerComplete, pageWidth / 2, 220,  { align: 'center', maxWidth: (pageWidth - (MARGIN_LEFT + MARGIN_RIGHT)) });

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text('Tepic, Nayarit., ' + new Date(this.dateGraduation.seconds * 1000).toLocaleDateString('es-MX', dateOptions),
          pageWidth / 2, 240, 'center');

        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(16);
        doc.text('LIC. MANUEL ANGEL URIBE VÁZQUEZ', pageWidth / 2, 260, 'center');
        doc.text('DIRECTOR', pageWidth / 2, 267, 'center');
        doc.addImage(this.firmaDirector, 'jpg', (pageWidth / 2) - 50, 217, 100, 53.75);


        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(9);
        doc.text((i + 1) + '', 5, pageHeight - 5, 'center');
        if (i < this.alumnosConstanciaVerificados.length - 1) {
          doc.addPage();
        }
      }
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  addTicket(item) {
    if (this.boletosRestantes > 0) {
      this.firestoreService.updateFieldGraduate(item.id, { numInvitados: (item.numInvitados + 1),
        invitados: firebase.firestore.FieldValue.arrayUnion({ ['invitado' + (item.numInvitados + 1)]: 'verificado' }) }, this.collection);
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'Se Terminaron los Boletos.');
    }
  }

  delTicket(item) {
    if (item.numInvitados === 0) {
      this.notificationsServices.showNotification(2, 'Atención', 'El número de boletos no debe ser menor a 0.');
    } else {
      const invitados = item.invitados;
      invitados.pop();
      this.firestoreService.updateFieldGraduate(item.id, {numInvitados: (item.numInvitados - 1), invitados}, this.collection);
    }
  }

  sendNotification(title: string, body: string, nc: string) {
    const subTok = this.firestoreService.getStudentToken(nc).subscribe(
      (token) => {
        subTok.unsubscribe();
        const infoToken = token[0];
        const notification = {
          'titulo': title,
          'descripcion': body,
          'fecha': new Date()
        };
        if (infoToken) {
          // student device exist
          if (infoToken.token) {
            // student has token device
            // send notification
            this.firestoreService.sendNotification(infoToken.id, notification).then(
              _ => {
                this.studentProv.sendNotification({title, body, token: infoToken.token, screen: 'graduation'}).subscribe(
                  __ => {
                    this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Notificación enviada', '');
                  }
                );
              }
            );
          } else {
            // only save notification in firebase
            this.firestoreService
              .sendNotification(infoToken.id, notification)
              .then(_ => console.log('Enviado'));
          }
          this.firestoreService
            .updateDeviceStudent(infoToken.id, {pendientes: (infoToken.pendientes + 1)})
            .then(_ => {});
        } else {
          // create register for notifications
          // only save notification in firebase
          this.firestoreService.createDeviceToken(nc).then(
            (created) => {
              const subST = this.firestoreService.getStudentToken(nc).subscribe(
                _ => {
                  subST.unsubscribe();
                  this.firestoreService.sendNotification(infoToken.id, notification).then(
                    __ => {
                      console.log('Enviado');
                      this.firestoreService
                        .updateDeviceStudent(infoToken.id, {pendientes: (infoToken.pendientes + 1)})
                        .then(___ => {});
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
  generateAllLabels() {
    if (this.alumnosConstancia.length !== 0) {
      this.loadingService.setLoading(true);
      const doc = new jsPDF('l', 'mm', [33.84, 479.4]);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
      doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

      var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      for (var i = 0; i < this.alumnosConstancia.length; i++) {
        var titulo = '';
        doc.setFontSize(10);
        doc.setFontType('bold');
        // Identificador
        // doc.text((i + 1) + '', 2.5, (pageHeight / 2) + 1.5);
        doc.setFontSize(9.5);
        doc.setFontType('bold');

        // Titulo
        if (this.alumnosConstancia[i].degree === true) {
          switch (this.alumnosConstancia[i].carreerComplete) {
            case 'ARQUITECTURA':
              titulo = 'ARQ.';
              break;
            case 'INGENIERÍA CIVIL':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA BIOQUÍMICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA QUÍMICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA MECATRÓNICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA ELÉCTRICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA INDUSTRIAL':
              titulo = 'ING.';
              break;
            case 'LICENCIATURA EN ADMINISTRACIÓN':
              titulo = 'LIC.';
              break;
            case 'MAESTRÍA EN CIENCIAS EN ALIMENTOS':
              titulo = 'MCA.';
              break;
            case 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN':
              titulo = 'MTI.';
              break;
            case 'DOCTORADO EN CIENCIAS EN ALIMENTOS':
              titulo = 'DCA.';
              break;
            default:
              titulo = '';
              break;
          }
          doc.text(titulo, 23, (pageHeight / 2) + 1.5);
        }

        // Nombre
        doc.text(this.alumnosConstancia[i].name, 35, (pageHeight / 2) + 1.5);

        // Carrera
        doc.text(this.alumnosConstancia[i].carreer, 150, (pageHeight / 2) + 1.5);

        doc.setFontSize(10);
        doc.setFontType('bold');

        if (i < this.alumnosConstancia.length - 1) {
          doc.addPage();
        }
      }
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  generateRegisteredLabels() {
    if (this.alumnosConstanciaRegistrados.length !== 0) {
      this.loadingService.setLoading(true);
      const doc = new jsPDF('l', 'mm', [33.84, 479.4]);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
      doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

      var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      for (let i = 0; i < this.alumnosConstanciaRegistrados.length; i++) {
        var titulo = '';
        doc.setFontSize(10);
        doc.setFontType('bold');
        // Identificador
        // doc.text((i + 1) + '', 2.5, (pageHeight / 2) + 1.5);
        doc.setFontSize(9.5);
        doc.setFontType('bold');

        // Titulo
        if (this.alumnosConstanciaRegistrados[i].degree === true) {
          switch (this.alumnosConstanciaRegistrados[i].carreerComplete) {
            case 'ARQUITECTURA':
              titulo = 'ARQ.';
              break;
            case 'INGENIERÍA CIVIL':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA BIOQUÍMICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA QUÍMICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA MECATRÓNICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA ELÉCTRICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA INDUSTRIAL':
              titulo = 'ING.';
              break;
            case 'LICENCIATURA EN ADMINISTRACIÓN':
              titulo = 'LIC.';
              break;
            case 'MAESTRÍA EN CIENCIAS EN ALIMENTOS':
              titulo = 'MCA.';
              break;
            case 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN':
              titulo = 'MTI.';
              break;
            case 'DOCTORADO EN CIENCIAS EN ALIMENTOS':
              titulo = 'DCA.';
              break;
            default:
              titulo = '';
              break;
          }
          doc.text(titulo, 23, (pageHeight / 2) + 1.5);
        }

        // Nombre
        doc.text(this.alumnosConstanciaRegistrados[i].name, 35, (pageHeight / 2) + 1.5);

        // Carrera
        doc.text(this.alumnosConstanciaRegistrados[i].carreer, 150, (pageHeight / 2) + 1.5);

        doc.setFontSize(10);
        doc.setFontType('bold');

        if (i < this.alumnosConstanciaRegistrados.length - 1) {
          doc.addPage();
        }
      }
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  generateVerifiedLabels() {
    if (this.alumnosConstanciaVerificados.length !== 0) {
      this.loadingService.setLoading(true);
      const doc = new jsPDF('l', 'mm', [33.84, 479.4]);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
      // @ts-ignore
      doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
      doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

      var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

      for (var i = 0; i < this.alumnosConstanciaVerificados.length; i++) {
        var titulo = '';
        doc.setFontSize(10);
        doc.setFontType('bold');
        // Identificador
        doc.text((i + 1) + '', 2.5, (pageHeight / 2) + 1.5);
        doc.setFontSize(9.5);
        doc.setFontType('bold');

        // Titulo
        if (this.alumnosConstanciaVerificados[i].degree === true) {
          switch (this.alumnosConstanciaVerificados[i].carreerComplete) {
            case 'ARQUITECTURA':
              titulo = 'ARQ.';
              break;
            case 'INGENIERÍA CIVIL':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA BIOQUÍMICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA QUÍMICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA MECATRÓNICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA ELÉCTRICA':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
              titulo = 'ING.';
              break;
            case 'INGENIERÍA INDUSTRIAL':
              titulo = 'ING.';
              break;
            case 'LICENCIATURA EN ADMINISTRACIÓN':
              titulo = 'LIC.';
              break;
            case 'MAESTRÍA EN CIENCIAS EN ALIMENTOS':
              titulo = 'MCA.';
              break;
            case 'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN':
              titulo = 'MTI.';
              break;
            case 'DOCTORADO EN CIENCIAS EN ALIMENTOS':
              titulo = 'DCA.';
              break;
            default:
              titulo = '';
              break;
          }
          doc.text(titulo, 23, (pageHeight / 2) + 1.5);
        }

        // Nombre
        doc.text(this.alumnosConstanciaVerificados[i].name, 35, (pageHeight / 2) + 1.5);

        // Carrera
        doc.text(this.alumnosConstanciaVerificados[i].carreer, 150, (pageHeight / 2) + 1.5);

        doc.setFontSize(10);
        doc.setFontType('bold');

        if (i < this.alumnosConstanciaVerificados.length - 1) {
          doc.addPage();
        }
      }
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    } else {
      this.notificationsServices.showNotification(2, 'Atención', 'No hay alumnos de esta carrera.');
    }
  }

  getBestAvgs() {
    this.bestStudents = [];
    return new Promise((resolve) => {
      const femaleAvgs = this.alumnosReport
        .filter((std) => std.genero === 'F')
        .map((st) => ({
          id: st.id,
          avg: parseFloat(st.average),
          career: st.carreerComplete,
          name: st.name,
          careerS: st.carreer,
          degree: st.degree
        }));
      const maleAvgs = this.alumnosReport
        .filter((std) => std.genero === 'M')
        .map((st) => ({
          id: st.id,
          avg: parseFloat(st.average),
          career: st.carreerComplete,
          name: st.name,
          careerS: st.carreer,
          degree: st.degree
        }));
      let bestMaleAvg = {
        id: '',
        avg: 0,
        name: '',
        career: '',
        degree: false,
        careerS: ''
      }, bestFemaleAvg = {
        id: '',
        avg: 0,
        name: '',
        career: '',
        degree: false,
        careerS: ''
      };
      const sub = this.firestoreService.getGraduates(this.collection).subscribe(
        (gr) => {

          sub.unsubscribe();
          const graduates = gr.map(st =>
            ({id: st.payload.doc.id, avg: st.payload.doc.get('promedio'),
              bestAvgM: st.payload.doc.get('mejorPromedioM'),
              bestAvgFM: st.payload.doc.get('mejorPromedioF')}));
          const bestAvgM = graduates.filter(st => st.bestAvgM === true)[0];
          const bestAvgFM = graduates.filter(st => st.bestAvgFM === true)[0];
          for (const stu of femaleAvgs) {
            if (stu.avg > bestFemaleAvg.avg) {
              bestFemaleAvg = stu;
            }
          }
          for (const stu of maleAvgs) {
            if (stu.avg > bestMaleAvg.avg) {
              bestMaleAvg = stu;
            }
          }
          if (bestAvgM) {
            if (bestAvgM.id !== bestMaleAvg.id) {
              this.firestoreService.updateFieldGraduate(bestAvgM.id, {mejorPromedioM: false}, this.collection).then((upd) => {});
              this.firestoreService.updateFieldGraduate(bestMaleAvg.id, {mejorPromedioM: true}, this.collection).then((up) => {});
            }
          } else {
            this.firestoreService.updateFieldGraduate(bestMaleAvg.id, {mejorPromedioM: true}, this.collection).then((up) => {
            });
          }
          if (bestAvgFM) {
            if (bestAvgFM.id !== bestFemaleAvg.id) {
              this.firestoreService.updateFieldGraduate(bestAvgFM.id, {mejorPromedioF: false}, this.collection).then((upd) => {});
              this.firestoreService.updateFieldGraduate(bestFemaleAvg.id, {mejorPromedioF: true}, this.collection).then((up) => {
              });
            }
          } else {
            this.firestoreService.updateFieldGraduate(bestFemaleAvg.id, {mejorPromedioF: true}, this.collection).then((up) => {
            });
          }
          this.bestStudents.push(bestFemaleAvg);
          this.bestStudents.push(bestMaleAvg);
          resolve(true);
        }
      );
    });
  }

  searchStudent() {
    if(this.findStudentTickets !== ''){
      this.studentsTickets = this.alumnosReport.filter(student => student.nc.indexOf(this.findStudentTickets) !== -1 || student.name.indexOf(this.findStudentTickets) !== -1);
    }
  }

  viewTickets(student){
    this.guests = [];
    const invitados = student.invitados;
    invitados.forEach((invitado) => {
      const ticketFor = Object.keys(invitado)[0];
      if (invitado[ticketFor] == 'verificado') {
        this.guests.push(
          {
            data: crypto.AES.encrypt(student.id + '&' + ticketFor, eQR.KEY).toString(),
            ticketFor,
            student
          });
      }
    });
    if(this.guests.length === 0){
      this.notificationsServices.showNotification(eNotificationType.INFORMATION,'No tiene boletos disponibles','');
    }
  }

  changeStatusTicket(ticket){
    const alumno = ticket.student;
    ticket.student.invitados.forEach((boleto,index) => {
      if(ticket.ticketFor === Object.keys(boleto)[0]){
        alumno.invitados[index] = {[Object.keys(boleto)[0]]:'asistió'};
      }
    });
    const invitadosMod = alumno.invitados;
    this.firestoreService.updateFieldGraduate(alumno.id,{invitados:invitadosMod},this.collection).then(
      (update) => {
        this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Asistencia registrada','');
      }
    );
    this.viewTickets(alumno);
  }

  callStudent(alumno){
    this.firestoreService.getProfile(alumno.id).subscribe(
      res=>{
        this.phoneStudent = res.payload.data();
        if(this.phoneStudent) {
          location.href = "tel:"+this.phoneStudent.telefonoAlumno;
        } else {
          this.notificationsServices.showNotification(eNotificationType.INFORMATION,'No tiene número registrado','');
        }
      }
    );
  }
  filter(type: string, event: Event){ //funcion para controlar los filtros activos
    const filterValue: string = (event.target as HTMLInputElement).value.trim().toLowerCase();  
    
    switch(type){
      case 'career':{ //filtrar por carrera
        if(filterValue == 'default'){          
          this.filters.career.status = false;
          this.filters.career.value = '';
          this.filteredCareer = '';
        }else{
          this.filters.career.status = true;
          this.filters.career.value = filterValue;  
          this.filteredCareer = filterValue;        
        }        
        break;
      }
      case 'surveys':{ //quienes ya contestaron o no la encuesta
        if(filterValue == 'default'){
          this.filters.survey.all = true;          
        }else{
          this.filters.survey.all = false;
          if(filterValue == 'false'){
            this.filters.survey.answered = false;
          }else{
            this.filters.survey.answered = true;
          }
        }
        break;
      }    
      case 'check':{ //checkbox con los estatus     
        
        switch(filterValue){
          case 'registrado':{ //cambiamos el estado del filtro para los checks
            this.filters.checkR = !this.filters.checkR;
            break;
          }
          case 'verificado':{
            this.filters.checkV = !this.filters.checkV;
            break;
          }
          case 'asistió':{
            this.filters.checkA = !this.filters.checkA;
            break;
          }
          case 'mencionado':{
            this.filters.checkM = !this.filters.checkM;
            break;
          }          
        }
        console.log(this.filters);        
        break;
      }      
      case 'search':{ //para el cuadro de texto
        if(filterValue !== ''){
          this.filters.textSearch.status = true;
          this.filters.textSearch.value = filterValue;
        }else{
          this.filters.textSearch.status = false;
          this.filters.textSearch.value = '';
        }        
        break;
      }
      
    }
    this.applyFilters();
    
  }
  applyFilters(){ //funcion para aplicar filtros activos
    this.dataSource.data = this.alumnosReport;
    
    if(this.filters.career.status){
      this.dataSource.data = this.dataSource.data.filter(st=>st.carreer.toLowerCase() == this.filters.career.value);
    }
    if(this.filters.textSearch.status){
      this.dataSource.filter = this.filters.textSearch.value;
    }
    if(!this.filters.survey.all){ //si no se quieren ver todos
      if(this.filters.survey.answered){ //solo encuestas contestadas
        this.dataSource.data = this.dataSource.data.filter( (st:any)=>st.survey);
      }else{
        this.dataSource.data = this.dataSource.data.filter( (st:any)=>!st.survey);
      }
    }    
    let tmpA=[],tmpR=[],tmpM=[],tmpV=[]; //variables temporales para guardar los alumnos por su estatus
    let filterStatusFlag = false; //variable para ver si al menos se filtro por un estatus
    if(this.filters.checkA){ //filtrar por status
      tmpA = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'asistió'); 
      filterStatusFlag = true;           
    }
    if(this.filters.checkR){
      tmpR = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'registrado');  
      filterStatusFlag = true;               
    }
    if(this.filters.checkM){
      tmpM = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'mencionado');
      filterStatusFlag = true;           
    }
    if(this.filters.checkV){
      tmpV = this.dataSource.data.filter((st)=>st.status.toLowerCase() == 'verificado'); 
      filterStatusFlag = true;                
    }    
    //se unen todos los arrays temporales para hacer un 'OR' de los status
    let tmpData = [].concat(tmpR,tmpV);    
    tmpData = tmpData.concat(tmpA);
    tmpData = tmpData.concat(tmpM);    
    tmpData.sort(function (a, b) { //ordenar por apellidos
      return a.nameLastName.localeCompare(b.nameLastName);
    });
    if(filterStatusFlag){ //si hay filtro por estatus
      this.dataSource.data = tmpData;
    }
    this.alumnosBallotPaper = this.filterItemsVerified(this.filteredCareer, 'Verificado');
  }
  filterDoc(type: string, event: Event){ //funcion para controlar los filtros activos
    const filterValue: string = (event.target as HTMLInputElement).value.trim().toLowerCase();  
    
    switch(type){
      case 'career':{ //filtrar por carrera
        if(filterValue == 'default'){          
          this.filtersDoc.career.status = false;
          this.filtersDoc.career.value = '';
          this.filteredCareerDoc = '';
        }else{
          this.filtersDoc.career.status = true;
          this.filtersDoc.career.value = filterValue;  
          this.filteredCareerDoc = filterValue;        
        }        
        break;
      }
      case 'status':{ // filtrar por estatus de la documentacion       
        if(filterValue == 'default'){
          this.filtersDoc.status.all = true;   
          this.filtersDoc.status.value = '';       
        }else{
          this.filtersDoc.status.all = false;
          this.filtersDoc.status.value = filterValue;                   
        }
        break;
      }               
      case 'search':{ //para el cuadro de texto
        if(filterValue !== ''){
          this.filtersDoc.textSearch.status = true;
          this.filtersDoc.textSearch.value = filterValue;
        }else{
          this.filtersDoc.textSearch.status = false;
          this.filtersDoc.textSearch.value = '';
        }        
        break;
      }
      
    }
    this.applyFiltersDoc();
    
  }
  applyFiltersDoc(){ //funcion para aplicar filtros activos
    this.dataSourceDoc.data = this.alumnosReportDocumentation;
    
    if(this.filtersDoc.career.status){
      this.dataSourceDoc.data = this.dataSourceDoc.data.filter(st=>st.carreer.toLowerCase() == this.filtersDoc.career.value);
    }
    if(this.filtersDoc.textSearch.status){
      this.dataSourceDoc.filter = this.filtersDoc.textSearch.value;
    }
    if(!this.filtersDoc.status.all){ //si no se quieren ver todos
      this.dataSourceDoc.data = this.dataSourceDoc.data.filter( (st:any)=>st.documentationStatus.toLowerCase() == this.filtersDoc.status.value);
      
    }
    this.eventFilterReportDocumentation();
  }
  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      (res)=>{       
        
        this.careers = res.careers;        
      },
      err=>console.warn(err)
      
    );
  }

  reviewPhotos(student){
    const linkModal = this.dialog.open(ReviewPhotosPaydocModalComponent, {
      data: {
        operation: 'view',
        student:student,
        collection: this.collection
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    linkModal.afterClosed().subscribe( (res)=>{
        const graduated = this.alumnos.filter( st=> st.id == student.id)[0];
        if(graduated.entregaFotos && graduated.comprobantePago.status.name == 'ACEPTADO'){
          this.firestoreService.updateFieldGraduate(student.id,{documentationStatus:'PENDIENTE',stepCertificado:3},this.collection).then(upd=>{});
        }
       
      },
      err=>console.log(err)
    );
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  changeStatusPhotos(student){
    const graduated = this.alumnos.filter( st=> st.id == student.id)[0];
    if(graduated.comprobantePago && graduated.comprobantePago.status.name == 'ACEPTADO'){
      this.firestoreService.updateFieldGraduate(student.id,{documentationStatus:'PENDIENTE',stepCertificado:3, entregaFotos:true},this.collection).then(upd=>{});
    }else{
      this.firestoreService.updateFieldGraduate(student.id,{entregaFotos:true},this.collection).then(upd=>{});
    }
  }

}
