import { ContextState } from './ContextState';
import { RealizedState } from './RealizedState';
import { iState } from './iState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { TitledState } from './TitledState';

export class GeneratedState extends iState {
    router = 'employeeCard';
    index = 9;
    phase: eRequest = eRequest.GENERATED;

    public next(context: ContextState): void {
        context.state = new TitledState();
    }

    public back(context: ContextState): void {
        context.state = new RealizedState();
    }
}
