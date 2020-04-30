import { Injectable, EventEmitter } from '@angular/core';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';

@Injectable()
export class RequestService {
    private Request: iRequest;
    public requestUpdate = new EventEmitter<{ Request: iRequest, Phase: eRequest, IsEdit: boolean }>();

    public AddRequest(request: iRequest, phase: eRequest, isEdit: boolean = false): void {
        this.Request = request;
        (async () => {
            await this.delay(150);
            this.requestUpdate.emit({ Request: this.Request, Phase: phase, IsEdit: isEdit });
        })();
        this.requestUpdate.emit({ Request: this.Request, Phase: phase, IsEdit: isEdit });

    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
