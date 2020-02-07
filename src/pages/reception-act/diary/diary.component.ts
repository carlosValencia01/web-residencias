import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, Input, ViewChild } from '@angular/core';
import { CalendarEvent, DAYS_OF_WEEK, CalendarDateFormatter, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, CalendarMonthViewBeforeRenderEvent, CalendarDayViewBeforeRenderEvent, CalendarWeekViewBeforeRenderEvent } from 'angular-calendar';
import { CustomDateFormatter } from 'src/providers/reception-act/custom-date-formatter.provider';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { iRequest } from 'src/entities/reception-act/request.model';
import { RequestService } from 'src/services/reception-act/request.service';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours, getYear } from 'date-fns';
import * as moment from 'moment';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { MatDialog } from '@angular/material';
import { NewEventComponent } from 'src/modals/reception-act/new-event/new-event.component';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { ViewMoreComponent } from 'src/modals/reception-act/view-more/view-more.component';
import { ConfirmDialogComponent } from 'src/modals/shared/confirm-dialog/confirm-dialog.component';
import { NewTitleComponent } from 'src/modals/reception-act/new-title/new-title.component';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
moment.locale('es');
@Component({
  selector: 'app-diary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.scss']

})
export class DiaryComponent implements OnInit {
  @ViewChild('basicMenu') public basicMenu: ContextMenuComponent;
  @ViewChild('basicMenu_2') public basicMenu_2: ContextMenuComponent;
  // carrers: { carrer: string, class: string, abbreviation: string, icon: string, status: boolean, color: { primary: string; secondary: string; } }[];
  carrers: iCarrera[];
  activeDayIsOpen: boolean = true;
  maxDate: Date = new Date(2019, 11, 15);
  viewDate = new Date();
  events: CalendarEvent[];
  hour: string;
  excludeDays: number[] = [0, 6];
  // Appointments: Array<{ _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, jury: Array<string>, place: string, }] }> = []
  Appointments: Array<iAppointmentGroup> = []
  Ranges: Array<{ start: Date, end: Date, quantity: number, careers: string[] }> = [];
  refresh: Subject<any> = new Subject();
  request: iRequest;
  view: CalendarView = CalendarView.Month;
  locale: string = 'es';

  constructor(public _RequestProvider: RequestProvider, public _NotificationsServices: NotificationsServices, private _RequestService: RequestService,
    private _CookiesService: CookiesService, private _sourceDataProvider: sourceDataProvider,
    public dialog: MatDialog) {
    const tmpFecha = localStorage.getItem('Appointment');
    if (typeof (tmpFecha) !== 'undefined' && tmpFecha) {
      this.viewDate = new Date(tmpFecha);
      this.view = CalendarView.Week;
      localStorage.removeItem('Appointment');
    }
    // else {
    //   this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    // }
  }
  ngOnInit() {
    this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
    this.carrers = this._sourceDataProvider.getCareerAbbreviation();
    this.carrers.push({
      carrer: 'Todos', class: 'circulo-all', abbreviation: 'All', icon: 'all.png', status: true,
      color: { primary: '#57c7d4', secondary: '#ace3ea' }
    });
  }

  reload() {
    this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
    this.carrers = this._sourceDataProvider.getCareerAbbreviation();
    this.carrers.push({
      carrer: 'Todos', class: 'circulo-all', abbreviation: 'All', icon: 'all.png', status: true,
      color: { primary: '#57c7d4', secondary: '#ace3ea' }
    });
  }
  diary(month: number, year: number): void {
    this.Appointments = [];
    // let nowDate = new Date(this.viewDate.getTime());
    let minDate = new Date(this.viewDate.getTime());
    let maxDate = new Date(this.viewDate.getTime());
    minDate.setDate(minDate.getDate() - minDate.getDay());
    maxDate.setDate(maxDate.getDate() + (6 - maxDate.getDay()));
    this._RequestProvider.getDiary({
      month: month,
      year: year,
      isWeek: this.view === CalendarView.Week,
      min: minDate,
      max: maxDate
    }).subscribe(data => {
      if (typeof (data.Diary) !== "undefined") {
        this.Appointments = data.Diary;
        this.Ranges = data.Ranges;
        // this.generateAppointment(month, year);
        this.loadAppointment();
        this.refresh.next();
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulación App",
        error);
    });
  }

  generateAppointment(month: number, year: number): void {
    // let startDate = new Date(year, month, 1, 0, 0, 0);
    const date = new Date(year, month + 1, 0).getDate();
    for (let i = 24; i < date; i++) {
      for (let j = 420; j <= 780; j += 60) {
        this._sourceDataProvider.getCareerAbbreviation().forEach(
          c => {
            const onlyDate = new Date(year, month, i, 0, 0, 0, 0);
            const tmpDate = new Date(year, month, i, 0, j, 0, 0);
            const countRange = this.getCountRange(c.carrer, tmpDate);
            const countAppointment = this.getCountAppointment(c.carrer, tmpDate);
            const quantity = countRange - countAppointment;
            for (let k = 0; k < quantity; k++) {
              let Carrera: string[] = [];
              let Student: string[] = [];
              Student.push("");
              const AppointmentCareer = this.Appointments.find(x => x._id[0] === c.carrer);
              if (typeof (AppointmentCareer) !== 'undefined') {
                // AppointmentCareer.values.push({ id: '-1', student: Student, proposedDate: onlyDate, proposedHour: j, phase: "--" });
                AppointmentCareer.values.push({ id: '-1', student: Student, project: '', proposedDate: onlyDate, proposedHour: j, phase: "--", jury: [], place: '', duration: 60, option: '', product: '' });
              }
              // _id: string[], values: [{ id: number, student: string[], proposedDate: Date, proposedHour: number }]
              // Carrera.push(c.carrer);
              // Student.push('');
            }
          }
        )

      }
    }
  }

  getCountAppointment(Career: string, Appointment: Date): number {
    const AppointmentCareer = this.Appointments.find(x => x._id[0] === Career);
    if (typeof (AppointmentCareer) !== 'undefined') {
      const minutes = Appointment.getHours() * 60;
      Appointment.setHours(0, 0, 0, 0);
      const countAppointment = AppointmentCareer.values.filter(x => {
        let date = new Date(x.proposedDate);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === Appointment.getTime() && x.proposedHour === minutes;
      });

      return countAppointment.length;
    }
    return 0;
  }

  getCountRange(Career: string, Appointment: Date): number {
    let quantity = 1;
    this.Ranges.forEach(element => {
      const value = element.careers.find(x => x === Career);
      if (typeof (value) !== 'undefined') {
        const endDate: Date = new Date(element.end);
        const startDate: Date = new Date(element.start);
        if (startDate.getTime() < Appointment.getTime() && Appointment.getTime() < endDate.getTime())
          quantity = element.quantity
      }
    });
    return quantity;
  }

  // Genera los eventos de la agenda
  loadAppointment(): void {
    this.events = [];
    this.carrers.forEach(career => {
      if (career.status) {
        let tmp: { _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, duration: number }] };
        tmp = this.Appointments.find(x => x._id[0] === career.carrer && career.status);
        if (typeof (tmp) != 'undefined') {
          tmp.values.forEach(element => {
            const vFecha = element.proposedDate.toString().split('T')[0].split('-');
            let tmpStart = new Date(element.proposedDate);
            let tmpEnd = new Date(element.proposedDate);
            tmpStart.setHours(0, 0, 0, 0);
            tmpEnd.setHours(0, 0, 0, 0);
            tmpStart.setMinutes(element.proposedHour);
            tmpEnd.setMinutes(element.proposedHour + element.duration);
            // let tmpStart = new Date(Number(vFecha[0]), Number(vFecha[1]), Number(vFecha[2]), 0, 0, 0, 0);
            // let tmpEnd = new Date(Number(vFecha[0]), Number(vFecha[1]), Number(vFecha[2]), 0, 0, 0, 0);            

            // let hours = element.proposedHour / 60;
            // let minutes = element.proposedHour % 60;
            // let hour = ((hours > 9) ? (hours + "") : ("0" + hours)) + ":" + ((minutes > 9) ? (minutes + "") : ("0" + minutes));
            let title = moment(tmpStart).format('LT') + " " + career.abbreviation + " " + element.student[0];
            this.events.push({ title: title, start: tmpStart, end: tmpEnd, color: (element.phase == 'Asignado' ? career.color : { primary: '#00c853', secondary: '#69f0ae' }) });
          });
        }
      }
    });
    this.refresh.next();
  }


  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      day.cssClass = 'disable-days';
    });
    (async () => {
      await this.delay(100);
    })();
  }

  async setView(view) {
    this.view = view;
    await this.delay(200);
    this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
  }

  async closeOpenMonthViewDay() {
    await this.delay(200);
    this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addNewTitled(date: Date) {
    this.addNewEvent(date, true);
  }

  addNewEvent(date: Date, isTitled: boolean = false) {
    let dialogRef;
    if (isTitled) {
      dialogRef = this.dialog.open(NewTitleComponent, {
        data: {
          operation: eOperation.NEW,
          date: date
        },
        disableClose: true,
        hasBackdrop: true,
        width: '45em'
      });
    } else {
      dialogRef = this.dialog.open(NewEventComponent, {
        data: {
          operation: eOperation.NEW,
          date: date
        },
        disableClose: true,
        hasBackdrop: true,
        width: '45em'
      });
    }


    dialogRef.afterClosed().subscribe((response: { career: string, value: { id: string, student: string[], project: string, phase: string, proposedDate: Date, proposedHour: number, jury: string[], place: string, duration: number, option: string, product: string } }) => {
      // this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
      //Para no llamar a la bd
      if (typeof (response) !== 'undefined') {
        const index = this.Appointments.findIndex(x => x._id[0] === response.career);
        if (index != -1) {
          this.Appointments[index].values.push(response.value);
        } else {
          // const tmpAppointment: { _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string }] } = { _id: [response.career], values: [response.value] }
          const tmpAppointment: iAppointmentGroup = { _id: [response.career], values: [response.value] }
          this.Appointments.push(tmpAppointment);
        }
        this.loadAppointment();
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', 'Ocurrió un problema ' + error);
    })
  }

  addTitled($event) {
    this.addEvent($event, true);
  }

  addEvent($event, isTitled: boolean = false): void {
    let dialogRef;
    if (isTitled) {
      dialogRef = this.dialog.open(
        NewTitleComponent, {
        data: {
          operation: eOperation.DML,
          event: $event
        },
        disableClose: true,
        hasBackdrop: true,
        width: '55em'
      });
    } else {
      dialogRef = this.dialog.open(
        NewEventComponent, {
        data: {
          operation: eOperation.DML,
          event: $event
        },
        disableClose: true,
        hasBackdrop: true,
        width: '45em'
      });
    }

    dialogRef.afterClosed().subscribe((response
      : {
        career: string,
        value: {
          id: string,
          student: string[],
          project: string,
          phase: string,
          proposedDate: Date,
          proposedHour: number,
          jury: string[],
          place: string,
          duration: number,
          option: string,
          product: string
        }
      }) => {
      // this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
      //Para no llamar a la bd
      if (typeof (response) !== 'undefined') {
        const index = this.Appointments.findIndex(x => x._id[0] === response.career);
        if (index != -1) {
          this.Appointments[index].values.push(response.value);
        } else {
          // const tmpAppointment: { _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string }] } = { _id: [response.career], values: [response.value] }
          const tmpAppointment: iAppointmentGroup = { _id: [response.career], values: [response.value] }
          this.Appointments.push(tmpAppointment);
        }
        this.loadAppointment();
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', 'Ocurrió un problema ' + error);
    })
  }

  viewEvent($event): void {
    const tmpAppointment: iAppointment = this.searchAppointment($event.title.split(' ')[1], $event.start, $event.title.split(' ').slice(2).join(' '));
    const dialogRef = this.dialog.open(ViewMoreComponent, {
      data: {
        Appointment: tmpAppointment
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });
  }
  cancelledEvent($event): void {
    this.confirmDenial($event, eStatusRequest.CANCELLED);
  }

  confirmDenial($event: any, operation: eStatusRequest): void {
    let AppointmentCareer = this.searchAppointmentByCareer($event.title.split(' ')[1]);
    const tmpAppointment: iAppointment = this.searchAppointmentInGroup(AppointmentCareer, $event.start, $event.title.split(' ').slice(2).join(' '));
    if (typeof (tmpAppointment) !== 'undefined') {
      if (tmpAppointment.option === 'XI - TITULACIÓN INTEGRAL') {
        const msnCancel = `¿ESTÁ SEGURO DE CANCELAR EL ESPACIO DE ${tmpAppointment.student}?`;
        const msnReject = `¿ESTÁ SEGURO DE RECHAZAR EL ESPACIO DE ${tmpAppointment.student}?`
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          data: {
            Configuration: {
              Status: operation,
              Message: {
                Title:
                  operation === eStatusRequest.CANCELLED ? msnCancel : msnReject
              },
              Buttons: { ConfirmText: 'Aceptar', CancelText: 'Cancelar' }
            }
          },
          disableClose: true,
          hasBackdrop: true,
          width: '30em'
        });

        dialogRef.afterClosed().subscribe((response: { confirm: boolean, motivo: string }) => {
          if (typeof (response) !== 'undefined') {
            if (response.confirm) {
              const data = {
                operation: operation,
                observation: response.motivo,
                doer: this._CookiesService.getData().user.name.fullName,
                phase: operation === eStatusRequest.CANCELLED ? eRequest.REALIZED : eRequest.ASSIGNED
              };
              this._RequestProvider.updateRequest(tmpAppointment.id, data).subscribe(_ => {
                this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Titulación App', operation === eStatusRequest.CANCELLED ? 'Evento cancelado' : 'Evento rechazado');
                AppointmentCareer.values.splice(AppointmentCareer.values.findIndex(x => x === tmpAppointment), 1);
                this.loadAppointment();
              }, error => {
                let tmpJson = JSON.parse(error._body);
                this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', tmpJson.message);
              });
            }
          }
        });
      } else {
        Swal.fire({
          title: '¿Está seguro de eliminar esta titulación?',
          // text: '¡No podrás revertir esto!',
          type: 'question',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.value) {
            this._RequestProvider.removeTitle(tmpAppointment.id).subscribe(_ => {
              this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Titulación removida');
              AppointmentCareer.values.splice(AppointmentCareer.values.findIndex(x => x === tmpAppointment), 1);
              this.loadAppointment();
            }, error => {
              let tmpJson = JSON.parse(error._body);
              this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', tmpJson.message);
            });
          }
        });
      }
    } else {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', 'Evento no encontrado, reporte el problema');
    }
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


  searchAppointmentInGroup(AppointmentCareer: iAppointmentGroup, date: any, student: string): iAppointment {
    // const tmpCarrera = this.carrers.find(x => x.abbreviation === abbreviation);
    // let AppointmentCareer = this.Appointments.find(x => x._id[0] === tmpCarrera.carrer);
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

  rejectEvent($event): void {
    this.confirmDenial($event, eStatusRequest.REJECT);
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

  appointmentClicked($event): void {
    let index: { appointment: number, value: number };

    // const tmpMinutes: number = value.start.getHours() * 60;
    // let tmpDate: Date = new Date(value.start.getFullYear(), value.start.getMonth(), value.start.getDate(), 0, 0, 0, 0);
    const tmpMinutes: number = $event.start.getHours() * 60;
    let tmpDate: Date = new Date($event.start.getFullYear(), $event.start.getMonth(), $event.start.getDate(), 0, 0, 0, 0);
    //Obtencion de datos del evento
    let student = $event.title.split(' ').slice(2).join(' ');
    let abbreviation = $event.title.split(' ')[1];
    let career = this.carrers.find(x => x.abbreviation === abbreviation);

    //Busqueda del evento
    let tmpValor: { id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string };
    for (let i = 0; i < this.Appointments.length; i++) {
      for (let j = 0; j < this.Appointments[i].values.length; j++) {
        let tmpFecha: Date = new Date(this.Appointments[i].values[j].proposedDate);
        tmpFecha.setHours(0, 0, 0, 0);
        if (tmpFecha.getTime() === tmpDate.getTime() && this.Appointments[i].values[j].proposedHour === tmpMinutes
          && this.Appointments[i].values[j].student[0].trim() === student.trim() && this.Appointments[i]._id[0].trim() === career.carrer.trim()
        ) {
          tmpValor = this.Appointments[i].values[j];
          index = { appointment: i, value: j };
          break;
        }
      }
    }
    if (typeof (tmpValor) !== 'undefined') {
      Swal.fire({
        title: `¿ESTÁ SEGURO DE CONFIRMAR EL ESPACIO DE ${tmpValor.student[0]}?`,
        // text: '¡No podrás revertir esto!',
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          const data = {
            operation: eStatusRequest.ACCEPT,
            doer: this._CookiesService.getData().user.name.fullName,
            phase: eRequest.ASSIGNED
          };
          this._RequestProvider.updateRequest(tmpValor.id, data).subscribe(_ => {
            this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Fecha Propuesta Aceptada');
            // tmpValor.phase = "Realizado";
            this.Appointments[index.appointment].values[index.value].phase = "Realizado";
            this.loadAppointment();
            // this.refresh.next();
          }, error => {
            this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', error);
          });
        }
      });
    }

  }
  eventClicked($event) {

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
interface iAppointment { id: string, student: string[], project: string, proposedDate: Date, proposedHour: number, phase: string, jury: Array<string>, place: string, duration: number, option: string, product: string }
