import { IPeriod } from '../../entities/shared/period.model';

export interface ICourse {
  _id?: string;
  name: string;
  dailyHours: number;
  semesterHours: number;
  totalSemesters: number;
  totalHours: number;
  startPeriod: IPeriod;
  endPeriod?: IPeriod;
  status: string;
}
