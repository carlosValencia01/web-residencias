import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable() 
export class ClassroomProvider {

    constructor(private api: Api) { }

    getAllClassroom() {
        return this.api.get('sg-cle/classroom/all')
        .pipe(map(classroom => classroom.json()));
    }

    createClassroom(classroom) {
        return this.api.post('sg-cle/classroom/create', classroom)
            .pipe(map(created => created.json()));
    }

    deleteClassroom(_id) {
        return this.api.delete(`sg-cle/classroom/remove/${_id}`)
        .pipe(map(classroom => classroom.json()));
    }
}
