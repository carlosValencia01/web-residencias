import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';


@Component({
  templateUrl: './survey-graduates-page.component.html',
  styleUrls: ['./survey-graduates-page.component.scss']
})
export class SurveyGraduatesPageComponent implements OnInit {
  public nc = null;
  public id = null;
  public eventActived = null;
  public data = null;

  // Datos del alumno
  graduateForm: FormGroup;
  public nombreAlumno: string = null;
  public ncAlumno: string = null;
  public correoAlumno: string = null;
  public telefonoAlumno: string = null;
  public carreraAlumno: string = null;
  public egresoAlumno: Date = null;
  public tituloAlumno: string = null;
  public generoAlumno: string = null;


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

  validateForm() {
    this.graduateForm = this.formBuilder.group({
      'nombreAlumno' : [this.nombreAlumno, [Validators.required]],
      'ncAlumno' : [this.ncAlumno, Validators.required],
      'correoAlumno' : [this.correoAlumno, Validators.required],
      'telefonoAlumno' : [this.telefonoAlumno, Validators.required],
      'carreraAlumno' : [this.carreraAlumno, Validators.required],
      'egresoAlumno' : [new Date(this.egresoAlumno), Validators.required],
      'tituloAlumno' : [this.tituloAlumno, []],
      'generoAlumno' : [this.generoAlumno, Validators.required],
    });
  }

  getAlumnData() {
    this.id = this.router.url.split('/')[3];
    this.nc = this.router.url.split('/')[4];
    this.firestoreService.getActivedEvent().subscribe(
      res => {
        this.eventActived = res[0].payload.doc.id;
        this.firestoreService.getGraduate(this.id, this.eventActived).subscribe(
          res => {
            this.data = res.payload.data();
            if (this.data !== undefined) { // Verificar que existan datos de alumno
              if (!this.data.survey) { // Verificar que la encuesta aun no sea contestada
                this.nombreAlumno = this.data.nombreApellidos;
                this.ncAlumno = this.data.nc;
                this.correoAlumno = this.data.correo;
                this.telefonoAlumno = this.data.telefono ? this.data.telefono : '';
                this.carreraAlumno = this.data.carreraCompleta;
                this.egresoAlumno = this.data.fechaEgreso ? this.data.fechaEgreso : '';
                this.tituloAlumno = (this.data.degree) ? 'Si' : 'No';
                this.generoAlumno = (this.data.generoAlumno) ? this.data.generoAlumno : '';
                this.validateForm();
              } else {
                Swal.fire({
                  title: 'Encuesta Finalizada',
                  text: 'La encuesta ya fué contestada',
                  type: 'info',
                  allowOutsideClick: false,
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar'
                }).then((result) => {
                  if (result.value) {
                    window.location.assign('/'); // salir de la encuesta
                  }
                });
              }
            }
          }
        );
      }
    );
  }

  async onFormSubmit(form: NgForm) {
    await this.saveProfile(this.id, form);
  }

  async saveProfile(idDoc, data) {
    this.firestoreService.getProfile(idDoc).subscribe(
      res => {
          this.firestoreService.createProfile(idDoc, data).then(
            created => {
              window.location.assign('/graduation/survey/' + this.id + '/' + this.nc);
            }
          );
      }
    );
  }
}
