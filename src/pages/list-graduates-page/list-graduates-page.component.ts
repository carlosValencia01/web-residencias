import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';
import { ExporterService } from 'src/services/exporter.service'
import Swal from 'sweetalert2';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { CheckboxControlValueAccessor } from '@angular/forms';


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

  //Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  //Variable donde se almacenan todos los alumnos
  public alumnos = [];

  //Variable donde se almacenan los alumnos filtrados
  public alumnosReport = [];

  //Variable para almacenar los alumnos verificados e imprimir papeletas
  public alumnosBallotPaper = [];


  public role: string;
  public no = 0;
  page=1;
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
    private imageToBase64Serv: ImageToBase64Service
    ) {
      if (this.cookiesService.getData().user.role !== 0 && 
      this.cookiesService.getData().user.role !== 5 &&
      this.cookiesService.getData().user.role !== 6 &&
      this.cookiesService.getData().user.role !== 9)
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
          degree: alumno.payload.doc.get("degree"),
          observations: alumno.payload.doc.get("observations")
        }});
        this.alumnosReport =  this.alumnos;
        this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer,'Verificado');
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
      degree: item.degree ? item.degree:'',
      observations: item.observations ? item.observations:'',
      estatus: 'Pagado'
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.notificationsServices.showNotification(1, 'Pago confirmado para:',item.nc);
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
      degree: item.degree ? item.degree:'',
      observations: item.observations ? item.observations:'',
      estatus: 'Registrado'
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.notificationsServices.showNotification(1, 'Pago removido para:',item.nc);
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
      degree: item.degree ? item.degree:'',
      observations: item.observations ? item.observations:'',
      estatus: 'Asistió'
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.notificationsServices.showNotification(1, 'Pago removido para:',item.nc);
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
      text: "Para: "+item.name,
      type: 'question',
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
    if(item.status == 'Verificado'){
      this.graduationProv.sendQR(item.email,item.id,item.name).subscribe(
        res=>{
          this.notificationsServices.showNotification(1, 'Invitación enviada a:',item.nc);
        },
        err =>{this.notificationsServices.showNotification(2, 'No se pudo enviar el correo a:',item.nc);
        }
      );
    }
    else{
      this.notificationsServices.showNotification(3,item.nc,'Aun no se realiza el pago correspondiente');
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

      if(Object.keys(this.alumnosReport).length === 0){
        if(!this.searchSRC && !this.searchSPC && !this.searchSVC && !this.searchSAC && !this.searchSMC){
          this.alumnosReport =  this.alumnos;
        }

        if(this.searchCarreer == '' && this.searchSR == '~' && this.searchSP == '~' && this.searchSV == '~' && this.searchSA == '~' && this.searchSM == '~'){
          this.alumnosReport =  this.alumnos;
        }

        if(this.searchCarreer != ''){
          this.alumnosReport = this.filterItemsCarreer(this.searchCarreer);
        }
      }
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

    doc.addImage(this.logoTecNM, 'PNG', 36, 2, 82, 35); // Logo TecNM
    doc.addImage(this.logoSep, 'PNG', pageWidth-147, 5, 110, 27); // Logo SEP

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

    this.notificationsServices.showNotification(1, 'Reporte Generado','Se generó reporte con filtros actuales.');
    window.open(doc.output('bloburl'), '_blank');
    //doc.save("Reporte Graduacion "+this.searchCarreer+".pdf");    
  }

  // Exportar alumnos a excel
  excelExport(){
    this.excelService.exportAsExcelFile(this.alumnosReport,'Graduacion '+this.searchCarreer);
    this.notificationsServices.showNotification(1, 'Datos Exportados','Se exportaron datos con filtros actuales.');
  }

  // Generar papeletas de alumnos verificados
  generateBallotPaper(){
    // Obtener alumnos cuyo estatus sea 'Verificado' && Carrera = al filtro seleccionado
    this.alumnosBallotPaper = this.filterItemsVerified(this.searchCarreer,'Verificado');

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
          doc.addImage(this.logoTecTepic, 'PNG',(pageWidth/2)-7.5,(divLine)-20, 15, 15); // Logo TecTepic
          
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
    //doc.save("Papeletas Graduación "+this.searchCarreer+".pdf");    
  }

  confirmDegree(item){
    Swal.fire({
      title: 'Asignar Título',
      text: "Para "+item.nameLastName,
      type: 'question',
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
      text: "Para "+item.nameLastName,
      type: 'question',
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
      degree : true
    };
    // console.log(itemUpdate);
    
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.notificationsServices.showNotification(1, 'Título asignado para:',item.nc);
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
      degree : false
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      this.notificationsServices.showNotification(1, 'Título removido para:',item.nc);
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
          imageUrl: '../../assets/icons/observations.svg',
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
          imageUrl: '../../assets/icons/observations.svg',
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
      degree: item.degree ? item.degree:'',
      observations: newObservations,
      estatus: item.status
    }
    this.firestoreService.updateGraduate(item.id,itemUpdate,this.collection).then(() => {
      Swal.fire("Observaciones Guardadas", "Para: "+item.nameLastName, "success");
    }, (error) => {
      console.log(error);
    });  
  }
  
  pageChanged(ev){
    this.page=ev;  
  }

}
