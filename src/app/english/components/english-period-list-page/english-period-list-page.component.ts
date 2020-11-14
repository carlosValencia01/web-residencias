import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import * as moment from 'moment';

moment.locale('es');

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

// Importar Proveedores
import { EnglishPeriodProvider } from 'src/app/english/providers/english-period.prov';

// Importar modelos
import { IPeriod } from '../../../entities/shared/period.model';

import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-english-period-list-page',
  templateUrl: './english-period-list-page.component.html',
  styleUrls: ['./english-period-list-page.component.scss'],
})
export class EnglishPeriodListPageComponent implements OnInit {

  activePeriod: IPeriod;
  period;
  canCreateEnglishPeriod = false;
  private englishPeriods: any[];
  searchEnglishPeriod = '';
  englishPeriodDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorEnglishPeriods') paginatorEnglishPeriods: MatPaginator;
  @ViewChild('sortEnglishPeriods') sortEnglishPeriods: MatSort;
  englishPeriodForm;
  @ViewChild("viewEnglishPeriod") dialogRefViewEnglishPeriod: TemplateRef<any>;

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private notificationServ: NotificationsServices,
    private englishPeriodProv: EnglishPeriodProvider,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this._initEnglishPeriods();
  }

  private async _initEnglishPeriods(): Promise<void> {
    this.englishPeriodDataSource = new MatTableDataSource();
    this.loadingService.setLoading(true);
    this.englishPeriods = await this._getEnglishPeriods();
    this.activePeriod = await this._getActivePeriod();
    this.canCreateEnglishPeriod = !this.findNewPeriod();
    console.log(this.canCreateEnglishPeriod)
    console.log(this.englishPeriods)
    console.log(this.activePeriod)
    this._fillTable();
    this.loadingService.setLoading(false);
  }

  private _getEnglishPeriods(): Promise<any[]> {
    return new Promise((resolve) => {
      this.englishPeriodProv.getAllEnglishPeriod()
        .subscribe(
          (res) => resolve(res.englishPeriods),
          (_) => resolve([])
        );
    });
  }

  private _getActivePeriod(): Promise<IPeriod> {
    return new Promise((resolve) => {
      this.englishPeriodProv.getActivePeriod()
        .subscribe(
          (res) => resolve(res.period),
          (_) => resolve()
        );
    });
  }

  private _fillTable(): void {
    this.englishPeriodDataSource.data = this.englishPeriods.map((englishPeriod) => this._parseEnglishTeacherToTable(englishPeriod));
    this.englishPeriodDataSource.sort = this.sortEnglishPeriods;
    this.englishPeriodDataSource.paginator = this.paginatorEnglishPeriods;
  }

  private _parseEnglishTeacherToTable(englishPeriod): any {
    return {
      _id: englishPeriod._id,
      year: englishPeriod.period.year,
      periodName: englishPeriod.period.periodName,
      active: englishPeriod.active,
      data: englishPeriod,
    };
  }

  applyFilter() {
    this.englishPeriodDataSource.filter = this.searchEnglishPeriod.trim().toLowerCase();
  }

  openDialogEnglishPeriod(selectedPeriod) {

    if ((this.englishPeriods.find(englishPeriod => englishPeriod.active == true) ? true : false)&&(selectedPeriod == null)) {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'Período activo', 'Ya existe un período activo, no es posible crear otro período.');
      return;
    }

    this.period = selectedPeriod;

    this.englishPeriodForm = this.formBuilder.group({
      reqPerInitDate: [this.period ? this.period.reqPerInitDate : "", [Validators.required]],
      reqPerEndDate: [this.period ? this.period.reqPerEndDate : "", [Validators.required]],
      secReqPerInitDate: [this.period ? this.period.secReqPerInitDate : "", [Validators.required]],
      secReqPerEndDate: [this.period ? this.period.secReqPerEndDate : "", [Validators.required,]],
      evaPerInitDate: [this.period ? this.period.evaPerInitDate : "", [Validators.required,]],
      evaPerEndDate: [this.period ? this.period.evaPerEndDate : "", [Validators.required,]],
    });

    let dialogRef = this.dialog.open(this.dialogRefViewEnglishPeriod, { hasBackdrop: true, height: '90%', width: '80%' });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.period ? this.onEditEnglishPeriod(data) : this.onCreateEnglishPeriod(data);
      }
    });
  }

  onCreateEnglishPeriod(data) {

    let englishPeriod = {
      period: this.activePeriod._id,
      active: true,
      reqPerInitDate: data.reqPerInitDate,
      reqPerEndDate: data.reqPerEndDate,
      secReqPerInitDate: data.secReqPerInitDate,
      secReqPerEndDate: data.secReqPerEndDate,
      evaPerInitDate: data.evaPerInitDate,
      evaPerEndDate: data.evaPerEndDate,
    };

    this.englishPeriodProv.createEnglishPeriod(englishPeriod).subscribe(res => {
      this.ngOnInit();
      Swal.fire({
        title: 'Período guardado con éxito!',
        showConfirmButton: false,
        timer: 2500,
        type: 'success'
      });
    },
      error => { });
  }

  onEditEnglishPeriod(data) {

    let englishPeriod = {
      reqPerInitDate: data.reqPerInitDate,
      reqPerEndDate: data.reqPerEndDate,
      secReqPerInitDate: data.secReqPerInitDate,
      secReqPerEndDate: data.secReqPerEndDate,
      evaPerInitDate: data.evaPerInitDate,
      evaPerEndDate: data.evaPerEndDate,
    };

    this.englishPeriodProv.updateEnglishPeriod(this.period._id, englishPeriod).subscribe(res => {
      this.ngOnInit();
      this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Período modificado correctamente', '');
    },
      error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
      });
  }

  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Sunday from being selected.
    return day !== 0;
  }

  findNewPeriod(): boolean {
    return this.englishPeriods.find(englishPeriod => englishPeriod.period._id == this.activePeriod._id) ? true : false;
  }

  openViewDetail(englishPeriod) {
    const format = 'L'
    Swal.fire({
      title: englishPeriod.period.periodName + ' (' + englishPeriod.period.year + ')',
      html:
        'Período de solicitudes:<br> <b>' + moment(englishPeriod.reqPerInitDate).format(format) + ' al ' + moment(englishPeriod.reqPerEndDate).format(format) + '</b><br><br>' +
        'Segundo período de solicitudes: <br><b>' + moment(englishPeriod.secReqPerInitDate).format(format) + ' al ' + moment(englishPeriod.secReqPerEndDate).format(format) + '</b><br><br>' +
        'Período de evaluación: <br><b>' + moment(englishPeriod.evaPerInitDate).format(format) + ' al ' + moment(englishPeriod.evaPerEndDate).format(format) + '</b><br>',
      showCloseButton: true,
      showConfirmButton: false,
      focusCancel: true
    })
  }

  disableEnglishPeriod(englishPeriod) {
    Swal.fire({
      title: 'Desactivar período',
      html: `Está por desactivar el período <b>` + englishPeriod.periodName + ' (' + englishPeriod.year + `)</b>. ¿Desea continuar?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.englishPeriodProv.updateEnglishPeriod(englishPeriod._id, { active: false }).subscribe(updated => {
          if (updated) {
            this.ngOnInit();
            this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Período desactivado correctamente', '');
          }
        });
      }
    });
  }

}