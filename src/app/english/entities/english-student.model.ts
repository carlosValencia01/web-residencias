import { IStudent } from '../../entities/shared/student.model';
import { ICourse } from './course.model';

export interface IEnglishStudent {
  _id?: string;
  studentId: IStudent | string;
  currentPhone: string;
  status?: string;
  totalHoursCoursed: number;
  courseType?: ICourse;
  level: number;
}
