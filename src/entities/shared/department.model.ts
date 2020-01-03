import {IEmployee} from './employee.model';
import {ICareer} from './career.model';

export interface IDepartment {
  _id?: string;
  name?: string;
  shortName?: string;
  careers?: Array<ICareer>;
  Employees?: Array<IEmployee>;
  boss?: IEmployee;
}
