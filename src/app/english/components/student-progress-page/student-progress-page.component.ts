import { Component, Input, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Importar modelos
import { IEnglishStudent } from '../../entities/english-student.model';

// Importar Servicios
import { LoadingService } from 'src/app/services/app/loading.service';

// Importar Proveedores
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';

@Component({
  selector: 'app-student-progress-page',
  templateUrl: './student-progress-page.component.html',
  styleUrls: ['./student-progress-page.component.scss']
})
export class StudentProgressPageComponent implements OnInit {

  @Input('englishStudent') englishStudent: IEnglishStudent;
  public requestsStudent: any[];
  public requestsDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorRequests') paginatorRequests: MatPaginator;
  @ViewChild('sortRequests') sortRequests: MatSort;

  totalHours = 450;
  totalHoursCoursed = 0;
  percentHours = 0;

  constructor(
    private loadingService: LoadingService,
    private requestCourseProv: RequestCourseProvider,) { }

  ngOnInit() {
    console.log(this.englishStudent);
    this.getRequests();
    this.getHoursCoursed();
  }

  getRequests() {
    this.loadingService.setLoading(true);
    this.requestCourseProv.getAllRequestCourseByEnglishStudentId(this.englishStudent._id).subscribe(res => {
      this.requestsStudent = res.requestCourse;
      if (this.requestsStudent.length > 0) {
        this.requestsStudent = this.requestsStudent.filter(request => (request.status == 'approved') || (request.status == 'not_approved'))
        this.requestsStudent.sort((a, b) => a.requestDate.localeCompare(b.requestDate));
      }
      this._fillTable();
    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  _fillTable() {
    this.requestsDataSource = new MatTableDataSource();
    this.requestsDataSource.data = this.requestsStudent.map((request) => this._parseRequestToTable(request));
    this.requestsDataSource.paginator = this.paginatorRequests;
    this.requestsDataSource.sort = this.sortRequests;
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
      period: request.period.periodName + ' ' + request.period.year,
      schedule: request.group.schedule,
      requestDate: request.requestDate,
      hoursCoursed: request.average ? (request.average > 70 ? request.group.course.semesterHours : 0) : 0
    };
  }

  getHoursCoursed() {
    this.totalHoursCoursed = this.englishStudent.totalHoursCoursed;
    this.percentHours = this.totalHoursCoursed / this.totalHours * 100;
  }

  openViewInfo(request) {
    Swal.fire({
      title: request.course + ' - ' + request.level,
      html:
        '(' + request.period + ')<br><br><br>' +
        'Grupo: <b>' + request.group + '</b><br><br>' +
        'Docente: <b>' + request.teacher + '</b><br><br>' +
        'Calificación final: <b>' + request.average + '</b><br>' +
        'Horas aprobadas: <b>' + request.hoursCoursed + '</b><br><br>',
      showCloseButton: true,
      showConfirmButton: false,
      focusCancel: true
    })
  }

}
