import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-list-graduates-page',
  templateUrl: './list-graduates-page.component.html',
  styleUrls: ['./list-graduates-page.component.scss']
})
export class ListGraduatesPageComponent implements OnInit {
  public searchText : string;
  public searchCarreer : string = '';
  public alumnos = [];
  
  pageSize = 10;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv : GraduationProvider
    ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageSize,      
      responsive: true,      
      
      /* below is the relevant part, e.g. translated to spanish */ 
      language: {
        processing: "Procesando...",
        search: "Buscar: ",
        searchPlaceholder:"Nombre, NC, carrera, estatus, email",        
        lengthMenu: "",
        info: "",
        infoEmpty: "",
        infoFiltered: "",
        infoPostFix: "",
        loadingRecords: "Cargando registros...",
        zeroRecords: "No se encontraron registros",
        emptyTable: "No hay datos disponibles",
        paginate: {
          first: "Primero",
          previous: "Anterior",
          next: "Siguiente",
          last: "Último"
        },
        aria: {
          sortAscending: ": Activar para ordenar la tabla en orden ascendente",
          sortDescending: ": Activar para ordenar la tabla en orden descendente"
        }
      }      
    };    
    this.readEmail();
    
  }

  readEmail(){
    this.firestoreService.getGraduates().subscribe(async (alumnosSnapshot) => {      
      this.alumnos = alumnosSnapshot.map( (alumno) =>{
        return {
          id:alumno.payload.doc.id,
          nc : alumno.payload.doc.data().nc,
          name : alumno.payload.doc.data().nombre,
          carreer : alumno.payload.doc.data().carrera,
          email: alumno.payload.doc.data().correoElectronico,
          status: alumno.payload.doc.data().status
        }});
        this.dtTrigger.next();               
    });
  }
  
  //envio del codigo qr por correo
  enviarInvitacion(item) {
    
    this.graduationProv.sendQR(item.email,item.id).subscribe(
      res=>{
        this.notificationsServices.showNotification(1, 'Invitación enviada a:',item.nc+'\n'+item.name+'\n'+item.carreer+'\n'+item.email);
      },
      err =>{this.notificationsServices.showNotification(2, 'No se pudo enviar el correo a:',item.nc+'\n'+item.name+'\n'+item.carreer+'\n'+item.email);
      }
    );
  }

  sendMailAll(){
    this.alumnos.forEach(async student =>{
      if(student.email){
        await this.enviarInvitacion(student);
      }
    });
  }
}
