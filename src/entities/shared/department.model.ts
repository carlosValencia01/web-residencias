import { IEmployee } from './employee.model';

export interface IDepartment {
    _id?: string;
    name?: string;
    shortName?: string;
    careers?: Array<Object>;
    Employees?: Array<IEmployee>;
}
