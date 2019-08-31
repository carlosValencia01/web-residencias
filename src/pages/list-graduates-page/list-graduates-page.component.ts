import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';
import { ExporterService } from 'src/services/exporter.service'
import Swal from 'sweetalert2';
import { filter } from 'rxjs/operators';


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

  //Variable donde se almacenan todos los alumnos
  public alumnos = [];

  //Variable donde se almacenan los alumnos filtrados
  public alumnosReport = [];


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
    private excelService: ExporterService
    ) {
      if (this.cookiesService.getData().user.role !== 0 && 
      this.cookiesService.getData().user.role !== 5 &&
      this.cookiesService.getData().user.role !== 6)
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
    }
    this.readEmail();
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
          status: alumno.payload.doc.get("estatus")
        }});
        this.alumnosReport =  this.alumnos;
      });
  }

  // Cambias estatus a Pagado
  paidEvent(item){
    console.log(item);  
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
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
    console.log(item);  
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
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
    console.log(item);  
    let itemUpdate = {
      nc : item.nc,
      nombre : item.name,
      nombreApellidos : item.nameLastName,
      carrera : item.carreer,
      carreraCompleta : item.carreerComplete,
      correo : item.email,
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
        //this.paidEvent(item);
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
        //this.removePaidEvent(item);
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
        //this.asistenceEvent(item);
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
        //this.sendOneMail(item);
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
          //this.sendMailAll();
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

  ////////////////////Obetener Valor del checkbox de Estatus/////////////////////////
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
      }

  }
  ////////////////////FILTRADO POR CARRERA O ESTATUS/////////////////////////
  filterItems(carreer,sR,sP,sV,sA,sM) {
    return this.alumnos.filter(function(alumno) {
      return alumno.carreer.toLowerCase().indexOf(carreer.toLowerCase()) > -1 && 
             alumno.status.toLowerCase().indexOf(sR.toLowerCase()) > -1 || 
             alumno.status.toLowerCase().indexOf(sP.toLowerCase()) > -1 || 
             alumno.status.toLowerCase().indexOf(sV.toLowerCase()) > -1 || 
             alumno.status.toLowerCase().indexOf(sA.toLowerCase()) > -1 || 
             alumno.status.toLowerCase().indexOf(sM.toLowerCase()) > -1;
    })
  }
  ///////////////////////////////////////////////////////////////////////////

 // Generar reporte de alumnos
  generateReport(){
    var doc = new jsPDF('p', 'pt');
  
    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let header = "Reporte Alumnos Graduados "+this.searchCarreer;
    doc.setTextColor(0,0,0);
    doc.setFontSize(20);
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
    let footer = "© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n"+today.getDate()+'/' +mes+'/'+today.getFullYear()+' - '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
    doc.setTextColor(100);
    doc.setFontStyle('bold');
    doc.setFontSize(10);
    doc.text(footer, pageWidth / 2, pageHeight  - 30, 'center');

    doc.output('dataurlnewwindow');    
    doc.save("Reporte Graduacion "+this.searchCarreer+".pdf");    
  }

  // Exportar alumnos a excel
  excelExport(): void{
    console.log('Exportando datos...');
    console.log(this.alumnosReport);
    this.excelService.exportAsExcelFile(this.alumnosReport,'Graduacion '+this.searchCarreer);
  }
  
  pageChanged(ev){
    this.page=ev;  
  }

}
