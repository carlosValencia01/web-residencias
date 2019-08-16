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
      this.firestoreService.getGraduates().subscribe((alumnosSnapshot) => {
        alumnosSnapshot.forEach((alumnosData: any) => {
          if(this.ncInput==alumnosData.payload.doc.data().nc){
            this.docId = alumnosData.payload.doc.id;
            let data = {
              nc : alumnosData.payload.doc.data().nc,
              nombre : alumnosData.payload.doc.data().nombre,
              carrera : alumnosData.payload.doc.data().carrera,
              estatus: ''
            }
            this.dataUpdate = data;
            data = null;
            this.hidden = true;
          }
        })
        //console.log (this.dataUpdate)
        if(this.dataUpdate == null){
          this.notificationsServices.showNotification(2, 'Error','No se encontró alumno con nc: '+this.ncInput);
        }
      });
  }

  updateEmail() {
    if (!this.formValidation()) {
      let newEmail = this.formEmailGraduate.get('emailGraduateInput').value;
      this.dataUpdate.correo=newEmail;
      //Actualizar registro
      if(this.dataUpdate != null){
        this.firestoreService.updateGraduate(this.docId,this.dataUpdate).then(() => {
          this.initializeForm();
          this.notificationsServices.showNotification(1,'Exito','Correo actualizado exitosamente');
        }, (error) => {
          console.log(error);
        });       
      }
      else{
        this.notificationsServices.showNotification(2, 'Error','No se encontró alumno con nc: '+this.ncInput);
      }
    }
  }
}