import { ContextState } from "./ContextState";
import { iState } from "./iState";
import { ScheduledState } from "./ScheduledState";
import { ReleasedState } from "./ReleasedState";
import { eRequest } from "src/enumerators/request.enum";
export class ValidatedState extends iState {
    router:string="oneStudentPage";
    index:number=4;
    phase: eRequest=  eRequest.VALIDATED;
    public next(context: ContextState): void {
        context.state = new ScheduledState();        
    } public back(context: ContextState): void {
        context.state = new ReleasedState();
    }
}