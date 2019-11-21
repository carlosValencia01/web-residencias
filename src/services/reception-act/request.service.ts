import { Injectable, EventEmitter } from '@angular/core';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

@Injectable()
export class RequestService {
    private Request: iRequest;
    public requestUpdate = new EventEmitter<{ Request: iRequest, Phase: eRequest }>();

    public AddRequest(request: iRequest, phase: eRequest): void {
        this.Request = request;
        console.log('ADD REQUEST service', this.Request);
          (async () => {
            await this.delay(150);
            this.requestUpdate.emit({ Request: this.Request, Phase: phase });
        })();
        this.requestUpdate.emit({ Request: this.Request, Phase: phase });
      
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
