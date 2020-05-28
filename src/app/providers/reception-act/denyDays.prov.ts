import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';


@Injectable()
export class DenyDayProvider {
    constructor(public api: Api) { }

    getApiURL() {
        return this.api.getURL();
    }

    getAll() {
        return this.api.get(`denyDay/`).pipe(map(dates => dates.json()));
    }

    add(data) {
        return this.api.post(`denyDay/create`, data).pipe(map(range => range.json()));
    }
}
