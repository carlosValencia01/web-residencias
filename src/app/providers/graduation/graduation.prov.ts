import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class GraduationProvider {
    constructor(
        public api: Api,
    ) { }

    sendQR(email: string, id: string, nombre: string) {
        return this.api.post('graduationmail', { to_email: [email], id: id, name: nombre })
        .pipe(map(data => data.json()));
    }

    sendSurvey(email: string, id: string, nombre: string, nc: string, carrera: string) {
        return this.api.post('graduationmail/survey', { to_email: [email], id: id, name: nombre, nc: nc, carreer: carrera })
        .pipe(map(data => data.json()));
    }
}
