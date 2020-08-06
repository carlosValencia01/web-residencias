import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable() 
export class GroupProvider {

    constructor(private api: Api) { }

    createGroup(group) {
        return this.api.post('sg-cle/group/create', group)
            .pipe(map(created => created.json()));
    }

    getAllGroup() {
        return this.api.get('sg-cle/group/all')
            .pipe(map(group => group.json()));
    }

    getAllGroupOpened() {
        return this.api.get('sg-cle/group/all/opened')
            .pipe(map(group => group.json()));
    }

    getAllGroupOpenedByCourseAndLevel(data) {
        return this.api.get('sg-cle/group/all/opened/by-course-and-level', data)
            .pipe(map(group => group.json()));
    }

    getActivePeriod(){
        return this.api.get('period/active').pipe(map( res=>res.json()));
    }
}
