import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

// Importar Proveedores
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';

// Importar Componentes

// Importar Enumeradores
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';
import { EStatusEnglishStudent, EStatusEnglishStudentBackgroundColor } from 'src/app/english/enumerators/status-english-student.enum';
import { ERequestCourseStatus } from 'src/app/english/enumerators/request-course-status.enum';

// Importar Modales

// Importar modelos
import { IEnglishStudent } from '../../entities/english-student.model';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {

  constructor(private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private requestCourseProv: RequestCourseProvider,
    private englishStudentProv: EnglishStudentProvider,
    public dialog: MatDialog,) { 
      if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
        this.router.navigate(['/']);
      }
    }

  ngOnInit() {
    this._initStudents();
  }

  public englishStudents: IEnglishStudent[];
  public englishStudentsDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorStudents') paginatorStudents: MatPaginator;
  @ViewChild('sortStudents') sortStudents: MatSort;
  searchStudent = "";
  public requestsStudent: any[];
  public requestsDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorHistory') paginatorHistory: MatPaginator;
  searchHistory = "";
  @ViewChild("viewHistory") dialogRefViewHistory: TemplateRef<any>;
  statusEnglishStudent = EStatusEnglishStudent;
  requestCourseStatus = ERequestCourseStatus;
  statusEnEsBackgroundColor = EStatusEnglishStudentBackgroundColor;

  private async _initStudents(): Promise<void> {

    this.englishStudentsDataSource = new MatTableDataSource();

    this.englishStudentProv.getAllEnglishStudent().subscribe(res => {

      this.englishStudents = res.englishStudents;
      this._fillTableEnglishStudents(this.englishStudents);
    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  private _fillTableEnglishStudents(englishStudents: IEnglishStudent[]): void {

    this.englishStudentsDataSource.data = englishStudents.map((englishStudent) => this._parseEnglishStudentToTable(englishStudent));
    
    this.englishStudentsDataSource.paginator = this.paginatorStudents;
    this.englishStudentsDataSource.sort = this.sortStudents;
    
  }

  private _parseEnglishStudentToTable(englishStudent: any): any {
    return {
      _id: englishStudent._id,
      controlNumber: englishStudent.studentId.controlNumber,
      name: englishStudent.studentId.fullName,
      phone: englishStudent.currentPhone,
      career: englishStudent.studentId.careerId ? englishStudent.studentId.careerId.acronym : '',
      hours: englishStudent.totalHoursCoursed,
      status: englishStudent.status
    };
  }

  openViewHistory(student){

    this.requestCourseProv.getAllRequestCourseByEnglishStudentId(student._id).subscribe(res => {

      this.requestsStudent = res.requestCourse;
      console.log(res)

      this._fillTableHistory(this.requestsStudent);

    }, error => {

    }, () => this.loadingService.setLoading(false));

    let dialogRef = this.dialog.open(this.dialogRefViewHistory, { hasBackdrop: true, height: '90%', width: '80%' });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
      }
    });
  }

  private _fillTableHistory(requests): void {

    this.requestsDataSource = new MatTableDataSource();
    this.requestsDataSource.data = requests.map((request) => this._parseRequestToTable(request));
    
    this.requestsDataSource.paginator = this.paginatorHistory;
    
    console.log(this.requestsDataSource.data)
  }

  private _parseRequestToTable(request): any {
    return {
      _id: request._id,
      course: request.group.course.name,
      level: request.group.level,
      group: request.group.name,
      status: request.status,
      average: request.average ? request.average : '-',
      teacher: request.group.teacher ? request.group.teacher.name.fullName : 'Sin Asignar',
      period: request.period.periodName + ' ' +  request.period.year,
      schedule: request.group.schedule
    };
  }

  applyFilterHistory() {
    this.requestsDataSource.filter = this.searchHistory.trim().toLowerCase();
  }
  applyFilterStudents() {
    this.englishStudentsDataSource.filter = this.searchStudent.trim().toLowerCase();
  }

  scheduleGroupSelected: Array<any>;
  dialogRef: any;
  @ViewChild("viewScheduleGroup") dialogRefViewScheduleGroup: TemplateRef<any>;
  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana
  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana

  openDilogViewScheduleGroup(scheduleSelected) {
    this.scheduleGroupSelected = scheduleSelected;
    this.dialogRef = this.dialog.open(this.dialogRefViewScheduleGroup, { hasBackdrop: true });

    this.dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.scheduleGroupSelected = [];
      }
    });
  }

  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
  }

  deleteProfile(student){
    this.requestCourseProv.getAllRequestCourseByEnglishStudentId(student._id).subscribe(async res => {
      const requestStudent = res.requestCourse.filter(req=> req.status == 'requested');
      const lastRequestStudent = requestStudent[requestStudent.length - 1];

      // Verificar si tiene una solocitud activa
      if(lastRequestStudent){
        // Mostrar alerta para eliminar solicitud de alumno
        Swal.fire({
          title: 'Solicitud Encontrada',
          type: 'info',
          html:
          '<label>El perfil del alumno con número de control: <b>'+student.controlNumber+'</b> cuenta con una solicitud activa. Se eliminará perfil y solicitud.</label>',
          allowOutsideClick: false,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: 'green',
          cancelButtonColor: 'red',
        }).then((result) => {
          if (result.value) {
            this.englishStudentProv.deleteEnglishProfile(student._id).subscribe(res => {
              if (res){
                Swal.fire({
                  title: 'Éxito',
                  text: 'Perfil y Solicitud Eliminadas',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this._initStudents();
              }
            });
          }
        });
      } else {
        // Eliminar perfil de inglés de alumno
        Swal.fire({
          title: 'Atención',
          type: 'info',
          html:
            '<label>Se eliminará el perfil del alumno con número de control: <b>'+student.controlNumber+'</b></label>',
          allowOutsideClick: false,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: 'green',
          cancelButtonColor: 'red',
        }).then((result) => {
          if (result.value) {
            this.englishStudentProv.deleteEnglishProfile(student._id).subscribe(res => {
              if (res){
                Swal.fire({
                  title: 'Éxito',
                  text: 'Perfil Eliminado',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this._initStudents();
              }
            });
          }
        });
      }
    });
  }

}
