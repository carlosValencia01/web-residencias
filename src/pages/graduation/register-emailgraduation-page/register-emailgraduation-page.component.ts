import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from 'src/services/graduation/firebase.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-emailgraduation-page',
  templateUrl: './register-emailgraduation-page.component.html',
  styleUrls: ['./register-emailgraduation-page.component.scss']
})
export class RegisterEmailgraduationPageComponent implements OnInit {
  @ViewChild('emailgraduateinput') emailGraduateInput:  ElementRef;
  formEmailGraduate: FormGroup;
  errorEmail = false;
  errorForm = false;
  correo = '';
  // Buscar alumno
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
                observations: alumnosData.payload.doc.data().observations
              };
              this.dataUpdate = data;
              data = null;
              this.hidden = true;
            }
          });
          if (this.dataUpdate === null) {
            this.foundNc = false;
          }
        });
      } else {
        this.notificationsServices.showNotification(3, 'Atención', 'No se ha ingresado ningún número de contról.');
      }
  }

  updateEmail() {
    const collection = this.router.url.split('/')[2];
    if (!this.formValidation()) {
      const newEmail = this.formEmailGraduate.get('emailGraduateInput').value;
      this.dataUpdate.correo = newEmail;
      // Actualizar registro
      if (this.dataUpdate != null) {
        this.firestoreService.updateGraduate(this.docId,this.dataUpdate,collection).then(() => {
          this.notificationsServices.showNotification(1,'Exito','Correo actualizado exitosamente para '+this.dataUpdate.nc);
          this.initializeForm();
        }, (error) => {
          console.log(error);
        });
      } else {
        this.notificationsServices.showNotification(2, 'Error', 'No se encontró alumno con nc: ' + this.ncInput);
      }
    }
  }
}
