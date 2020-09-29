import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import * as moment from 'moment';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/commons/confirm-dialog/confirm-dialog.component';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eOperation } from 'src/app/enumerators/reception-act/operation.enum';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { sourceDataProvider } from 'src/app/providers/reception-act/sourceData.prov';
import { DepartmentProvider } from 'src/app/providers/shared/department.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import { DenyDayProvider } from 'src/app/providers/reception-act/denyDays.prov';
import { NewEventComponent } from '../new-event/new-event.component';
import { NewTitleComponent } from '../new-title/new-title.component';
import { ViewMoreComponent } from '../view-more/view-more.component';
import { ERoleToAcronym } from 'src/app/enumerators/app/role.enum';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'src/app/services/app/web-socket.service';
import { eRecActEvents } from 'src/app/enumerators/shared/sockets.enum';
require('jspdf-autotable');
const jsPDF = require('jspdf');

moment.locale('es');

@Component({
  selector: 'app-diary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.scss']
})
export class DiaryComponent implements OnInit, OnDestroy {
  @ViewChild('basicMenu') public basicMenu: ContextMenuComponent;
  @ViewChild('basicMenu_2') public basicMenu_2: ContextMenuComponent;
  carrers: iCarrera[];
  activeDayIsOpen = true;
  maxDate: Date = new Date(2019, 11, 15);
  viewDate = new Date();
  events;
  hour: string;
  excludeDays: number[] = [0, 6];
  employees;
  // Appointments: Array<{ _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, jury: Array<string>, place: string, }] }> = []
  Appointments: Array<iAppointmentGroup> = []
  Ranges: Array<{ start: Date, end: Date, quantity: number, careers: string[] }> = [];
  refresh: Subject<any> = new Subject();
  request: iRequest;
  view: CalendarView = CalendarView.Month;
  locale = 'es';
  private folderId: string;
  private sepLogo: any;
  private tecNacLogoTitle: any;
  private tecLogo: any;
  private montserratNormal: any;
  private montserratBold: any;
  mapedStudents = [];
  private WIDTH = 286;
  private HEIGHT = 239;
  private FONT = 'Montserrat';
  private MARGIN: {
    LEFT: number,
    RIGHT: number,
    TOP: number,
    BOTTOM: number
  } = {
      LEFT: 20,
      RIGHT: 20,
      TOP: 25,
      BOTTOM: 25
    };

  rol: string;
  canEdit = false;
  denyDays = [];
  private filterRole: string;
  private subscriptions: Array<Subscription> = [];
  constructor(
    public _RequestProvider: RequestProvider,
    public _NotificationsServices: NotificationsServices,
    private _CookiesService: CookiesService,
    private _sourceDataProvider: sourceDataProvider,
    private _StudentProvider: StudentProvider,
    public _ImageToBase64Service: ImageToBase64Service,
    public dialog: MatDialog,
    public _getImage: ImageToBase64Service,
    private _DepartmentProvider: DepartmentProvider,
    private _DenyDayProvider: DenyDayProvider,
    private loadingService: LoadingService,
    private webSocketService: WebSocketService
  ) {
    const tmpFecha = localStorage.getItem('Appointment');
    this.rol = this._CookiesService.getData().user.rol.name.toLowerCase();
    this.filterRole = (ERoleToAcronym as any)[this.rol];
    this.canEdit = this.rol === 'jefe div. est. prof.' || 'administrador' || 'coordinación de titulación' ? true : false;

    this._getImageToPdf();
    if (typeof (tmpFecha) !== 'undefined' && tmpFecha) {
      this.viewDate = new Date(tmpFecha);
      this.view = CalendarView.Week;
      localStorage.removeItem('Appointment');
    }  }

  ngOnInit() {
    this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
    this.carrers = this._sourceDataProvider.getCareerAbbreviation();
    this.carrers.push({
      carrer: 'Todos', class: 'circulo-all', abbreviation: 'All', icon: 'all.png', status: true,
      color: { primary: '#57c7d4', secondary: '#ace3ea' }
    });
  }
  ngOnDestroy(){        
    this.subscriptions.forEach((subscription: Subscription) => {
      if(!subscription.closed)
        subscription.unsubscribe();
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
    const minDate = new Date(this.viewDate.getTime());
    const maxDate = new Date(this.viewDate.getTime());
    minDate.setDate(minDate.getDate() - minDate.getDay());
    maxDate.setDate(maxDate.getDate() + (6 - maxDate.getDay()));

    this.subscriptions.push(
      this.webSocketService.listen(eRecActEvents.GET_DIARY).subscribe( data=>{
        if (typeof (data.Diary) !== 'undefined') {
          this.Appointments = data.Diary;
          // this.Ranges = data.Ranges;
          this.denyDays = data.denyDays;
          
          this.loadAppointment();
          this.refresh.next();
        }
      }));

    this.subscriptions.push(
      this.webSocketService.listen(eRecActEvents.MODIFY_DIARY).subscribe(data=>{
        this._RequestProvider.getDiary({
          month: month,
          year: year,
          isWeek: this.view === CalendarView.Week,
          min: minDate,
          max: maxDate
        }, this._CookiesService.getClientId()).subscribe(data => {
          
        });
      }));

    this._RequestProvider.getDiary({
      month: month,
      year: year,
      isWeek: this.view === CalendarView.Week,
      min: minDate,
      max: maxDate
    }, this._CookiesService.getClientId()).subscribe(data => {
      
    }, _ => {
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener eventos');
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
              const Carrera: string[] = [];
              const Student: string[] = [];
              Student.push('');
              const AppointmentCareer = this.Appointments.find(x => x._id[0] === c.carrer);
              if (typeof (AppointmentCareer) !== 'undefined') {
                AppointmentCareer.values.push({
                  id: '-1',
                  student: Student,
                  project: '',
                  proposedDate: onlyDate,
                  proposedHour: j,
                  phase: '--',
                  jury: [],
                  place: '',
                  duration: 60,
                  option: '',
                  product: ''
                });
              }
            }
          }
        );

      }
    }
  }

  getCountAppointment(Career: string, Appointment: Date): number {
    const AppointmentCareer = this.Appointments.find(x => x._id[0] === Career);
    if (typeof (AppointmentCareer) !== 'undefined') {
      const minutes = Appointment.getHours() * 60;
      Appointment.setHours(0, 0, 0, 0);
      const countAppointment = AppointmentCareer.values.filter(x => {
        const date = new Date(x.proposedDate);
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
        if (startDate.getTime() < Appointment.getTime() && Appointment.getTime() < endDate.getTime()) {
          quantity = element.quantity;
        }
      }
    });
    return quantity;
  }

  // Genera los eventos de la agenda
  loadAppointment(): void {
    this.events = [];
    
    this.carrers.forEach(career => {
      if (career.status) {
        let tmp: {
          _id: string[],
          values: [{
            id: string,
            student: string[],
            proposedDate: Date,
            proposedHour: number,
            phase: string,
            duration: number,
            status?:string
          }]
        };
        tmp = this.Appointments.find(x => x._id[0] === career.carrer && career.status);
        
        if (typeof (tmp) != 'undefined') {
          tmp.values.forEach(element => {
            const vFecha = element.proposedDate.toString().split('T')[0].split('-');
            const tmpStart = new Date(element.proposedDate);
            const tmpEnd = new Date(element.proposedDate);
            tmpStart.setHours(0, 0, 0, 0);
            tmpEnd.setHours(0, 0, 0, 0);
            tmpStart.setMinutes(element.proposedHour);
            tmpEnd.setMinutes(element.proposedHour + element.duration);
            // let tmpStart = new Date(Number(vFecha[0]), Number(vFecha[1]), Number(vFecha[2]), 0, 0, 0, 0);
            // let tmpEnd = new Date(Number(vFecha[0]), Number(vFecha[1]), Number(vFecha[2]), 0, 0, 0, 0);

            // let hours = element.proposedHour / 60;
            // let minutes = element.proposedHour % 60;
            // let hour = ((hours > 9) ? (hours + "") : ("0" + hours)) + ":" + ((minutes > 9) ? (minutes + "") : ("0" + minutes));                        
            const title = moment(tmpStart).format('LT') + ' ' + career.abbreviation + ' ' + element.student[0];
            this.events.push({
              phase:element.phase,
              status:element.status,
              title: title,
              start: tmpStart,
              end: tmpEnd,
              color: (element.phase === 'Asignado'
                ? career.color
                : { primary: '#00c853', secondary: '#69f0ae' })
              
              });
          });
        }
      }
    });
    this.denyDays.forEach(date => {
      const start = new Date(date.date);
      start.setHours(0,0,0);
        this.events.push({
          title: 'Día bloqueado',
          start: start,
          end: new Date(date.date),
          color:  { primary: '#00c853', secondary: '#69f0ae' },
          id:date._id
          });
    });
    this.refresh.next();
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(day => {
      
      const ev = day.events.length > 0 ? 
                day.events.filter(e=> e.title == 'Día bloqueado').length > 0
                ? 'bloqueado' : 'ocupado' : 'libre';
      
      day.cssClass = ev == 'bloqueado' ? 'deny-day' : ev == 'ocupado' ? 'disable-days' :'free-day' ;
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
    const mapedDenyDays = this.denyDays.map( dd=> { 
      const tmpD = new Date(dd.date);
      return {
        day: tmpD.getDate(),
        month: tmpD.getMonth(),
        year: tmpD.getFullYear()        
      }
    });
    const itsLock = mapedDenyDays.find( d=> d.day == date.getDate() && d.month == date.getMonth() && d.year == date.getFullYear());
    if(itsLock){
      return this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'El día ha sido bloqueado');
    }
    if (isTitled) {
      dialogRef = this.dialog.open(NewTitleComponent, {
        data: {
          operation: eOperation.NEW,
          date: date,
          doer:this._CookiesService.getData().user.name.fullName
        },
        disableClose: true,
        hasBackdrop: true,
        width: '70vw'
      });
    } else {
      dialogRef = this.dialog.open(NewEventComponent, {
        data: {
          operation: eOperation.NEW,
          date: date
        },
        disableClose: true,
        hasBackdrop: true,
        width: '60vw'
      });
    }

    dialogRef.afterClosed()
      .subscribe((
        response: {
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
        }
      ) => {
        // Para no llamar a la bd
        if (typeof (response) !== 'undefined') {
          const index = this.Appointments.findIndex(x => x._id[0] === response.career);
          if (index !== -1) {
            this.Appointments[index].values.push(response.value);
          } else {
            const tmpAppointment: iAppointmentGroup = { _id: [response.career], values: [response.value] };
            this.Appointments.push(tmpAppointment);
          }
          this.loadAppointment();
        }
    }, _ => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
    });
  }

  addTitled($event) {
    this.addEvent($event, true);
  }

  addEvent($event, isTitled: boolean = false): void {
    let dialogRef;
    const mapedDenyDays = this.denyDays.map( dd=> dd.date);
    console.log(mapedDenyDays, $event,'33');
    
    if (isTitled) {
      dialogRef = this.dialog.open(
        NewTitleComponent, {
        data: {
          operation: eOperation.DML,
          event: $event
        },
        disableClose: true,
        hasBackdrop: true,
        width: '70vw'
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
        width: '60vw'
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
      // Para no llamar a la bd
      if (typeof (response) !== 'undefined') {
        const index = this.Appointments.findIndex(x => x._id[0] === response.career);
        if (index !== -1) {
          this.Appointments[index].values.push(response.value);
        } else {
          const tmpAppointment: iAppointmentGroup = { _id: [response.career], values: [response.value] };
          this.Appointments.push(tmpAppointment);
        }
        this.loadAppointment();
      }
    }, _ => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
    });
  } 

  viewEvent($event): void {
    const tmpAppointment: iAppointment =
      this.searchAppointment($event.title.split(' ')[1], $event.start, $event.title.split(' ').slice(2).join(' '));
    const dialogRef = this.dialog.open(ViewMoreComponent, {
      data: {
        Appointment: tmpAppointment
      },
      disableClose: false,
      hasBackdrop: true,
      width: '60em'
    });
  }

  cancelledEvent($event): void {
    this.confirmDenial($event, eStatusRequest.CANCELLED);
  }

  confirmDenial($event: any, operation: eStatusRequest): void {
    const AppointmentCareer = this.searchAppointmentByCareer($event.title.split(' ')[1]);
    const tmpAppointment: iAppointment =
      this.searchAppointmentInGroup(AppointmentCareer, $event.start, $event.title.split(' ').slice(2).join(' '));
    if (typeof (tmpAppointment) !== 'undefined') {
      if (tmpAppointment.option === 'XI - TITULACIÓN INTEGRAL') {
        const msnCancel = `¿ESTÁ SEGURO DE CANCELAR EL ESPACIO DE ${tmpAppointment.student}?`;
        const msnReject = `¿ESTÁ SEGURO DE RECHAZAR EL ESPACIO DE ${tmpAppointment.student}?`;
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
              this._RequestProvider.updateRequest(tmpAppointment.id, data,this.filterRole).subscribe(_ => {
                this._NotificationsServices
                  .showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
                    operation === eStatusRequest.CANCELLED ? 'Evento cancelado' : 'Evento rechazado');
                AppointmentCareer.values.splice(AppointmentCareer.values.findIndex(x => x === tmpAppointment), 1);
                this.loadAppointment();
              }, error => {
                const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
                this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
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
              this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Titulación removida');
              AppointmentCareer.values.splice(AppointmentCareer.values.findIndex(x => x === tmpAppointment), 1);
              this.loadAppointment();
            }, error => {
              const tmpJson = JSON.parse(error._body);
              this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', tmpJson.message);
            });
          }
        });
      }
    } else {
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Evento no encontrado, reporte el problema');
    }
  }

  searchAppointment(abbreviation: string, date: any, student: string): iAppointment {
    const AppointmentCareer = this.searchAppointmentByCareer(abbreviation);
    const size = AppointmentCareer.values.length;
    let tmpAppointment: iAppointment;
    const Student: string = student;
    for (let i = 0; i < size; i++) {
      const eventDate = new Date(date);
      const appointmentDate = new Date(AppointmentCareer.values[i].proposedDate);
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
      const eventDate = new Date(date);
      const appointmentDate = new Date(AppointmentCareer.values[i].proposedDate);
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
    const AppointmentCareer = this.Appointments.find(x => x._id[0] === tmpCarrera.carrer);
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
      });
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
    let tmpStudentData;
    //Obtencion de datos del evento
    let student = $event.title.split(' ').slice(2).join(' ');
    let abbreviation = $event.title.split(' ')[1];
    let career = this.carrers.find(x => x.abbreviation === abbreviation);

    // Busqueda del evento
    let tmpValor: { id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string };
    for (let i = 0; i < this.Appointments.length; i++) {
      for (let j = 0; j < this.Appointments[i].values.length; j++) {
        const tmpFecha: Date = new Date(this.Appointments[i].values[j].proposedDate);
        tmpFecha.setHours(0, 0, 0, 0);
        if (tmpFecha.getTime() === tmpDate.getTime()
          && this.Appointments[i].values[j].proposedHour === tmpMinutes
          && this.Appointments[i].values[j].student[0].trim() === student.trim()
          && this.Appointments[i]._id[0].trim() === career.carrer.trim()
        ) {
          tmpValor = this.Appointments[i].values[j];
          tmpStudentData = this.Appointments[i].values[j];
          index = { appointment: i, value: j };
          var departamento;
          switch(career.carrer){
            case "ARQUITECTURA" :
              departamento = 'DEPARTAMENTO DE CIENCIAS DE LA TIERRA';
              break;
            case "INGENIERÍA CIVIL" :
              departamento = 'DEPARTAMENTO DE INGENIERÍA CIVIL';
              break;
            case "INGENIERÍA BIOQUÍMICA" :
              departamento = 'DEPARTAMENTO DE INGENIERÍA QUÍMICA Y BIOQUÍMICA';
              break;
            case "INGENIERÍA EN GESTIÓN EMPRESARIAL" :
              departamento = 'DEPARTAMENTO DE CIENCIAS ECONÓMICO ADMINISTRATIVAS';
              break;
            case "INGENIERÍA QUÍMICA" :
              departamento = 'DEPARTAMENTO DE INGENIERÍA QUÍMICA Y BIOQUÍMICA';
              break;
            case "INGENIERÍA MECATRÓNICA" :
              departamento = 'DEPARTAMENTO DE INGENIERÍA ELÉCTRICA Y ELECTRÓNICA';
              break;
            case "INGENIERÍA ELÉCTRICA" :
              departamento = 'DEPARTAMENTO DE INGENIERÍA ELÉCTRICA Y ELECTRÓNICA';
              break;
            case "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES" :
              departamento = 'DEPARTAMENTO DE SISTEMAS Y COMPUTACIÓN'
              break;
            case "INGENIERÍA EN SISTEMAS COMPUTACIONALES" :
              departamento = 'DEPARTAMENTO DE SISTEMAS Y COMPUTACIÓN'
              break;
            case "INGENIERÍA INDUSTRIAL" :
              departamento = 'DEPARTAMENTO DE INGENIERÍA INDUSTRIAL';
              break;
            case "LICENCIATURA EN ADMINISTRACIÓN" :
              departamento = 'DEPARTAMENTO DE CIENCIAS ECONÓMICO ADMINISTRATIVAS';
              break;
            case "LICENCIATURA EN INFORMÁTICA" :
              departamento = 'DEPARTAMENTO DE SISTEMAS Y COMPUTACIÓN';
              break;
         }
          this._DepartmentProvider.getDepartmentBossSecretary(departamento).subscribe(res => {
            this.employees = res.department;
          });
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
          let hours = tmpStudentData.proposedHour / 60;
          let minutes = tmpStudentData.proposedHour % 60;
          let hour = ((hours > 9) ? (hours + "") : ("0" + hours)) + ":" + ((minutes > 9) ? (minutes + "") : ("0" + minutes));
          let date = moment(tmpStudentData.proposedDate).format('LLL');

          const data = {
            operation: eStatusRequest.ACCEPT,
            doer: this._CookiesService.getData().user.name.fullName,
            phase: eRequest.ASSIGNED,
            jurado: tmpStudentData.jury,
            fechaEvento: date.slice(0,date.length-5),
            horaEvento: hour,
            lugarEvento: tmpStudentData.place,
            duracionEvento: tmpStudentData.duration,
            nombreAlumno: tmpStudentData.student[0],
            carreraAlumno: career.carrer,
            nombreProyecto: tmpStudentData.project,
            opcionTitulacion: tmpStudentData.product,
            departamentoEmail: this.employees
          };
          this._RequestProvider.updateRequest(tmpValor.id, data,this.filterRole).subscribe(_ => {
            this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Fecha propuesta aceptada');
            // tmpValor.phase = "Realizado";
            this.Appointments[index.appointment].values[index.value].phase = 'Realizado';
            this.loadAppointment();
            // this.refresh.next();
          }, _ => {
            this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
          });
        }
      });
    }

  }

  eventClicked($event) { }

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

  getFolder(controlNumber: string): void {
    this._StudentProvider.getDriveFolderId(controlNumber, eFOLDER.TITULACION).subscribe(folder => {
      this.folderId = folder.folderIdInDrive;
    });
  }

  public castRequest(element: any): iRequest {
    const tmp: iRequest = new Object(); // <iRequest>element;
    tmp._id = element._id;
    tmp.status = element.status;
    tmp.controlNumber = element.studentId.controlNumber;
    tmp.phase = element.phase;
    tmp.career = element.studentId.career;
    tmp.fullName = element.studentId.fullName;
    tmp.student = element.studentId;
    tmp.studentId = element.studentId._id;
    tmp.jury = element.jury;
    tmp.duration = element.duration;
    tmp.proposedHour = element.proposedHour;
    tmp.proposedDate = element.proposedDate;
    tmp.adviser = element.adviser;
    tmp.history = element.history;
    tmp.honorificMention = element.honorificMention;
    tmp.observation = element.observation;
    tmp.noIntegrants = element.noIntegrants;
    tmp.projectName = element.projectName;
    tmp.telephone = element.telephone;
    tmp.integrants = element.integrants;
    tmp.email = element.email;
    tmp.product = element.product;
    tmp.titulationOption = element.titulationOption;
    tmp.place = element.place;
    tmp.grade = element.grade;
    tmp.department = element.department;
    tmp.applicationDateLocal = new Date(element.applicationDate).toLocaleDateString();
    tmp.lastModifiedLocal = new Date(element.lastModified).toLocaleDateString();
    tmp.registry = element.registry;
    tmp.documents = element.documents;
    tmp.isIntegral = typeof (element.isIntegral) !== 'undefined' ? element.isIntegral : true;
    return tmp;
  }

  async documentation($event: any) {
    const AppointmentCareer = this.searchAppointmentByCareer($event.title.split(' ')[1]);
    const tmpAppointment: iAppointment =
      this.searchAppointmentInGroup(AppointmentCareer, $event.start, $event.title.split(' ').slice(2).join(' '));    
    const _request: iRequest = await this.getRequestById(tmpAppointment.id);
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Generando documentación');
    this.loadingService.setLoading(true);
    
    const oRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
    this.getFolder(_request.controlNumber);

    await this.delay(2000);
    const fileData = {
      file: {
        mimetype: 'application/pdf',
        data: oRequest.documentSend(eFILES.JURAMENTO_ETICA),
        name: eFILES.JURAMENTO_ETICA + '.pdf',
      },
      folderId: this.folderId,
      isJsPdf: true,
      Document: eFILES.JURAMENTO_ETICA,
      phase: _request.phase,
      IsEdit: 'true'
    };
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto Recepcional', 'Generando código de ética');
    this._RequestProvider.uploadFile(tmpAppointment.id, fileData).subscribe(_ => {
      if (_request.status === 'Pendiente') {
        const data = {
          doer: this._CookiesService.getData().user.name.fullName,
          observation: '',
          phase: eRequest.REALIZED,
          operation: eStatusRequest.PROCESS
        };
        this._RequestProvider.updateRequest(tmpAppointment.id, data,this.filterRole).subscribe(__ => {
          window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
          this.reload();
          this.loadingService.setLoading(false);
        }, __ => {
          this.loadingService.setLoading(false);
          this._NotificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
        });
      } else {
        window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
        this.loadingService.setLoading(false);
      }
    }, _ => {
      this.loadingService.setLoading(false);
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
    });
  }

  async getRequestById(Identificador) {
    return new Promise(resolve => {
      this._RequestProvider.getRequestById(Identificador).subscribe(
        request => {
          const tmpRequest: iRequest = this.castRequest(request.request[0]);
          resolve(tmpRequest);
        }, error => {
          resolve(null);
        }
      );
    });
  }

  excelExport() {
    const filteredCareers = this.carrers.filter((ca) => ca.status == true);
    this.mapedStudents = [];
    if (filteredCareers.length > 0) {
      this.loadingService.setLoading(true);
      const y = 60;

      const doc = this.newDocumentTec(true, false);
      doc.setTextColor(0, 0, 0);
      doc.setFont(this.FONT, 'Bold');
      doc.setFontSize(10);
      // doc.text('INSTITUTO TECNOLÓGICO DE TEPIC', (this.WIDTH / 2), 45, { align: 'center' });
      doc.text('AGENDA DE ACTO RECEPCIONAL', (this.WIDTH / 2), 45, { align: 'center' });
      doc.setFont(this.FONT, 'Normal');
      doc.setFontSize(8);

      filteredCareers.forEach((car) => {
        const filtered = this.Appointments.filter((ap) => ap._id[0] == car.carrer).map(
          (care) => care.values
        )[0];
        if (filtered) {

          const maped = filtered.
            map((st) => ({
              date: moment(st.proposedDate).format('LL'),
              hour: moment(new Date(st.proposedDate).setHours(st.proposedHour / 60, st.proposedHour % 60, 0, 0)).format('HH:mm'),
              student: st.student,
              place: st.place,
              jury: st.jury
                .map((jr: any, index: number) =>
                  index === 0
                  ? 'PRESIDENTE(A): ' + jr.name
                  : index === 1
                  ? 'SECRETARIO(A): ' + jr.name
                  : index === 2
                  ? 'VOCAL: ' + jr.name
                  : 'VOCAL SUPLENTE: ' + jr.name
                ).join('\r\n'),
                dateWithoutFormat: moment(st.proposedDate),
                career: car.abbreviation
            }));

          for(let i=0; i < maped.length; i++){
            for(let j = 0; j < maped.length-i-1; j++){
              let prev = maped[j].dateWithoutFormat;
              let next = maped[j+1].dateWithoutFormat;
              if(prev > next){
                let tmp = maped[j];
                maped[j] = maped[j+1];
                maped[j+1] = tmp;
              }
            }
          }
          maped.forEach(maped=>{
            this.mapedStudents.push(maped);
          });
        }

      });
      this.loadingService.setLoading(false);
      setTimeout(() => {
        this.loadingService.setLoading(false);
        doc.autoTable(
          {
            html: '#table',
            theme: 'grid',
            startY: y,
            headStyles: { fillColor: [24, 57, 105], halign: 'center', valign: 'middle' },
            bodyStyles: { textColor: [0, 0, 0] },
            columnStyles: {
              0: { cellWidth: 1, halign: 'center', valign: 'middle' },
              1: { cellWidth: 2, halign: 'center', valign: 'middle' },
              2: { cellWidth: 35, halign: 'center', valign: 'middle' },
              3: { cellWidth: 7, halign: 'center', valign: 'middle' },
              4: { cellWidth: 40, halign: 'center', valign: 'middle' },
              5: { cellWidth: 30, halign: 'center', valign: 'middle' },
              6: { cellWidth: 100, halign: 'left', valign: 'middle' },
            }
          }
        );

        window.open(doc.output('bloburl'), '_blank');
      }, 500);

    }
  }

  private newDocumentTec(header = true, footer = true) {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'letter',
      orientation: 'landscape'
    });
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');
    if (header) {
      this.addHeaderTec(doc);
    }
    if (footer) {
      this.addFooterTec(doc);
    }
    return doc;
  }

  private addHeaderTec(document) {
    const tecnmHeight = 15;
    const sepHeight = tecnmHeight * 100 / 53;
    document.setFont(this.FONT, 'Bold');
    document.setFontSize(8);
    document.setTextColor(189, 189, 189);
    // Logo Izquierdo
    document.addImage(this.sepLogo, 'PNG', this.MARGIN.LEFT - 5, 1, 35 * 3, sepHeight);
    // Logo Derecho
    document.addImage(this.tecNacLogoTitle, 'PNG', 215, 5, 40, tecnmHeight);
    document.text('Instituto Tecnólogico de Tepic', 212, 23, { align: 'left' });
  }

  private addFooterTec(document) {
    document.setFont(this.FONT, 'Bold');
    document.setFontSize(8);
    document.setTextColor(189, 189, 189);
    document.addImage(this.tecLogo, 'PNG', this.MARGIN.LEFT, this.HEIGHT - this.MARGIN.BOTTOM, 17, 17);
    // document.setTextColor(183, 178, 178);
    document.text('Av. Tecnológico #2595 Fracc. Lagos del Country C.P. 63175', (this.WIDTH / 2), 260, { align: 'center' });
    document.text('Tepic, Nayarit Tel. 01 (311) 211 94 00 y 211 94 01. email: info@ittepic.edu.mx',
      (this.WIDTH / 2), 265, { align: 'center' });
    document.text('www.ittepic.edu.mx', (this.WIDTH / 2), 270, { align: 'center' });
  }

  private _getImageToPdf() {
    this._getImage.getBase64('assets/imgs/sep.png').then(logo => {
      this.sepLogo = logo;
    });

    this._getImage.getBase64('assets/imgs/ittepic-sm.png').then(logo => {
      this.tecLogo = logo;
    });

    this._getImage.getBase64('assets/imgs/tecnm.png').then(logo => {
      this.tecNacLogoTitle = logo;
    });

    this._getImage.getBase64('assets/fonts/Montserrat-Regular.ttf').then(base64 => {
      this.montserratNormal = base64.toString().split(',')[1];
    });

    this._getImage.getBase64('assets/fonts/Montserrat-Bold.ttf').then(base64 => {
      this.montserratBold = base64.toString().split(',')[1];
    });
  }

  //check if the day it's blocked for display option in context menu
  public isDayBlocked = this.dayBlocked.bind(this);  
  private dayBlocked(day: any): boolean {       
   return day.events.filter( ev=> ev.title === 'Día bloqueado').length > 0;  
  }
  //check if the day it's free for display option in context menu
  public isDayFree = this.dayFree.bind(this);  
  private dayFree(day: any): boolean {       
   return day.events.length == 0;  
  }
  //check if the day it's free for display option in context menu
  public isJuryOfficeSign = this.juryOffice.bind(this);  
  private juryOffice(day: any): boolean {       
    console.log(day);
    
   return day.phase == 'Realizado' && day.status == 'Process';  
  }
  //disable or enable a day
  async disableDay(event){    
    
    const ev = event.events.length > 0 ? 
                event.events.filter(e=> e.title == 'Día bloqueado').length > 0
                ? 'bloqueado' : 'ocupado' : 'libre';
    if(ev == 'libre'){
      const curdate = new Date();
      curdate.setHours(0,0,0);
      curdate.setDate(new Date().getDate()-1);
      if(event.date < curdate){
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'No se puede bloquear un día antes de hoy');  
      }else{              
        event.date.setHours(23,59,59);        
       
          const answer = await this.showAlert('¿Bloquear el día?');
          if(answer){
            this._DenyDayProvider.add({date:event.date}).toPromise().then(
              res=>{
                this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Día deshabilitado');  
                this.reload();
              },
              err=>this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Algo salió mal')
            ).catch(err=>this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Algo salió mal'));
          }        
      }
      
    }else if(ev == 'ocupado'){
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ya se agendaron solicitudes ese día');
    }else{
      //enable day again
      const id = event.events[0].id;
      this._DenyDayProvider.remove(id).toPromise().then(
        (deleted)=>{
          this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Día habilitado');  
                this.reload();
        },
        (err)=>{
          this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Algo salio mal al desbloquear el día'); console.error(err);
        }
      ).catch((err)=>{
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Algo salio mal al desbloquear el día'); console.error(err);
      });
      
      // this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'El día ya a sido bloqueado');
    }
    
  }

  showAlert(message: string, buttons: { accept: string, cancel: string } = { accept: 'Aceptar', cancel: 'Cancelar' }):any {
    return new Promise((resolve) => {
      Swal.fire({
        title: message,
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: buttons.cancel,
        confirmButtonText: buttons.accept
      }).then((result) => {
        if (result.value) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

}

interface iAppointmentGroup {
  _id: string[];
  values: [iAppointment];
}

interface iCarrera {
  carrer: string;
  class: string;
  abbreviation: string;
  icon: string;
  status: boolean;
  color: {
    primary: string;
    secondary: string;
  };
}

interface iAppointment {
  id: string;
  student: string[];
  project: string;
  proposedDate: Date;
  proposedHour: number;
  phase: string;
  jury: Array<string>;
  place: string;
  duration: number;
  option: string;
  product: string;
  status?:string
}
