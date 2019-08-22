import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { Router } from '@angular/router';
import { NotificationsServices } from '../../services/notifications.service';
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

  constructor(
    private firestoreService: FirebaseService, 
    private router : Router,
    private notificationsServices: NotificationsServices 
    ) {

    this.firestoreService.getAllEvents().subscribe(
      ev =>{
        this.events = ev.map( data=> { return {id:data.payload.doc.id, status:data.payload.doc.get("estatus")}} );    
        
        this.year=this.today.getFullYear()+"";
                    
      }
    )
  }

  ngOnInit() {
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
                    sub.unsubscribe();
                    this.insertEvent("a");
                  }
                );
              }          
            }
            console.log("eje");
            
          }else{
            console.log("aja");
            if(i===1){

              sub.unsubscribe();
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
    this.firestoreService.getGraduates(event.id).subscribe(
      res =>{
        if(res.length === 0){
          this.notificationsServices.showNotification(2, 'No se encontraron alumnos, por favor primero importe los datos','');
      
        }else{
          this.router.navigate(['/listGraduates', event.id,event.status]);  
        }
      }
    );
  }

}
