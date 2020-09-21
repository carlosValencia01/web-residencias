import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { MatTabGroup } from '@angular/material/tabs';
import { MatAutocomplete, MatChipInputEvent } from '@angular/material';

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
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';

// Importar Componentes
import { StudentRequestsComponent } from 'src/app/english/components/english-courses-page/student-requests/student-requests.component';
import { FormCreateCourseComponent } from 'src/app/english/components/english-courses-page/form-create-course/form-create-course.component';
import { FormGroupComponent } from 'src/app/english/components/english-courses-page/form-group/form-group.component';
import { FromGenerateGroupsComponent } from 'src/app/english/components/english-courses-page/from-generate-groups/from-generate-groups.component';
import { GroupStudentsComponent } from 'src/app/english/components/english-courses-page/group-students/group-students.component';

// Importar Enumeradores
import { EStatusGroupDB, EStatusGroup } from 'src/app/english/enumerators/status-group.enum';
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';

// Importar Modales
import { ActiveGroupModalComponent } from '../../modals/active-group-modal/active-group-modal.component';
import { AssignEnglishTeacherComponent } from '../../modals/assign-english-teacher/assign-english-teacher.component';
import { AddStudentsGroupModalComponent } from '../../modals/add-students-group-modal/add-students-group-modal.component';
import { AssignClassroomComponent } from '../../modals/assign-classroom/assign-classroom.component';

// Importar modelos
import { IPeriod } from '../../../entities/shared/period.model';
import { IClassroom } from '../../entities/classroom.model';
import { IGroup } from '../../entities/group.model';
import { ICourse } from '../../entities/course.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { IEmployee } from '../../../entities/shared/employee.model';
import { IRequestCourse } from '../../entities/request-course.model';

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
  weekdays = [1, 2, 3, 4, 5, 6]; // Dias de la semana
  dayschedule = EDaysSchedule; // Enumerador de los dias de la semana
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
    private requestProvider: RequestProvider,
    private router: Router,
    private loadingService: LoadingService,
    private requestCourseProv: RequestCourseProvider,
    private classroomProv: ClassroomProvider,
    private englishCourseProv: EnglishCourseProvider,
    private groupProv: GroupProvider,
    public dialog: MatDialog,
    private notificationsServices: NotificationsServices,
  ) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.dataSourceGroups = new MatTableDataSource();
    this.dataSourceActiveGroups = new MatTableDataSource();
  }

  ngOnInit() {
    this.createEnglishCourseActive();
    this.createClassrooms();
    this.createEnglishCourses();
    this.createGroups();
    this.getActivePeriod();
    this._getPeriods();
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


  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
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

  openDilogViewScheduleGroup(scheduleSelected) {
    this.dialog.open(this.dialogRefViewScheduleGroup, { data: scheduleSelected, hasBackdrop: false });
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

  public openDialogShowClassrooms(group: IGroup): void {
    const dialogRef = this.dialog.open(AssignClassroomComponent, {
      data: { group },
      hasBackdrop: true,
      maxWidth: '95vw',
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
    this.requestCourseProv.getAllRequestActiveCourse(_group._id, this._CookiesService.getClientId()).subscribe(async res => {
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

  // #region Filtro Periodo

  // Periods
  periods: IPeriod[] = [];
  filteredPeriods: IPeriod[] = [];
  // periods used to filter data
  usedPeriods: IPeriod[] = [];
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('periodInput') periodInput: ElementRef<HTMLInputElement>;
  periodCtrl = new FormControl();

  _getPeriods() {
    this.requestProvider.getPeriods().subscribe(
      (periods) => {
        this.periods = periods.periods;
        this.filteredPeriods = periods.periods;
        this.updatePeriods(this.filteredPeriods.filter(per => per.active === true)[0], 'insert');
      }
    );
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

  filterPeriod(value: string): void {
    if (value) {
      this.periods = this.periods.filter(period => (period.periodName + '-' + period.year).toLowerCase().trim().indexOf(value) !== -1);
    }
  }

  slectedPeriod(period): void {
    this.updatePeriods(period, 'insert');
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
    this.applyFiltersActiveGroups();
  }

  removePeriod(period): void {
    this.updatePeriods(period, 'delete');
  }

  applyFiltersActiveGroups() {

    this.dataSourceGroups.data = this.groups;
    if (this.usedPeriods) {
      if (this.usedPeriods.length > 0) {
        this.dataSourceGroups.data = this.dataSourceGroups.data.filter(
          (req: any) => this.usedPeriods.map(per => (per._id)).includes((req.period._id))
        );
      } else {
        this.dataSourceGroups.data = this.dataSourceGroups.data;
      }
    } else {
      this.dataSourceGroups.data = this.dataSourceGroups.data;
    }
  }

}

interface IEnglishTeacher {
  _id: string;
  name: string;
  countGroups: number;
  groups: ICourse[];
}
