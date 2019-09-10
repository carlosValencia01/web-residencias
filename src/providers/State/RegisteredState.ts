import { ContextState } from "./ContextState";
import { ReleasedState } from "./ReleasedState";
import { iState } from "./iState";
import { VerifiedState } from "./VerifiedState";
import { eRequest } from "src/enumerators/request.enum";

export class RegisteredState extends iState {
    router:string="oneStudentPage";
    index:number=3;
    phase: eRequest=  eRequest.REGISTERED;
    public next(context: ContextState): void {
        context.state = new ReleasedState();        
    } public back(context: ContextState): void {
        context.state = new VerifiedState();
    }
}