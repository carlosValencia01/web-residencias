import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Api } from 'src/app/providers/app/api.prov';

@Injectable()
export class RequestCourseProvider {

  constructor(private api: Api) { }

  getAllRequestCourse() {
    return this.api.get('sg-cle/requestcourse/all').pipe(map(student => student.json()));
  }

  getRequestCourse(englishStudentId) {
    return this.api.get('sg-cle/requestcourse/student/' + englishStudentId).pipe(map(student => student.json()));
  }

  getAllRequestByCourse(course) {
    return this.api.get('sg-cle/requestcourse/all/requested/' + course).pipe(map(student => student.json()));
  }

  getAllRequestStudyingByCourse(course) {
    return this.api.get('sg-cle/requestcourse/all/studying/' + course).pipe(map(student => student.json()));
  }

  getRequestCourseByEnglishStudentId(englishStudentId) {
    return this.api.get('sg-cle/requestcourse/by/englishstudent/' + englishStudentId).pipe(map(student => student.json()));
  }

  public getRequestedGroupRequest(groupId: string) {
    return this.api.get(`sg-cle/requestcourse/${groupId}/requests`)
      .pipe(map(res => res.json()));
  }

  createRequestCourse(data) {
    return this.api.post('sg-cle/requestcourse/create', data).pipe(map(res => res.json()));
  }

  updateRequestById(id, data) {
    return this.api.put('sg-cle/requestcourse/update/' + id, data).pipe(map(student => student.json()));
  }

  updateRequestByStudentId(id, data) {
    return this.api.put('sg-cle/requestcourse/update/student/' + id, data).pipe(map(student => student.json()));
  }

  activeRequest(data) {
    return this.api.post('sg-cle/requestcourse/active/request', data).pipe(map(res => res.json()));
  }

  getAllRequestActiveCourse(course, clientId: string) {
    return this.api.get(`sg-cle/requestcourse/all/active/${course}/${clientId}`).pipe(map(student => student.json()));
  }

  declineRequest(data) {
    return this.api.post('sg-cle/requestcourse/decline/request', data).pipe(map(res => res.json()));
  }

  addRequest(data) {
    return this.api.post('sg-cle/requestcourse/add/request', data).pipe(map(res => res.json()));
  }

  setPaidStatus(data) {
    return this.api.put('sg-cle/requestcourse/paidstatus', data).pipe(map(res => res.json()));
  }

  updateRequestCourseStatusToPendingByGroupId(id, data) {
    return this.api.put(`sg-cle/requestcourse/requestCourseToPending/${id}`, data).pipe(map(res => res.json()));
  }

  getAllRequestCourseByEnglishStudentId(englishStudentId) {
    return this.api.get('sg-cle/requestcourse/all/by/englishstudent/' + englishStudentId).pipe(map(res => res.json()));
  }
}
