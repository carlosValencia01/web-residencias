import { IPeriod } from '../shared/period.model';
import { IStudent } from '../shared/student.model';
import { iIntegrant } from './integrant.model';

// Modelo usado actualmente - tratar de usarlo lo menos posible
export interface iRequest {
  _id?: string;
  studentId?: IStudent | any;
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
  periodId?: IPeriod;
  examActStatus?: boolean;
}

// Nuevo modelo - tratar de usarlo en lugar de iRequest
export interface IRequest {
  _id?: string;
  studentId: IStudent;
  periodId: IPeriod;
  email: string;
  applicationDate: Date;
  projectName: string;
  product: string;
  proposedDate?: Date;
  proposedHour?: number;
  duration?: number;
  place?: string;
  actDate?: Date;
  telephone: string;
  honorificMention: boolean;
  phase: string;
  status: string;
  lastModified: Date;
  observation: string;
  doer: string;
  adviser: IAdviser;
  noIntegrants: number;
  jury?: IJury[];
  integrants?: iIntegrant[];
  department: IDepartment;
  history: IHistory[];
  documents: IDocument[];
  grade: string;
  titulationOption: string;
  verificationStatus?: boolean;
  sentVerificationCode?: boolean;
  registry?: IRegistry;
  isIntegral: boolean;
  examActStatus?: boolean;
}

interface IAdviser {
  name: string;
  title: string;
  cedula: string;
  email?: string;
}

interface IJury {
  name: string;
  title: string;
  cedula: string;
  email?: string;
}

interface IDepartment {
  name: string;
  boss: string;
}

interface IHistory {
  phase: string;
  status: string;
  observation: string;
  achievementDate: Date;
  achievementDateString: string;
  user: string;
}

interface IDocument {
  type: string;
  dateRegister: Date;
  nameFile: string;
  status: string;
  observation: string;
  driveId?: string;
}

interface IRegistry {
  bookNumber: string;
  foja: string;
  date: Date;
  career: string;
}
