import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';


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
    private notificationsServices: NotificationsServices
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
  
  enviarInvitacion(item) {
    console.log(this.alumnos);
    this.notificationsServices.showNotification(1, 'Invitación enviada a:',item.nc+'\n'+item.name+'\n'+item.carreer+'\n'+item.email);
  }

}
