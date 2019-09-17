import { Component, OnInit,OnDestroy } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsServices } from '../../services/notifications.service';
import { CookiesService } from 'src/services/cookie.service';
import * as years from 'ye-ars';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-graduation-events-page',
  templateUrl: './graduation-events-page.component.html',
  styleUrls: ['./graduation-events-page.component.scss']
})
export class GraduationEventsPageComponent implements OnInit,OnDestroy {

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
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    ) {

      if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log('events');
    
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
           i++;   // Por el subscribe y lo asincrono solo dejamos que se ejecute una vez cada que se llama la funcion             
           if(res.length>0 && i===1){
             oldEvent = res[0].payload.doc.id; // Evento activo actual
               // Preguntar si se desea tener un nuevo evento activo      
              Swal.fire({
              title: `¿DESEA ACTIVAR EL EVENTO CON PERIODO ${ev.id.toUpperCase()}?`,
              text: `ESTO DESHABILITARA EL EVENTO DEL PERIODO ${oldEvent.toUpperCase()}`,
              type: 'question',
              showCancelButton: true,
              allowOutsideClick: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              cancelButtonText: 'Cancelar',
              confirmButtonText: 'Activar'
            }).then((result) => {
              if (result.value) {
                // Cambiamos de evento activo
                this.firestoreService.setStatusEvent(3,oldEvent).then(
                  updated=>{
                    this.firestoreService.setStatusEvent(1,ev.id).then(
                      up=> this.notificationsServices.showNotification(1, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`,'')
                    );
                  }
                );
              }
            })
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
      Swal.fire({
        title: `¿DESEA FINALIZAR EL EVENTO CON PERIODO ${ev.id.toUpperCase()}?`,
        text: `ESTO DESHABILITARA EL EVENTO DE FORMA PERMANENTE`,
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Finalizar'
      }).then((result) => {
        if (result.value) {
          // Finalizar de evento activo
          this.firestoreService.setStatusEvent(3,ev.id).then(
            up=> this.notificationsServices.showNotification(1, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`,'')
          );
        }
      })
    }
    
  }

}
