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
  documents?: IDocument[];
  sex?: string;
  phone?: string;
  status?: string;
}

interface IDocument {
  filename?: string;
  releseDate?: Date;
  type?: string;
  status?: IDocumentStatus[];
}

interface IDocumentStatus {
  _id?: string;
  date?: Date;
  name?: string;
  active?: boolean;
  message?: string;
}
