import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable() 
export class EnglishCourseProvider {

    constructor(private api: Api) { }

    createEnglishCourse(englishCourse) {
        return this.api.post('sg-cle/englishcourse/create', englishCourse)
            .pipe(map(created => created.json()));
    }

    getAllEnglishCourse() {
        return this.api.get('sg-cle/englishcourse/all')
            .pipe(map(englishCourse => englishCourse.json()));
    }

    getAllEnglishCourseActive() {
        return this.api.get('sg-cle/englishcourse/all/active')
            .pipe(map(englishCourse => englishCourse.json()));
    }

    getActivePeriod(){
        return this.api.get('period/active').pipe(map( res=>res.json()));
    }
}
