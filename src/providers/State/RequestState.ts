import { ContextState } from "./ContextState";
import { VerifiedState } from "./VerifiedState";
import { iState } from "./iState";
import { eRequest } from "src/enumerators/request.enum";

export class RequestState extends iState {  
    router:string="student";       
    index:number=0;   
    phase: eRequest=  eRequest.REQUEST;
    public next(context: ContextState): void {        
        context.state = new VerifiedState();
    } public back(context: ContextState): void {

    }
}