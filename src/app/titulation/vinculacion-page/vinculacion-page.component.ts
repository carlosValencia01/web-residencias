import { ComponentType } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import * as Papa from 'papaparse';
import { LoadCsvDataComponent } from 'src/app/commons/load-csv-data/load-csv-data.component';
import { IStudent } from 'src/app/entities/shared/student.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
moment.locale('es');

@Component({
  selector: 'app-vinculacion-page',
  templateUrl: './vinculacion-page.component.html',
  styleUrls: ['./vinculacion-page.component.css'],
})

export class VinculacionPageComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorReleased') paginatorReleased: MatPaginator;
  @ViewChild('matPaginatorNotReleased') paginatorNotReleased: MatPaginator;
  public students: IStudent[] = [];
  public displayedColumnsReleased: string[];
  public displayedColumnsReleasedName: string[];
  public displayedColumnsNotReleased: string[];
  public displayedColumnsNotReleasedName: string[];
  public dataSourceReleased: MatTableDataSource<IEnglishTable>;
  public dataSourceNotReleased: MatTableDataSource<IEnglishTable>;
  public search: string;
  public selectedTab: FormControl;

  constructor(
    private cookiesService: CookiesService,
    private notificationServ: NotificationsServices,
    private router: Router,
    private routeActive: ActivatedRoute,
    private studentProvider: StudentProvider,
    private dialog: MatDialog,
    private loadingService: LoadingService,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.selectedTab = new FormControl(0);
  }

  ngOnInit() {
    this.displayedColumnsReleased = ['name', 'career', 'controlNumber', 'dateRelease', 'actions'];
    this.displayedColumnsReleasedName = ['Nombre', 'Carrera', 'Número de control', 'Fecha de liberación'];
    this.displayedColumnsNotReleased = ['name', 'career', 'controlNumber', 'actions'];
    this.displayedColumnsNotReleasedName = ['Nombre', 'Carrera', 'Número de control'];
    setTimeout(() => { 
      this._getAllNotReleased();
    });
  }

  public changeTab(event) {
    this.selectedTab.setValue(event);
    switch (event) {
      case 0: return this._getAllNotReleased();
      case 1: return this._getAllReleased();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedTab.value) {
      case 0:
        this.dataSourceNotReleased.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceNotReleased.paginator) {
          this.dataSourceNotReleased.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceReleased.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceReleased.paginator) {
          this.dataSourceReleased.paginator.firstPage();
        }
        break;
    }
  }

  public release(student: IEnglishTable) {
    Swal.fire({
      title: 'Liberación de inglés',
      text: `¿Está seguro de liberar el inglés al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Liberar'
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        this.studentProvider.releaseEnglish(student.controlNumber)
          .subscribe(_ => {
            this.loadingService.setLoading(false);
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante liberado con éxito', '');
            this._getAllNotReleased();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Error, no se pudo liberar el inglés al estudiante', '');
            this.loadingService.setLoading(false);
          });
      }
    });
  }

  public cancelRelease(student: IEnglishTable) {
    Swal.fire({
      title: 'Cancelación de liberación de inglés',
      text: `¿Está seguro de cancelar la liberación de inglés al estudiante ${student.name}?`,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        this.studentProvider.removeRelease(student.controlNumber)
          .subscribe(_ => {
            this.loadingService.setLoading(false);
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Se ha quitado la liberación con éxito', '');
            this._getAllReleased();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Error al quitar liberación al estudiante', '');
            this.loadingService.setLoading(false);
          });
      }
    });
  }

  public refreshReleased() {
    this._getAllReleased();
  }

  public refreshNotReleased() {
    this._getAllNotReleased();
  }

  public onUpload(event) {
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
                title: 'Liberación de inglés',
                displayedColumns: ['controlNumber'],
                displayedColumnsName: ['Número de control']
              },
              componentData: students
            };
            const refDialog = this._openDialog(LoadCsvDataComponent, 'EnglishRelease', _data);
            refDialog.afterClosed().subscribe((_students: Array<any>) => {
              if (_students) {
                this.loadingService.setLoading(true);
                provider.releaseEnglishCsv(_students).subscribe(_ => {
                  this.loadingService.setLoading(false);
                  notificacion.showNotification(eNotificationType.SUCCESS, 'Estudiantes liberados con éxito', '');
                  this.changeTab(this.selectedTab.value);
                }, _ => {
                  this.notificationServ.showNotification(eNotificationType.ERROR,
                    'Ocurrió un error al liberar los estudiantes', '');
                  this.loadingService.setLoading(false);
                });
              }
            });
          }
        }
      });
    }
  }

  private _getAllReleased() {
    this.loadingService.setLoading(true);
    this.studentProvider.studentsEnglishReleased()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshReleased(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes liberados', '');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      });
  }

  private _getAllNotReleased() {
    this.loadingService.setLoading(true);
    this.studentProvider.studentsEnglishNotReleased()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshNotReleased(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes sin liberar', '');
        this.loadingService.setLoading(false);
      }, () => {
        this.loadingService.setLoading(false);
      });
  }

  private _refreshReleased(data: Array<any>): void {
    this.dataSourceReleased = new MatTableDataSource(data);
    this.dataSourceReleased.paginator = this.paginatorReleased;
    this.dataSourceReleased.sort = this.sort;
  }

  private _refreshNotReleased(data: Array<any>): void {
    this.dataSourceNotReleased = new MatTableDataSource(data);
    this.dataSourceNotReleased.paginator = this.paginatorNotReleased;
    this.dataSourceNotReleased.sort = this.sort;
  }

  private _castToTable(data) {
    return {
      controlNumber: data.controlNumber,
      name: data.fullName,
      career: data.career,
      dateRelease: (data.documents && data.documents.length) ? moment(data.documents[0].releaseDate).format('LL') : '',
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

interface IEnglishTable {
  _id?: string;
  controlNumber?: string;
  name?: string;
  career?: string;
  dateRelease?: string;
  action?: string;
}
