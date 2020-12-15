import {IStudent} from '../shared/student.model';
import {IPeriod} from '../shared/period.model';

export interface InitSelfEvaluationModel {
  qs1?: number;
  qs2?: number;
  qs3?: number;
  qs4?: number;
  qs5?: number;
  qs6?: number;
  qs7?: number;
  observations?: string;
  position?: number;
  studentName: string;
  programName: string;
  period: string;
  control: string;
}

interface Category {
  option: string;
  value: string;
}
