import { ContextState } from "./ContextState";
import { iState } from "./iState";
import { ApprovedState } from "./ApprovedState";
import { ScheduledState } from "./ScheduledState";
import { eRequest } from "src/enumerators/request.enum";

export class RealizedState extends iState {
    router:string="oneStudentPage";
    index:number=6;
    phase: eRequest=  eRequest.REALIZED;
    public next(context: ContextState): void {
        context.state = new ApprovedState();        
    } public back(context: ContextState): void {
        context.state = new ScheduledState();
    }
}