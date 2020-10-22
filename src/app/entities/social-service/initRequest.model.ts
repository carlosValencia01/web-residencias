import {IStudent} from '../shared/student.model';
import {IPeriod} from '../shared/period.model';

export interface InitRequestModel {
  student?: IStudent | any;
  dependencyName?: string;
  dependencyPhone?: string;
  dependencyAddress?: string;
  dependencyHeadline?: string;
  dependencyHeadlinePosition?: string;
  dependencyDepartment?: string;
  dependencyDepartmentManager?: string;
  dependencyDepartmentManagerEmail?: string;
  dependencyProgramName?: string;
  dependencyProgramModality?: string;
  initialDate?: Date;
  dependencyActivities?: string;
  dependencyProgramType?: Category;
  dependencyProgramObjective?: string;
  dependencyProgramLocationInside?: string;
  dependencyProgramLocation?: string;
  tradeDocumentNumber?: string;
  periodId?: IPeriod;
  months?: Array<any>;
  schedule?: Array<any>;
}

interface Category {
  option: string;
  value: string;
}
