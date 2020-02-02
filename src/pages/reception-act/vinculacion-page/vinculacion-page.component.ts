import { ActivatedRoute, Router } from '@angular/router';
import { ComponentType } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild } from '@angular/core';
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
    this.displayedColumnsReleased = ['name', 'career', 'controlNumber', 'dateRelease', 'actions'];
    this.displayedColumnsReleasedName = ['Nombre', 'Carrera', 'Número de control', 'Fecha de liberación'];
    this.displayedColumnsNotReleased = ['name', 'career', 'controlNumber', 'actions'];
    this.displayedColumnsNotReleasedName = ['Nombre', 'Carrera', 'Número de control'];
    this._getAllNotReleased();
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
        this.studentProvider.releaseEnglish(student.controlNumber)
          .subscribe(_ => {
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Estudiante liberado con éxito', '');
            this._getAllNotReleased();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Error, no se pudo liberar el inglés al estudiante', '');
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
        this.studentProvider.removeRelease(student.controlNumber)
          .subscribe(_ => {
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Se ha quitado la liberación con éxito', '');
            this._getAllReleased();
          }, _ => {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Error al quitar liberación al estudiante', '');
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
                students.push({ controlNumber: element[0] });
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
                provider.releaseEnglishCsv(_students).subscribe(_ => {
                  notificacion.showNotification(eNotificationType.SUCCESS, 'Estudiantes liberados con éxito', '');
                  this.changeTab(this.selectedTab.value);
                }, _ => {
                  this.notificationServ.showNotification(eNotificationType.ERROR,
                    'Ocurrió un error al liberar los estudiantes', '');
                });
              }
            });
          }
        }
      });
    }
  }

  private _getAllReleased() {
    this.loading = true;
    this.studentProvider.studentsEnglishReleased()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshReleased(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes liberados', '');
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  private _getAllNotReleased() {
    this.loading = true;
    this.studentProvider.studentsEnglishNotReleased()
      .subscribe(res => {
        const data = res.students.map(this._castToTable);
        this._refreshNotReleased(data);
      }, _ => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'No se pudieron cargar los estudiantes sin liberar', '');
        this.loading = false;
      }, () => {
        this.loading = false;
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
