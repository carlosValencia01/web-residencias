import { IDocument } from 'src/entities/shared/document.model';
import { IDepartment } from 'src/entities/shared/department.model';
import { iRole } from 'src/entities/app/role.model';

export interface IPosition {
    _id?: string;
    name?: string;
    ascription?: IDepartment;
    canSign?: boolean;
    documents?: Array<IDocument>;
    isUnique?: boolean;
    gender?: { male?: string, female?: string };
    role?: iRole | string;
}
