import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from 'src/services/graduation/firebase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { Subscription } from 'rxjs';
import * as years from 'ye-ars';
import Swal from 'sweetalert2';
import { NewEventComponent } from 'src/modals/graduation/new-event/new-event.component';
import { MatDialog } from '@angular/material';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-graduation-events-page',
  templateUrl: './graduation-events-page.component.html',
  styleUrls: ['./graduation-events-page.component.scss']
})
export class GraduationEventsPageComponent implements OnInit, OnDestroy {
  events = [];
  today = new Date();
  year = '';
  closeResult = '';
  periodo = '';
  public role: string;
  model;
  yearsOptions = {
    count: 50
  };
  newYears = [];
  eventYear = '';
  eventsSub : Subscription;
  constructor(
    private firestoreService: FirebaseService,
    private router: Router,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    public dialog: MatDialog,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }

     this.eventsSub = this.firestoreService.getAllEvents().subscribe(
        ev => {
          this.events = ev.map( data => (
            {
              id: data.payload.doc.id, 
              status: data.payload.doc.get('estatus'),
              date: data.payload.doc.get('date'),
              limitDate: data.payload.doc.get('limitDate'),
              hour: data.payload.doc.get('hour'),              
              directorName: data.payload.doc.get('directorName'),              
              directorMessage: data.payload.doc.get('directorMessage'),              
              totalTickets: data.payload.doc.get('totalTickets'),              
              studentTickets: data.payload.doc.get('studentTickets'),              
            }) );
          this.year = this.today.getFullYear() + '';
        }
      );
      this.newYears = years(this.yearsOptions);
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.eventsSub.unsubscribe();
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

  createEvent() {
    const linkModal = this.dialog.open(NewEventComponent, {
      data: {
        operation: 'create'        
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em',
      height: '750px'
    });
    linkModal.afterClosed().subscribe(
      event=>{         
        if(event.action === 'create'){         
          this.saveEvent(event);
        }
        // else this.refreshDataSource();
      },
      err=>console.log(err)
    );
  }

  async saveEvent(event) {
    const newEvent = {
      estatus:2,
      totalTickets: event.event.totalTickets,
      studentTickets: event.event.studentTickets,
      date: event.event.date,
      name: event.event.periodName + event.event.year,
      limitDate: event.event.limitDate ,
      hour: event.event.hour ,
      directorMessage: event.event.directorMessage,
      directorName: event.event.directorName
    };
        
    this.firestoreService.createEvent(newEvent.name, newEvent).then(
     async created => {
       await this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'EVENTO CREADO', '');       
      }
    );   
  }

  checkEvent(event) {
   const sub = this.firestoreService.getGraduates(event.id).subscribe(
      res => {
        sub.unsubscribe();
        if (res.length === 0) {
          this.notificationsServices.showNotification(eNotificationType.ERROR, 'No se encontraron alumnos, por favor primero importe los datos', '');

        } else {
          this.router.navigate(['/listGraduates', event.id]);
        }
      }
    );
  }

  changeEventStatus(ev) {
    console.log(ev);

    let i = 0, oldEvent = '';
    if (ev.status === 2) {

      const sub = this.firestoreService.getActivedEvent().subscribe(
        res => {
         sub.unsubscribe();
           i++;   // Por el subscribe y lo asincrono solo dejamos que se ejecute una vez cada que se llama la funcion
           if (res.length > 0 && i === 1) {
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
                this.firestoreService.setStatusEvent(3, oldEvent).then(
                  updated => {
                    this.firestoreService.setStatusEvent(1, ev.id).then(
                      up => this.notificationsServices.showNotification(eNotificationType.SUCCESS, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`, '')
                    );
                  }
                );
              }
            });
           } else {
             if (i === 1) {
              this.firestoreService.setStatusEvent(1, ev.id).then(
                up => this.notificationsServices.showNotification(eNotificationType.SUCCESS, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`, '')
              );
             }
           }
         }
       );
    } else {
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
          this.firestoreService.setStatusEvent(3, ev.id).then(
            up => this.notificationsServices.showNotification(eNotificationType.SUCCESS, `ESTATUS DEL PERIODO ${ev.id.toUpperCase()} ACTUALIZADO`, '')
          );
        }
      });
    }
  }

  updateEvent(event){

    const linkModal = this.dialog.open(NewEventComponent, {
      data: {
        operation: 'edit',
        event     
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em',
      height: '750px'
    });
    linkModal.afterClosed().subscribe(
      event=>{         
        if(event.action === 'edit'){         
          this.updateEv(event);
        }
        // else this.refreshDataSource();
      },
      err=>console.log(err)
    ); 
    
  }
  infoEvent(event){    
    let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    Swal.fire({
      html:
        `<h4>Detalles del evento</h4>
          <p style="text-align='left'">
            <h6><b>Fecha del evento:</b> ${new Date(event.date.toDate()).toLocaleDateString("es-MX", dateOptions)}</h6>
            <h6><b>Fecha limite de entrega de comprobante de pago:</b> <br/>${new Date(event.limitDate.toDate()).toLocaleDateString("es-MX", dateOptions)}</h6>        
            <br>
          </p>          
          <p style="text-align='left'">
            <h6><b>Boletos totales:</b> ${event.totalTickets}</h6>
            <h6><b>Boletos por estudiante:</b> ${event.studentTickets}</h6>        
            <h6><b>Hora de llegada:</b> ${event.hour}</h6>            
            <br>
          </p>
        `,
      allowOutsideClick: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Regresar'
    }).then((result) => { });
  }

  async updateEv(event){
    const newEvent = {
      estatus:1,
      totalTickets: event.event.totalTickets,
      studentTickets: event.event.studentTickets,
      date: event.event.date,
      name: event.event.id,
      limitDate: event.event.limitDate ,
      hour: event.event.hour ,
      directorMessage: event.event.directorMessage,
      directorName: event.event.directorName
    };
        
    this.firestoreService.updateEvent(newEvent.name, newEvent).then(
     async created => {
       await this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'EVENTO ACTUALIZADO', '');       
      }
    ); 
  }

  saveStudents(){
    const s = this.firestoreService.getGraduates('agodic2019').subscribe(
      students=>{
        s.unsubscribe();
        const studentsMap = students.map(st=> ({nc:st.payload.doc.get('nc'),}));
        console.log(studentsMap);
        studentsMap.forEach(elem=>{
          this.firestoreService.asignEvent('agodic2019',elem.nc).then(
            sd=>{console.log(elem.nc);
            }
          );
        });
      }
    )
  }
  
}
