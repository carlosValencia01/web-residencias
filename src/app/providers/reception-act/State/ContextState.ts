import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { CapturedState } from './CapturedState';
import { VerifiedState } from './VerifiedState';
import { iState } from './iState';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { RegisteredState } from './RegisteredState';
import { SentState } from './SentState';
import { ReleasedState } from './ReleasedState';
import { DeliveredState } from './DeliveredState';
import { ValidatedState } from './ValidatedState';
import { AssignedState } from './AssignedState';
import { RealizedState } from './RealizedState';
import { GeneratedState } from './GeneratedState';
import { TitledState } from './TitledState';

export class ContextState {
    public state: iState;
    constructor(phase: eRequest = eRequest.NONE, status: eStatusRequest = eStatusRequest.NONE) {
        switch (phase) {
            case eRequest.NONE: {
                this.state = new CapturedState();
                this.state.status = status;
                break;
            }
            case eRequest.CAPTURED: {
                this.state = new CapturedState();
                this.state.status = status;
                break;
            }
            case eRequest.SENT: {
                this.state = new SentState();
                this.state.status = status;
                break;
            }
            case eRequest.VERIFIED: {
                this.state = new VerifiedState();
                this.state.status = status;
                break;
            }
            case eRequest.REGISTERED: {
                this.state = new RegisteredState();
                this.state.status = status;
                break;
            }
            case eRequest.RELEASED: {
                this.state = new ReleasedState();
                this.state.status = status;
                break;
            } case eRequest.DELIVERED: {
                this.state = new DeliveredState();
                this.state.status = status;
                break;
            }
            case eRequest.VALIDATED: {
                this.state = new ValidatedState();
                this.state.status = status;
                break;
            }
            case eRequest.ASSIGNED: {
                this.state = new AssignedState();
                this.state.status = status;
                break;
            }
            case eRequest.REALIZED: {
                this.state = new RealizedState();
                this.state.status = status;
                break;
            }
            case eRequest.GENERATED: {
                this.state = new GeneratedState();
                this.state.status = status;
                break;
            }
            case eRequest.TITLED: {
                this.state = new TitledState();
                this.state.status = status;
                break;
            }
        }
    }

    public getRouter(): string {
        return this.state.router;
    }

    public next(): void {
        this.state.next(this);
        this.state.status = eStatusRequest.NONE;
    }

    public getIndex(): number {
        return this.state.index;
    }

    public getPhase(): eRequest {
        return this.state.phase;
    }

    public back(): void {
        this.state.back(this);
        this.state.status = eStatusRequest.ACCEPT;
    }
}
