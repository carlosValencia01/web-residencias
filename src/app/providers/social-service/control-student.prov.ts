import { Injectable } from '@angular/core';
import {Api} from '../app/api.prov';
import {map, tap} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class ControlStudentProv {
  constructor(public api: Api) { }

  getAllControlStudents() {
    return this.api.get('controlStudent')
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentByStudentId(studentId) {
    return this.api.get(`controlStudent/${studentId}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  updateGeneralControlStudent(_id, data) {
    return this.api.put(`controlStudent/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }
}
