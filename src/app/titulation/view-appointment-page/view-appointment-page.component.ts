import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CalendarEvent, CalendarMonthViewBeforeRenderEvent, CalendarView } from 'angular-calendar';
import { isSameDay, isSameMonth } from 'date-fns';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { sourceDataProvider } from 'src/app/providers/reception-act/sourceData.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { ActNotificacionComponent } from 'src/app/titulation/act-notificacion/act-notificacion.component';
import { ViewMoreComponent } from 'src/app/titulation/view-more/view-more.component';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'src/app/services/app/web-socket.service';
import { eRecActEvents } from 'src/app/enumerators/shared/sockets.enum';
require('jspdf-autotable');
const jsPDF = require('jspdf');

moment.locale('es');

@Component({
  selector: 'app-view-appointment-page',
  templateUrl: './view-appointment-page.component.html',
  styleUrls: ['./view-appointment-page.component.scss']
})
export class ViewAppointmentPageComponent implements OnInit, OnDestroy {
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
  private sepLogo: any;
  private tecNacLogoTitle: any;
  private tecLogo: any;
  private montserratNormal: any;
  private montserratBold: any;
  mapedStudents = [];

  carrers: iCarrera[];
  allCarrers: iCarrera[];
  activeDayIsOpen = true;
  maxDate: Date = new Date(2019, 11, 15);
  viewDate = new Date();
  events: CalendarEvent[];
  excludeDays: number[] = [0, 6];
  Appointments: Array<iAppointmentGroup> = [];
  refresh: Subject<any> = new Subject();
  request: iRequest;
  view: CalendarView = CalendarView.Month;
  locale = 'es';
  role: string;
  private subscriptions: Array<Subscription> = [];
  constructor(
    public _RequestProvider: RequestProvider,
    public _NotificationsServices: NotificationsServices,
    private _sourceDataProvider: sourceDataProvider,
    public _InscriptionsProvider: InscriptionsProvider,
    public dialog: MatDialog,
    private _CookiesService: CookiesService,
    public _getImage: ImageToBase64Service,
    private loadingService: LoadingService,
    private webSocketService: WebSocketService,
  ) {
    this.carrers = [];
    this._getImageToPdf();
  }

  async ngOnInit() {
    // let currentPosition: any = await this.currentPositionService.getCurrentPosition();
    // let tmpCarrers = currentPosition.ascription.careers;
    const tmpCarrers = this._CookiesService.getPosition().ascription.careers;
    this.allCarrers = this._sourceDataProvider.getCareerAbbreviation(); // this.carrers.slice(0);
    this.allCarrers.forEach(element => {
      const i = tmpCarrers.findIndex(x => x.fullName == element.carrer);
      if (i !== -1) {
        this.carrers.push(element);
      }
    });

    this._InscriptionsProvider.getActivePeriod().subscribe(
      periodo => {
        if (typeof (periodo) !== 'undefined' && typeof (periodo.period) !== 'undefined' && periodo.period.active) {
          this.maxDate = new Date(periodo.period.arecPerEndDate);
          this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
        }
      });
  }
  ngOnDestroy(){        
    this.subscriptions.forEach((subscription: Subscription) => {
      if(!subscription.closed)
        subscription.unsubscribe();
    });
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
    const minDate = new Date(this.viewDate.getTime());
    const maxDate = new Date(this.viewDate.getTime());
    minDate.setDate(minDate.getDate() - minDate.getDay());
    maxDate.setDate(maxDate.getDate() + (6 - maxDate.getDay()));

    this.subscriptions.push(
      this.webSocketService.listen(eRecActEvents.GET_DIARY).subscribe( data=>{
        if (typeof (data.Diary) !== 'undefined') {
          this.Appointments = data.Diary;
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

  loadAppointment(): void {
    this.events = [];
    this.allCarrers.forEach(career => {
      let tmp: {
        _id: string[],
        values: [{
          id: string,
          student: string[],
          proposedDate: Date,
          proposedHour: number,
          phase: string,
          duration: number
        }]
      };
      tmp = this.Appointments.find(x => x._id[0] === career.carrer);
      if (typeof (tmp) != 'undefined') {
        tmp.values.forEach(element => {
          const vFecha = element.proposedDate.toString().split('T')[0].split('-');
          const tmpStart = new Date(element.proposedDate);
          const tmpEnd = new Date(element.proposedDate);
          tmpStart.setHours(0, 0, 0, 0);
          tmpEnd.setHours(0, 0, 0, 0);
          tmpStart.setMinutes(element.proposedHour);
          tmpEnd.setMinutes(element.proposedHour + element.duration);
          let title = '';
          const index = this.carrers.findIndex(x => x.carrer === career.carrer);
          if (index !== -1 && this.carrers[index].status) {
            title = moment(tmpStart).format('LT') + ' ' + career.abbreviation + ' ' + element.student[0];
            this.events.push({
              title: title,
              start: tmpStart,
              end: tmpEnd,
              color: (element.phase === 'Asignado'
                ? career.color
                : { primary: '#00c853', secondary: '#69f0ae' }
              )
            });
          } else {
            title = element.phase === 'Asignado' ? ' Evento Solicitado' : ' Evento Reservado';
            this.events.push({
              title: title,
              start: tmpStart,
              end: tmpEnd,
              color: (element.phase == 'Asignado'
                ? { primary: '#b64443', secondary: '#dcdcdc' }
                : { primary: '#b64443', secondary: '#e5bab9' }
              )
            });
          }
        });
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
    const title: string = $event.title;
    if (!title.includes('Evento')) {
      const tmpAppointment: iAppointment =
        this.searchAppointment($event.title.split(' ')[1], $event.start, $event.title.split(' ').slice(2).join(' '));
      const dialogRef = this.dialog.open(ViewMoreComponent, {
        data: {
          Appointment: tmpAppointment
        },
        disableClose: true,
        hasBackdrop: true,
        width: '45em'
      });
    }
  }



  genTrades($event): void {
    const title: string = $event.title;
    if (!title.includes('Evento')) {
      const tmpAppointment: iAppointment =
        this.searchAppointment($event.title.split(' ')[1], $event.start, $event.title.split(' ').slice(2).join(' '));
      const dialogRef = this.dialog.open(ActNotificacionComponent, {
        data: {
          Appointment: tmpAppointment
        },
        disableClose: true,
        hasBackdrop: true,
        width: '45em'
      });
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

  searchAppointmentByCareer(abbreviation: string): iAppointmentGroup {
    const tmpCarrera = this.carrers.find(x => x.abbreviation === abbreviation);
    const AppointmentCareer = this.Appointments.find(x => x._id[0] === tmpCarrera.carrer);
    return AppointmentCareer;
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
                  ? 'PRESIDENTE: ' + jr.name
                  : index === 1
                  ? 'SECRETARIO: ' + jr.name
                  : index === 2
                  ? 'VOCAL ' + jr.name
                  : 'VOCAL SUPLENTE: ' + jr.name
                ).join('\r\n'),
                dateWithoutFormat: moment(st.proposedDate)
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
      setTimeout(() => {
        doc.autoTable(
          {
            html: '#table',
            theme: 'grid',
            startY: y,
            headStyles: { fillColor: [24, 57, 105], halign: 'center', valign: 'middle' },
            bodyStyles: { textColor: [0, 0, 0] },
            columnStyles: {
              0: { cellWidth: 10, halign: 'center', valign: 'middle' },
              1: { cellWidth: 30, halign: 'center', valign: 'middle' },
              2: { cellWidth: 10, halign: 'center', valign: 'middle' },
              3: { cellWidth: 40, halign: 'center', valign: 'middle' },
              4: { cellWidth: 30, halign: 'center', valign: 'middle' },
              5: { cellWidth: 80, halign: 'center', valign: 'middle' },
            }
          }
        );
        this.loadingService.setLoading(false);
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
}

interface iAppointmentGroup {
  _id: string[],
  values: [iAppointment]
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
  proposedDate: Date;
  proposedHour: number;
  phase: string;
  jury: Array<string>;
  place: string;
  duration: number;
}
