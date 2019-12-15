import { ContextState } from './ContextState';
import { GeneratedState } from './GeneratedState';
import { iState } from './iState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

export class TitledState extends iState {
    router = 'employeeCard';
    index = 10;
    phase: eRequest = eRequest.TITLED;
    public next(context: ContextState): void {

    }

    public back(context: ContextState): void {
        context.state = new GeneratedState();
    }
}
