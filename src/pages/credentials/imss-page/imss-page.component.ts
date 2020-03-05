import { ActivatedRoute, Router } from '@angular/router';
import { ComponentType } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import Swal from 'sweetalert2';
import * as Papa from 'papaparse';
import * as moment from 'moment';
moment.locale('es');

import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { IStudent } from 'src/entities/shared/student.model';
import { LoadCsvDataComponent } from 'src/modals/shared/load-csv-data/load-csv-data.component';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';


@Component({
  selector: 'app-imss-page',
  templateUrl: './imss-page.component.html',
  styleUrls: ['./imss-page.component.scss']
})
export class ImssPageComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorInsured') paginatorInsured: MatPaginator;
  @ViewChild('matPaginatorUninsured') paginatorUninsured: MatPaginator;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  public students: IStudent[] = [];
  public displayedColumnsInsured: string[];
  public displayedColumnsInsuredName: string[];
  public displayedColumnsUninsured: string[];
  public displayedColumnsUninsuredName: string[];
  public dataSourceInsured: MatTableDataSource<IIMMSTable>;
  public dataSourceUninsured: MatTableDataSource<IIMMSTable>;
  public search: string;
  public selectedTab: FormControl;
  public loading: boolean;

  constructor(
    private cookiesService: CookiesService,
    private notificationServ: NotificationsServices,
    private router: Router,
    private routeActive: ActivatedRoute,
    private studentProvider: StudentProvider,
    private dialog: MatDialog,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.selectedTab = new FormControl(0);
    this.loading = false;
  }

  ngOnInit() {
    this.displayedColumnsUninsuredName = ['Número de control','Nombre', 'Carrera', 'NSS'];
    this.displayedColumnsUninsured = ['controlNumber', 'name', 'career', 'nss', 'actions']
    this.displayedColumnsInsuredName = ['Número de control','Nombre', 'Carrera', 'NSS', 'Fecha Alta'];
    this.displayedColumnsInsured = ['controlNumber','name', 'career', 'nss', 'registerDate', 'actions'];
    this._getAllUninsured();
  }

  // Obtener alumnos al cambiar de pestaña
  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getAllUninsured();
      case 1: return this._getAllInsured();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceUninsured.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceUninsured.paginator) {
          this.dataSourceUninsured.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceInsured.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceInsured.paginator) {
          this.dataSourceInsured.paginator.firstPage();
        }
        break;
    }
  }

  // Asegurar Alumno
  public insuredStudent(student: IIMMSTable) {
    Swal.fire({
      title: 'Asegurar Alumno',
      text: `¿Está seguro de asegurar al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Asegurar'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.studentProvider.insuredStudent(student.controlNumber)
          .subscribe(_ => {
            this.loading = false;
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante asegurado con éxito', '');
            this._getAllUninsured();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Error, no se pudo asegurar al estudiante', '');
            this.loading = false;
          });
      }
    });
  }

  // Remover Seguro
  public uninsuredStudent(student: IIMMSTable) {
    Swal.fire({
      title: 'Cancelación de Seguro',
      text: `¿Está seguro de cancelar el seguro al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.loading = true;
        this.studentProvider.uninsuredStudent(student.controlNumber)
          .subscribe(_ => {
            this.loading = false;
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Se ha quitado el seguro con éxito', '');
            this._getAllInsured();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Error al quitar seguro al estudiante', '');
            this.loading = false;
          });
      }
    });
  }

  // Refrescar datos de tablas
  public refreshInsured() {
    this._getAllInsured();
  }

  public refreshUninsured() {
    this._getAllUninsured();
  }

  // Cargar archivo .csv
  public uploadCsv(event) {
    const provider = this.studentProvider;
    const notificacion = this.notificationServ;
    const students = [];
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (results) => {
          if (results.data.length > 0) {
            results.data.slice(1).forEach(element => {
              if (element[0]) {
                const index = students.findIndex(student => student.controlNumber === element[0]);
                if (index === -1) {
                  students.push({ controlNumber: element[0] });
                }
              }
            });
            const _data = {
              config: {
                title: 'Asegurar Estudiantes',
                displayedColumns: ['controlNumber'],
                displayedColumnsName: ['Número de control']
              },
              componentData: students
            };
            const refDialog = this._openDialog(LoadCsvDataComponent, 'ImssInsured', _data);
            refDialog.afterClosed().subscribe((_students: Array<any>) => {
              if (_students) {
                this.loading = true;
                provider.insuredStudentsCsv(_students).subscribe(_ => {
                  this.loading = false;
                  notificacion.showNotification(eNotificationType.SUCCESS, 'Estudiantes asegurados con éxito', '');
                  this.changeTab(this.selectedTab.value);
                  this.fileUpload.nativeElement.value = '';
                }, _ => {
                  this.notificationServ.showNotification(eNotificationType.ERROR,'Ocurrió un error al asegurar los estudiantes', '');
                  this.loading = false;
                  this.fileUpload.nativeElement.value = '';
                });
              } else {
                this.fileUpload.nativeElement.value = '';
              }
            });
          }
        }
      });
    }
  }

  // Descargar plantilla csv
  downloadTemplateCsv(){
    const ExampleStudents = [
      {nc: 'Número de Control'},
      {nc: '14400971'},
      {nc: '14400972'},
      {nc: '14400973'},
      {nc: '14400974'},
      {nc: '14400975'}
    ];
    new Angular5Csv(ExampleStudents, 'Plantilla Estudiantes Asegurados IMSS');
  }

  // Obtener alumnos no asegurados
  private _getAllInsured() {
    this.loading = true;
    this.studentProvider.studentsImssInsured()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshInsured(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes asegurados', '');
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  // Obtener alumnos asegurados
  private _getAllUninsured() {
    this.loading = true;
    this.studentProvider.studentsImssUninsured()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshUninsured(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes no asegurados', '');
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  // Refrescar datos de tablas
  private _refreshInsured(data: Array<any>): void {
    this.dataSourceInsured = new MatTableDataSource(data);
    this.dataSourceInsured.paginator = this.paginatorInsured;
    this.dataSourceInsured.sort = this.sort;
  }

  private _refreshUninsured(data: Array<any>): void {
    this.dataSourceUninsured = new MatTableDataSource(data);
    this.dataSourceUninsured.paginator = this.paginatorUninsured;
    this.dataSourceUninsured.sort = this.sort;
  }

  private _castToTable(data) {
    return {
      controlNumber: data.controlNumber,
      name: data.fullName,
      career: data.career,
      nss: data.nss,
      registerDate: (data.documents && data.documents.length) ? moment(data.documents[0].registerDate).format('LL') : '',
    };
  }

  private _openDialog(component: ComponentType<any>, id?: string, data?: any) {
    return this.dialog.open(component, {
      id: id ? id : '',
      data: data ? data : null,
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });
  }

}

interface IIMMSTable {
  _id?: string;
  controlNumber?: string;
  name?: string;
  career?: string;
  nss?: string;
  registerDate?: string;
  action?: string;
}