import { Injectable, EventEmitter } from '@angular/core';
import { iRequest } from 'src/entities/request.model';
import { eRequest } from 'src/enumerators/request.enum';
@Injectable()
export class RequestService{
    private Request:iRequest;     
    public requestUpdate=new EventEmitter<{Request:iRequest, Phase:eRequest}>();
    
    public AddRequest(request:iRequest, phase:eRequest):void{        
        this.Request=request;
        console.log("ADD REQUEST service", this.Request);
        this.requestUpdate.emit({Request: this.Request, Phase: phase});
    }    
}