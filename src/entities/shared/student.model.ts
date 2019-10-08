export interface IStudent {
    _id?: string;
    controlNumber: string;
    fullName: string;
    name?: string;
    lastName?: string;
    career: string;
    nss?: string;
    nip?: string;
    english?: string;
    document?: { filename?: string, releseDate?: Date, type?: string, status?: string };
}
