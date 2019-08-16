import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Api } from './api.prov';

@Injectable()
export class GraduationProvider {
    constructor(
        public api: Api,
    ){}

    sendQR(email: string, id: string, nombre: string) {
        return this.api.post('graduationmail', { to_email: [email], id: id, name: nombre })
        .pipe(map(data => data.json()));
    }
}