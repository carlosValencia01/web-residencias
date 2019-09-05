import { eRequest } from "src/enumerators/request.enum";
import { RequestState } from "./RequestState";
import { VerifiedState } from "./VerifiedState";
import { iState } from "./iState";
import { eStatusRequest } from "src/enumerators/statusRequest.enum";
import { RegisteredState } from "./RegisteredState";

export class ContextState {
    public state: iState;
    constructor(phase: eRequest=eRequest.NONE, status: eStatusRequest=eStatusRequest.NONE) {
        console.log("c pahe",phase);
        console.log("c status",status);
        switch (phase) {
            case eRequest.NONE:{                                
                this.state = new RequestState();
                this.state.status=status;
                break;
            }
            case eRequest.REQUEST: {
                this.state = new RequestState();
                this.state.status=status;
                break;
            }
            case eRequest.VERIFIED: {
                this.state = new VerifiedState();
                this.state.status=status;
                break;
            }       
            case eRequest.REGISTERED: {
                this.state = new RegisteredState();
                this.state.status=status;
                break;
            }       
        }
    }

    public getRouter():string{
        return this.state.router;
    }
    public next(): void {
        this.state.next(this);
        this.state.status=eStatusRequest.NONE;
    }
    public getIndex():number{
        return this.state.index;
    }

    public getPhase():eRequest{
        return this.state.phase;
    }
    public back(): void {
        this.state.back(this);
        this.state.status=eStatusRequest.ACCEPT;
    }
}