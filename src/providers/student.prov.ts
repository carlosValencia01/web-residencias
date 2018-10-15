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
            .pipe(map(students => students.json()));
    }

    getProfileImage(id) {
        return this.api.get(`student/image/${id}`, { responseType: ResponseContentType.Blob })
            .pipe(map(response => {
                return new Blob([response.blob()], { type: 'application/jpeg' });
            }));
    }

    updateStudent(id, data) {
        return this.api.put(`student/${id}`, data)
            .pipe(map(student => student.json()));
    }

    updatePhoto(id, data) {
        return this.api.put(`student/image/${id}`, data)
            .pipe(map(student => student.json()));
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
