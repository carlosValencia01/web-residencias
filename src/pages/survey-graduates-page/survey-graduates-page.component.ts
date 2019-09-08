import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CookiesService } from 'src/services/cookie.service';

@Component({
  templateUrl: './survey-graduates-page.component.html',
  styleUrls: ['./survey-graduates-page.component.scss']
})
export class SurveyGraduatesPageComponent implements OnInit {
  public nc = null;
  public id = null;
  public eventActived = null;
  public data = null;

  //Datos del alumno
  public nombreAlumno = null;
  public ncAlumno = null;
  public correoAlumno = null;
  public carreraAlumno = null;


  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    ) {
      this.id=this.router.url.split('/')[2];
      this.nc=this.router.url.split('/')[3];

      this.firestoreService.getActivedEvent().subscribe(
        res => {
          this.eventActived = res[0].payload.doc.id;
          console.log(this.eventActived);

          this.firestoreService.getGraduate(this.id,this.eventActived).subscribe(
            res => {
              this.data = res.payload.data();
              if(this.data !== undefined){
                console.log("Alumno encontrado")
                this.nombreAlumno = this.data.nombreApellidos;
                this.ncAlumno = this.data.nc;
                this.correoAlumno = this.data.correo;
                this.carreraAlumno = this.data.carreraCompleta;
              }else{
                console.log("Alumno no encontrado/registrado")
              }
            }
          );
        }
      );
    }

  ngOnInit() {
  }

  goSurvey(event){ 
    this.router.navigate(['/survey',this.id,this.nc]);  
  }
}
