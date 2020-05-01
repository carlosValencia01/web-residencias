import { iPermission } from './permissions.model';

export interface iRole {
    _id?: string;
    name: string;
    description?: string;
    permissions?: Array<iPermission | string>;
}
