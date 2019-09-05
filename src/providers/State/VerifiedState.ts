import { ContextState } from "./ContextState";
import { RegisteredState } from "./RegisteredState";
import { RequestState } from "./RequestState";
import { iState } from "./iState";
import { eRequest } from "src/enumerators/request.enum";

export class VerifiedState extends iState {
    router:string="oneStudentPage";
    index:number=1;
    phase: eRequest=  eRequest.VERIFIED;
    public next(context: ContextState): void {
        context.state = new RegisteredState();        
    } public back(context: ContextState): void {
        context.state = new RequestState();
    }
}