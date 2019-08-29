import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NotificationsServices } from '../../services/notifications.service';
import { CookiesService } from 'src/services/cookie.service';
import * as years from 'ye-ars';

@Component({
  selector: 'app-graduation-events-page',
  templateUrl: './graduation-events-page.component.html',
  styleUrls: ['./graduation-events-page.component.scss']
})
export class GraduationEventsPageComponent implements OnInit {

  events = [];
  today = new Date();
  year="";
  closeResult="";
  periodo="";
  public role: string;

  model;
  yearsOptions = {
    count: 50
  };
  newYears=[];
  eventYear="";
  constructor(
    private firestoreService: FirebaseService, 
    private router : Router,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService
    ) {
        if (this.cookiesService.getData().user.role !== 0 && 
        this.cookiesService.getData().user.role !== 5 && 
        this.cookiesService.getData().user.role !== 6) {
          this.router.navigate(['/']);
        }

        this.firestoreService.getAllEvents().subscribe(
          ev =>{
            this.events = ev.map( data=> { return {id:data.payload.doc.id, status:data.payload.doc.get("estatus")}} );
            this.year=this.today.getFullYear()+"";                  
          }
        );
        this.newYears = years(this.yearsOptions);      
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
  }

  createEvent(){
    console.log("create");
    this.periodo="";
    this.eventYear="";
    let evento = document.getElementById("evento").classList.toggle("inactivo");
  }

  async saveEvent(){
    if(this.periodo!== "" && this.eventYear!==""){
     this.periodo = this.periodo+this.eventYear;
     this.firestoreService.createEvent(this.periodo,2).then(
      async created=>{
        await this.notificationsServices.showNotification(1, 'EVENTO CREADO CON PERIODO:',this.periodo); 
        this.createEvent();
       }
     );
     
    }
  }

  checkEvent(event){
   let sub= this.firestoreService.getGraduates(event.id).subscribe(
      res =>{
        sub.unsubscribe();
        if(res.length === 0){
          this.notificationsServices.showNotification(2, 'No se encontraron alumnos, por favor primero importe los datos','');
          
        }else{          
          this.router.navigate(['/listGraduates', event.id]);  
        }
      }
    );        
  }

  changeEventStatus(ev){
    console.log(ev);
    
    let i=0, oldEvent="";
    if(ev.status === 2){

      let sub = this.firestoreService.getActivedEvent().subscribe(
        res=> {
         sub.unsubscribe();
           i++;   //por el subscribe y lo asincrono solo dejamos que se ejecute una vez cada que se llama la funcion             
           if(res.length>0 && i===1){
             oldEvent = res[0].payload.doc.id; //evento activo actual
               
               //preguntar si se desea tener un nuevo evento activo
               let opcion = confirm(`¿DESEA ACTIVAR EL EVENTO CON PERIODO ${ev.id.toUpperCase()}?\n ESTO DESHABILITARA EL EVENTO DEL PERIODO ${oldEvent.toUpperCase()}`);              
               
               if (opcion===true) {
                 //cambiamos de evento activo
                 this.firestoreService.setStatusEvent(3,oldEvent).then(
                   updated=>{
                     this.firestoreService.setStatusEvent(1,ev.id).then(
                       up=> this.notificationsServices.showNotification(1, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`,'')
                     );
                   }
                 );
               }                                    
           }else{             
             if(i===1){
              this.firestoreService.setStatusEvent(1,ev.id).then(
                up=> this.notificationsServices.showNotification(1, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`,'')
              );
             }
           }
         }
       );
    }else{
      this.firestoreService.setStatusEvent(3,ev.id).then(
        up=> this.notificationsServices.showNotification(1, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`,'')
      );
    }
    
  }

}
