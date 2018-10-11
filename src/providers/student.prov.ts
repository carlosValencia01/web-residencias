import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';


import { Api } from './api.prov';
import { ResponseContentType } from '@angular/http';

@Injectable()
export class StudentProvider {
    constructor(
        public api: Api,
    ) {

    }

    getApiURL() {
        return this.api.getURL();
    }

    getAllStudents() {
        return this.api.get('student')
            .pipe(map(atudents => atudents.json()));
    }

    getProfileImage() {
        return this.api.get2('post/5b9961abd7d3df267ff75282', { responseType: ResponseContentType.Blob })
            .pipe(map( response => {
                return new Blob([response.blob()], {type: 'application/jpeg'});
              } ));
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
