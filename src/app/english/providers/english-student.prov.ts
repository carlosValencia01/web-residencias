import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';
import { IEnglishStudent } from '../entities/english-student.model';

@Injectable()
export class EnglishStudentProvider {

  constructor(private api: Api) { }

  getEnglishStudentByStudentId(studentId: string) {
    return this.api.get(`sg-cle/englishstudent/search/student/` + studentId)
      .pipe(map(student => student.json()));
  }

  getEnglishStudentById(id) {
    return this.api.get(`sg-cle/englishstudent/search/` + id)
      .pipe(map(student => student.json()));
  }

  createEnglishStudent(englishStudent: IEnglishStudent) {
    return this.api.post('sg-cle/englishstudent/create', englishStudent)
      .pipe(map(created => created.json()));
  }

  updateEnglishStudent(data, id) {
    return this.api.put('sg-cle/englishstudent/update/' + id, data).pipe(map(res => res.json()));
  }

  updateStatus(id, data) {
    return this.api.put('sg-cle/englishstudent/update/status/' + id, data).pipe(map(res => res.json()));
  }
  
  setPaidStatus(data){
    return this.api.put('sg-cle/englishstudent/set/paidstatus', data).pipe(map(res => res.json()));
  }

  getEnglishStudentNoVerified() {
    return this.api.get('sg-cle/englishstudent/students/noverified').pipe(map(student => student.json()));
  }
}
