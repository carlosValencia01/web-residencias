import { IEmployee } from "./employee.model";

export interface IDepartment {
    _id?: string;
    name?: string;    
    careers?:Array<Object>;   
    Employees?:Array<IEmployee>;
}