import { ContextState } from './ContextState';
import { iState } from './iState';
import { AssignedState } from './AssignedState';
import { ReleasedState } from './ReleasedState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
export class ValidatedState extends iState {
    router = 'oneStudentPage';
    index = 4;
    phase: eRequest =  eRequest.VALIDATED;

    public next(context: ContextState): void {
        context.state = new AssignedState();
    }

    public back(context: ContextState): void {
        context.state = new ReleasedState();
    }
}
