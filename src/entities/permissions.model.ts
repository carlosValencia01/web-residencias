export interface iPermission {
    label: string;
    icon: string;
    routerLink?: string;
    items?: Array<iPermission>;
}
