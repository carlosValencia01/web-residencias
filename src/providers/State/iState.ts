import { ContextState } from "./ContextState";
import { eRequest } from "src/enumerators/request.enum";
import { eStatusRequest } from "src/enumerators/statusRequest.enum";

export abstract class iState {  
    public router:string;             
    public status:eStatusRequest;   
    public index:number;
    public phase:eRequest;
    public abstract next(context: ContextState):void;
    public abstract back(context: ContextState):void;
}