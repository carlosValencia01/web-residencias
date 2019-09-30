import { ContextState } from './ContextState';
import { RealizedState } from './RealizedState';
import { iState } from './iState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

export class GeneratedState extends iState {
    router = 'employeeCard';
    index = 7;
    phase: eRequest =  eRequest.GENERATED;

    public next(context: ContextState): void {

    }

    public back(context: ContextState): void {
        context.state = new RealizedState();
    }
}
