import { ContextState } from "./ContextState";
import { iState } from "./iState";
import { eRequest } from "src/enumerators/request.enum";
import { ValidatedState } from "./ValidatedState";
import { ReleasedState } from "./ReleasedState";

export class DeliveredState extends iState {  
    router:string="student";       
    index:number=0;   
    phase: eRequest=  eRequest.CAPTURED;
    public next(context: ContextState): void {        
        context.state = new ValidatedState();
    } public back(context: ContextState): void {
        context.state = new ReleasedState();
    }
}