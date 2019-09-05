import { IGrade } from "./grade.model";

export interface IEmployee {
    _id?: string;
    rfc?: string;
    name: {firstName?:string, lastName?:string, fullName?:string};    
    area?: string;
    position?: string;
    filename?: string;   
    isBoss?: boolean;
    grade?:Array<IGrade>;    
}