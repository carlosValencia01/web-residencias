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

const jsPDF = require('jspdf');
require('jspdf-autotable');
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
moment.locale('es');
@Component({
  selector: 'app-view-appointment-page',
  templateUrl: './view-appointment-page.component.html',
  styleUrls: ['./view-appointment-page.component.scss']
})
export class ViewAppointmentPageComponent implements OnInit {

  loading: boolean = false;
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
    private _sourceDataProvider: sourceDataProvider, public _InscriptionsProvider: InscriptionsProvider,
    public dialog: MatDialog, private _CookiesService: CookiesService,
    public _getImage: ImageToBase64Service
  ) {
    this.carrers = [];
    // this.role =
    //   //'Secretaria Académica';
    //   // 'Jefe Académico';
    // this._CookiesService.getData().user.rol.name;
    this._getImageToPdf();
  }

  async ngOnInit() {
    // let currentPosition: any = await this.currentPositionService.getCurrentPosition();    
    // let tmpCarrers = currentPosition.ascription.careers;
    let tmpCarrers = this._CookiesService.getPosition().ascription.careers;
    this.allCarrers = this._sourceDataProvider.getCareerAbbreviation();// this.carrers.slice(0);
    this.allCarrers.forEach(element => {
      let i = tmpCarrers.findIndex(x => x.fullName == element.carrer);
      if (i !== -1)
        this.carrers.push(element);
    });

    this._InscriptionsProvider.getActivePeriod().subscribe(
      periodo => {
        if (typeof (periodo) !== 'undefined' && typeof (periodo.period) !== 'undefined' && periodo.period.active) {
          this.maxDate = new Date(periodo.period.arecPerEndDate);
          this.diary(this.viewDate.getMonth(), this.viewDate.getFullYear());
        }
      });

    // //this._sourceDataProvider.getCareerAbbreviation();
    //PASADO
    // this.allCarrers = this._sourceDataProvider.getCareerAbbreviation();// this.carrers.slice(0);
    // this.allCarrers.forEach(element => {
    //   let i = tmpCarrers.findIndex(x => x.fullName == element.carrer);
    //   if (i !== -1)
    //     this.carrers.push(element);
    // });
    //PASADO

    // console.log("CARRERAS__", this.carrers);
    // switch (this.role) {
    //   case eRole.SECRETARYACEDMIC: {
    //     this.filterDepto('ISIC');
    //     break;
    //   }
    //   case eRole.CHIEFACADEMIC: {
    //     // this.filterDepto('IBQA');
    //     this.filterDepto('ISIC');
    //     break;
    //   }
    //   default: {
    //     this.carrers.push({
    //       carrer: 'Todos', class: 'circulo-all', abbreviation: 'All', icon: 'all.png', status: true,
    //       color: { primary: '#57c7d4', secondary: '#ace3ea' }
    //     });
    //     break;
    //   }
    // }
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
        this.loadAppointment();
        this.refresh.next();
      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, "Titulación App",
        error);
    });
  }
  loadAppointment(): void {
    console.log("APPOINTMENTS DE LOAD", this.Appointments);
    this.events = [];
    this.allCarrers.forEach(career => {
      // if (career.status) {
      let tmp: { _id: string[], values: [{ id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, duration: number }] };
      // tmp = this.Appointments.find(x => x._id[0] === career.carrer && career.status);      
      tmp = this.Appointments.find(x => x._id[0] === career.carrer);
      console.log("Appointment__", this.Appointments);
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
      this.loading = true;
      let y = 60;

      const doc = this.newDocumentTec(true, false);
      doc.setTextColor(0, 0, 0);
      doc.setFont(this.FONT, 'Bold');
      doc.setFontSize(10);
      // doc.text('INSTITUTO TECNOLÓGICO DE TEPIC', (this.WIDTH / 2), 45, { align: 'center' });
      doc.text('AGENDA DE ACTO RECEPCIONAL', (this.WIDTH / 2), 45, { align: 'center' });
      doc.setFont(this.FONT, 'Normal');
      doc.setFontSize(8);
      
      console.log(filteredCareers);
      
      filteredCareers.forEach((car) => {       
        const filtered = this.Appointments.filter((ap) => ap._id[0] == car.carrer).map(
          (care) => care.values
        )[0];
        if(filtered)  {
          const maped = filtered.
            map((st) => ({
              date: moment(st.proposedDate).format('LL'),
              hour: moment(new Date(st.proposedDate).setHours(st.proposedHour / 60, st.proposedHour % 60, 0, 0)).format('HH'),
              student: st.student,
              place: st.place,
              jury: st.jury.map((jr: any,index: number) => index == 0 ? 'PRESIDENTE: '+jr.name: index == 1 ? 'SECRETARIO: '+ jr.name : index == 2 ? 'VOCAL '+ jr.name : 'VOCAL SUPLENTE: '+ jr.name).join('\r\n')
            }));
            
          maped.forEach(maped => {
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
        this.loading = false;
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
    // this._getImage.getBase64('assets/imgs/logo.jpg').then(logo => {
    //     this.tecNacLogo = logo;
    // });

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

    // this._getImage.getBase64('assets/imgs/firms/director.png').then(firm => {
    //     this.directorFirm = firm;
    // });

    // this._getImage.getBase64('assets/imgs/firms/servicios.png').then(firm => {
    //     this.serviceFirm = firm;
    // });
  }
}
interface iAppointmentGroup { _id: string[], values: [iAppointment] }
interface iCarrera { carrer: string, class: string, abbreviation: string, icon: string, status: boolean, color: { primary: string; secondary: string; } }
interface iAppointment { id: string, student: string[], proposedDate: Date, proposedHour: number, phase: string, jury: Array<string>, place: string, duration: number }
