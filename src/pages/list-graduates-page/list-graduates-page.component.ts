import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';

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
  public role: string;
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
        console.log(this.alumnos);
               
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

  // Enviar invitación a todos los alumnos
  sendMailAll(){
    this.alumnos.forEach(async student =>{
      if(student.email){
        await this.sendOneMail(student);
      }
    });
  }

  pageChanged(ev){
    this.page=ev;    
  }

}
