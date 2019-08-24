import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Api } from './api.prov';

@Injectable()
export class InscriptionsProvider {
    constructor(
        public api: Api,
    ) { }

    sendEmail(data: object) {
        return this.api.post('inscription/sendmail', data)
            .pipe(map(res => res.json()));
    }
}