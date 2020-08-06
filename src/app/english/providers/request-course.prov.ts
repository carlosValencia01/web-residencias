import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class RequestCourseProvider {

    constructor(private api: Api) { }

    getAllRequestCourse() {
        return this.api.get('sg-cle/requestcourse/all').pipe(map(student => student.json()));
    }

    getAllRequestByCourse(course) {
        return this.api.get('sg-cle/requestcourse/all/'+course).pipe(map(student => student.json()));
    }

    createRequestCourse(data){
        return this.api.post('sg-cle/requestcourse/create', data).pipe(map( res=>res.json()));
    }

    updateRequestById(id, data) {
        return this.api.put('sg-cle/requestcourse/update/'+id, data).pipe(map(student => student.json()));
    }
}