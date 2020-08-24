import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { IEmployee } from '../../../entities/shared/employee.model';
import { eNotificationType } from '../../../enumerators/app/notificationType.enum';
import { EmployeeProvider } from '../../../providers/shared/employee.prov';
import { NotificationsServices } from '../../../services/app/notifications.service';
import { IGroup } from '../../entities/group.model';
import { GroupProvider } from '../../providers/group.prov';

@Component({
  selector: 'app-assign-english-teacher',
  templateUrl: './assign-english-teacher.component.html',
  styleUrls: ['./assign-english-teacher.component.scss']
})
export class AssignEnglishTeacherComponent implements OnInit {
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.englishTeachersDataSource.paginator = paginator;
  }
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.englishTeachersDataSource.sort = sort;
  }
  public englishTeachersDataSource: MatTableDataSource<IEnglishTeacher>;
  private ENGLISH_TEACHER_POSITION = 'DOCENTE INGLÉS';
  private currentTeacher: IEnglishTeacher;
  private englishTeachers: IEmployee[];

  public get groupName(): string {
    return this.data.group.name;
  }

  constructor(
    private dialogRef: MatDialogRef<AssignEnglishTeacherComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { group: IGroup, teacherId?: string },
    private employeeProv: EmployeeProvider,
    private groupProv: GroupProvider,
    private notification: NotificationsServices,
  ) {
    this.englishTeachersDataSource = new MatTableDataSource();

    this._init();
  }

  ngOnInit() { }

  public canAssign(): boolean {
    return !!this.currentTeacher;
  }

  public selecTeacher(row: IEnglishTeacher): void {
    if (row) {
      this.currentTeacher = row;
    }
  }

  public assignTeacher(): void {
    if (!this.currentTeacher) {
      return this.notification.showNotification(eNotificationType.INFORMATION, 'Asignación de docente', 'Debe seleccionar un docente');
    }

    this.groupProv.assignGroupEnglishTeacher(this.data.group._id, this.currentTeacher._id)
      .subscribe(
        (res: { ok_msj: string }) => {
          this.notification.showNotification(eNotificationType.SUCCESS, 'Asignación de docente', res.ok_msj || 'Docente asignado con éxito');
          this.data.group.teacher = this.currentTeacher._id;
          this.dialogRef.close(this.data.group);
        }
      );
  }

  private async _init(): Promise<void> {
    this.englishTeachers = await this._getEnglishTeachers();

    if (this.data.teacherId) {
      const index = this.englishTeachers.findIndex(({ _id }) => _id === this.data.teacherId);
      if (index !== -1) {
        this.englishTeachers.splice(index, 1);
      }
    }

    this.englishTeachersDataSource.data = this.englishTeachers.map((teacher) => this._parseEnglishTeacherToTable(teacher));
  }

  private _parseEnglishTeacherToTable(teacher: IEmployee): IEnglishTeacher {
    return {
      _id: teacher._id,
      name: teacher.name.fullName,
      position: this.ENGLISH_TEACHER_POSITION,
    };
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

}

interface IEnglishTeacher {
  _id: string;
  name: string;
  position: string;
}
