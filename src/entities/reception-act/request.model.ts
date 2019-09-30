import { IStudent } from '../shared/student.model';
import { iIntegrant } from './integrant.model';

export interface iRequest {
    _id?: string;
    studentId?: string;
    student?: IStudent;
    controlNumber?: string;
    career?: string;
    fullName?: string;
    applicationDate?: Date;
    applicationDateLocal?: string;
    projectName?: string;
    product?: string;
    proposedDate?: Date;
    email?: string;
    actDate?: Date;
    honorificMention?: boolean;
    adviserId?: string;
    adviser?: string;
    noIntegrants?: number;
    integrants?: Array<iIntegrant>;
    department?: { name: string, boss: string };
    phase?: string;
    status?: string;
    telephone?: string;
    lastModified?: Date;
    doer?: string;
    observation?: string;
    history?: [
        {
            phase: string,
            status: string,
            observation: string,
            achievementDate: Date,
            achievementDateString: string,
            user: string
        }
    ];
    documents?: [
        {
            type: string,
            dateRegister: Date,
            nameFile: string,
            status: string
        }
    ];
}
