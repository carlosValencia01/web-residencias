import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { FormGroup,FormBuilder, Validators, FormControl } from '@angular/forms';
import { NotificationsServices } from '../../services/notifications.service';
import { resolve } from 'url';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-emailgraduation-page',
  templateUrl: './register-emailgraduation-page.component.html',
  styleUrls: ['./register-emailgraduation-page.component.scss']
})
export class RegisterEmailgraduationPageComponent implements OnInit {


  @ViewChild('emailgraduateinput') emailGraduateInput:  ElementRef;

  formEmailGraduate: FormGroup;
  errorEmail: boolean = false;
  errorForm: boolean = false;
  correo:string='';
  
  //Buscar alumno
  public ncInput = '';
  public dataUpdate;
  public docId;
  public hidden;
  public foundNc;

  constructor(
    private firestoreService: FirebaseService,
    private formBuilder: FormBuilder,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    ) {
      if (this.cookiesService.getData().user.role !== 0 &&
        this.cookiesService.getData().user.role !== 1) {
          this.router.navigate(['/']);
        }
    }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.formEmailGraduate = this.formBuilder.group({
      'emailGraduateInput': ['', [Validators.required, Validators.email]],
    });
    this.ncInput = '';
    this.dataUpdate = null;
    this.docId = null;
    this.hidden = false;
    this.foundNc = true;
  }

  formValidation(): boolean {
    let invalid = false;
    this.errorForm = false;
    this.errorEmail = false;
    if (this.formEmailGraduate.invalid) {
      this.errorForm = true;
      this.errorEmail = true;
      invalid = true;
    }
    return invalid;
  }

  searchAlumno(){
      this.foundNc = true;
      if (this.ncInput !== '') {
        this.firestoreService.getGraduates(this.router.url.split('/')[2]).subscribe((alumnosSnapshot) => {
          alumnosSnapshot.forEach((alumnosData: any) => {
            if(this.ncInput === alumnosData.payload.doc.data().nc){
              this.docId = alumnosData.payload.doc.id;
              let data = {
                nc : alumnosData.payload.doc.data().nc,
                nombre : alumnosData.payload.doc.data().nombre,
                nombreApellidos : alumnosData.payload.doc.data().nombreApellidos,
                carrera : alumnosData.payload.doc.data().carrera,
                carreraCompleta : alumnosData.payload.doc.data().carreraCompleta,
                estatus: alumnosData.payload.doc.data().estatus,
                degree: alumnosData.payload.doc.data().degree,
                observations: alumnosData.payload.doc.data().observations ? alumnosData.payload.doc.data().observations:'',
                survey: alumnosData.payload.doc.data().survey ? alumnosData.payload.doc.data().survey:false,
                mejorPromedio: alumnosData.payload.doc.data().mejorPromedio ? alumnosData.payload.doc.data().mejorPromedio:false ,
                promedio: alumnosData.payload.doc.data().promedio ? alumnosData.payload.doc.data().promedio:'' 
              }              
              this.dataUpdate = data;
              console.log(this.dataUpdate);
              data = null;
              this.hidden = true;
            }
          })
          if(this.dataUpdate === null){
            this.foundNc = false;
          }
        });
      } else {
        this.notificationsServices.showNotification(2, 'Atención','No se ha ingresado ningún número de contról.');
      }
      
  }

  updateEmail() {
    let collection=this.router.url.split('/')[2];
    
    if (!this.formValidation()) {
      let newEmail = this.formEmailGraduate.get('emailGraduateInput').value;
      this.dataUpdate.correo=newEmail;
      //Actualizar registro
      if(this.dataUpdate != null){
        this.firestoreService.updateGraduate(this.docId,this.dataUpdate,collection).then(() => {
          this.notificationsServices.showNotification(0,'Exito','Correo actualizado exitosamente para '+this.dataUpdate.nc);
          this.initializeForm();
        }, (error) => {
          console.log(error);
        });       
      }
      else{
        this.notificationsServices.showNotification(1, 'Error','No se encontró alumno con nc: '+this.ncInput);
      }
    }
  }
}