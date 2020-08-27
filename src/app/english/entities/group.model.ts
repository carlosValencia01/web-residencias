import { IEmployee } from '../../entities/shared/employee.model';
import { IPeriod } from '../../entities/shared/period.model';
import { IClassroom } from './classroom.model';
import { ICourse } from './course.model';

export interface IGroup {
  _id?: string;
  name: string;
  schedule: ISchedule[];
  level: number;
  period: IPeriod;
  status: string;
  minCapacity: number;
  maxCapacity: number;
  teacher?: IEmployee;
  course: ICourse;
}

interface ISchedule {
  day: number; // Lunes: 1, Sábado: 6
  startHour: number; // En minutos
  endDate: number; // En minutos
  classroom?: IClassroom;
}
