import {IStudent} from '../shared/student.model';

export interface InitConstancyModel {
  student?: IStudent | any;
  dependencyName?: string;
  dependencyDepartment?: string;
  dependencyDepartmentManager?: string;
  dependencyProgramName?: string;
  initialDate?: Date;
  tradeConstancyDocumentNumber?: string;
  performanceLevelConstancyDocument?: string;
  departmentSignName?: string;
  departmentSignDate?: string;
}
