import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { GraduationProvider } from '../../providers/graduation.prov';

@Component({
  selector: 'app-list-graduates-page',
  templateUrl: './list-graduates-page.component.html',
  styleUrls: ['./list-graduates-page.component.scss']
})
export class ListGraduatesPageComponent implements OnInit {
  public searchText : string;
  public searchCarreer : string = '';
  public alumnos = [];

  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv : GraduationProvider
    ) { }

  ngOnInit() {
    this.readEmail();
  }

  readEmail(){
    this.firestoreService.getGraduates().subscribe((alumnosSnapshot) => {
      this.alumnos = [];
      alumnosSnapshot.forEach((alumnosData: any) => {
        this.alumnos.push({
          id : alumnosData.payload.doc.id,
          nc : alumnosData.payload.doc.data().nc,
          name : alumnosData.payload.doc.data().nombre,
          carreer : alumnosData.payload.doc.data().carrera,
          email: alumnosData.payload.doc.data().correoElectronico,
          status: alumnosData.payload.doc.data().status
        });
      }) 
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
