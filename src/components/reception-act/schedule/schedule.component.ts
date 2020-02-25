import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
import { ISchedule } from 'src/entities/reception-act/schedule.model';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

@Component({
  selector: 'app-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]
})
export class ScheduleComponent implements OnInit {
  // @Input('Request') size;
  @Output('onResponse') eventResponse = new EventEmitter<boolean>();
  maxDate: Date;
  excludeDays: number[] = [0, 6];
  viewDate = new Date();
  events: CalendarEvent[];
  hour: string;
  appointments: Array<{ date: Date, count: number }> = [];
  ranges: Array<{ start: Date, end: Date, quantity: number }> = [];
  refresh: Subject<any> = new Subject();
  request: iRequest;
  // diary: Array<ISchedule>;
  career: String;
  constructor(public _RequestProvider: RequestProvider, public _NotificationsServices: NotificationsServices, private _RequestService: RequestService,
    private _CookiesService: CookiesService, public _InscriptionsProvider: InscriptionsProvider) {
    const user = this._CookiesService.getData().user;
    this.career = user.career;
  }
  ngOnInit() {
    this._RequestService.requestUpdate.subscribe(
      (result) => {
        this.request = result.Request;
        if(this.request.proposedHour){
          let hours = this.request.proposedHour / 60;
          let minutes = this.request.proposedHour % 60;
          this.hour = ((hours > 9) ? (hours + "") : ("0" + hours)) + ":" + ((minutes > 9) ? (minutes + "") : ("0" + minutes));
        }
      }
    );

    this._InscriptionsProvider.getActivePeriod().subscribe(
      periodo => {
        if (typeof (periodo) !== 'undefined' && typeof (periodo.period) !== 'undefined' && periodo.period.active) {
          this.maxDate = new Date(periodo.period.arecPerEndDate);
          this.schedule(this.viewDate.getMonth(), this.viewDate.getFullYear());
        }
      });
  }
  //Retorna los eventos que estan en la misma hora que el estudiante
  getEvents(Schedule: any): Array<ISchedule> {
    let diary: Array<ISchedule> = [];
    Schedule.forEach(element => {
      //  Para agregar los eventos de acuerdo a la hora y por carrera, se quita para tomar en cuenta todas los eventos
      // if (element._id.career[0] === this.career && this.request.proposedHour === element._id.minutes) 
      if (this.request.proposedHour === element._id.minutes) {
        diary.push({ career: element._id.career[0], date: element._id.date, minutes: element._id.minutes, count: element.count });
      }
    });
    return diary;
  }

  //Obtiene los rangos de fecha
  getRanges(Ranges: any): void {
    this.ranges = [];
    Ranges.forEach(element => {
      const value = element.careers.find(x => x === this.career);
      if (typeof (value) !== 'undefined') {
        let tmp: { start: Date, end: Date, quantity: number } =
        {
          end: new Date(element.end), start: new Date(element.start), quantity: element.quantity
        };
        this.ranges.push(tmp);
      }
    });
  }

  //Obtiene los espacios ocupados 
  schedule(month: number, year: number): void {
    this.events = [];
    this.appointments = [];
    this._RequestProvider.getAvailableSpaces({
      month: month,
      year: year
    }).subscribe(data => {
      if (typeof (data.Schedule) !== "undefined") {
        this.getRanges(data.Ranges);
        const diary = this.getEvents(data.Schedule);
        console.log(diary);
        
        diary.forEach(e => {

          let tmpDate: Date = new Date(e.date);
          tmpDate.setHours(0, 0, 0, 0);
          tmpDate.setHours(e.minutes / 60);
          tmpDate.setMinutes(e.minutes % 60);
          for (let i = 0; i < e.count; i++) { this.events.push({ title: '', start: tmpDate }); }
          tmpDate = new Date(e.date);
          tmpDate.setHours(0, 0, 0, 0);
          this.appointments.push({ date: tmpDate, count: e.count });
        });

        this.refresh.next();
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulación App",
        error);
    });
  }

  view: CalendarView = CalendarView.Month;
  locale: string = 'es';
  // activeDayIsOpen: boolean = true;
  // limite: number = 1;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      if (typeof (this.appointments) !== 'undefined') {
        if ((day.isPast && !day.isToday) || day.date > this.maxDate) {
          day.cssClass = 'disable-days';
        } else {
          let lDate: Date = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
          lDate.setHours(0, 0, 0, 0);
          // let tmp: { fecha: Date, count: Number } = this.citas.find(x => x.fecha.getTime() === lDate.getTime());   

          let tmp: { date: Date, count: Number } = this.appointments.find(x => x.date.getTime() === lDate.getTime());
          let tmpRange = this.ranges.find(x => x.start.getTime() <= lDate.getTime() && lDate.getTime() <= x.end.getTime());
          if (typeof (tmp) === 'undefined')
            day.cssClass = 'free';
          else {
            //Descomentar para usar rangos
            let limite = 1; //typeof (tmpRange) !== 'undefined' ? tmpRange.quantity : 1;
            if (tmp.count >= limite)
              day.cssClass = 'complete';
            else
              day.cssClass = 'free';
          }
        }
      }
    });
  }

  async closeOpenMonthViewDay() {
    await this.delay(200);
    this.schedule(this.viewDate.getMonth(), this.viewDate.getFullYear());
    // this.activeDayIsOpen = false;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dayClicked(events): void {
    if (events.day.cssClass === 'free') {
      Swal.fire({
        title: '¿Está seguro de reservar este espacio?',
        text: '¡No podrás revertir esto!',
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          let tmpAppointment: Date = new Date(events.day.date);
          tmpAppointment.setHours(0, 0, 0, 0);
          tmpAppointment.setMinutes(this.request.proposedHour);
          const data = {
            operation: eStatusRequest.PROCESS,
            doer: this._CookiesService.getData().user.name.fullName,
            appointment: tmpAppointment,
            phase: eRequest.ASSIGNED
          };
          this._RequestProvider.updateRequest(this.request._id, data).subscribe(_ => {
            this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Fecha Propuesta Agendada');
            this.eventResponse.emit(true);
          }, error => {
            this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', error);
          });
        }
      });
    } else {
      Swal.fire({
        type: 'error',
        title: 'Oops...',
        text: 'Día no disponible'
      })
    }

  }
}

