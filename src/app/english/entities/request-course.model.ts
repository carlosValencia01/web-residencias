import { IPeriod } from '../../entities/shared/period.model';
import { IEnglishStudent } from './english-student.model';
import { IGroup } from './group.model';

export interface IRequestCourse {
  _id?: string;
  englishStudent: IEnglishStudent;
  group: IGroup;
  status: string;
  average?: string;
  requestDate: Date;
  level: number;
  rejectMessage?: string;
  period: IPeriod;
  paidNumber?: number;
  active: boolean;
}
