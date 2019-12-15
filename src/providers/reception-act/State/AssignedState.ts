import { ContextState } from './ContextState';
import { iState } from './iState';
import { RealizedState } from './RealizedState';
import { ValidatedState } from './ValidatedState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

export class AssignedState extends iState {
    router = 'oneStudentPage';
    index = 7;
    phase: eRequest =  eRequest.ASSIGNED;

    public next(context: ContextState): void {
        context.state = new RealizedState();
    }

    public back(context: ContextState): void {
        context.state = new ValidatedState();
    }
}
