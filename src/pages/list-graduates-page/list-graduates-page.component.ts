import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';
import { CookiesService } from 'src/services/cookie.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExporterService } from 'src/services/exporter.service'
import Swal from 'sweetalert2';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { CheckboxControlValueAccessor } from '@angular/forms';
import TableToExcel from "@linways/table-to-excel";


declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-list-graduates-page',
  templateUrl: './list-graduates-page.component.html',
  styleUrls: ['./list-graduates-page.component.scss']
})
export class ListGraduatesPageComponent implements OnInit {
  public searchText : string;

  //Variables para filtrar alumnos y generar reporte
  public searchCarreer : string = '';

  public searchSRC = false;
  public searchSPC = false;
  public searchSVC = false;
  public searchSAC = false;
  public searchSMC = false;

  public searchSR : string = '';
  public searchSP : string = '';
  public searchSV : string = '';
  public searchSA : string = '';
  public searchSM : string = '';

  public showTotal = true;

  //Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  //Variable donde se almacenan todos los alumnos
  public alumnos = [];

  //Variable donde se almacenan los alumnos filtrados
  public alumnosReport = []; // Variable donde se almacenan los alumnos para el reporte
  public totalAlumnos; //Obtener total de alumnos con filtros de estatus y carrera
  public totalAlumnosFilter; //Obtener total de alumnos con filto de busqueda de alumno

  //Variable para almacenar los alumnos verificados e imprimir papeletas
  public alumnosBallotPaper = [];


  public role: string;
  public no = 0;
  page=1;
  pag;
  pageSize = 10;
  collection = null;
  public status = 0;
  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv : GraduationProvider,
    private cookiesService: CookiesService,
    private router: Router,
    private excelService: ExporterService,
    private imageToBase64Serv: ImageToBase64Service,
    private routeActive: ActivatedRoute,
    ) {
      let rol = this.cookiesService.getData().user.role;
      
      if (rol !== 0 && rol !== 5 && rol !== 6 &&
      rol !== 9)
       {
        this.router.navigate(['/']);
      }
      this.collection=this.router.url.split('/')[2];
      let sub = this.firestoreService.getEvent(this.collection).subscribe(
        ev =>{ sub.unsubscribe(); this.status=ev.payload.get("estatus");}
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

    //Convertir imágenes a base 64 para los reportes
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

  readEmail(){
    this.firestoreService.getGraduates(this.collection).subscribe(async (alumnosSnapshot) => {
      this.alumnos = alumnosSnapshot.map( (alumno) =>{
        return {
          id:alumno.payload.doc.id,
          nc : alumno.payload.doc.get("nc"),
          name : alumno.payload.doc.get("nombre"),
          nameLastName : alumno.payload.doc.get("nombreApellidos"),
          carreer : alumno.payload.doc.get("carrera"),
          carreerComplete : alumno.payload.doc.get("carreraCompleta"),
          email: alumno.payload.doc.get("correo"),
          status: alumno.payload.doc.get("estatus"),
          degree: alumno.payload.doc.get("degree") ? true:false,
          observations: alumno.payload.doc.get("observations"),
          survey: alumno.payload.doc.get("survey")
        }});

        //Ordenar Alumnos por Apellidos
        this.alumnos.sort(function (a, b) {
          return a.nameLastName.localeCompare(b.nameLastName);
        });

        this.alumnosReport =  this.alumnos;
        this.totalAlumnos = this.alumnosReport.length;
        this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer,'');
      });
  }

  // Cambias estatus a Pagado
  paidEvent(item){
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
      degree: item.degree ? item.degree:false,
      observations: item.observations ? item.observations:'',
      survey: item.survey ? item.survey:false,
      estatus: 'Pagado'
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.eventFilterReport();
      this.notificationsServices.showNotification(0, 'Pago confirmado para:',item.nc);
    }, (error) => {
      console.log(error);
    });
  }

  // Cambias estatus a Registrado
  removePaidEvent(item){
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
      degree: item.degree ? item.degree:false,
      observations: item.observations ? item.observations:'',
      survey: item.survey ? item.survey:false,
      estatus: 'Registrado'
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.eventFilterReport();
      this.notificationsServices.showNotification(0, 'Pago removido para:',item.nc);
    }, (error) => {
      console.log(error);
    });
  }

  // Cambias estatus a Asistió
  asistenceEvent(item){
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
      degree: item.degree ? item.degree:false,
      observations: item.observations ? item.observations:'',
      survey: item.survey ? item.survey:false,
      estatus: 'Asistió'
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.eventFilterReport();
      this.notificationsServices.showNotification(0, 'Asistencia registrada para:',item.nc);
    }, (error) => {
      console.log(error);
    });
  }

  // Confirmar pago
  confirmPaidEvent(item){
    Swal.fire({
      title: 'Confirmar Pago',
      text: "Para "+item.name,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.paidEvent(item);
      }
    })
  }

  // Confirmar remover pago
  confirmRemovePaidEvent(item){
    Swal.fire({
      title: 'Remover Pago',
      text: "Para "+item.name,
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
    })
  }

  // Confirmar asistencia
  confirmPresenceEvent(item){
    Swal.fire({
      title: 'Confirmar Asistencia',
      text: "Para "+item.name,
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
    })
  }

  // Confirmar envio de invitación
  confirmSendEmail(item){
    Swal.fire({
      title: 'Enviar Invitación',
      imageUrl: '../../assets/icons/sendEmail.svg',
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
    })
  }

  // Enviar invitación al alumno seleccionado (status == Verificado)
  sendOneMail(item) {
    if(item.survey){
      this.graduationProv.sendQR(item.email,item.id,item.name).subscribe(
        res=>{
          this.notificationsServices.showNotification(0, 'Invitación enviada a:',item.nc);
        },
        err =>{this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:',item.nc);
        }
      );
    }
    else{
      this.notificationsServices.showNotification(2,item.nc,'Encuesta de Egresados aun no ha sido respondida');
    }
  }

    // Confirmar envio de encuesta de egresados
    confirmSendEmailSurvey(item){
      Swal.fire({
        title: 'Enviar Encuesta',
        imageUrl: '../../assets/icons/survey.svg',
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
      })
    }

    // Enviar encuesta al alumno seleccionado (status == Verificado)
    sendOneMailSurvey(item) {
      if(item.status == 'Verificado'){
        this.graduationProv.sendSurvey(item.email,item.id,item.name, item.nc, item.carreerComplete).subscribe(
          res=>{
            this.notificationsServices.showNotification(0, 'Encuesta enviada a:',item.nc);
          },
          err =>{this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:',item.nc);
          }
        );
      }
      else{
        this.notificationsServices.showNotification(2,item.nc,'Aun no se realiza el pago correspondiente');
      }
    }

  // Confirmar envio de invitación
  confirmSendEmailAll(){
      Swal.fire({
        title: 'Enviar Invitación',
        text: "Para todos los alumnos",
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
      })
  }

  // Enviar invitación a todos los alumnos
  sendMailAll(){
    this.alumnos.forEach(async student =>{
      if(student.email){
        await this.sendOneMail(student);
      }
    });
  }

  // Obetener Valor del checkbox de Estatus
  eventFilterReport(){
    if(this.searchSRC){
      this.searchSR = 'Registrado';
    }
    else{
      this.searchSR = '~';
    }
    if(this.searchSPC){
      this.searchSP = 'Pagado';
    }
    else{
      this.searchSP = '~';
    }
    if(this.searchSVC){
      this.searchSV = 'Verificado';
    }
    else{
      this.searchSV = '~';
    }
    if(this.searchSAC){
      this.searchSA = 'Asistió';
    }
    else{
      this.searchSA = '~';
    }
    if(this.searchSMC){
      this.searchSM = 'Mencionado';
    }
    else{
      this.searchSM = '~';
    }
    this.alumnosReport = this.filterItems(
                      this.searchCarreer,
                      this.searchSR,
                      this.searchSP,
                      this.searchSV,
                      this.searchSA,
                      this.searchSM
                    );
    
    var cantidadStatus = this.filterItems(
      this.searchCarreer,
      this.searchSR,
      this.searchSP,
      this.searchSV,
      this.searchSA,
      this.searchSM
    ).length;

    var cantidadCarrera = this.filterItemsCarreer(this.searchCarreer).length;
    console.log(this.alumnosReport);

    if(cantidadStatus == 0){
      if(this.searchSRC || this.searchSPC || this.searchSVC || this.searchSAC || this.searchSMC){
        this.totalAlumnos = 0;
      } else {
        this.totalAlumnos = cantidadCarrera;
      }
    } else {
      if(this.searchSRC || this.searchSPC || this.searchSVC || this.searchSAC || this.searchSMC){
        this.totalAlumnos = cantidadStatus;
      } else {
        this.totalAlumnos = cantidadCarrera;
      }
    }
      
      if(Object.keys(this.alumnosReport).length === 0){
        if(!this.searchSRC && !this.searchSPC && !this.searchSVC && !this.searchSAC && !this.searchSMC){
          this.alumnosReport =  this.alumnos;
        }
      }
      this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer,'');
  }
 
  // FILTRADO POR CARRERA O ESTATUS
  filterItems(carreer,sR,sP,sV,sA,sM) {
    return this.alumnos.filter(function(alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1 && (
             alumno.status.toLowerCase().indexOf(sR.toLowerCase()) > -1 ||
             alumno.status.toLowerCase().indexOf(sP.toLowerCase()) > -1 ||
             alumno.status.toLowerCase().indexOf(sV.toLowerCase()) > -1 ||
             alumno.status.toLowerCase().indexOf(sA.toLowerCase()) > -1 ||
             alumno.status.toLowerCase().indexOf(sM.toLowerCase()) > -1);
    })
  }

  filterItemsCarreer(carreer) {
    return this.alumnos.filter(function(alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1;
    })
  }

  filterItemsVerified(carreer,status){
    return this.alumnos.filter(function(alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1 &&
             alumno.status.toLowerCase().indexOf(status.toLowerCase()) > -1;
    })
  }

 // Generar reporte de alumnos
  generateReport(){
    var doc = new jsPDF('p', 'pt');

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 5, 110, 27); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth-120, 2, 82, 35); // Logo TecNM

    let header = "Reporte Alumnos Graduados "+this.searchCarreer;
    doc.setTextColor(0,0,0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text(header, pageWidth / 2, 30 , 'center');

    doc.autoTable({
      html: '#tableReport',
      didParseCell: function (data) {
          if(data.row.cells[4].text[0] === 'Registrado'){
            data.cell.styles.fillColor = [71, 178, 218];
            data.cell.styles.textColor = [255,255,255];
          }
          if(data.row.cells[4].text[0] === 'Pagado'){
            data.cell.styles.fillColor = [250, 157, 0];
            data.cell.styles.textColor = [255,255,255];
            data.cell.styles.fontSize =  10;
          }
          if(data.row.cells[4].text[0] === 'Verificado'){
            data.cell.styles.fillColor = [202, 0, 10];
            data.cell.styles.textColor = [255,255,255];
            data.cell.styles.fontSize =  10;
          }
          if(data.row.cells[4].text[0] === 'Asistió'){
            data.cell.styles.fillColor = [26, 111, 0];
            data.cell.styles.textColor = [255,255,255];
            data.cell.styles.fontSize =  10;
          }
          if(data.row.cells[4].text[0] === 'Mencionado'){
            data.cell.styles.fillColor = [0, 0, 116];
            data.cell.styles.textColor = [255,255,255];
            data.cell.styles.fontSize =  10;
          }
          if(data.row.cells[4].text[0] === 'Estatus'){
            data.cell.styles.fillColor = [17, 32, 67];
            data.cell.styles.textColor = [255,255,255];
            data.cell.styles.fontSize =  10;
          }
      }
    });

    // FOOTER
    var  today = new Date();
    var m = today.getMonth() + 1;
    var mes = (m < 10) ? '0' + m : m;
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.addImage(this.logoTecTepic, 'PNG',282.64, pageHeight  - 47, 30,30); // Logo SEP
    let footer = "© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n";
    doc.setTextColor(0,0,0);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(footer, pageWidth / 2, pageHeight -12, 'center');

    //Hour PDF
    let hour = today.getDate()+'/' +mes+'/'+today.getFullYear()+' - '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
    doc.setTextColor(100);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(hour, pageWidth-45, pageHeight -5, 'center');

    window.open(doc.output('bloburl'), '_blank');
    //doc.save("Reporte Graduacion "+this.searchCarreer+".pdf");
  }

  // Exportar alumnos a excel
  excelExport(){
    this.notificationsServices.showNotification(0, 'Datos Exportados','Los datos se exportaron con éxito');
    TableToExcel.convert(document.getElementById("tableReportExcel"), {
      name: "Reporte Graduación.xlsx",
      sheet: {
        name: "Alumnos"
      }
    });
  }

  // Generar papeletas de alumnos verificados
  generateBallotPaper(){
    if(this.alumnosBallotPaper.length !== 0){
      // Obtener alumnos cuyo estatus sea 'Verificado' && Carrera = al filtro seleccionado
      this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer,'');

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
      var divLine = pageHeight/4;
      var cont = 1;
      for(var i = 0; i < divAlumnosBallotPaper.length; i++){ // Recorrer cada segmento de alumnos
        for(var j = 0; j < divAlumnosBallotPaper[i].length; j++){ // Recorrer los alumnos del segmento actual
          if(j == 0){
            doc.addImage(this.logoSep, 'PNG', 5, 2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth-58, 2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG',(pageWidth/2)-7.5,divLine-20, 15, 15); // Logo TecTepic

            // Numero de alumno
            doc.setLineWidth(.3)
            doc.setDrawColor(0)
            doc.setFillColor(20, 43, 88)
            doc.circle(pageWidth-25,divLine-20,10, 'FD')
            doc.setTextColor(255,255,255);
            doc.setFontSize(30);
            doc.text(cont.toString(), pageWidth-25,divLine-16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2,30, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2,45, 'center');
            doc.line(0,divLine,pageWidth,divLine);
          }
          if(j == 1){
            doc.addImage(this.logoSep, 'PNG', 5,(divLine)+2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth-58,(divLine)+2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG',(pageWidth/2)-7.5,(divLine*2)-20, 15, 15); // Logo TecTepic

            //Numero de alumno
            doc.setLineWidth(.3)
            doc.setDrawColor(0)
            doc.setFillColor(20, 43, 88)
            doc.circle(pageWidth-25,(divLine*2)-20,10, 'FD')
            doc.setTextColor(255,255,255);
            doc.setFontSize(30);
            doc.text((cont).toString(), pageWidth-25,(divLine*2)-16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2,104.25, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2,119.25, 'center');
            doc.line(0,divLine*2,pageWidth,divLine*2);
          }
          if(j == 2){
            doc.addImage(this.logoSep, 'PNG', 5,(divLine*2)+2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth-58,(divLine*2)+2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG',(pageWidth/2)-7.5,(divLine*3)-20, 15, 15); // Logo TecTepic

            //Numero de alumno
            doc.setLineWidth(.3)
            doc.setDrawColor(0)
            doc.setFillColor(20, 43, 88)
            doc.circle(pageWidth-25,(divLine*3)-20,10, 'FD')
            doc.setTextColor(255,255,255);
            doc.setFontSize(30);
            doc.text((cont).toString(), pageWidth-25,(divLine*3)-16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2,178.5, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2,193.5, 'center');
            doc.line(0,divLine*3,pageWidth,divLine*3);
          }
          if(j == 3){
            doc.addImage(this.logoSep, 'PNG', 5,(divLine*3)+2, 60, 14); // Logo Sep
            doc.addImage(this.logoTecNM, 'PNG', pageWidth-58,(divLine*3)+2, 53, 14); // Logo TecNM
            doc.addImage(this.logoTecTepic, 'PNG',(pageWidth/2)-7.5,(divLine*4)-20, 15, 15); // Logo TecTepic

            //Numero de alumno
            doc.setLineWidth(.3)
            doc.setDrawColor(0)
            doc.setFillColor(20, 43, 88)
            doc.circle(pageWidth-25,(divLine*4)-20,10, 'FD')
            doc.setTextColor(255,255,255);
            doc.setFontSize(30);
            doc.text((cont).toString(), pageWidth-25,(divLine*4)-16, 'center');
            cont++;

            // Nombre y Carrera
            doc.setTextColor(0);
            doc.setFontSize(22);
            doc.text(divAlumnosBallotPaper[i][j].nameLastName, pageWidth / 2,252.75, 'center');
            doc.setFontSize(13);
            doc.text(divAlumnosBallotPaper[i][j].carreerComplete, pageWidth / 2,267.75, 'center');
          }
        }
        if(i < divAlumnosBallotPaper.length-1){
          doc.addPage(); // Agregar una nueva página al documento cuando cambie el segmento de alumnos
        }
      }
      window.open(doc.output('bloburl'), '_blank'); // Abrir el pdf en una nueva ventana
    }else{
      this.notificationsServices.showNotification(2, 'Error','No hay alumnos  en estatus Verificado');
    }
  }

  confirmDegree(item){
    Swal.fire({
      title: 'Asignar Título',
      imageUrl: '../../assets/imgs/asignarTitulo.png',
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
    })
  }

  confirmRemoveDegree(item){
    Swal.fire({
      title: 'Remover Título',
      imageUrl: '../../assets/imgs/removerTitulo.png',
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
    })
  }

  // Asignar titulo
  degreeEvent(item){
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
      estatus : item.status,
      observations: item.observations ? item.observations:'',
      survey: item.survey ? item.survey:false,
      degree : true
    };
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.eventFilterReport();
      Swal.fire("Título Asignado", "Para: "+item.nameLastName, "success");
    }, (error) => {
      console.log(error);
    });
  }

  // Remover titulo
  degreeRemoveEvent(item){
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
      estatus : item.status,
      observations: item.observations ? item.observations:'',
      survey: item.survey ? item.survey:false,
      degree : false
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.eventFilterReport();
      Swal.fire("Título Removido", "Para: "+item.nameLastName, "success");
    }, (error) => {
      console.log(error);
    });
  }

  // Mostar modal para agregar y visualizar observaciones
  observationsModal(item){
    if(this.role === 'administration'){
      var id = 'observaciones';
      if(item.observations){
        Swal.fire({
          title: 'Observaciones',
          imageUrl: '../../assets/imgs/logros.png',
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: 'Custom image',
          html:
            '<textarea rows="4" cols="30" id="observaciones">'+item.observations+'</textarea>  ',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Guardar'
        }).then((result) => {
          if (result.value) {
            var observations = (<HTMLInputElement>document.getElementById(id)).value;
            this.saveObservations(item,observations);
          }
        })
      }else{
        Swal.fire({
          title: 'Observaciones',
          imageUrl: '../../assets/imgs/logros.png',
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
            var observations = (<HTMLInputElement>document.getElementById(id)).value;
            this.saveObservations(item,observations);
          }
        })
      }
    }
  }

  // Guardar observaciones
  saveObservations(item,newObservations){
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
      degree: item.degree ? item.degree:false,
      observations: newObservations,
      survey: item.survey ? item.survey:false,
      estatus: item.status
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.eventFilterReport();
      Swal.fire("Observaciones Guardadas", "Para: "+item.nameLastName, "success");
    }, (error) => {
      console.log(error);
    });
  }

  pageChanged(ev){
    this.page=ev;
  }

  eventFilter(item){
    if (item != ''){
      this.showTotal = false;
      var total = this.getNumberFilterItems(item).length;
      this.totalAlumnosFilter = total;
    }
    else {
      this.showTotal = true;
    }
  }

  getNumberFilterItems(item) {
    return this.alumnos.filter(function(alumno) {
      return alumno.nc.toLowerCase().indexOf(item.toLowerCase()) > -1 ||
             alumno.name.toLowerCase().indexOf(item.toLowerCase()) > -1 ||
             alumno.email.toLowerCase().indexOf(item.toLowerCase()) > -1 ;
    })
  }
}
