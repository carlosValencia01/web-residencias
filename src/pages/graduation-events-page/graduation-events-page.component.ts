import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NotificationsServices } from '../../services/notifications.service';
import { CookiesService } from 'src/services/cookie.service';

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

  constructor(
    private firestoreService: FirebaseService, 
    private router : Router,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService
    ) {
        if (this.cookiesService.getData().user.role !== 0 && 
        this.cookiesService.getData().user.role !== 5) {
          this.router.navigate(['/']);
        }

        this.firestoreService.getAllEvents().subscribe(
          ev =>{
            this.events = ev.map( data=> { return {id:data.payload.doc.id, status:data.payload.doc.get("estatus")}} );
            this.year=this.today.getFullYear()+"";                  
          }
        )
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
    let evento = document.getElementById("evento").classList.toggle("inactivo");
  }

  async saveEvent(){
    if(this.periodo!== ""){
     var oldEvent="";
     let i=0;
     let sub = this.firestoreService.getActivedEvent().subscribe(
       res=> {
        sub.unsubscribe();
          i++;   //por el subscribe y lo asincrono solo dejamos que se ejecute una vez cada que se llama la funcion             
          if(res.length>0 && i===1){
            oldEvent = res[0].payload.doc.id; //evento activo actual
  
            if(oldEvent === this.periodo){
              this.notificationsServices.showNotification(2, 'YA EXISTE UN EVENTO ACTIVO EN ESE PERIODO:',this.periodo);
            }else{

              //preguntar si se desea tener un nuevo evento activo
              let opcion = confirm(`¿DESEA CREAR EL EVENTO CON PERIODO ${this.periodo}?\n ESTO DESHABILITARA EL EVENTO DEL PERIODO ${oldEvent.toUpperCase()}`);
              console.log(opcion);
              
              if (opcion===true) {
                //cambiamos de evento activo
                this.firestoreService.setStatusEvent(0,oldEvent).then(
                  updated=>{
                    this.insertEvent("a");
                  }
                );
              }          
            }
            console.log("eje");
            
          }else{
            console.log("aja");
            if(i===1){
              this.insertEvent("i");
            }
          }
        }
      );
     
    }
  }

   insertEvent(msg){

    if(this.periodo!==""){
      
     this.firestoreService.createEvent(this.periodo,1).then(
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

}
