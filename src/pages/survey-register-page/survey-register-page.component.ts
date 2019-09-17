import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CookiesService } from 'src/services/cookie.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-survey-register-page',
  templateUrl: './survey-register-page.component.html',
  styleUrls: ['./survey-register-page.component.scss']
})
export class SurveyRegisterPageComponent implements OnInit {

  public nc = null;
  public id = null;
  public eventActived = null;
  public data = null;
  public exist = false;

  //Datos del alumno
  graduateForm: FormGroup;
  public nombreAlumno:string = null;
  public ncAlumno:string = null;
  public correoAlumno:string = null;
  public telefonoAlumno:string = null;
  public carreraAlumno:string = null;
  public egresoAlumno: Date = null;
  public tituloAlumno:string = null;


  constructor(
    private firestoreService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private formBuilder: FormBuilder,
    ) {
        this.getAlumnData();
      }

  ngOnInit() {
  }

  validateForm(){
    this.graduateForm = this.formBuilder.group({
      'nombreAlumno' : [this.nombreAlumno, [Validators.required]],
      'ncAlumno' : [this.ncAlumno, Validators.required],
      'correoAlumno' : [this.correoAlumno, Validators.required],
      'telefonoAlumno' : [this.telefonoAlumno, Validators.required],
      'carreraAlumno' : [this.carreraAlumno, Validators.required],
      'egresoAlumno' : [new Date(this.egresoAlumno), Validators.required],
      'tituloAlumno' : [this.tituloAlumno,[]],
    });
  }

  getAlumnData(){
    this.id=this.router.url.split('/')[2];
    this.nc=this.router.url.split('/')[3];
    this.firestoreService.getActivedEvent().subscribe(
      res => {
        this.eventActived = res[0].payload.doc.id;
        this.firestoreService.getGraduate(this.id,this.eventActived).subscribe(
          res => {
            this.data = res.payload.data();
            if(this.data !== undefined){ // Verificar que existan datos de alumno
              if(!this.data.survey){ // Verificar que la encuesta aun no sea contestada
                this.nombreAlumno = this.data.nombreApellidos ? this.data.nombreApellidos:'';
                this.ncAlumno = this.nc;
                this.correoAlumno = this.data.correo ? this.data.correo:'';
                this.telefonoAlumno = this.data.telefono ? this.data.telefono:'';
                this.carreraAlumno = this.data.carreraCompleta ? this.data.carreraCompleta:'';
                this.egresoAlumno = this.data.fechaEgreso ? this.data.fechaEgreso: '';
                this.tituloAlumno = (this.data.degree) ? 'Si':'No';
                this.validateForm();
              }else{
                Swal.fire({
                  title: 'Encuesta Finalizada',
                  text: "La encuesta ya fué contestada",
                  type: 'info',
                  allowOutsideClick: false,
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar'
                }).then((result) => {     
                  if (result.value) {
                    window.location.assign("/") //salir de la encuesta
                  }
                }) 
              }
            }
          }
        );
      }
    );
    this.firestoreService.getProfiles().subscribe((alumnosSnapshot) => {
      alumnosSnapshot.forEach((alumnosData: any) => {
        if(this.id === alumnosData.payload.doc.data().ncAlumno){
          this.exist = true;  
        }
      })
      if(!this.exist){
        this.nombreAlumno = '';
        this.ncAlumno = this.id;
        this.correoAlumno = '';
        this.telefonoAlumno = '';
        this.carreraAlumno = '';
        this.egresoAlumno = new Date();
        this.tituloAlumno = 'No';
        this.validateForm();
      }
      else{
          this.encuestaFinalizada();
      }
    });
  }

  async onFormSubmit(form:NgForm) {
    if(this.router.url.split('/')[3]){
      await this.saveProfile(this.id,form);
    }else{
      await this.saveNewProfile(form);
    }
  }

  async saveProfile(idDoc,data){
    this.firestoreService.getProfile(idDoc).subscribe(
      res => {
          this.firestoreService.createProfile(idDoc,data).then(
            created=>{
              this.router.navigate(['/surveyQuestions',this.id,this.nc]);  
            }
          );    
      }
    ); 
  }

  async saveNewProfile(data){
    this.firestoreService.createProfileNew(data).then(
      created=>{
        this.firestoreService.getProfiles().subscribe((alumnosSnapshot) => {
          alumnosSnapshot.forEach((alumnosData: any) => {
            if(this.id === alumnosData.payload.doc.data().ncAlumno){
              var docId = alumnosData.payload.doc.id;
              var docNc = alumnosData.payload.doc.data().ncAlumno;   
              window.location.assign('/surveyQuestions/'+docId+'/'+docNc) 
            }
          })
        });
      }
    );    
  }

  encuestaFinalizada(){
    Swal.fire({
      title: 'Encuesta Finalizada',
      text: "La encuesta ya fué contestada",
      type: 'info',
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => {     
      if (result.value) {
        this.router.navigate(['/surveyFind']);  
      }
    })
  }

}
