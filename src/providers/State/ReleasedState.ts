import { ContextState } from "./ContextState";
import { iState } from "./iState";
import { ValidatedState } from "./ValidatedState";
import { RegisteredState } from "./RegisteredState";
import { eRequest } from "src/enumerators/request.enum";

export class ReleasedState extends iState {
    router:string="oneStudentPage";
    index:number=3;
    phase: eRequest=  eRequest.RELEASED;
    public next(context: ContextState): void {
        context.state = new ValidatedState();        
    } public back(context: ContextState): void {
        context.state = new RegisteredState();
    }
}