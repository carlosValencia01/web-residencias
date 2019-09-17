import { ContextState } from './ContextState';
import { iState } from './iState';
import { eRequest } from 'src/enumerators/request.enum';
import { ValidatedState } from './ValidatedState';
import { ReleasedState } from './ReleasedState';

export class DeliveredState extends iState {
    router = 'student';
    index = 4;
    phase: eRequest =  eRequest.DELIVERED;
    public next(context: ContextState): void {
        context.state = new ValidatedState();
    } public back(context: ContextState): void {
        context.state = new ReleasedState();
    }
}
