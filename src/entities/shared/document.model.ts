export interface IDocument {
    _id?: string;
    strategicProcess?: string;
    key?: string;
    operativeProcess?: string;
    procedure?: string;
    code?: string;
    name?: string;
    departments?: Array<string>;
}
