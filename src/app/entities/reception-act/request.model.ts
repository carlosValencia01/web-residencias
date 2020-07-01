import { IStudent } from '../shared/student.model';
import { iIntegrant } from './integrant.model';

export interface iRequest {
    _id?: string;
    studentId?: any;
    student?: IStudent;
    controlNumber?: string;
    career?: string;
    careerAcronym?: string;
    fullName?: string;
    applicationDate?: Date;
    applicationDateLocal?: string;
    projectName?: string;
    product?: string;
    duration?: number;
    proposedHour?: number;
    proposedDate?: Date;
    proposedDateLocal?: string;
    email?: string;
    actDate?: Date;
    honorificMention?: boolean;
    adviserId?: string;
    adviser?: { name: string, title: string, cedula: string, email?: string };
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
    folder?: string;
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
    sentVerificationCode?: boolean;
    grade?: string;
    registry?: {
        bookNumber: string,
        foja: string,
        date: Date,
        career: string
    };
    isIntegral?: boolean;
    period?: {
        periodName: string,
        _id:string,
        year:string,
        active:boolean
    };
    examActStatus?: boolean;
}
