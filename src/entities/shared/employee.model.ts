import { IGrade } from '../reception-act/grade.model';

export interface IEmployee {
    _id?: string;
    rfc?: string;
    email?: string;
    curp?: string;
    name: {firstName?: string, lastName?: string, fullName?: string};
    gender?: string;
    birthDate?: Date;
    area?: string;
    position?: string;
    filename?: string;
    grade?: Array<IGrade>;
    positions?: Array<any>;
}
