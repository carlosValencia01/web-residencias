import { ICareer } from './career.model';

export interface IStudent {
  _id?: string;
  controlNumber: string;
  fullName: string;
  name?: string;
  lastName?: string;
  career: string;
  careerId?: ICareer;
  nss?: string;
  nip?: string;
  english?: string;
  document?: { filename?: string, releseDate?: Date, type?: string, status?: string };
  sex?: string;
  phone?: string;
}
