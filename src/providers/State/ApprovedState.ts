import { ContextState } from "./ContextState";
import { RealizedState } from "./RealizedState";
import { iState } from "./iState";
import { eRequest } from "src/enumerators/request.enum";

export class ApprovedState extends iState{
    router:string="employeeCard";
    index:number=7;
    phase: eRequest=  eRequest.APPROVED;
    public next(context: ContextState): void {
        ;
    } public back(context: ContextState): void {
        context.state = new RealizedState();
    }
}