import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Api } from './api.prov';

@Injectable()
export class InscriptionsProvider {
    constructor(
        public api: Api,
    ){}

    sendInfography(email: string, subject: string) {
        return this.api.post('sendmail', { to_email: email, subject: subject })
        .pipe(map(data => data.json()));
    }
}