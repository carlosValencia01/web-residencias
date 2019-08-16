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
  public alumnos = [];
  page = 1;
  pageSize = 10;
  
  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private graduationProv : GraduationProvider,
    private cookiesService: CookiesService,
    private router: Router
    ) {
      if (this.cookiesService.getData().user.role !== 0 && 
      this.cookiesService.getData().user.role !== 1) {
        this.router.navigate(['/']);
      }
    }

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
          email: alumnosData.payload.doc.data().correo,
          status: alumnosData.payload.doc.data().estatus
        });
      }) 
    });
  }
  //3 estatus Pagado,Presente,Mencionado

  paidEvent(item){
    console.log(item);  
    let dataUpdate = {
      nc : item.nc,
      nombre : item.name,
      carrera : item.carreer,
      correo : item.email,
      estatus: 'Pagado'
    }
    this.firestoreService.updateGraduate(item.id,dataUpdate).then(() => {
      this.notificationsServices.showNotification(1, 'Pago confirmado para:',item.nc);
    }, (error) => {
      console.log(error);
    });  
  }
  
  confirmPaidEvent(item){
    var opcion = confirm("CONFIRMAR PAGO PARA:"+"\n"+'NC: '+item.nc+"\n"+'Nombre: '+item.name);
    if (opcion == true) {
      this.paidEvent(item);
    }
  }
  //Enviar invitación al alumno seleccionado (status == Pagado)
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

  //Enviar invitación a todos los alumnos (status = pagado)
  sendMailAll(){
    this.alumnos.forEach(async student =>{
      if(student.email){
        await this.sendOneMail(student);
      }
    });
  }
}
