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
    duration?: number;
    proposedHour?: number;
    proposedDate?: Date;
    email?: string;
    actDate?: Date;
    honorificMention?: boolean;
    adviserId?: string;
    adviser?: { name: string, title: string, cedula: string };
    place?: string;
    noIntegrants?: number;
    integrants?: Array<iIntegrant>;
    department?: { name: string, boss: string };
    phase?: string;
    status?: string;
    telephone?: string;
    lastModified?: Date;
    lastModifiedLocal?: string;
    doer?: string;
    observation?: string;
    jury?: Array<any>;
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
            status: string,
            observation: string,
            driveId?: string
        }
    ];
    titulationOption?: string;
    verificationStatus?: boolean;
}
