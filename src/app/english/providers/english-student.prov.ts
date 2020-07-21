import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class EnglishStudentProvider {

    constructor(private api: Api) { }

    getEnglishStudentByStudentId(studentId) {
        return this.api.get(`sg-cle/englishstudent/search/student/`+studentId)
            .pipe(map(student => student.json()));
    }

    createEnglishStudent(englishStudent) {
        return this.api.post('sg-cle/englishstudent/create', englishStudent)
            .pipe(map(created => created.json()));
    }

    updateEnglishStudent(data, id){
        return this.api.put('sg-cle/englishstudent/update/'+id, data).pipe(map( res=>res.json()));
    }
}
