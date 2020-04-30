import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';


@Injectable()
export class RangeProvider {
    constructor(public api: Api) { }

    getApiURL() {
        return this.api.getURL();
    }

    getAll() {
        return this.api.get(`range/`).pipe(map(ranges => ranges.json()));
    }

    add(data) {
        return this.api.post(`range/create`, data).pipe(map(range => range.json()));
    }

    update(_id, data) {
        return this.api.put(`range/${_id}`, data).pipe(map(range => range.json()));
    }

    delete(_id) {
        return this.api.delete(`range/remove/${_id}`).pipe(map(range => range.json()));
    }
}
