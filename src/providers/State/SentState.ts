import { ContextState } from "./ContextState";
import { VerifiedState } from "./VerifiedState";
import { iState } from "./iState";
import { eRequest } from "src/enumerators/request.enum";
import { CapturedState } from "./CapturedState";

export class SentState extends iState {  
    router:string="student";       
    index:number=1;   
    phase: eRequest=  eRequest.SENT;
    public next(context: ContextState): void {        
        context.state = new VerifiedState();
    } public back(context: ContextState): void {
        context.state = new CapturedState();
    }
}