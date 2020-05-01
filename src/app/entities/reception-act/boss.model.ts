import { IGrade } from "./grade.model";
export interface IBoss {
    _id?: string;
    name?: string;
    gender?: string;
    position?: string;
    department?: string;
    grade?: Array<IGrade>;
}
