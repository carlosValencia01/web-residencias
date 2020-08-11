import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';
import { GroupProvider } from 'src/app/english/providers/group.prov';

import { StudentRequestsComponent } from 'src/app/english/components/english-courses-page/student-requests/student-requests.component';

import { FormCreateCourseComponent } from 'src/app/english/components/english-courses-page/form-create-course/form-create-course.component';
import { FormGroupComponent } from 'src/app/english/components/english-courses-page/form-group/form-group.component';

import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-english-courses-page',
  templateUrl: './english-courses-page.component.html',
  styleUrls: ['./english-courses-page.component.scss']
})
export class EnglishCoursesPageComponent implements OnInit {

  classrooms: any;
  classroomForm;
  updateClassroomForm;
  scheduleClassroom: Array<any>

  englishCourses: any;
  activePeriod: any;
  groups: any;

  requests: Array<any>;

  weekdays = [1,2,3,4,5,6]; //Dias de la semana

  dayschedule = DaysSchedule; //Enumerador de los dias de la semana

  hourStart = "07:00"; //Tiempo de inicio
  hourEnd = "21:00"; //Tiempo de finalización
  segment = 60; //Cantidad en minutos de los segmentos
  dataHours = []; //Horas que se van a mostrar
  dataSchedule = []; //Arreglo de los dias seleccionados

  @ViewChild("scheduleClassroomAux") dialogRefScheduleClassroomAux: TemplateRef<any>;
  @ViewChild("viewScheduleClassroom") dialogRefViewScheduleClassroom: TemplateRef<any>;
  @ViewChild("viewUpdateClassroom") dialogRefViewUpdateClassroom: TemplateRef<any>;

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private requestCourseProv : RequestCourseProvider,
    private classroomProv: ClassroomProvider,
    private englishCourseProv: EnglishCourseProvider,
    private groupProv: GroupProvider,
    public dialog: MatDialog,
  ) { 
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.createEnglishCourseActive();
    this.createFormClassroom();
    this.createClassrooms();
    this.createEnglishCourses();
    this.createGroups();
    this.getActivePeriod();
  }

  // Solicitudes

  createEnglishCourseActive(){
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourseActive().subscribe(res => {

      res.englishCourses.forEach(course => {
        this.requests = []; 
        this.getOpenGroupsByLevel(course);
      });
      console.log(this.requests);

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  async getOpenGroupsByLevel(course) {

    const x = [];

    for (let i = 1; i <= course.totalSemesters; i++) {

      let data = {
        courseId: course._id,
        level: i,
      };
  
      this.loadingService.setLoading(true);
      await this.groupProv.getAllGroupOpenedByCourseAndLevel(data).subscribe(res => {
  
        if(res.groups.length>0){
          x.push({level: i, haveGroups: true, groups: res.groups});
        }else{  
          x.push({level: i, haveGroups: false, groups: res.groups});
        }
        x.sort((a, b) => a.level - b.level);
  
      },error => {
  
      }, () => this.loadingService.setLoading(false));
      
    };
    
    console.log(x);
    this.requests.push({course: course, data:x});
  }

  /*
  deleteRequestForHour(requestCourseId,dayId,hourId){
    console.log(requestCourseId);
    console.log(dayId);
    console.log(hourId);
  }
  */

  openDialogTableStudents(group): void {

    const dialogRef = this.dialog.open(StudentRequestsComponent, {
      data: {
        group: group
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        const request = {
          name: result.nameCourseSelected,
          period: result.period
        };
      }
      this.ngOnInit();
    });

  }

  // Aulas

  createFormClassroom(){
    this.classroomForm = this.formBuilder.group({
      name: ['', Validators.required],
      schedule: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]]
    });

    this.classroomForm.get('schedule').valueChanges.subscribe(option => {
      switch (option) {
        case '1':
          this.generateAutoSchedule();
          break;
        case '2':
          this.openDialogTableSchedule('1', null);
          break;
      }
    });
  }

  createDataHours(){ //Genera las Horas en segmentos

    this.dataHours = [];

    const start = this.getMinutes(this.hourStart); //Convierte la hora de inicio en minutos
    const end = this.getMinutes(this.hourEnd); //Convierte la hora de fin en minutos

    for (let hour = start; hour < end; hour = hour + this.segment) { //Recorrer de inicio a fin incrementando por segmentos
      this.dataHours.push(this.getHour(hour)); //Guardar el segmento de hora
    }
    console.log(this.dataHours); //Imprimir en consola todos los seegmentos

  }

  getHour(minutes):String{ //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh+':'+mm; //Retorna los minutos en tiempo Ej: "24:00"
  }

  generateShedule(){ //Genera el arreglo en el que se guardaran los valores seleccionados
    this.dataSchedule = [];
    this.dataHours.forEach(a => { //Recorre cada una de las horas
      let week=[]; //define arreglo de dias de la semana
      this.weekdays.forEach(b => { //Recorre cada dia de la semana
        week.push(""); //Agrega valor al dia
      });
      this.dataSchedule.push(week); //Agrega los dias de la semana a la hora
    });
  }

  selectHour(hour){ //Seleccionar hora de la Tabla
    //Si todos los campos estan vacios
    if(this.dataSchedule[hour][0]=="" && this.dataSchedule[hour][1]=="" && this.dataSchedule[hour][2]=="" &&
       this.dataSchedule[hour][3]=="" && this.dataSchedule[hour][4]=="" && this.dataSchedule[hour][5]==""){
         for (let i = 0; i < 5; i++) {//De Lunes a Viernes
          this.dataSchedule[hour][i] = this.dataHours[hour]; //Asignar la hora seleccionada
         }
       }else{//Si no
        for (let i = 0; i < 6; i++) { //De lunes a Sabado
          this.dataSchedule[hour][i] = ""; //Dejar de seleccionar esos dias
         }
       }
  }

  openDialogTableSchedule(type, schedule) {
    let view: any;
    switch (type) {
      case "1":     
        this.segment = 60;
        this.createDataHours();   
        this.generateShedule();
        view = this.dialogRefScheduleClassroomAux;
        break;
    
      case "2":
        this.segment = 30;
        this.createDataHours();
        this.generateShedule();
        this.getShedule(schedule, 'status');
        view = this.dialogRefViewScheduleClassroom;
        break;
    }
    const dialogRef = this.dialog.open(view, {hasBackdrop: true});

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getShedule(shedule, get){
    shedule.forEach(element => {
      
      const psitionHour = this.dataHours.indexOf(this.getHour(element.startHour));
      
      if (psitionHour>-1) {

        switch (get) {
          case 'status':    
            this.dataSchedule[psitionHour][element.day-1] = element.status;
            break;
        
          case 'time':    
            this.dataSchedule[psitionHour][element.day-1] = this.dataHours[psitionHour];
            break;
        }

      }
    });
  }

  showHour(hour):boolean{ //Mostrar el renglon de la hora
    //Si todos los campos estan vacios
    if(hour[0]=="" && hour[1]=="" && hour[2]=="" &&
       hour[3]=="" && hour[4]=="" && hour[5]==""){
         return false; //Ocultar
       }else{
        return true; //Mostrar
       }
  }

  generateAutoSchedule(){
    this.scheduleClassroom = [];

    this.segment = 30;

    const start = this.getMinutes(this.hourStart);
    const end = this.getMinutes(this.hourEnd);

    for (let hour = start; hour < end; hour = hour + this.segment) {
      this.weekdays.forEach(day => {
        this.dataHours.push(this.getHour(hour));
        let data = {
          day: day,
          startHour: hour,
          endDate: hour + this.segment,
          status: 'available'
        }
        this.scheduleClassroom.push(data);
      });
    }
  }

  createClassrooms(){
    this.loadingService.setLoading(true);
    this.classroomProv.getAllClassroom().subscribe(res => {

      this.classrooms = res.classrooms;
      
    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  //

  createScheduleClassroom(){

    this.scheduleClassroom = [];

    this.segment = 30;

    this.dataSchedule.forEach(hourForDay => {
      
      this.weekdays.forEach(day => {
        if (hourForDay[day-1]) {

          let startHour = this.getMinutes(hourForDay[day-1]);
          let endDate = startHour + this.segment;

          let startData = {
            day: day,
            startHour: startHour,
            endDate: endDate,
            status: 'available'
          }

          this.scheduleClassroom.push(startData);

          //
          let endData = {
            day: day,
            startHour: endDate,
            endDate: endDate + this.segment,
            status: 'available'
          }

          this.scheduleClassroom.push(endData);
        }
      });
    });

    console.log(this.scheduleClassroom);
  }

  onCreateClassroom(){
    var classroom = {
      name: this.classroomForm.get('name').value,
      schedule: this.scheduleClassroom,
      capacity: this.classroomForm.get('capacity').value
    };
    console.log(classroom);
  
   this.classroomProv.createClassroom(classroom).subscribe(res => {
     this.ngOnInit();
   }, 
   error => {console.log(error)});
  }

  deleteClassroom(classroomId, classroomName){

    Swal.fire({
      title: 'Borrar Aula',
      text: `¿Está seguro de eliminar el aula: `+classroomName+` ?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {

        this.loadingService.setLoading(true);
        this.classroomProv.deleteClassroom(classroomId).subscribe(res => {
          this.ngOnInit();
          Swal.fire({
            title: 'Eliminada!',
            text: 'El aula se ha eliminado exitosamente.',
            showConfirmButton: false,
            timer: 2500,
            type: 'success'
          })
        },error => {

        }, () => this.loadingService.setLoading(false));

      }});

  }

  openDialogUpdateClassroom(classroom){

    this.segment = 60;
    this.createDataHours();   
    this.generateShedule();
    this.getShedule(classroom.schedule, 'time');

    console.log(classroom);
    this.updateClassroomForm = this.formBuilder.group({
      id: [classroom._id, Validators.required],
      name: [classroom.name, Validators.required],
      capacity: [classroom.capacity, [Validators.required, Validators.min(1)]]
    });

    const dialogRef = this.dialog.open(this.dialogRefViewUpdateClassroom, {hasBackdrop: true});

    dialogRef.afterClosed().subscribe(result => {
      if (result=="update") {
        this.onUpdateClassroom();
      }
      console.log(result);
    });
  }

  onUpdateClassroom(){

    this.createScheduleClassroom();

    const id = this.updateClassroomForm.get('id').value;

    var classroom = {
      name: this.updateClassroomForm.get('name').value,
      schedule: this.scheduleClassroom,
      capacity: this.updateClassroomForm.get('capacity').value
    };
    this.classroomProv.updateClassroom(id, classroom).subscribe(res => {
      this.ngOnInit();
      Swal.fire({
        title: 'Actualización exitosa!',
        showConfirmButton: false,
        timer: 2500,
        type: 'success'
      })
    }, 
    error => {console.log(error)});
  }

  //Grupos

  createGroups(){
    this.loadingService.setLoading(true);
    this.groupProv.getAllGroup().subscribe(res => {

      this.groups = res.groups;

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  openDialogFormCreateGroup(): void {
    const dialogRef = this.dialog.open(FormGroupComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        console.log(result);
        var data={
          name: result.a.nameCtrl,
          schedule: [],
          level: result.a.levelCtrl,
          period: this.activePeriod._id,
          status: 'opened',
          course: result.a.courseCtrl._id,
        };

        switch (result.a.scheduleCtrl) {
          case "1":
            for (let index = 1; index <= 5; index++) {
              data.schedule.push(
                {
                  day: index, 
                  startHour: this.getMinutes(result.b.x), 
                  endDate: this.getMinutes(result.b.y),
                });
              
            }
            
            break;
          case "2":
            data.schedule.push(
              {
                day: 6, 
                startHour: this.getMinutes(result.b.x), 
                endDate: this.getMinutes(result.b.y),
              });
            break;
          case "3":
            result.c.forEach(element => {
              if (element.active) {
                data.schedule.push(
                  {
                    day: element.day, 
                    startHour: this.getMinutes(element.startHour), 
                    endDate: this.getMinutes(element.endDate),
                  });
              }
            });
            break;
          default:
            return;
            break;
        };

        this.groupProv.createGroup(data).subscribe(res => {
          this.ngOnInit()
        }, 
        error => {console.log(error)});
      };
    });
  }

  getMinutes(hour): number{
    var hh = parseFloat(hour.split(":",2)[0])
    var mm = parseFloat(hour.split(":",2)[1])
    var time = mm + (hh*60);
    return time;
  }
  
  // Cursos

  createEnglishCourses(){
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourse().subscribe(res => {

      this.englishCourses = res.englishCourses;
      console.log(res);

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  createCourse(){
    var data = {
      englishCourse: {
        name: "",
        dailyHours: "",
        totalHours: "",
        totalSemesters: "",
        finalHours: "",
        //status: ""
      },
      courseSchedule: {
        days: [
          {
            desc: [false, false, false, false, false, false, false],
            enable: false,
            hours: []
          }
        ]
      },
      newCourse: true
    }

    //this.openDialog(data);

  }

  openDialogFormCreateCourse(): void {
    const dialogRef = this.dialog.open(FormCreateCourseComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        let data = {
          name: result.nameCtrl,
          dailyHours: result.dailyHoursCtrl,
          semesterHours: result.semesterHoursCtrl,
          totalSemesters: result.totalSemestersCtrl,
          totalHours: result.totalHoursCtrl,
          startPeriod: this.activePeriod._id,
          status: 'active',
        };
        this.englishCourseProv.createEnglishCourse(data).subscribe(res => {
          this.ngOnInit()
        }, 
        error => {console.log(error)});

      };
    });
  }

  getActivePeriod(){

    this.loadingService.setLoading(true);
    this.englishCourseProv.getActivePeriod().subscribe(res => {

      if(res.period){
        this.activePeriod = res.period;
      }

    },error => {

    }, () => this.loadingService.setLoading(false));

  }

}

export enum DaysSchedule {
  Lunes = 1,
  Martes = 2,
  Miércoles = 3,
  Jueves = 4,
  Viernes = 5,
  Sábado = 6
}
