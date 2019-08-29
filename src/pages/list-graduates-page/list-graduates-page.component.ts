import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';

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
  public searchCarreer : string = '';
  public searchStatus : string = '';
  public alumnos = [];
  public alumnosReport;
  public role: string;
  public no = 0;
  page=1;
  pageSize = 10;
  collection = null;
  status = 0;
  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv : GraduationProvider,
    private cookiesService: CookiesService,
    private router: Router
    ) {
      if (this.cookiesService.getData().user.role !== 0 && 
      this.cookiesService.getData().user.role !== 5) {
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
        this.alumnosReport =  this.filterItems(this.searchCarreer);
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
    var opcion = confirm("CONFIRMAR PAGO PARA:"+"\n"+'NC: '+item.nc+"\n"+'Nombre: '+item.name);
    if (opcion == true) {
      this.paidEvent(item);
    }
  }

  // Confirmar remover pago
  confirmRemovePaidEvent(item){
    var opcion = confirm("REMOVER PAGO PARA:"+"\n"+'NC: '+item.nc+"\n"+'Nombre: '+item.name);
    if (opcion == true) {
      this.removePaidEvent(item);
    }
  }

  // Confirmar asistencia
  confirmPresenceEvent(item){
    var opcion = confirm("CONFIRMAR ASISTENCIA PARA:"+"\n"+'NC: '+item.nc+"\n"+'Nombre: '+item.name);
    if (opcion == true) {
      this.asistenceEvent(item);
    }
  }

  // Confirmar envio de invitación
  confirmSendEmail(item){
    var opcion = confirm("ENVIAR INVITACIÓN A:"+"\n"+'NC: '+item.nc+"\n"+'Nombre: '+item.name);
    if (opcion == true) {
      this.sendOneMail(item);
    }
  }

  // Enviar invitación al alumno seleccionado (status == Pagado)
  sendOneMail(item) {
    if(item.status == 'Pagado'){
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
      var opcion = confirm("ENVIAR INVITACIÓN A TODOS LOS ALUMNOS:");
      if (opcion == true) {
        this.sendMailAll();
      }
    }

  // Enviar invitación a todos los alumnos
  sendMailAll(){
    this.alumnos.forEach(async student =>{
      if(student.email){
        await this.sendOneMail(student);
      }
    });
  }

  // Cambiar valor del alumnosReport dependiendo del filtro de carrera
  loadInfoReport(){
    this.alumnosReport =  this.filterItems(this.searchCarreer);
  }

  // Filtrar elementos para generar reporte
  filterItems(query) {
    return this.alumnos.filter(function(elemento) {
      return elemento.carreer.toLowerCase().indexOf(query.toLowerCase()) > -1;
    })
  }

 // Generar reporte
  generateReport(){
    // Generando PDF
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
          if(data.row.cells[4].text[0] === 'Asistió'){
            data.cell.styles.fillColor = [26, 111, 0];
            data.cell.styles.textColor = [255,255,255];
          }      
          if(data.row.cells[4].text[0] === 'Registrado' || data.row.cells[3].text[0] === 'Pagado' || data.row.cells[3].text[0] === 'Mencionado' || data.row.cells[3].text[0] === 'Verificado'){
            data.cell.styles.fillColor = [202, 0, 10];
            data.cell.styles.textColor = [255,255,255];
          }
          if(data.row.cells[4].text[0] === 'Estatus'){
            data.cell.styles.fillColor = [21, 43, 84];
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
    doc.setTextColor(0,0,0);
    doc.setFontStyle('bold');
    doc.setFontSize(10);
    doc.text(footer, pageWidth / 2, pageHeight  - 30, 'center');


    doc.save("Reporte Graduacion "+this.searchCarreer+".pdf");
    }
  pageChanged(ev){
    this.page=ev;  
  }

}
