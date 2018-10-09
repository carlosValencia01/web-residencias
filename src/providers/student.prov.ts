import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';


import { Api } from './api.prov';

@Injectable()
export class StudentProvider {
    constructor(
        public api: Api,
    ) {

    }

    getAllStudents() {
        return this.api.get('student')
            .pipe(map(atudents => atudents.json()));
    }

    searchStudents(text: string, start?: number, limit?: number) {
        const trueStart = start || 0;
        const trueLimit = limit || 15;

        return this.api.get(`student/search/${text}`, {
            start: trueStart,
            limit: trueLimit
        }).pipe(map(res => res.json()));
    }


}
