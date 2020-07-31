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
}
