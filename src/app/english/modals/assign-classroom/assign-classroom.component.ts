import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import Swal from 'sweetalert2';
import { eNotificationType } from '../../../enumerators/app/notificationType.enum';
import { NotificationsServices } from '../../../services/app/notifications.service';
import { IClassroom } from '../../entities/classroom.model';
import { IGroup, IGroupSchedule } from '../../entities/group.model';
import { EDaysSchedule } from '../../enumerators/days-schedule.enum';
import { ClassroomProvider } from '../../providers/classroom.prov';
import { GroupProvider } from '../../providers/group.prov';

@Component({
  selector: 'app-assign-classroom',
  templateUrl: './assign-classroom.component.html',
  styleUrls: ['./assign-classroom.component.scss']
})
export class AssignClassroomComponent implements OnInit {
  public weekdays = [1, 2, 3, 4, 5, 6]; // Lunes: 1, Sábado: 6
  public groupSchedule: IGroupSchedule[];
  public groupDays: number[]; // Lunes: 1, Sábado: 6

  public get groupName(): string {
    return this.data.group.name;
  }

  public get group(): IGroup {
    return this.data.group;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { group: IGroup },
    private classroomProv: ClassroomProvider,
    private groupProv: GroupProvider,
    private notification: NotificationsServices,
  ) {
    this.groupSchedule = this.data.group.schedule as IGroupSchedule[];
    this.groupDays = (this.data.group.schedule || []).map(({ day }) => day);
  }

  ngOnInit() { }

  public canShowScheduleTable(): boolean {
    return !!this.data.group && !!this.data.group.schedule && !!this.data.group.schedule.length;
  }

  public isAssignedDay(weekDay: number): boolean {
    return this.groupDays.includes(weekDay);
  }

  public hasAssignedClassroom(schedule: IGroupSchedule): boolean {
    return !!schedule.classroom;
  }

  public getDaySchedule(day: number): string {
    return (EDaysSchedule as any)[day];
  }

  public getScheduleHour(hour: number): string {
    return `${(Math.floor(hour / 60)).toString().padStart(2, '0')}:${(hour % 60).toString().padEnd(2, '0')}`;
  }

  public getBadgeType(schedule: IGroupSchedule): string {
    return schedule.classroom ? 'badge badge-info' : 'badge badge-danger';
  }

  public getBadgeText(schedule: IGroupSchedule): string {
    return schedule.classroom ? schedule.classroom.name : 'Sin aula';
  }

  public async assignClassroom(schedule: IGroupSchedule): Promise<void> {
    const availableClassrooms = await this._getAvailableClassrooms(schedule.startHour, schedule.endDate, schedule.day);
    let options = {};

    availableClassrooms.forEach(({ _id, name }) => { options[_id] = name; });

    Swal.fire({
      title: 'Asignación de aula',
      text: `Seleccione el aula del grupo ${this.data.group.name} para el día ${this._getWeekDay(schedule.day)}
        en el horario ${this.getScheduleHour(schedule.startHour)} - ${this.getScheduleHour(schedule.endDate)}`,
      input: 'select',
      inputOptions: options,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      inputPlaceholder: 'Seleccione un aula',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve();
          } else {
            resolve('Debe seleccionar un aula');
          }
        })
      }
    }).then((result) => {
      if (result.value) {
        this.groupProv.assignGroupClassroom(this.data.group._id, schedule, result.value)
          .subscribe(
            (res: { ok_msj: string, schedule }) => {
              this.notification.showNotification(eNotificationType.SUCCESS, 'Asignación de aula', res.ok_msj || 'Aula asignada con éxito');
              this.data.group.schedule = res.schedule;
              this.groupSchedule = this.data.group.schedule as IGroupSchedule[];
            }, (res: { _body: string }) => {
              const msj: { error_msj: string } = JSON.parse(res._body);
              this.notification
                .showNotification(eNotificationType.ERROR, 'Asignación de aula', msj.error_msj || 'Ocurrió un error al asignar el aula');
            }
          );
      }
    });
  }

  private _getWeekDay(day: number): string {
    switch (day) {
      case 1: return 'Lunes';
      case 2: return 'Martes';
      case 3: return 'Miércoles';
      case 4: return 'Jueves';
      case 5: return 'Viernes';
      case 6: return 'Sábado';
      default: '';
    }
  }

  private _getAvailableClassrooms(startHour: number, endHour: number, day: number): Promise<IClassroom[]> {
    return new Promise((resolve) => {
      this.classroomProv.getAvailableClassrooms({ startHour, endHour, day })
        .subscribe(
          (classrooms: IClassroom[]) => resolve(classrooms),
          (_) => resolve([])
        );
    });
  }

}
