import { ContextState } from './ContextState';
import { iState } from './iState';
import { RegisteredState } from './RegisteredState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { DeliveredState } from './DeliveredState';

export class ReleasedState extends iState {
    router = 'oneStudentPage';
    index = 4;
    phase: eRequest =  eRequest.RELEASED;

    public next(context: ContextState): void {
        context.state = new DeliveredState();
    }

    public back(context: ContextState): void {
        context.state = new RegisteredState();
    }
}
