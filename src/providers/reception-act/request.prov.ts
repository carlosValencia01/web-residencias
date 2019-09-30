import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/providers/app/api.prov';

@Injectable()
export class RequestProvider {
    constructor(public api: Api) { }

    getApiURL() {
        return this.api.getURL();
    }

    getAllRequestByStatus(role) {
        return this.api.get(`request/phase/${role}`)
            .pipe(map(requests => requests.json()));
    }

    getRequestById(_id) {
        return this.api.get(`request/${_id}`)
            .pipe(map(request => request.json()));
    }

    updateRequest(_id, data) {
        return this.api.put(`request/${_id}/status`, data).pipe(map(request => request.json()));
    }

    releasedRequest(_id, data) {
        return this.api.put(`request/${_id}/released`, data, true).pipe(map(request => request.json()));
    }
}
