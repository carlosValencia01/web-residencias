import { ContextState } from './ContextState';
import { iState } from './iState';
import { GeneratedState } from './GeneratedState';
import {  AssignedState } from './AssignedState';
import { eRequest } from 'src/enumerators/request.enum';

export class RealizedState extends iState {
    router = 'oneStudentPage';
    index = 6;
    phase: eRequest =  eRequest.REALIZED;
    public next(context: ContextState): void {
        context.state = new GeneratedState();
    } public back(context: ContextState): void {
        context.state = new AssignedState();
    }
}
