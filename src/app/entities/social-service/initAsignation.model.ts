import {IStudent} from '../shared/student.model';
import {IPeriod} from '../shared/period.model';

export interface InitAsignationModel {
    studentName?: string | '';
    studentAge?: number;
    studentGender?: string | '';
    studentStreet?: string | '';
    studentSuburb?: string | '';
    studentCity?: string | '';
    studentState?: string | '';
    studentPhone?: string | '';
    studentCarrer?: string | '';
    semester?: string | '';
    studentControl?: string | '';
    studentProgress?: string | '';
    dependencyProgramName?: string;
    dependencyProgramObjective?: string;
    dependencyActivities?: string;
    schedule?: Array<any>;
    months?: Array<any>;
    dependencyProgramLocationInside?: string;
    dependencyProgramLocation?: string;
}
