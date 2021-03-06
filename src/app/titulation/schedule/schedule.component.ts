import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, EventEmitter, Output } from '@angular/core';
import { CalendarEvent, DAYS_OF_WEEK, CalendarDateFormatter, CalendarView, CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { CustomDateFormatter } from 'src/app/providers/reception-act/custom-date-formatter.provider';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { RequestService } from 'src/app/services/reception-act/request.service';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ISchedule } from 'src/app/entities/reception-act/schedule.model';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { ERoleToAcronym } from 'src/app/enumerators/app/role.enum';

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
  // tslint:disable-next-line: no-output-rename
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
  career: String;
  view: CalendarView = CalendarView.Month;
  locale = 'es';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];
  denyDays = [];
  private filterRole: string;
  constructor(
    public _RequestProvider: RequestProvider,
    public _NotificationsServices: NotificationsServices,
    private _RequestService: RequestService,
    private _CookiesService: CookiesService,
    public _InscriptionsProvider: InscriptionsProvider,
  ) {
    const user = this._CookiesService.getData().user;
    this.career = user.career;
    this.filterRole = (ERoleToAcronym as any)[user.rol.name.toLowerCase()];
  }

  ngOnInit() {
    this._RequestService.requestUpdate.subscribe(
      (result) => {
        this.request = result.Request;
        if (this.request.proposedHour) {
          const hours = this.request.proposedHour / 60;
          const minutes = this.request.proposedHour % 60;
          this.hour = ((hours > 9) ? (hours + '') : ('0' + hours)) + ':' + ((minutes > 9) ? (minutes + '') : ('0' + minutes));
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
  // Retorna los eventos que estan en la misma hora que el estudiante
  getEvents(Schedule: any): Array<ISchedule> {
    const diary: Array<ISchedule> = [];
    Schedule.forEach(element => {
      //  Para agregar los eventos de acuerdo a la hora y por carrera, se quita para tomar en cuenta todas los eventos
      // if (element._id.career[0] === this.career && this.request.proposedHour === element._id.minutes) 
      // if (this.request.proposedHour === element._id.minutes)
      if (this.request.proposedHour === element._id.minutes) {
        diary.push({ career: element._id.career[0], date: element._id.date, minutes: element._id.minutes, count: element.count });
      }
    });
    return diary;
  }

  // Obtiene los rangos de fecha
  getRanges(Ranges: any): void {
    this.ranges = [];
    Ranges.forEach(element => {
      console.log('element',element);
      
      const value = element.careers.find(x => x === this.career);
      if (typeof (value) !== 'undefined') {
        const tmp: { start: Date, end: Date, quantity: number } = {
          end: new Date(element.end), start: new Date(element.start), quantity: element.quantity
        };
        this.ranges.push(tmp);
      }
    });
  }

  // Obtiene los espacios ocupados
  schedule(month: number, year: number): void {
    this.events = [];
    this.appointments = [];
    
    this._RequestProvider.getAvailableSpaces({
      month: month,
      year: year
    }).subscribe(data => {
      
      
      if (typeof (data.Schedule) !== 'undefined') {
        // this.getRanges(data.Ranges);
        this.denyDays = data.denyDays;        
        
        const diary = this.getEvents(data.Schedule);
        
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
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener los espacios');
    });
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      if (typeof (this.appointments) !== 'undefined') {
        const mapedDenyDays = this.denyDays.map( dd=> { 
          const tmpD = new Date(dd.date);
          return {
            day: tmpD.getDate(),
            month: tmpD.getMonth(),
            year: tmpD.getFullYear()        
          }
        });
        const itsLock = mapedDenyDays.find( d=> d.day == day.date.getDate() && d.month == day.date.getMonth() && d.year == day.date.getFullYear());        
        
        if ((day.isPast && !day.isToday) || day.date > this.maxDate && !itsLock) {
          day.cssClass = 'disable-days';
        } else if(itsLock){
          day.cssClass = 'complete';
        } else{
          const lDate: Date = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
          lDate.setHours(0, 0, 0, 0);
          // let tmp: { fecha: Date, count: Number } = this.citas.find(x => x.fecha.getTime() === lDate.getTime());

          const tmp: { date: Date, count: Number } = this.appointments.find(x => x.date.getTime() === lDate.getTime());
          const tmpRange = this.ranges.find(x => x.start.getTime() <= lDate.getTime() && lDate.getTime() <= x.end.getTime());
          if (typeof (tmp) === 'undefined') {
            day.cssClass = 'free';
          } else {
            // Descomentar para usar rangos
            const limite = 1; // typeof (tmpRange) !== 'undefined' ? tmpRange.quantity : 1;
            if (tmp.count >= limite) {
              day.cssClass = 'complete';
            } else {
              day.cssClass = 'free';
            }
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
          const tmpAppointment: Date = new Date(events.day.date);
          tmpAppointment.setHours(0, 0, 0, 0);
          tmpAppointment.setMinutes(this.request.proposedHour);
          const data = {
            operation: eStatusRequest.PROCESS,
            doer: this._CookiesService.getData().user.name.fullName,
            appointment: tmpAppointment,
            phase: eRequest.ASSIGNED
          };
          this._RequestProvider.updateRequest(this.request._id, data,this.filterRole).subscribe(_ => {
            this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Fecha propuesta agendada');
            this.eventResponse.emit(true);
          }, _ => {
            this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
          });
        }
      });
    } else {
      Swal.fire({
        type: 'error',
        title: '¡Acto recepcional!',
        text: 'Día no disponible'
      });
    }

  }
}

