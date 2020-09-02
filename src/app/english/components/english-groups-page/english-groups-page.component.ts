import { Component, ElementRef, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAutocomplete, MatChipInputEvent } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';

import { IPeriod } from '../../../entities/shared/period.model';
import { IGroup } from '../../entities/group.model';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { GroupProvider } from 'src/app/english/providers/group.prov'
import { GroupStudentsComponent } from 'src/app/english/components/english-courses-page/group-students/group-students.component';

// Importar Enumeradores
import { EStatusGroup } from 'src/app/english/enumerators/status-group.enum';
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';

@Component({
  selector: 'app-english-groups-page',
  templateUrl: './english-groups-page.component.html',
  styleUrls: ['./english-groups-page.component.scss']
})
export class EnglishGroupsPageComponent implements OnInit {

  // Periods
  periods: IPeriod[] = [];
  filteredPeriods: IPeriod[] = [];
  // periods used to filter data
  usedPeriods: IPeriod[] = [];
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('periodInput') periodInput: ElementRef<HTMLInputElement>;
  periodCtrl = new FormControl();

  groups: IGroup[];
  showGroups: IGroup[];

  constructor(
    private _CookiesService: CookiesService,
    public dialog: MatDialog,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private requestProvider: RequestProvider,
    private groupProvider: GroupProvider) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
   }

  async ngOnInit() {

    await this.getData();

    this.groupProvider.getAllGroupByTeacher(this._CookiesService.getData().user._id)

    console.log(this._CookiesService.getData().user)

    this.requestProvider.getPeriods().subscribe(
      (periods) => {
        this.periods = periods.periods;
        this.filteredPeriods = periods.periods;
        this.updatePeriods(this.filteredPeriods.filter(per => per.active === true)[0], 'insert');
      }
    );
  }

  getData() {
    return new Promise((resolve) => {
      this.groupProvider.getAllGroupByTeacher(this._CookiesService.getData().user.eid).subscribe((data) => {
  
        this.groups = data.groups;

        resolve(true);
      });
    });
  }

  addPeriod(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if (input) {
        input.value = '';
      }
      this.periodCtrl.setValue(null);
    }
  }

  slectedPeriod(period): void {
    this.updatePeriods(period, 'insert');
  }

  removePeriod(period): void {
    this.updatePeriods(period, 'delete');
  }

  updatePeriods(period, action: string): void {
    if (action === 'delete') {
      this.filteredPeriods.push(period);
      this.usedPeriods = this.usedPeriods.filter(per => per._id !== period._id);
    }
    if (action === 'insert') {
      this.usedPeriods.push(period);
      this.filteredPeriods = this.filteredPeriods.filter(per => per._id !== period._id);
    }
    this.periods = this.filteredPeriods;
    if (this.periodInput) this.periodInput.nativeElement.blur(); // set focus
    this.applyFilters();
  }

  filterPeriod(value: string): void {
    if (value) {
      this.periods = this.periods.filter(period => (period.periodName + '-' + period.year).toLowerCase().trim().indexOf(value) !== -1);
    }
  }

  applyFilters() {

    this.showGroups = this.groups;
    if (this.usedPeriods) {
      if (this.usedPeriods.length > 0) {
        this.showGroups = this.showGroups.filter(
          (req: any) => this.usedPeriods.map(per => (per._id)).includes((req.period))
        );
      } else {
        this.showGroups = this.showGroups;
      }
    } else {
      this.showGroups = this.showGroups;
    }

    console.log(this.showGroups);
  }

  public getStatusGroupName(status: string): string {
    return (EStatusGroup as any)[status];
  }

  scheduleGroupSelected: Array<any>;
  dialogRef: any;
  @ViewChild("viewScheduleGroup") dialogRefViewScheduleGroup: TemplateRef<any>;
  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana
  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana

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

  openDialogshowGroupStudents(group): void {

    const dialogRef = this.dialog.open(GroupStudentsComponent, {
      data: {
        group: group,
        type: 'teacher'
      },
      hasBackdrop: true, height: '70%', width: '90%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });

  }

}
