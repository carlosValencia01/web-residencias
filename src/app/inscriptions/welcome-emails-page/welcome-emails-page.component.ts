import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import { IStudent } from 'src/app/entities/shared/student.model';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
moment.locale('es');

@Component({
  selector: 'app-welcome-emails-page',
  templateUrl: './welcome-emails-page.component.html',
  styleUrls: ['./welcome-emails-page.component.scss']
})
export class WelcomeEmailsPageComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @ViewChild('matPaginator') paginator: MatPaginator;

  public students: IStudent[] = [];
  public displayedColumnsStudentsName: string[];
  public displayedColumnsStudents: string[];
  public dataSourceStudents: MatTableDataSource<StudentTable>;
  public listStudents;
  public showTable: boolean;

  constructor(
    private cookiesService: CookiesService,
    private _NotificationsServices: NotificationsServices,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionsProv: InscriptionsProvider,
    private dialog: MatDialog,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.showTable = false;
    this.displayedColumnsStudentsName = ['Carrera','Número Control', 'NIP', 'Nombre', 'Semestres Revalidados', 'CURP', 'Correo Personal', 'Correo Institucional'];
    this.displayedColumnsStudents = ['career','controlNumber', 'nip', 'name', 'revalidatedSemesters', 'curp', 'personalEmail', 'institutionalEmail'];
  }

  public applyFilter(filterValue: string) {
    this.dataSourceStudents.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceStudents.paginator) {
      this.dataSourceStudents.paginator.firstPage();
    }      
  }
  

  private _refreshStudents(data: Array<any>): void {
    this.dataSourceStudents = new MatTableDataSource(data);
    this.dataSourceStudents.sort = this.sort;
    setTimeout(() => this.dataSourceStudents.paginator = this.paginator);
    this.showTable = true;
  }

  private _castToTable(data) {
    return {
      career: data.career ? data.career : '', 
      controlNumber: data.controlNumber ? data.controlNumber : '',
      nip: data.nip ? data.nip : '',
      name: data.name ? data.name : '',
      revalidatedSemesters: data.revalidatedSemesters ? data.revalidatedSemesters : '',
      curp: data.curp ? data.curp : '',
      personalEmail: data.personalEmail ? data.personalEmail : '',
      institutionalEmail: data.institutionalEmail ? data.institutionalEmail : ''
    };
  }

  // Cargar archivo .csv
  public uploadCsv(event) {
    const students = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (results) => {
          if (results.data.length > 0) {
            results.data.slice(1).forEach(element => {
              if (element[0]) {
                const index = students.findIndex(student => student.controlNumber === element[1]);
                if (index === -1) {
                  students.push({ 
                    career: element[0],
                    controlNumber: element[1],
                    nip: element[2],
                    name: element[3],
                    revalidatedSemesters: element[4],
                    curp: element[5],
                    personalEmail: element[6],
                    institutionalEmail: element[7]
                  });
                }
              }
            });   
            const data = students.map(this._castToTable);
            this.listStudents = data;
            this._refreshStudents(data);  
          }
        }
      });
    }
  }

  // Mandar correo a los alumnos
  public confirmSendEmails() {
    Swal.fire({
      title: 'Enviar Notificación',
      text: `¿Está seguro de notificar a todos los estudiantes?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.sendEmails();
      }
    });
  }

  public sendEmails(){
    this.inscriptionsProv.sendNotificationMail(this.listStudents).subscribe(
      res => {
        this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Inscripciones', 'Notificación enviada a los alumnos');
      }, _ => {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Inscripciones', 'Error, no se pudo enviar notificaciones');
      });
  }

}

interface StudentTable {
  career?: string;
  controlNumber?: string;
  nip?: string;
  name?: string;
  revalidatedSemesters?: string;
  curp?: string;
  personalEmail?
  institutionalEmail?: string;
}
