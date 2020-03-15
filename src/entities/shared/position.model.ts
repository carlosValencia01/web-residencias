import { IDocument } from './document.model';
import { IDepartment } from './department.model';

export interface IPosition {
    _id?: string;
    name?: string;
    ascription?: IDepartment;
    canSign?: boolean;
    documents?: Array<IDocument>;
    isUnique?: boolean;
    gender?: { male?: string, female?: string };
}
