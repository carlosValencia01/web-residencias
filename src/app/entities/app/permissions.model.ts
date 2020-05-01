export interface iPermission {
    _id?: string;
    label?: string;
    icon?: string;
    routerLink?: string;
    category?: string;
    items?: Array<iPermission>;
}
