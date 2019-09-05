import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from './api.prov';

@Injectable()
export class RequestProvider {
    constructor(public api: Api) {}

    getAllRequest() {
        return this.api.get('request')
            .pipe(map(requests => requests.json()));
    }

    getRequestById(_id) {
        return this.api.get(`request/${_id}`)
            .pipe(map(request => request.json()));
    }
    
    updateRequest(_id, data){
        return this.api.put(`request/${_id}/status`,data).pipe(map(request => request.json()));
    }
}