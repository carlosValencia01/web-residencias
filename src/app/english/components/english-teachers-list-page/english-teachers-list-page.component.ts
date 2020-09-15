import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// TABLA
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';

// Importar Proveedores
import { GroupProvider } from 'src/app/english/providers/group.prov';
import { EmployeeProvider } from '../../../providers/shared/employee.prov';

// Importar Componentes
import { GroupStudentsComponent } from 'src/app/english/components/english-courses-page/group-students/group-students.component';

// Importar Enumeradores
import { EStatusGroupDB } from 'src/app/english/enumerators/status-group.enum';
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';

// Importar Modales

// Importar modelos
import { IGroup } from '../../entities/group.model';
import { ICourse } from '../../entities/course.model';
import { IEmployee } from '../../../entities/shared/employee.model';

@Component({
  selector: 'app-english-teachers-list-page',
  templateUrl: './english-teachers-list-page.component.html',
  styleUrls: ['./english-teachers-list-page.component.scss']
})
export class EnglishTeachersListPageComponent implements OnInit {

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private groupProv: GroupProvider,
    private employeeProv: EmployeeProvider,
  ) {
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this._initTeachers();
  }

  private ENGLISH_TEACHER_POSITION = 'DOCENTE INGLÉS';
  private englishTeachers: IEmployee[];
  public englishTeachersDataSource: MatTableDataSource<IEnglishTeacher>;
  @ViewChild('matPaginatorTeachers') paginatorTeachers: MatPaginator;
  @ViewChild('sortTeachers') sortTeachers: MatSort;
  public dataSourceActiveGroupsOfTeacher: MatTableDataSource<IGroup>;
  groups: IGroup[];
  activeGroups: IGroup[];
  @ViewChild('matPaginatorActiveGroups') paginatorActiveGroups: MatPaginator;
  @ViewChild('sortActiveGroups') sortActiveGroups: MatSort;
  @ViewChild("viewGroupOfTeacher") dialogRefViewGroupOfTeacher: TemplateRef<any>;

  private async _initTeachers(): Promise<void> {
    this.englishTeachersDataSource = new MatTableDataSource();
    this.englishTeachers = await this._getEnglishTeachers();
    this.groups = await this._getGroups();
    this._fillTable(this.englishTeachers);
  }

  private _getGroups(): Promise<any> {
    return new Promise((resolve) => {
      this.groupProv.getAllGroup()
        .subscribe(
          (res) => resolve(res.groups),
          (_) => resolve([])
        );
    });
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
    this.englishTeachersDataSource.sort = this.sortTeachers;
    this.englishTeachersDataSource.paginator = this.paginatorTeachers;
  }

  private _parseEnglishTeacherToTable(teacher: IEmployee): IEnglishTeacher {
    let groupsActive = [];
    this.groups.forEach(group => {
      if (group.teacher && group.status === EStatusGroupDB.ACTIVE) {
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

  openViewTableGroups(groups: IGroup[]) {
    this.dataSourceActiveGroupsOfTeacher = new MatTableDataSource();
    setTimeout(() => {
      this.dataSourceActiveGroupsOfTeacher.data = groups;
      this.dataSourceActiveGroupsOfTeacher.sort = this.sortActiveGroups;
      this.dataSourceActiveGroupsOfTeacher.paginator = this.paginatorActiveGroups;
    });
    let dialogRef = this.dialog.open(this.dialogRefViewGroupOfTeacher, { hasBackdrop: true, height: '90%', width: '80%' });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
      }
    });
  }



  scheduleGroupSelected: Array<any>;
  dialogRef: any;
  @ViewChild("viewScheduleGroup") dialogRefViewScheduleGroup: TemplateRef<any>;
  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana
  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana

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
        group: group
      },
      hasBackdrop: true, height: '70%', width: '90%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
      this.ngOnInit();
    });

  }

}

interface IEnglishTeacher {
  _id: string;
  name: string;
  countGroups: number;
  groups: ICourse[];
}