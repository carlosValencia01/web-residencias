import { IGrade } from '../reception-act/grade.model';
import { IPosition } from './position.model';

export interface IEmployee {
    _id?: string;
    rfc?: string;
    name: {firstName?: string, lastName?: string, fullName?: string};
    gender?: string;
    birthDate?: Date;
    area?: string;
    position?: string;
    filename?: string;
    grade?: Array<IGrade>;
    positions?: Array<IPosition>;
}
