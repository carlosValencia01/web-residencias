import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import TableToExcel from '@linways/table-to-excel';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Subscription } from 'rxjs';

// models
import { IGroup } from '../../entities/group.model';
import { IRequestCourse } from '../../entities/request-course.model';
import { IStudent } from 'src/app/entities/shared/student.model';

// enumerators
import { EDaysSchedule } from '../../enumerators/days-schedule.enum';
import { eEnglishEvents } from 'src/app/enumerators/shared/sockets.enum';

// providers
import { GroupProvider } from '../../providers/group.prov';
import { RequestCourseProvider } from '../../providers/request-course.prov';
import { PDFEnglish } from '../../entities/english-pdf-generator';

// services
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { WebSocketService } from 'src/app/services/app/web-socket.service';
@Component({
  selector: 'app-english-students-list-page',
  templateUrl: './english-students-list-page.component.html',
  styleUrls: ['./english-students-list-page.component.scss']
})
export class EnglishStudentsListPageComponent implements OnInit, OnDestroy {
  
  teacher: { name: string, email: string };
  grupId: string;
  students: Array<IRequestCourse>;
  group: IGroup;
  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana
  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana

  dataSource: MatTableDataSource<any>;

  @ViewChild('matPaginatorEnglishStudents') paginatorStudents: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sortStudents') sortStudents: MatSort;
  excelData: { students: any; group: any; schedule: any; teacher: { name: string; email: string; }; };
  pdfData: { students: IRequestCourse[]; group: IGroup; schedule; teacher: { name: string; email: string; }; };

  emptyPDFGenerator: PDFEnglish;
  actData: { students: any; group: any; schedule: any; teacher: { name: string; email: string; }; };
  avgsTemplate;
  subs: Array<Subscription> = [];
  constructor(
    private _CookiesService: CookiesService,
    private router: Router,    
    private requestCourseProv: RequestCourseProvider,
    private notificationsServices: NotificationsServices,
    private loadingService: LoadingService,
    private groupProvider: GroupProvider,
    private imageToBase64Serv: ImageToBase64Service,
    private wsService: WebSocketService,
  ) { }

  ngOnInit() {
    this.teacher = {
      name: this._CookiesService.getData().user.name,
      email: this._CookiesService.getData().user.email
    };
    this.grupId = this.router.url.split('/').pop();
    this._loadData();
  }
  ngOnDestroy(){  
    this.subs.forEach( sub => {
      if(!sub.closed) sub.unsubscribe();
    })
  }
  
  async _loadData(){
    setTimeout(() => {      
      this.emptyPDFGenerator = new PDFEnglish(this.imageToBase64Serv,this._CookiesService);
    }, 300);
    setTimeout(() => {
      if(!this.group){
        this.router.navigate(['/english/english-groups']);
      }
    }, 2000);
    this._getGroup();
    this._getStudentsGroup(this.grupId);    
  }
  _getGroup(){
    this.subs.push( this.wsService.listen(eEnglishEvents.GET_ALL_GROUP_BY_TEACHER).subscribe( ({groups}) => {
      this.group = groups.filter( group => group._id == this.grupId)[0];
      console.log(groups);
      
    }) );
    this.groupProvider.getAllGroupByTeacher(this._CookiesService.getData().user.eid, this._CookiesService.getClientId()).subscribe((data) => {  });

  }

  _getStudentsGroup(id){
    this.subs.push( this.wsService.listen( eEnglishEvents.GET_ALL_REQUEST_ACTIVE_COURSE).subscribe( data =>{
      this.students = data.requestCourses;
      this.createDataSource();  
    }) );
    this.requestCourseProv.getAllRequestActiveCourse(id, this._CookiesService.getClientId()).subscribe(async res => {     
    });

  }

  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
  }
  createDataSource() {
    this.dataSource = new MatTableDataSource(this.students);
    this.dataSource.paginator = this.paginatorStudents;
    this.dataSource.sort = this.sortStudents;

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
  async downloadExcel(){ 
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando Reporte Excel');
      this.excelData = {
        students : this.students,
        group: this.group,
        schedule: await this.getScheduleDaysGroup(this.group.schedule),
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
  async downloadPDF(){
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando Reporte PDF');
    this.pdfData = {
      students : this.students,
      group: this.group,
      schedule: await this.getScheduleDaysGroup(this.group.schedule),
      teacher: this.teacher
    }    
    setTimeout(() => {
      this.generatePDFReport();
    }, 2000);
  }
  async generateAct(){
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando Acta Calificaciones');
    this.actData = {
      students : this.students,
      group: this.group,
      schedule: await this.getScheduleDaysGroup(this.group.schedule),
      teacher: this.teacher
    }    
    setTimeout(() => {
      this.generatePDFAct();
    }, 2000);
  }
  
  generatePDFReport() {
    this.loadingService.setLoading(true);
    const doc1 = this.emptyPDFGenerator.generateGroupStudentsListStep1();
    //await this.delay(200);

    doc1.autoTable({
      html: '#tablePdfReportHead',
      theme: 'plain',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle', fontSize: 6, fontStyle: 'bold', cellPadding:2 },
      margin: { top: 70 },
    });
    doc1.autoTable({
      html: '#tablePdfReport',
      theme: 'striped',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle', fontSize: 6, fontStyle: 'bold', cellPadding:2 },
      startY: 110
    });
    const doc = this.emptyPDFGenerator.generateGroupStudentsListStep2(doc1);
    //await this.delay(3000);    
    window.open(doc.output('bloburl'), '_blank');
    this.loadingService.setLoading(false);
  }
  generatePDFAct() {
    this.loadingService.setLoading(true);
    const doc1 = this.emptyPDFGenerator.generateActaCalificacionesStep1(this.actData);

    doc1.autoTable({
      html: '#tablePdfActHead',
      theme: 'grid',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle', fontSize: 7, fontStyle: 'bold', cellPadding:1},
      margin: { top: 120 }
    });

    doc1.autoTable({
      html: '#tablePdfAct',
      theme: 'grid',
      headStyles: { fillColor: [20, 43, 88], textColor: [255,255,255] },
      styles: { halign: 'center', valign: 'middle' , fontSize: 7, fontStyle: 'bold', cellPadding:1},
      startY: 159
    });

    const doc = this.emptyPDFGenerator.generateGroupStudentsListStep2(doc1);
    
    window.open(doc.output('bloburl'), '_blank');
    this.loadingService.setLoading(false);
  }

  async downloadAvgsTemplate(){
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'INGLÉS', 'Generando plantilla');         
    this.avgsTemplate = this.students.filter( req => !req.average).slice(0);
    await this.delay(600);
    TableToExcel.convert(document.getElementById('tableAvgsExcel'), {
      name: 'Calificaciones Alumnos Inglés Grupo ' + this.group.name + '.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });    

  }
  async uploadAvgs(event){
    this.loadingService.setLoading(true);

    if (event.target.files && event.target.files[0]) {
      this.loadingService.setLoading(false);
      
      let file= event.target.files[0];     
      let fileReader = new FileReader();    
      fileReader.readAsArrayBuffer(file);
      let studentsToUploadAvg = [];
      fileReader.onload = async (e) => {    
          const arrayBuffer: any = fileReader.result;    
          let data = new Uint8Array(arrayBuffer);    
          let arr = new Array();    
          for(let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);    
          const bstr = arr.join("");    
          const workbook = XLSX.read(bstr, {type:"binary"});             
          const first_sheet_name = workbook.SheetNames[0];    
          const worksheet = workbook.Sheets[first_sheet_name];             
          const arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:false});          
          studentsToUploadAvg = this.students.reduce((prev,curr)=>{
            // solo los alumnos que no se le ha registrado el promedio
            if(!curr.average){
              // alumnos de la lista en excel que se encuentran en el grupo
              if(arraylist.map(stu => stu['NO. CONTROL']).includes((curr.englishStudent.studentId as IStudent).controlNumber)){
                let average = arraylist.find( stu => stu['NO. CONTROL'] == (curr.englishStudent.studentId as IStudent).controlNumber)['PROMEDIO'];
                if(average){
                  average = parseFloat(average);
                  if(average >= 0 && average <= 100){
                    prev.push({
                      _id: curr._id,
                      average,
                      englishStudent:curr.englishStudent._id,
                      englishStudent_level:curr.englishStudent.level,
                      group: curr.group
                    });
                  }
                }
              }
            }
            return prev;
          },[]);
          this.loadingService.setLoading(false);
          if(studentsToUploadAvg.length > 0){

            const res = await this.showAlert('GUARDAR CALIFICACIONES',`No podrá actualizar las calificaciones despues  ¿Desea continuar?`);
            if(res){
              this.notificationsServices.showNotification(eNotificationType.INFORMATION,'ÍNGLES','Registrando calificaciones');
              this.loadingService.setLoading(true);
              this.groupProvider.saveAverages({studentsToUploadAvg,groupId:this.grupId,teacherId: this._CookiesService.getData().user.eid}).subscribe((res)=>{
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,'ÍNGLES','Calificaciones registradas');   
                this.loadingService.setLoading(false);           
              });
            }
          }else{
            this.notificationsServices.showNotification(eNotificationType.INFORMATION,'ÍNGLES','No hay calificaciones para registrar');
          }
      }
             
    }
  }

  delay(ms: number){
    return new Promise((resolve)=>{
      setTimeout(() => {
        resolve(true);
      }, ms);
    })
  }
  async setRequestAverage(row){

    let avg = document.getElementById(row._id)['value'];
    if(avg){
      if(!avg.match((/^\d{1,3}(\.\d{1,2})?$/))){//validar numeros 
        if(avg.match((/^\d{1,3}(\.\d{3,10})?$/))){document.getElementById(row._id)['value'] = ''; this.showAlert('ERROR','¡Solo dos decimales!'); return ;}
        document.getElementById(row._id)['value'] = '';  this.showAlert('ERROR','¡Ingresa un promedio valido!'); return ;
        
      }else if(parseFloat(avg)>100){
        document.getElementById(row._id)['value'] = '';  this.showAlert('ERROR','¡El promedio no puede ser mayor a 100!'); return ;
      }
      const res = await this.showAlert('GUARDAR CALIFICACIÓN','Ya no podrá actualizar la calificación ¿Desea continuar?');
      if(res){
        avg = parseFloat(avg);
        let requestQuery = {
          average:avg,
          status: 'approved',
          active: false
        };
        if(avg < 70){
          requestQuery.status = 'not_approved';
        }        
        let studentQuery = {
          status: 'no_choice',
          level: requestQuery.status == 'approved' ? row.level : row.englishStudent.level,
          totalHoursCoursed: requestQuery.status == 'approved' ? (row.englishStudent.totalHoursCoursed+row.group.course.semesterHours) : row.englishStudent.totalHoursCoursed,
          courseType: requestQuery.status == 'approved' ? row.group.course._id : (row.englishStudent.courseType ? row.englishStudent.courseType : null)
        };
        if(requestQuery.status == 'approved' && row.level == row.group.course.totalSemesters){
          studentQuery.status = 'not_released';
        }
        this.groupProvider.saveSingleAverage({studentQuery,requestQuery, request:row,groupId:this.grupId,teacherId: this._CookiesService.getData().user.eid}).subscribe(res=>{});
      }
    }
    
  }

  showAlert(title: string, message: string){
    return new Promise((resolve)=>{
      Swal.fire({
        title,
        text:message,
        type: 'warning',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: 'red',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        focusCancel: true
      }).then((result) => {
        if(result.value){
          return resolve(true);
        }
        resolve(false);
      });
    })
  }
}
