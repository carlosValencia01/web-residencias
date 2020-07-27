import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class RequestCourseProvider {

    constructor(private api: Api) { }

    getAllRequestCourse() {
        return this.api.get('sg-cle/requestcourse/all').pipe(map(student => student.json()));
    }

    updateRequestCourse(data){
        return this.api.post('sg-cle/requestcourse/update', data).pipe(map( res=>res.json()));
    }

    deleteRequestStudent(id, data){
        return this.api.put('sg-cle/requestcourse/delete/'+id, data).pipe(map( res=>res.json()));
    }
}