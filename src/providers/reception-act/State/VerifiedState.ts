import { ContextState } from './ContextState';
import { RegisteredState } from './RegisteredState';
import { iState } from './iState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { SentState } from './SentState';

export class VerifiedState extends iState {
    router = 'oneStudentPage';
    index = 2;
    phase: eRequest =  eRequest.VERIFIED;

    public next(context: ContextState): void {
        context.state = new RegisteredState();
    }

    public back(context: ContextState): void {
        context.state = new SentState();
    }
}
