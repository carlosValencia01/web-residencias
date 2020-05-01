import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { Router, ActivatedRoute } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'app-survey-list-page',
  templateUrl: './survey-list-page.component.html',
  styleUrls: ['./survey-list-page.component.scss']
})
export class SurveyListPageComponent implements OnInit {
  public alumnosEncuestados = [];
  public role: string;
  public totalAlumnos;
  page = 1;
  pag;
  pageSize = 5;

  constructor(
    private firestoreService: FirebaseService,
    private cookiesService: CookiesService,
    private notificationsServices: NotificationsServices,
    private router: Router,
  ) {
      const rol = this.cookiesService.getData().user.role;
      if (rol !== 0 && rol !== 10) {
        this.router.navigate(['/']);
      }
  }

  ngOnInit() {
    switch (this.cookiesService.getData().user.role) {
      case 0:
        this.role = 'administration';
        break;
      case 1:
        this.role = 'secretary';
        break;
      case 2:
        this.role = 'student';
        break;
      case 3:
        this.role = 'employee';
        break;
      case 4:
        this.role = 'rechumanos';
        break;
      case 5:
        this.role = 'comunication';
        break;
      case 6:
        this.role = 'coordinator';
        break;
      case 9:
        this.role = 'recfinancieros';
        break;
      case 10:
        this.role = 'vinculation';
        break;
    }
    this.readSurvey();
  }

  readSurvey() {
    this.firestoreService.getSurvey().subscribe(async (surveySnapshot) => {
      this.alumnosEncuestados = surveySnapshot.map( (alumno) => {
        if (alumno.payload.doc.get('egresoAlumno') != null ) {
          var dateEgreso = new Date((alumno.payload.doc.get('egresoAlumno').seconds) * 1000);
          var fechaEgreso = this.convertirFecha(dateEgreso);
        } else {
          var fechaEgreso = '';
        }
        if (alumno.payload.doc.get('fechaEncuesta') != null ) {
          var dateEncuesta = new Date((alumno.payload.doc.get('fechaEncuesta').seconds) * 1000);
          var fechaEncuesta = this.convertirFecha(dateEncuesta);
        } else {
          var fechaEncuesta = '';
        }

        return {
          ID : alumno.payload.doc.id,
          NC : alumno.payload.doc.get('ncAlumno'),
          Nombre : alumno.payload.doc.get('nombreAlumno'),
          Genero : alumno.payload.doc.get('generoAlumno'),
          Carrera : alumno.payload.doc.get('carreraAlumno'),
          Correo : alumno.payload.doc.get('correoAlumno'),
          Telefono : alumno.payload.doc.get('telefonoAlumno'),
          Fecha_Egreso : alumno.payload.doc.get('egresoAlumno') ? fechaEgreso : '',
          Titulado: alumno.payload.doc.get('tituloAlumno') ? alumno.payload.doc.get('tituloAlumno') : 'No',
          Fecha_Encuesta: alumno.payload.doc.get('fechaEncuesta') ? fechaEncuesta : '',
          Respuestas: alumno.payload.doc.get('respuestas') ? alumno.payload.doc.get('respuestas') : ''
        };});
        this.totalAlumnos = this.alumnosEncuestados.length;

        this.alumnosEncuestados.sort(function (a, b) {
          return a.Nombre.localeCompare(b.Nombre);
        });

      });
  }

  convertirFecha(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (month < 10) {
      if (day < 10) {
        return `0${day}/0${month}/${year}`;
      } else {
        return `${day}/0${month}/${year}`;
      }
    } else {
      if (day < 10) {
        return `0${day}/${month}/${year}`;
      } else {
        return `${day}/${month}/${year}`;
      }
    }
  }

  exportTableToExcel() {
    this.notificationsServices.showNotification(0, 'Datos Exportados', 'Los datos se exportaron con éxito');
    TableToExcel.convert(document.getElementById('table-survey'), {
      name: 'Encuesta Egresados.xlsx',
      sheet: {
        name: 'Egresados'
      }
    });
  }

  pageChanged(ev) {
    this.page = ev;
  }
}
