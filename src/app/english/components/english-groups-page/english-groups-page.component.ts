import { Component, ElementRef, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAutocomplete, MatChipInputEvent } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { LoadingService } from 'src/app/services/app/loading.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
const jsPDF = require('jspdf');
require('jspdf-autotable');
import * as moment from 'moment';
moment.locale('es');

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';

import { IPeriod } from '../../../entities/shared/period.model';
import { IGroup } from '../../entities/group.model';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { GroupProvider } from 'src/app/english/providers/group.prov'
import { GroupStudentsComponent } from 'src/app/english/components/english-courses-page/group-students/group-students.component';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';

// Importar Enumeradores
import { EStatusGroup } from 'src/app/english/enumerators/status-group.enum';
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';
import { UploadAvgsModalComponent } from '../upload-avgs-modal/upload-avgs-modal.component';
import { IRequestCourse } from '../../entities/request-course.model';

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
  excelData;
  pdfData;
  scheduleData;
  actData;
  teacher;

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  constructor(
    private _CookiesService: CookiesService,
    public dialog: MatDialog,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private requestProvider: RequestProvider,
    private requestCourseProv: RequestCourseProvider,
    private notificationsServices: NotificationsServices,
    private loadingService: LoadingService,
    private imageToBase64Serv: ImageToBase64Service,
    private groupProvider: GroupProvider) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
   }

  async ngOnInit() {

    await this.getData();

    this.groupProvider.getAllGroupByTeacher(this._CookiesService.getData().user._id)

    this.teacher = {
      name: this._CookiesService.getData().user.name,
      email: this._CookiesService.getData().user.email
    } 

    this.requestProvider.getPeriods().subscribe(
      (periods) => {
        this.periods = periods.periods;
        this.filteredPeriods = periods.periods;
        this.updatePeriods(this.filteredPeriods.filter(per => per.active === true)[0], 'insert');
      }
    );

    // Convertir imágenes a base 64 para los reportes
    this.imageToBase64Serv.getBase64('assets/imgs/logoTecNM.png').then(res1 => {
      this.logoTecNM = res1;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoEducacionSEP.png').then(res2 => {
      this.logoSep = res2;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoITTepic.png').then(res3 => {
      this.logoTecTepic = res3;
    });
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

    this.showGroups = this.groups.slice(0); // copia del array

    if (this.usedPeriods) {
      if (this.usedPeriods.length > 0) {
        this.showGroups = this.showGroups.filter(
          (req: any) => this.usedPeriods.map(per => (per._id)).includes((req.period._id))
        );
      } else {
        this.showGroups = this.showGroups;
      }
    } else {
      this.showGroups = this.showGroups;
    }
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

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        await this.getData();
        this.applyFilters();
      }
    });

  }

  async downloadExcel(group){ 
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando Reporte Excel');
      this.excelData = {
        students : await this.getStudentsGroup(group._id),
        group: group,
        schedule: await this.getScheduleDaysGroup(group.schedule),
        teacher: this.teacher
      }    
      setTimeout(() => {
        TableToExcel.convert(document.getElementById('tableExcelReport'), {
          name: 'Reporte Alumnos Inglés Grupo ' + this.excelData.group.name + '.xlsx',
          sheet: {
            name: 'Alumnos'
          }
        });
      }, 2000);
  }

  async downloadPDF(group){
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando Reporte PDF');
    this.pdfData = {
      students : await this.getStudentsGroup(group._id),
      group: group,
      schedule: await this.getScheduleDaysGroup(group.schedule),
      teacher: this.teacher
    }    
    setTimeout(() => {
      this.generatePDFReport();
    }, 2000);
  }

  async generateAct(group){
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando Acta Calificaciones');
    this.actData = {
      students : await this.getStudentsGroup(group._id),
      group: group,
      schedule: await this.getScheduleDaysGroup(group.schedule),
      teacher: this.teacher
    }    
    setTimeout(() => {
      this.generatePDFAct();
    }, 2000);
  }

  generatePDFReport() {
    this.loadingService.setLoading(true);
    var doc = new jsPDF('p', 'pt');

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 5, 163, 40); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 145, 2, 103, 44); // Logo TecNM

    let header = 'Lista de Alumnos';
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text(header, pageWidth / 2, 59, 'center');

    doc.autoTable({
      html: '#tablePdfReportHead',
      theme: 'plain',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle', fontSize: 6, fontStyle: 'bold', cellPadding:2 },
      margin: { top: 70 },
    });
    doc.autoTable({
      html: '#tablePdfReport',
      theme: 'striped',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle', fontSize: 6, fontStyle: 'bold', cellPadding:2 },
      startY: 110
    });

    // FOOTER
    var today = new Date();
    var m = today.getMonth() + 1;
    var mes = (m < 10) ? '0' + m : m;
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 25, pageHeight - 60, 50, 50); // Logo SEP
    let footer = '© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n';
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(footer, pageWidth / 2, pageHeight - 12, 'center');

    // Hour PDF
    let hour = today.getDate() + '/' + mes + '/' + today.getFullYear()
      + ' - ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    doc.setTextColor(100);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(hour, pageWidth - 45, pageHeight - 5, 'center');
    window.open(doc.output('bloburl'), '_blank');
    this.loadingService.setLoading(false);
    //doc.save("Reporte Alumnos Inglés Grupo "+this.pdfData.group.name+".pdf");
  }

  generatePDFAct() {
    this.loadingService.setLoading(true);
    var doc = new jsPDF('p', 'pt');

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 36, 5, 163, 40); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 145, 2, 103, 44); // Logo TecNM

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text('Instituto Tecnológico de Tepic', pageWidth / 2, 59, 'center');
    doc.setFontSize(10);
    doc.text('ACTA DE CALIFICACIONES', 40, 75, 'left');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFontStyle('normal');
    doc.text('CURSO:', 40, 85, 'left');
    doc.text('BLOQUE:', 40, 95, 'left');
    doc.text('PROFESOR:', 40, 105, 'left');
    doc.text('GRUPO:', pageWidth - 145, 105, 'left');
    doc.text('PERIODO:', 40, 115, 'left');
    doc.text('ALUMNOS:', pageWidth - 145, 115, 'left');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFontStyle('bold');
    doc.text(this.actData.group.course.name, 100, 85, 'left');
    doc.text(this.actData.group.level.toString(), 100, 95, 'left');
    doc.text(this.actData.teacher.name.fullName, 100, 105, 'left');
    doc.text(this.actData.group.name, pageWidth - 85, 105, 'left');
    doc.text(this.actData.group.period.periodName+'/'+this.actData.group.period.year, 100, 115, 'left');
    doc.text(this.actData.group.reqActCount.toString(), pageWidth - 85, 115, 'left');

    doc.autoTable({
      html: '#tablePdfActHead',
      theme: 'grid',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle', fontSize: 7, fontStyle: 'bold', cellPadding:1},
      margin: { top: 120 }
    });

    doc.autoTable({
      html: '#tablePdfAct',
      theme: 'grid',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle' , fontSize: 7, fontStyle: 'bold', cellPadding:1},
      startY: 159
    });



    // FOOTER
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFontStyle('normal');
    doc.text('Este documento no es válido si tiene tachaduras o enmendaduras', 40, pageHeight - 60, 'left');
    doc.text('Tepic, Nay., a '+moment(new Date()).format('LL'), 40, pageHeight - 50, 'left');
    doc.text("Firma del Profesor:",(pageWidth/2)+40, pageHeight - 60, 'left');
    doc.setDrawColor(0, 0, 0);
    doc.line((pageWidth/2)+120, (pageHeight - 60), (pageWidth / 2)+257, (pageHeight - 60));

    doc.addImage(this.logoTecTepic, 'PNG', (pageWidth / 2) - 25, pageHeight - 60, 50, 50); // Logo SEP
    let footer = '© ITT Instituto Tecnológico de Tepic\nTepic, Nayarit, México \n';
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle('bold');
    doc.setFontSize(7);
    doc.text(footer, pageWidth / 2, pageHeight - 12, 'center');

    window.open(doc.output('bloburl'), '_blank');
    this.loadingService.setLoading(false);
    //doc.save("Reporte Alumnos Inglés Grupo "+this.pdfData.group.name+".pdf");
  }

  getStudentsGroup(id): Promise<Array<IRequestCourse>>{
    return new Promise((resolve) => {
      this.requestCourseProv.getAllRequestActiveCourse(id).subscribe(async res => { 
        resolve(res.requestCourses);
      });
    });
  }

  getScheduleDaysGroup(schedules) {
    return new Promise((resolve) => {
      var horario = {
        Lunes:{
          hour : '',
          classroom : ''
        },
        Martes:{
          hour : '',
          classroom : ''
        },
        Miercoles:{
          hour : '',
          classroom : ''
        },
        Jueves:{
          hour : '',
          classroom : ''
        },
        Viernes:{
          hour : '',
          classroom : ''
        },
        Sabado:{
          hour : '',
          classroom : ''
        }
      };
      schedules.forEach((schedule, index) => {
        switch (EDaysSchedule[schedule.day]) {
          case 'Lunes':
            horario.Lunes.hour = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
            horario.Lunes.classroom = schedule.classroom ? schedule.classroom :  's/a';
            break;
          case 'Martes':
            horario.Martes.hour = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
            horario.Martes.classroom = schedule.classroom ? schedule.classroom :  's/a';
            break;
          case 'Miércoles':
            horario.Miercoles.hour = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
            horario.Miercoles.classroom = schedule.classroom ? schedule.classroom :  's/a';
            break;
          case 'Jueves':
            horario.Jueves.hour = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
            horario.Jueves.classroom = schedule.classroom ? schedule.classroom :  's/a';
            break;
          case 'Viernes':
            horario.Viernes.hour = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
            horario.Viernes.classroom = schedule.classroom ? schedule.classroom :  's/a';
            break;
          case 'Sábado':
            horario.Sabado.hour = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
            horario.Sabado.classroom = schedule.classroom ? schedule.classroom :  's/a';
            break;
        }
      });
      resolve(horario);
    });
  }

  async uploadAverages(group: IGroup){

    const dialogRef = this.dialog.open(UploadAvgsModalComponent, {
      data: {
        group: group, 
        students : (await this.getStudentsGroup(group._id))
      },
      hasBackdrop: true, height: '70%', width: '90%'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        await this.getData();
        this.applyFilters();
      }
    });
  }

}
