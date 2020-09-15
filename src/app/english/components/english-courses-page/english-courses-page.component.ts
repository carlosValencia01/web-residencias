import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { MatTabGroup } from '@angular/material/tabs';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

// Importar Proveedores
import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';
import { GroupProvider } from 'src/app/english/providers/group.prov';
import { EmployeeProvider } from '../../../providers/shared/employee.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';

// Importar Componentes
import { StudentRequestsComponent } from 'src/app/english/components/english-courses-page/student-requests/student-requests.component';
import { FormCreateCourseComponent } from 'src/app/english/components/english-courses-page/form-create-course/form-create-course.component';
import { FormGroupComponent } from 'src/app/english/components/english-courses-page/form-group/form-group.component';
import { FromGenerateGroupsComponent } from 'src/app/english/components/english-courses-page/from-generate-groups/from-generate-groups.component';
import { GroupStudentsComponent } from 'src/app/english/components/english-courses-page/group-students/group-students.component';

// Importar Enumeradores
import { EStatusGroupDB, EStatusGroup } from 'src/app/english/enumerators/status-group.enum';
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';
import { EStatusEnglishStudent } from 'src/app/english/enumerators/status-english-student.enum';
import { ERequestCourseStatus } from 'src/app/english/enumerators/request-course-status.enum';

// Importar Modales
import { ActiveGroupModalComponent } from '../../modals/active-group-modal/active-group-modal.component';
import { AssignEnglishTeacherComponent } from '../../modals/assign-english-teacher/assign-english-teacher.component';
import { AddStudentsGroupModalComponent } from '../../modals/add-students-group-modal/add-students-group-modal.component';

// Importar modelos
import { IPeriod } from '../../../entities/shared/period.model';
import { IClassroom } from '../../entities/classroom.model';
import { IGroup } from '../../entities/group.model';
import { ICourse } from '../../entities/course.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { IEmployee } from '../../../entities/shared/employee.model';
import { IRequestCourse } from '../../entities/request-course.model';
import { IEnglishStudent } from '../../entities/english-student.model';

@Component({
  selector: 'app-english-courses-page',
  templateUrl: './english-courses-page.component.html',
  styleUrls: ['./english-courses-page.component.scss']
})
export class EnglishCoursesPageComponent implements OnInit {

  activePeriod: IPeriod; //Periodo activo actualmente

  // SOLICITUDES
  requests: Array<any>;
  dataExcel;

  // AULAS
  classrooms: IClassroom[];
  classroomForm;
  updateClassroomForm;
  scheduleClassroom: Array<any>
  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana
  hourStart = "07:00"; //Tiempo de inicio
  hourEnd = "21:00"; //Tiempo de finalización
  segment = 60; //Cantidad en minutos de los segmentos
  dataHours = []; //Horas que se van a mostrar
  dataSchedule = []; //Arreglo de los dias seleccionados
  dialogRef: any;
  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana
  searchClassroom = '';
  searchGA = '';

  @ViewChild("viewCreateClassroom") dialogRefViewCreateClassroom: TemplateRef<any>;
  @ViewChild("scheduleClassroomAux") dialogRefScheduleClassroomAux: TemplateRef<any>;
  @ViewChild("viewScheduleClassroom") dialogRefViewScheduleClassroom: TemplateRef<any>;
  @ViewChild("viewUpdateClassroom") dialogRefViewUpdateClassroom: TemplateRef<any>;
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  // GRUPOS
  groups: IGroup[];
  dataSourceGroups: MatTableDataSource<any>;
  @ViewChild('matPaginatorCreatedGroups') set matPaginatorGroups(paginator: MatPaginator) {
    this.dataSourceGroups.paginator = paginator;
  };
  @ViewChild('matPaginatorClassrooms') paginatorClassrooms: MatPaginator;
  @ViewChild(MatSort) sortClassrooms: MatSort;
  @ViewChild(MatSort) sortGroups: MatSort;
  activeGroups: IGroup[];
  dataSourceActiveGroups: MatTableDataSource<IGroup>;
  dataSourceClassrooms: MatTableDataSource<any>;
  @ViewChild('matPaginatorActiveGroups') set paginatorActiveGroups(paginator: MatPaginator) {
    this.dataSourceActiveGroups.paginator = paginator;
  }
  @ViewChild(MatSort) sortActiveGroups: MatSort;
  @ViewChild("viewScheduleGroup") dialogRefViewScheduleGroup: TemplateRef<any>;

  // CURSOS
  englishCourses: ICourse[];

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private requestCourseProv: RequestCourseProvider,
    private classroomProv: ClassroomProvider,
    private englishCourseProv: EnglishCourseProvider,
    private englishStudentProv: EnglishStudentProvider,
    private groupProv: GroupProvider,
    public dialog: MatDialog,
    private notificationsServices: NotificationsServices,
    private employeeProv: EmployeeProvider,
  ) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.dataSourceGroups = new MatTableDataSource();
    this.dataSourceActiveGroups = new MatTableDataSource();
  }

  ngOnInit() {
    this.createEnglishCourseActive();
    this.createFormClassroom();
    this.createClassrooms();
    this.createEnglishCourses();
    this.createGroups();
    this.getActivePeriod();
    this._initTeachers();
    this._initStudents();
  }

  // #region Solicitudes

  createEnglishCourseActive() {
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourseActive().subscribe(res => {

      res.englishCourses.forEach((course: ICourse) => {
        this.requests = [];
        this.getOpenGroupsByLevel(course);
      });

    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  async getOpenGroupsByLevel(course: ICourse) {

    const x = [];

    for (let i = 1; i <= course.totalSemesters; i++) {

      let data = {
        courseId: course._id,
        level: i,
      };

      this.loadingService.setLoading(true);
      await this.groupProv.getAllGroupOpenedByCourseAndLevel(data).subscribe(res => {

        if (res.groups.length > 0) {
          x.push({ level: i, haveGroups: true, groups: res.groups });
        } else {
          x.push({ level: i, haveGroups: false, groups: res.groups });
        }
        x.sort((a, b) => a.level - b.level);

      }, error => {

      }, () => this.loadingService.setLoading(false));

    };

    this.requests.push({ course: course, data: x });
  }

  /*
  deleteRequestForHour(requestCourseId,dayId,hourId){
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
      if (result) {
        const request = {
          name: result.nameCourseSelected,
          period: result.period
        };
      }
      this.ngOnInit();
    });

  }
  // #endregion


  // #region Aulas



  createFormClassroom() {
    this.classroomForm = this.formBuilder.group({
      name: ['', Validators.required],
      schedule: ['', Validators.required],
      capacity: ['30', [Validators.required, Validators.min(1)]],
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

  createDataHours() { //Genera las Horas en segmentos

    this.dataHours = [];

    const start = this.getMinutes(this.hourStart); //Convierte la hora de inicio en minutos
    const end = this.getMinutes(this.hourEnd); //Convierte la hora de fin en minutos

    for (let hour = start; hour < end; hour = hour + this.segment) { //Recorrer de inicio a fin incrementando por segmentos
      this.dataHours.push(this.getHour(hour)); //Guardar el segmento de hora
    }

  }

  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
  }

  generateSchedule() { //Genera el arreglo en el que se guardaran los valores seleccionados
    this.dataSchedule = [];
    this.dataHours.forEach(a => { //Recorre cada una de las horas
      let week = []; //define arreglo de dias de la semana
      this.weekdays.forEach(b => { //Recorre cada dia de la semana
        week.push(""); //Agrega valor al dia
      });
      this.dataSchedule.push(week); //Agrega los dias de la semana a la hora
    });
  }

  selectHour(hour) { //Seleccionar hora de la Tabla
    //Si todos los campos estan vacios
    if (this.dataSchedule[hour][0] == "" && this.dataSchedule[hour][1] == "" && this.dataSchedule[hour][2] == "" &&
      this.dataSchedule[hour][3] == "" && this.dataSchedule[hour][4] == "" && this.dataSchedule[hour][5] == "") {
      for (let i = 0; i < 5; i++) {//De Lunes a Viernes
        this.dataSchedule[hour][i] = this.dataHours[hour]; //Asignar la hora seleccionada
      }
    } else {//Si no
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
        this.generateSchedule();
        view = this.dialogRefScheduleClassroomAux;
        break;

      case "2":
        this.segment = 30;
        this.createDataHours();
        this.generateSchedule();
        this.getSchedule(schedule, 'status');
        view = this.dialogRefViewScheduleClassroom;
        break;
    }
    this.dialogRef = this.dialog.open(view, { hasBackdrop: false, height: '90%', width: '80%' });
    this.dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.classroomForm.get('schedule').setValue('');
      }
    });
  }

  getSchedule(schedule, get) {
    schedule.forEach(element => {

      const psitionHour = this.dataHours.indexOf(this.getHour(element.startHour));

      if (psitionHour > -1) {

        switch (get) {
          case 'status':
            this.dataSchedule[psitionHour][element.day - 1] = element.status;
            break;

          case 'time':
            this.dataSchedule[psitionHour][element.day - 1] = this.dataHours[psitionHour];
            break;
        }

      }
    });
  }

  showHour(hour): boolean { //Mostrar el renglon de la hora
    //Si todos los campos estan vacios
    if (hour[0] == "" && hour[1] == "" && hour[2] == "" &&
      hour[3] == "" && hour[4] == "" && hour[5] == "") {
      return false; //Ocultar
    } else {
      return true; //Mostrar
    }
  }

  generateAutoSchedule() {
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

  createClassrooms() {
    this.loadingService.setLoading(true);
    this.classroomProv.getAllClassroom().subscribe(res => {

      this.classrooms = res.classrooms;
      this.dataSourceClassrooms = new MatTableDataSource(this.classrooms);
      this.dataSourceClassrooms.paginator = this.paginatorClassrooms;
      this.dataSourceClassrooms.sort = this.sortClassrooms;
      this.applyFilter();
    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  createScheduleClassroom() {

    this.scheduleClassroom = [];

    this.segment = 30;

    this.dataSchedule.forEach(hourForDay => {

      this.weekdays.forEach(day => {
        if (hourForDay[day - 1]) {

          let startHour = this.getMinutes(hourForDay[day - 1]);
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

    if (this.scheduleClassroom.length == 0) {
      Swal.fire({
        title: 'ATENCIÓN!',
        text: 'Es necesario agregar un horario.',
        showConfirmButton: false,
        timer: 2000,
        type: 'warning'
      })
      return false;
    };

    return true;
  }

  onCreateClassroom() {

    var classroom = {
      name: this.classroomForm.get('name').value,
      schedule: this.scheduleClassroom,
      capacity: this.classroomForm.get('capacity').value,

    };

    this.classroomProv.createClassroom(classroom).subscribe(res => {
      this.dialog.closeAll();
      this.ngOnInit();
      Swal.fire({
        title: 'Aula registrada con exito!',
        showConfirmButton: false,
        timer: 2500,
        type: 'success'
      });
    },
      error => { });
  }

  deleteClassroom(classroomId, classroomName) {

    Swal.fire({
      title: 'Borrar Aula',
      text: `¿Está seguro de eliminar el aula: ` + classroomName + ` ?`,
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
        }, error => {

        }, () => this.loadingService.setLoading(false));

      }
    });

  }

  openDialogCreateClassroom() {
    this.dialogRef = this.dialog.open(this.dialogRefViewCreateClassroom, { hasBackdrop: false, height: '70%', width: '40%' });
  }

  openDialogUpdateClassroom(classroom) {

    this.segment = 60;
    this.createDataHours();
    this.generateSchedule();
    this.getSchedule(classroom.schedule, 'time');

    this.updateClassroomForm = this.formBuilder.group({
      id: [classroom._id, Validators.required],
      name: [classroom.name, Validators.required],
      capacity: [classroom.capacity, [Validators.required, Validators.min(1)]],
    });

    this.dialogRef = this.dialog.open(this.dialogRefViewUpdateClassroom, { hasBackdrop: false, height: '90%', width: '80%' });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onUpdateClassroom();
      }
    });
  }

  verifySchedule() {
    if (this.createScheduleClassroom()) {
      this.dialogRef.close(true);
    }
  }

  onUpdateClassroom() {

    const id = this.updateClassroomForm.get('id').value;

    var classroom = {
      name: this.updateClassroomForm.get('name').value,
      schedule: this.scheduleClassroom,
      capacity: this.updateClassroomForm.get('capacity').value,

    };
    this.classroomProv.updateClassroom(id, classroom).subscribe(res => {
      this.ngOnInit();
      Swal.fire({
        title: 'Actualización exitosa!',
        showConfirmButton: false,
        timer: 2500,
        type: 'success'
      });
    },
      error => { });
  }
  // #endregion

  // #region Grupos

  createGroups() {
    this.loadingService.setLoading(true);
    this.groupProv.getAllGroup().subscribe(res => {

      this.groups = res.groups;
      this.divideGroups();
      this.createDataSourceGroups();


    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  public getStatusGroupName(status: string): string {
    return (EStatusGroup as any)[status];
  }

  createDataSourceGroups() {
    this.groups = this.groups.filter(({ status }) => status !== EStatusGroupDB.ACTIVE);
    this.dataSourceGroups.data = this.groups;
    this.dataSourceGroups.sort = this.sortGroups;
  }

  divideGroups() {
    this.activeGroups = this.groups.filter(({ status }) => status === EStatusGroupDB.ACTIVE);
    this.createDataSourceActiveGroups(this.activeGroups);
  }

  createDataSourceActiveGroups(groups: IGroup[]): void {
    this.dataSourceActiveGroups.data = groups;
    this.dataSourceActiveGroups.sort = this.sortActiveGroups;
  }

  scheduleGroupSelected: Array<any>;

  openDilogViewScheduleGroup(scheduleSelected) {
    this.scheduleGroupSelected = scheduleSelected;
    this.dialogRef = this.dialog.open(this.dialogRefViewScheduleGroup, { hasBackdrop: false });

    this.dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.scheduleGroupSelected = [];
      }
    });
  }

  openDialogFormGenerateGroups() {
    const dialogRef = this.dialog.open(FromGenerateGroupsComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let startName = "";
        result.courseName.split(" ").forEach(word => {
          startName += word.charAt(0);
        });

        for (let level = 1; level <= result.levels; level++) {

          result.schedules.forEach(schedule => {

            let data = {
              name: startName + level + '-' + (schedule[0].startHour / 60),
              schedule: schedule,
              level: level,
              period: this.activePeriod._id,
              status: 'opened',
              minCapacity: result.minCapacity,
              maxCapacity: result.maxCapacity,
              course: result.courseId,
            };

            this.groupProv.createGroup(data).subscribe(res => {
              this.ngOnInit()
            },
              error => { });

          });

        }

      };
    });
  }

  openDialogFormCreateGroup(): void {
    const dialogRef = this.dialog.open(FormGroupComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var data = {
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
          error => { });
      };
    });
  }

  getMinutes(hour): number {
    var hh = parseFloat(hour.split(":", 2)[0])
    var mm = parseFloat(hour.split(":", 2)[1])
    var time = mm + (hh * 60);
    return time;
  }

  openDialogshowGroupStudents(group): void {

    const dialogRef = this.dialog.open(GroupStudentsComponent, {
      data: {
        group: group
      },
      hasBackdrop: false, height: '70%', width: '90%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
      this.ngOnInit();
    });

  }

  public getEnglishTeacherItemName(group: IGroup): string {
    return group.teacher ? 'Cambiar docente' : 'Asignar docente';
  }

  public openDialogshowEnglishTeachers(group: IGroup): void {
    const dialogRef = this.dialog.open(AssignEnglishTeacherComponent, {
      data: { group, teacherId: group.teacher && group.teacher._id },
      hasBackdrop: true,
      maxWidth: '85vw',
      disableClose: true,
    });

    dialogRef.afterClosed()
      .subscribe((group: IGroup) => {
        if (group) {
          const index = this.activeGroups.findIndex(({ _id }) => _id === group._id);
          if (index !== -1) {
            this.activeGroups.splice(index, 1, group);
            this.createDataSourceActiveGroups(this.activeGroups);
          }
        }
      });
  }

  openDialogAddGroupStudents(group) {
    const linkModal = this.dialog.open(AddStudentsGroupModalComponent, {
      data: {
        operation: 'view',
        groupOrigin: group.groupOrigin,
        groupActive: group._id
      },
      disableClose: true,
      hasBackdrop: true,
      width: '90%',
      height: '90%'
    });

    let sub = linkModal.afterClosed().subscribe(
      information => {
        this.ngOnInit();
      },
      err => { }, () => sub.unsubscribe()
    );
  }
  //#endregion

  // #region Cursos

  createEnglishCourses() {
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourse().subscribe(res => {

      this.englishCourses = res.englishCourses;

    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  createCourse() {
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

  }

  openDialogFormCreateCourse(): void {
    const dialogRef = this.dialog.open(FormCreateCourseComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
          error => { });

      };
    });
  }

  getActivePeriod() {

    this.loadingService.setLoading(true);
    this.englishCourseProv.getActivePeriod().subscribe(res => {

      if (res.period) {
        this.activePeriod = res.period;
      }

    }, error => {

    }, () => this.loadingService.setLoading(false));

  }

  setupFilter() {
    this.dataSourceClassrooms.filterPredicate = (data, filterValue: string) =>
      data.name.trim().toLowerCase().indexOf(filterValue) !== -1 || data.capacity == filterValue;
  }

  applyFilter() {
    this.dataSourceClassrooms.filter = this.searchClassroom.trim().toLowerCase();
  }

  setupFilterG() {
    this.dataSourceActiveGroups.filterPredicate = (data, filterValue: string) =>
      data.course.name.trim().toLowerCase().indexOf(filterValue) !== -1 ||
      data.name.trim().toLowerCase().indexOf(filterValue) !== -1 ||
      data.level == parseInt(filterValue) ||
      (data.teacher ? (data.teacher as IEmployee).name.fullName.trim().toLowerCase().indexOf(filterValue) !== -1 : false)
  }

  applyFilterG() {
    this.dataSourceActiveGroups.filter = this.searchGA.trim().toLowerCase();
  }

  getScheduleDaysGroup(schedules) {
    var horario = {
      Lunes: '',
      Martes: '',
      Miercoles: '',
      Jueves: '',
      Viernes: '',
      Sabado: ''
    };
    schedules.forEach((schedule, index) => {
      switch (EDaysSchedule[schedule.day]) {
        case 'Lunes':
          horario.Lunes = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
          break;
        case 'Martes':
          horario.Martes = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
          break;
        case 'Miércoles':
          horario.Miercoles = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
          break;
        case 'Jueves':
          horario.Jueves = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
          break;
        case 'Viernes':
          horario.Viernes = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
          break;
        case 'Sábado':
          horario.Sabado = this.getHour(schedule.startHour) + ' - ' + this.getHour(schedule.endDate);
          break;
      }
    });
    return horario;
  }

  activeGroup(_groupId) {
    this.getPaidStudentsRequest(_groupId);
  }

  getPaidStudentsRequest(group) {
    this.groupProv.getAllStudentsGroup(group._id).subscribe(res => {
      if (res) {
        const students = res.students;
        const linkModal = this.dialog.open(ActiveGroupModalComponent, {
          data: {
            operation: 'view',
            students: students,
            group: group
          },
          disableClose: true,
          hasBackdrop: true,
          width: '90%',
          height: '80%'
        });
        let sub = linkModal.afterClosed().subscribe(
          information => {
            if (information.action == 'saved') {
              Swal.fire({
                title: 'Éxito!',
                text: 'Grupo activado',
                showConfirmButton: false,
                timer: 2500,
                type: 'success'
              })
              this.ngOnInit();
            }
          },
          err => { }, () => sub.unsubscribe()
        );
      }
    }, error => {
    });
  }
  //#endregion

  // #region Reportes Excel
  generateExcelActiveGroup(_group) {
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, '', 'Generando Reporte...');
    this.requestCourseProv.getAllRequestActiveCourse(_group._id).subscribe(async res => {
      this.dataExcel = {
        group: _group,
        teacher: _group.teacher ? _group.teacher.name.fullName : '',
        schedule: await this.getScheduleDaysGroup(_group.schedule),
        students: res.requestCourses,
      }
      setTimeout(() => {
        TableToExcel.convert(document.getElementById('tableActiveGroupReportExcel'), {
          name: 'Reporte Inglés Grupo ' + this.dataExcel.group.name + '.xlsx',
          sheet: {
            name: 'Alumnos'
          }
        });
      }, 2000);
    });
  }

  public async generateExcelGroupRequests(row: IGroup): Promise<void> {
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Solicitudes de grupo', 'Generando reporte');
    const requests = await this._getRequestedRequestByGroup(row._id as string);

    this.dataExcel = {
      group: row,
      teacher: row.teacher ? row.teacher.name.fullName : 'Sin docente',
      schedule: await this.getScheduleDaysGroup(row.schedule),
      students: requests,
    }
    setTimeout(() => {
      TableToExcel.convert(document.getElementById('tableActiveGroupReportExcel'), {
        name: 'Solicitudes a grupo ' + this.dataExcel.group.name + '.xlsx',
        sheet: {
          name: 'Solicitudes'
        }
      });
    }, 2000);
  }
  //#endregion

  // #region Peticiones al server
  private _getRequestedRequestByGroup(groupId: string): Promise<IRequestCourse[]> {
    return new Promise((resolve) => {
      this.requestCourseProv.getRequestedGroupRequest(groupId)
        .subscribe(
          (requests: IRequestCourse[]) => resolve(requests),
          (_) => resolve([])
        );
    });
  }
  // #endregion

  // #region Docentes

  private ENGLISH_TEACHER_POSITION = 'DOCENTE INGLÉS';
  private englishTeachers: IEmployee[];
  public englishTeachersDataSource: MatTableDataSource<IEnglishTeacher>;
  public dataSourceActiveGroupsOfTeacher: MatTableDataSource<IGroup>;
  @ViewChild("viewGroupOfTeacher") dialogRefViewGroupOfTeacher: TemplateRef<any>;

  private async _initTeachers(): Promise<void> {
    this.englishTeachersDataSource = new MatTableDataSource();
    this.englishTeachers = await this._getEnglishTeachers();

    this._fillTable(this.englishTeachers);
  }

  private _getEnglishTeachers(): Promise<IEmployee[]> {
    return new Promise((resolve) => {
      this.employeeProv.getEmployeesByPosition(this.ENGLISH_TEACHER_POSITION)
        .subscribe(
          (employees: IEmployee[]) => resolve(employees),
          (_) => resolve([])
        );
    });
  }

  private _fillTable(teachers: IEmployee[]): void {
    this.englishTeachersDataSource.data = teachers.map((teacher) => this._parseEnglishTeacherToTable(teacher));
  }

  private _parseEnglishTeacherToTable(teacher: IEmployee): IEnglishTeacher {
    let groupsActive = [];
    this.activeGroups.forEach(group => {
      if (group.teacher) {
        if (group.teacher._id == teacher._id) {
          groupsActive.push(group)
        }
      }
      
    });
    return {
      _id: teacher._id,
      name: teacher.name.fullName,
      countGroups: groupsActive.length,
      groups: groupsActive,
    };
  }

  openViewTableGroups(groups: IGroup[]){
    this.dataSourceActiveGroupsOfTeacher = new MatTableDataSource();
    this.dataSourceActiveGroupsOfTeacher.data = groups;
    this.dataSourceActiveGroupsOfTeacher.sort = this.sortActiveGroups;
    let dialogRef = this.dialog.open(this.dialogRefViewGroupOfTeacher, { hasBackdrop: false, height: '90%', width: '80%' });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
      }
    });
  }

  // #endregion


  // #region Estudiantes

  
  public englishStudents: IEnglishStudent[];
  public englishStudentsDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorStudents') paginatorStudents: MatPaginator;
  searchStudent = "";
  public requestsStudent: any[];
  public requestsDataSource: MatTableDataSource<any>;
  @ViewChild('matPaginatorHistory') paginatorHistory: MatPaginator;
  searchHistory = "";
  @ViewChild("viewHistory") dialogRefViewHistory: TemplateRef<any>;
  statusEnglishStudent = EStatusEnglishStudent;
  requestCourseStatus = ERequestCourseStatus;

  private async _initStudents(): Promise<void> {

    this.englishStudentsDataSource = new MatTableDataSource();

    this.englishStudentProv.getAllEnglishStudent().subscribe(res => {

      this.englishStudents = res.englishStudents;
      this._fillTableEnglishStudents(this.englishStudents);
    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  private _fillTableEnglishStudents(englishStudents: IEnglishStudent[]): void {

    this.englishStudentsDataSource.data = englishStudents.map((englishStudent) => this._parseEnglishStudentToTable(englishStudent));
    
    this.englishStudentsDataSource.paginator = this.paginatorStudents;
    
  }

  private _parseEnglishStudentToTable(englishStudent: any): any {
    return {
      _id: englishStudent._id,
      controlNumber: englishStudent.studentId.controlNumber,
      name: englishStudent.studentId.fullName,
      phone: englishStudent.currentPhone,
      career: englishStudent.studentId.careerId ? englishStudent.studentId.careerId.acronym : '',
      hours: englishStudent.totalHoursCoursed,
      status: englishStudent.status
    };
  }

  openViewHistory(student){

    this.requestCourseProv.getAllRequestCourseByEnglishStudentId(student._id).subscribe(res => {

      this.requestsStudent = res.requestCourse;
      console.log(res)

      this._fillTableHistory(this.requestsStudent);

    }, error => {

    }, () => this.loadingService.setLoading(false));

    let dialogRef = this.dialog.open(this.dialogRefViewHistory, { hasBackdrop: true, height: '90%', width: '80%' });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
      }
    });
  }

  private _fillTableHistory(requests): void {

    this.requestsDataSource = new MatTableDataSource();
    this.requestsDataSource.data = requests.map((request) => this._parseRequestToTable(request));
    
    this.requestsDataSource.paginator = this.paginatorHistory;
    
    console.log(this.requestsDataSource.data)
  }

  private _parseRequestToTable(request): any {
    return {
      _id: request._id,
      course: request.group.course.name,
      level: request.group.level,
      group: request.group.name,
      status: request.status,
      average: request.average ? request.average : '-',
      teacher: request.group.teacher ? request.group.teacher.name.fullName : 'Sin Asignar',
      period: request.period.periodName + ' ' +  request.period.year,
      schedule: request.group.schedule
    };
  }

  applyFilterHistory() {
    this.requestsDataSource.filter = this.searchHistory.trim().toLowerCase();
  }
  applyFilterStudents() {
    this.englishStudentsDataSource.filter = this.searchStudent.trim().toLowerCase();
  }

  deleteProfile(student){
    this.requestCourseProv.getAllRequestCourseByEnglishStudentId(student._id).subscribe(async res => {
      const requestStudent = res.requestCourse.filter(req=> req.status == 'requested');
      const lastRequestStudent = requestStudent[requestStudent.length - 1];
      
      // Verificar si tiene una solocitud activa
      if(lastRequestStudent){
        // Mostrar alerta para eliminar solicitud de alumno
        Swal.fire({
          title: 'Solicitud Encontrada',
          type: 'info',
          html:
          '<label>El perfil del alumno con número de control: <b>'+student.controlNumber+'</b> cuenta con una solicitud activa. Se eliminará perfil y solicitud.</label>',
          allowOutsideClick: false,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: 'green',
          cancelButtonColor: 'red',
        }).then((result) => {
          if (result.value) {
            this.englishStudentProv.deleteEnglishProfile(student._id).subscribe(res => {
              if (res){
                Swal.fire({
                  title: 'Éxito',
                  text: 'Perfil y Solicitud Eliminadas',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this._initStudents();
              }
            });
          }
        });
      } else {
        // Eliminar perfil de inglés de alumno
        Swal.fire({
          title: 'Atención',
          type: 'info',
          html:
            '<label>Se eliminará el perfil del alumno con número de control: <b>'+student.controlNumber+'</b></label>',
          allowOutsideClick: false,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: 'green',
          cancelButtonColor: 'red',
        }).then((result) => {
          if (result.value) {
            this.englishStudentProv.deleteEnglishProfile(student._id).subscribe(res => {
              if (res){
                Swal.fire({
                  title: 'Éxito',
                  text: 'Perfil Eliminado',
                  showConfirmButton: false,
                  timer: 2500,
                  type: 'success'
                });
                this._initStudents();
              }
            });
          }
        });
      }
    });
  }

  // #endregion
}

interface IEnglishTeacher {
  _id: string;
  name: string;
  countGroups: number;
  groups: ICourse[];
}