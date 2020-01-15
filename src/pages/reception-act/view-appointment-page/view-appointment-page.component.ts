import { Component, OnInit } from '@angular/core';
import { iRequest } from 'src/entities/reception-act/request.model';
import { CalendarView, CalendarEvent, CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { Subject } from 'rxjs';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { isSameMonth, isSameDay } from 'date-fns';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import { ViewMoreComponent } from '../../../modals/reception-act/view-more/view-more.component';
import { eRole } from 'src/enumerators/app/role.enum';
import { ActNotificacionComponent } from 'src/modals/reception-act/act-notificacion/act-notificacion.component';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
moment.locale('es');
@Component({
  selector: 'app-view-appointment-page',
  templateUrl: './view-appointment-page.component.html',
  styleUrls: ['./view-appointment-page.component.scss']
})
export class ViewAppointmentPageComponent implements OnInit {
  carrers: iCarrera[];
  allCarrers: iCarrera[];
  activeDayIsOpen: boolean = true;
  maxDate: Date = new Date(2019, 11, 15);
  viewDate = new Date();
  events: CalendarEvent[];
  excludeDays: number[] = [0, 6];
  Appointments: Array<iAppointmentGroup> = []
  refresh: Subject<any> = new Subject();
  request: iRequest;
  view: CalendarView = CalendarView.Month;
  locale: string = 'es';
  role: string;
  constructor(public _RequestProvider: RequestProvider, public _NotificationsServices: NotificationsServices,
    private _sourceDataProvider: sourceDataProvider, public dialog: MatDialog, public _InscriptionsProvider: InscriptionsProvider) {
    this.role =
      //'Secretaria Académica';
      'Jefe Académico';
    // this._CookiesService.getData().user.rol.name;
  }

  ngOnInit() {
    this._InscriptionsProvider.getActivePeriod().subscribe(
      periodo => {
        if (typeof (periodo) !== 'undefined' && typeof (periodo.period) !== 'undefined' && periodo.period.active) {
          this.maxDate = new Date(periodo.period.arecPerEndDate);
          this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
        }
      });

    this.carrers = this._sourceDataProvider.getCareerAbbreviation();
    this.allCarrers = this.carrers.slice(0);
    switch (this.role) {
      case eRole.SECRETARYACEDMIC: {
        this.filterDepto('ISIC');
        break;
      }
      case eRole.CHIEFACADEMIC: {
        // this.filterDepto('IBQA');
        this.filterDepto('ISIC');
        break;
      }
      default: {
        this.carrers.push({
          carrer: 'Todos', class: 'circulo-all', abbreviation: 'All', icon: 'all.png', status: true,
          color: { primary: '#57c7d4', secondary: '#ace3ea' }
        });
        break;
      }
    }
  }

  filterDepto(depto: string): void {
    switch (depto) {
      case 'ISIC': {
      }
      case 'ITIC': {
        this.carrers = this.carrers.filter(x => x.carrer === 'INGENIERÍA EN SISTEMAS COMPUTACIONALES'
          || x.carrer === 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES').slice(0);
        break;
      }
      case 'IQUI': {
      }
      case 'IBQA': {
        this.carrers = this.carrers.filter(x => x.carrer === 'INGENIERÍA BIOQUÍMICA'
          || x.carrer === 'INGENIERÍA QUÍMICA').slice(0);
        break;
      }
    }
  }

  diary(month: number, year: number): void {
    this.Appointments = [];
    this._RequestProvider.getDiary({
      month: month,
      year: year
    }).subscribe(data => {
      if (typeof (data.Diary) !== "undefined") {
        this.Appointments = data.Diary;
        console.log("APPOINTMENTS", this.Appointments);
        this.loadAppointment();
        this.refresh.next();
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulación App",
        error);
    });
  }
  loadAppointment(): void {
    this.events = [];
    this.allCarrers.forEach(career => {
      // if (career.status) {
      let tmp: { _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, duration: number }] };
      // tmp = this.Appointments.find(x => x._id[0] === career.carrer && career.status);
      tmp = this.Appointments.find(x => x._id[0] === career.carrer);
      if (typeof (tmp) != 'undefined') {
        tmp.values.forEach(element => {
          const vFecha = element.proposedDate.toString().split('T')[0].split('-');
          let tmpStart = new Date(element.proposedDate);
          let tmpEnd = new Date(element.proposedDate);
          tmpStart.setHours(0, 0, 0, 0);
          tmpEnd.setHours(0, 0, 0, 0);
          tmpStart.setMinutes(element.proposedHour);
          tmpEnd.setMinutes(element.proposedHour + element.duration);
          let title = "";
          let index = this.carrers.findIndex(x => x.carrer === career.carrer);
          if (index != -1 && this.carrers[index].status) {
            title = moment(tmpStart).format('LT') + " " + career.abbreviation + " " + element.student[0];
            this.events.push({ title: title, start: tmpStart, end: tmpEnd, color: (element.phase == 'Asignado' ? career.color : { primary: '#00c853', secondary: '#69f0ae' }) });
          }
          else {
            console.log("CITA", element);
            title = element.phase == 'Asignado' ? " Evento Solicitado" : " Evento Reservado";
            this.events.push({ title: title, start: tmpStart, end: tmpEnd, color: (element.phase == 'Asignado' ? { primary: '#b64443', secondary: '#dcdcdc' } : { primary: '#b64443', secondary: '#e5bab9' }) });
          }
          // let title = moment(tmpStart).format('LT') + " " + career.abbreviation + " " + element.student[0];          
        });
        console.log("EVENT", this.events);
        // }
      }
    });
    this.refresh.next();
  }


  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      day.cssClass = 'disable-days';
    });
    (async () => {
      await this.delay(200);
    })();
  }

  setView(view) {
    this.view = view;
  }

  async closeOpenMonthViewDay() {
    await this.delay(200);
    this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  viewEvent($event): void {
    const tmpAppointment: iAppointment = this.searchAppointment($event.title.split(' ')[1], $event.start, $event.title.split(' ').slice(2).join(' '));
    const dialogRef = this.dialog.open(ViewMoreComponent, {
      data: {
        Appointment: tmpAppointment
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });
  }

  genTrades($event): void {
    const tmpAppointment: iAppointment = this.searchAppointment($event.title.split(' ')[1], $event.start, $event.title.split(' ').slice(2).join(' '));
    const dialogRef = this.dialog.open(ActNotificacionComponent, {
      data: {
        Appointment: tmpAppointment
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });
  }

  searchAppointment(abbreviation: string, date: any, student: string): iAppointment {
    let AppointmentCareer = this.searchAppointmentByCareer(abbreviation);
    const size = AppointmentCareer.values.length;
    let tmpAppointment: iAppointment;
    const Student: string = student;
    for (let i = 0; i < size; i++) {
      let eventDate = new Date(date);
      let appointmentDate = new Date(AppointmentCareer.values[i].proposedDate);
      appointmentDate.setHours(0, 0, 0, 0);
      appointmentDate.setMinutes(AppointmentCareer.values[i].proposedHour);
      if (AppointmentCareer.values[i].student[0].trim() === Student.trim() && appointmentDate.getTime() === eventDate.getTime()) {
        tmpAppointment = AppointmentCareer.values[i];
        break;
      }
    }
    return tmpAppointment;
  }

  searchAppointmentByCareer(abbreviation: string): iAppointmentGroup {
    const tmpCarrera = this.carrers.find(x => x.abbreviation === abbreviation);
    let AppointmentCareer = this.Appointments.find(x => x._id[0] === tmpCarrera.carrer);
    return AppointmentCareer;
  }

  toggle(carrer: { carrer: string, abbreviation: string, icon: string, status: boolean }): void {
    carrer.status = !carrer.status;
    if (carrer.carrer === 'Todos') {
      this.carrers.forEach(x => {
        x.status = carrer.status;
      })
    }
    this.loadAppointment();
    this.refresh.next();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }
}
interface iAppointmentGroup { _id: string[], values: [iAppointment] }
interface iCarrera { carrer: string, class: string, abbreviation: string, icon: string, status: boolean, color: { primary: string; secondary: string; } }
interface iAppointment { id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, jury: Array<string>, place: string, duration: number }
