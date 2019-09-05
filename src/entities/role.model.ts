import { iPermission } from "./permissions.model";

export interface iRole {
    name: string,
    description: string,
    permissions?: Array<iPermission>
}