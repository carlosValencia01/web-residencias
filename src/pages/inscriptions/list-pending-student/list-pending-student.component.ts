import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ReviewExpedientComponent } from 'src/modals/inscriptions/review-expedient/review-expedient.component';
import { StudentInformationComponent } from 'src/modals/inscriptions/student-information/student-information.component';
import { ReviewAnalysisComponent } from 'src/modals/inscriptions/review-analysis/review-analysis.component';
import { ReviewCredentialsComponent } from 'src/modals/inscriptions/review-credentials/review-credentials.component';
import TableToExcel from '@linways/table-to-excel';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
const jsPDF = require('jspdf');
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-list-pending-student',
  templateUrl: './list-pending-student.component.html',
  styleUrls: ['./list-pending-student.component.scss']
})
export class ListPendingStudentComponent implements OnInit {
  students;
  listStudentsPending;
  periods = [];
  loading = false;

  rolName;

  docAnalisis;

  frontBase64: any;
  backBase64: any;

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  //Font Montserrat
  montserratNormal: any;
  montserratBold: any;


  // filter nc,nombre
  public searchText = '';
  public searchCarreer = '';
  public searchDictamen = '';
  public searchAdvertencia = '';
  public searchCredential = '';

  public searchEC = false;
  public searchE = false;
  public searchEP = false;
  public searchV = false;
  public searchA = false;

  public EC = '';
  public E = '';
  public EP = '';
  public V = '';
  public A = '';

  //Paginator Students
  pageP = 1;
  pagP;
  pageSizeP = 10;

  constructor(
    private imageToBase64Serv: ImageToBase64Service,
    private inscriptionsProv: InscriptionsProvider,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private router: Router,
    private studentProv: StudentProvider
  ) { 
    this.rolName = this.cookiesService.getData().user.rol.name;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.getFonts();
    this.getStudents();
    this.getPeriods();
    this.getBase64ForStaticImages();

  }

  getFonts() {
    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Regular.ttf').then(base64 => {
        this.montserratNormal = base64.toString().split(',')[1];
    });

    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Bold.ttf').then(base64 => {
        this.montserratBold = base64.toString().split(',')[1];
    });
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

  getStudents(){
    this.inscriptionsProv.getStudentsPendant().subscribe(res => {
      this.students = res.students;

      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.fatherLastName.localeCompare(b.fatherLastName);
      });
      this.listStudentsPending = this.students;
      this.eventFilterStatus();
    });
  }

  pageChanged(ev) {
    this.pageP = ev;
  }

  // Obetener Valor del checkbox de Estatus
  eventFilterStatus() {
    if (this.searchEC) {
      this.EC = 'En Captura';
    } else {
      this.EC = '~';
    }
    if (this.searchE) {
      this.E = 'Enviado';
    } else {
      this.E = '~';
    }
    if (this.searchEP) {
      this.EP = 'En Proceso';
    } else {
      this.EP = '~';
    }
    if (this.searchV) {
      this.V = 'Verificado';
    } else {
      this.V = '~';
    }
    if (this.searchA) {
      this.A = 'Aceptado';
    } else {
      this.A = '~';
    }

    this.listStudentsPending = this.filterItems(
      this.searchCarreer,
      this.EC,
      this.E,
      this.EP,
      this.V,
      this.A
    );

    if (Object.keys(this.listStudentsPending).length === 0) {
      if (!this.searchEC && !this.searchE && !this.searchEP && !this.searchV && !this.searchA) {
        this.listStudentsPending = this.students;
      }
    }

  }

  // FILTRADO POR CARRERA
  filterItemsCarreer(carreer) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1;
    });
  }

   // FILTRADO POR CARRERA O ESTATUS
   filterItems(carreer, EC, E, EP, V, A) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1 && (
        student.inscriptionStatus.toLowerCase().indexOf(EC.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(E.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(EP.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(V.toLowerCase()) > -1 ||
        student.inscriptionStatus.toLowerCase().indexOf(A.toLowerCase()) > -1);
    });
  }

  filterItemsCovers(carreer,nc) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1 &&
        student.controlNumber.toLowerCase().indexOf(nc.toLowerCase()) > -1    
      });
  }
  

  getPeriods(){
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {
        this.periods=periods.periods;
        this.periods.reverse();
        sub.unsubscribe();
      });
  }

  updateGI(student){
    const linkModal = this.dialog.open(StudentInformationComponent, {
      data: {
        operation: 'view',
        student:student
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      information=>{
        this.getStudents();
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  viewExpedient(student){
    const linkModal = this.dialog.open(ReviewExpedientComponent, {
      data: {
        operation: 'view',
        student:student,
        user: this.cookiesService.getData().user.rol.name
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
      height: '800px'
    });
    let sub = linkModal.afterClosed().subscribe(
      expedient=>{
        this.getStudents();
      },
      err=>console.log(err), ()=> sub.unsubscribe()
    );
  }

  // Exportar alumnos a excel
  excelExport() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte Alumnos Inscripcion.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

  viewAnalysis(student){
    if(student.documents != ''){
      var docAnalisis = student.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] ? student.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] : '';
      if(docAnalisis != ''){
        if(docAnalisis.status[docAnalisis.status.length-1].name == "VALIDADO" || docAnalisis.status[docAnalisis.status.length-1].name == "ACEPTADO"){
          const linkModal = this.dialog.open(ReviewAnalysisComponent, {
            data: {
              operation: 'view',
              student:student
            },
            disableClose: true,
            hasBackdrop: true,
            width: '90em',
            height: '800px'
          });
          let sub = linkModal.afterClosed().subscribe(
            analysis=>{
              this.getStudents();
            },
            err=>console.log(err), ()=> sub.unsubscribe()
          );
        } else {
          this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Aun no son Validados/Aceptados los análisis clínicos.');   
        }
      } else {
        this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Alumno no tiene análisis clínicos.');   
      }
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'ATENCIÓN', 'Alumno no tiene expediente.');   
    }
    
  }

  filterDocuments(document,student){
    
  
    
    switch (document) {
      case "Acta": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ?docc.filename.indexOf('ACTA') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Certificado": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('CERTIFICADO') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Analisis": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('CLINICOS') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Comprobante": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('COMPROBANTE') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Curp": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('CURP') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Nss": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('NSS') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Foto": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('FOTO') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      default:{

      }
    }
  }

  // Generar plantilla IMSS Excel
  excelExportIMSS() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcelIMSS'), {
      name: 'Plantilla Alumnos IMSS.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

   // Generar plantilla CM Excel
   excelExportCM() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loading = true;
    TableToExcel.convert(document.getElementById('tableReportExcelCM'), {
      name: 'Reporte Consultorio Médico.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loading = false;
  }

  complete10Dig(number){
    var num = number.toString();
    while (num.length<10){
      num = '0'+num;
    }
    return(num);
  }

  getDateMov(){
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if(month < 10){
      if(day < 10){
        return (`0${day}0${month}${year}`)
      }
      else{
        return (`${day}0${month}${year}`)
      }
    }else{
      if(day < 10){
        return (`0${day}${month}${year}`)
      } else{
        return (`${day}${month}${year}`)
      }
    }
  }

  registerCredential(item){
    Swal.fire({
      title: 'Registrar Impresión de Credencial',
      text: 'Para ' + item.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.loading=true;
        this.inscriptionsProv.updateStudent({printCredential:true},item._id).subscribe(res => {
        }, err=>{},
        ()=>{
          this.loading=false
          this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
          this.getStudents();
        });
      }
    });
  }

  removeCredential(item){
    Swal.fire({
      title: 'Remover Impresión de Credencial',
      text: 'Para ' + item.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.loading=true;
        this.inscriptionsProv.updateStudent({printCredential:false},item._id).subscribe(res => {
        }, err=>{},
        ()=>{
          this.loading=false
          this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Removida.');
          this.getStudents();
        });
      }
    });
  }

  //GENERAR PDF
  getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/front45A.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back3.jpg').then(res2 => {
      this.backBase64 = res2;
    });
  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128', displayValue: false });
    return canvas.toDataURL('image/png');
  }

  reduceCareerString(career: string): string {
    if (career.length < 33) {
      return career;
    }

    switch (career) {
      case 'DOCTORADO EN CIENCIAS DE ALIMENTOS':
        return 'DOC. EN CIENCIAS DE ALIMENTOS';

      case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
        return 'ING. EN GESTION EMPRESARIAL';


      case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
        return 'ING. EN SISTEMAS COMPUTACIONALES';

      case 'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN':
        return 'MAESTRÍA EN TEC. DE LA INFORMACIÓN';

      case 'MAESTRIA EN CIENCIAS DE ALIMENTOS':
        return 'MAEST. EN CIENCIAS DE ALIMENTOS';

      default:
        return 'ING. EN TEC. DE LA INF. Y COM.';
    }

  }

  async findFoto(docFoto) {
    return new Promise(resolve => {
      this.inscriptionsProv.getFile(docFoto.fileIdInDrive, docFoto.filename).subscribe(
        data => {
          var pub = data.file;
          var image = 'data:image/png;base64,' + pub;
          resolve(image);
        },
        err => {
          console.log(err);
        }
      )
    });
  }

  updateSolicitud(student){
    Swal.fire({
      title: 'Actualizar Solicitud',
      text: 'Para ' + student.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        var day = student.curp.substring(8, 10);
        var month = student.curp.substring(6, 8);
        var year = student.curp.substring(4, 6);
        var fechaNacimiento = day + "/" + month + "/" + year;
    
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
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Solicitud de Inscripción", pageWidth / 2, 37, 'center');
    
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Código: ITT-POE-01-02      Revisión: 0", pageWidth / 2, 42, 'center');
    
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(13);
        doc.text("Referencia a la Norma ISO 9001-2015:    8.2.2, 8.2.3, 8.2.1, 8.5.2", pageWidth / 2, 47, 'center');
    
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(15);
        doc.text("SOLICITUD DE INSCRIPCIÓN", pageWidth / 2, 60, 'center');
    
        // Cuadro 1
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 65, 190, 10, 'f');
    
        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 75, 190, 45, 'f');
    
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 72, 'Datos Generales');
    
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Nombre: ', 15, 80);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.fatherLastName + ' ' + student.motherLastName + ' ' + student.firstName, 70, 80);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Lugar de nacimiento: ', 15, 85);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.birthPlace, 70, 85);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Fecha de nacimiento: ', 15, 90);
        doc.setFont('Montserrat', 'Normal');
        doc.text(fechaNacimiento, 70, 90);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Estado Civil: ', 15, 95);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.civilStatus, 70, 95);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Correo Electrónico: ', 15, 100);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.email, 70, 100);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('CURP: ', 15, 105);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.curp, 70, 105);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('NSS: ', 15, 110);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.nss, 70, 110);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Número de control: ', 15, 115);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.controlNumber, 70, 115);
    
        // Cuadro 2
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 125, 190, 10, 'f');
    
        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 135, 190, 35, 'f');
    
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 132, 'Dirección');
    
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Calle: ', 15, 140);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.street, 70, 140);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Colonia: ', 15, 145);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.suburb, 70, 145);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Ciudad: ', 15, 150);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.city, 70, 150);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Estado: ', 15, 155);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.state, 70, 155);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Código Postal: ', 15, 160);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.cp + '', 70, 160);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Teléfono: ', 15, 165);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.phone + '', 70, 165);
    
        // Cuadro 3
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 175, 190, 10, 'f');
    
        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 185, 190, 25, 'f');
    
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 182, 'Datos académicos');
    
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Escuela de procedencia: ', 15, 190);
        doc.setFont('Montserrat', 'Normal');
        doc.setFontSize(9);
        doc.text(student.originSchool + ': ' + student.nameOriginSchool, 70, 190);
    
        doc.setFontSize(12);
        doc.setFont('Montserrat', 'Bold');
        doc.text('Otra: ', 15, 195);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.otherSchool, 70, 195);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Promedio: ', 15, 200);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.averageOriginSchool + '', 70, 200);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('Carrera a cursar: ', 15, 205);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.career, 70, 205);
    
        // Cuadro 4
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(10, 215, 190, 10, 'f');
    
        doc.setDrawColor(0);
        doc.setFillColor(230, 230, 230);
        doc.rect(10, 225, 190, 25, 'f');
    
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('Montserrat', 'Bold');
        doc.text(15, 222, 'Datos extras');
    
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Perteneces a alguna Etnia? ', 15, 230);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.etnia, 85, 230);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Cuál?', 15, 235);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.typeEtnia, 85, 235);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Tienes alguna discapacidad? ', 15, 240);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.disability, 85, 240);
    
        doc.setFont('Montserrat', 'Bold');
        doc.text('¿Cuál?', 15, 245);
        doc.setFont('Montserrat', 'Normal');
        doc.text(student.typeDisability, 85, 245);
    
        doc.line((pageWidth / 2)-35, 270, (pageWidth / 2)+35, 270);
        doc.setFont('Montserrat', 'Bold');
        doc.setFontSize(10);
        doc.text("Firma del Estudiante", pageWidth / 2, 280, 'center');
    
        let document = doc.output('arraybuffer');
        let binary = this.bufferToBase64(document);
    
        this.updateDocument(binary,student);
        // window.open(doc.output('bloburl'), '_blank');    
      }
    });
  }

  bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  async updateDocument(document, student){
    
    const fileId = student.documents[0].fileIdInDrive;
    const folderId = await this.getFolderId(student._id);
    const documentInfo = {
      mimeType: "application/pdf",
      nameInDrive: student.controlNumber + '-SOLICITUD.pdf',
      bodyMedia: document,
      folderId: folderId,
      newF: false, 
      fileId: fileId
    };
    this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
      async updated => {
        const documentInfo2 = {
          doc: {
            filename: updated.filename,
            type: 'DRIVE',
            fileIdInDrive: updated.fileId
          },
          status: {
            name: 'EN PROCESO',
            active: true,
            message: 'Se envio por primera vez'
          }
        };
        await this.studentProv.uploadDocumentDrive(student._id, documentInfo2).subscribe(
          updated => {
            this.notificationService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud actualizada correctamente.');    
             this.loading = false;
          },
          err => {
            console.log(err);
          }, () => this.loading = false
        );
      },
      err => {
        this.loading = false;
        console.log(err);
      }
    );
  }

  async getFolderId(id){
    let folderId;
   await this.studentProv.getFolderId(id).toPromise().then(
      folder => {        
        if (folder.folder) {// folder exists
          if (folder.folder.idFolderInDrive) {
            folderId = folder.folder.idFolderInDrive;                        
          }
        }
      });
    return folderId;
  }

  updateExpedientStatus(student){
    Swal.fire({
      title: 'Actualizar Estatus de Expediente',
      text: 'Para ' + student.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.studentProv.getDocumentsUpload(student._id).subscribe(res => {
          var comprobante = res.documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0] : '';
          var acta = res.documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0] : '';
          var curp = res.documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0] : '';
          var nss = res.documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0] : '';
          var compromiso = res.documents.filter( docc => docc.filename.indexOf('COMPROMISO') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('COMPROMISO') !== -1)[0] : '';
          var clinicos = res.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0] : '';
          var certificado = res.documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0] : '';
          var foto = res.documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] ? res.documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] : '';
          
          if (comprobante.statusName == "ACEPTADO"  && acta.statusName == "ACEPTADO"  && curp.statusName == "ACEPTADO"  && nss.statusName == "ACEPTADO"  && clinicos.statusName == "ACEPTADO"  && certificado.statusName == "ACEPTADO"  && foto.statusName == "ACEPTADO"){
            // Cambiar estatus a ACEPTADO
            this.inscriptionsProv.updateStudent({inscriptionStatus:"Aceptado"},student._id).subscribe(res => {
            }); 
            this.getStudents();
            return;
          } 
          if (comprobante.statusName == "VALIDADO"  && acta.statusName == "VALIDADO"  && curp.statusName == "VALIDADO"  && nss.statusName == "VALIDADO"  && clinicos.statusName == "VALIDADO"  && certificado.statusName == "VALIDADO"  && foto.statusName == "VALIDADO"){
            // Cambiar estatus a VALIDADO
            this.inscriptionsProv.updateStudent({inscriptionStatus:"Verificado"},student._id).subscribe(res => {
            });   
            this.getStudents();
            return;
          }
    
          var allDiferentProcess = true;
          var allValidateOrAcept = true;
    
          for(var i = 0; i < res.documents.length; i++){
            if(res.documents[i].statusName == "EN PROCESO"){
              allDiferentProcess = false;
            }
            if(res.documents[i].statusName == "VALIDADO" || res.documents[i] == "ACEPTADO"){
              allValidateOrAcept = true;
            } else {
              allValidateOrAcept = false;
            }
          }
    
          if(allDiferentProcess){
            if(!allValidateOrAcept){
              // Cambiar estatus a EN PROCESO
              this.inscriptionsProv.updateStudent({inscriptionStatus:"En Proceso"},student._id).subscribe(res => {
              });
              this.getStudents();
              return;
            }
            // No cambiar estatus
          }
        });
      }
    });
  }

}
