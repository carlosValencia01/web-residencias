import { ContextState } from './ContextState';
import { VerifiedState } from './VerifiedState';
import { iState } from './iState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

export class CapturedState extends iState {
    router = 'student';
    index = 0;
    phase: eRequest =  eRequest.CAPTURED;

    public next(context: ContextState): void {
        context.state = new VerifiedState();
    }

    public back(context: ContextState): void {

    }
}
