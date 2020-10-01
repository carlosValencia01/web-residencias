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

  getActivePeriod() {
    return this.api.get('period/active')
      .pipe(map(period => period.json()));
  }

  getControlStudentById(_id) {
    return this.api.get(`controlStudent/control/student/${_id}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentByStudentId(studentId) {
    return this.api.get(`controlStudent/${studentId}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getStudentInformationByControlId(_id) {
    return this.api.get(`controlStudent/student/${_id}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getSignedRequests() {
    return this.api.get('controlStudent/signedRequests/')
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getApprovedRequests(){
    return this.api.get('controlStudent/approvedRequests/')
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getRequests(status){
    return this.api.get(`controlStudent/request/${status}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  sendCodeForEmailConfirmation(_id, email) {
    return this.api.get(`controlStudent/verify/${_id}/${email}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  createAssistanceByControlNumber(controlNumber) {
    return this.api.post('controlStudent/register/assistance', {controlNumber: controlNumber})
      .pipe(map(controlStudent => controlStudent.json()));
  }

  verifyCode(data) {
    return this.api.post('controlStudent/verify', data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  releaseSocialServiceCsv(data: any) {
    return this.api.put(`controlStudent/release/csv`, data).pipe(map(res => res.json()));
  }

  updateGeneralControlStudent(_id, data) {
    return this.api.put(`controlStudent/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  uploadDocumentDrive(id, data): Observable<any> {
    return this.api.put(`controlStudent/document/drive/${id}`, data).pipe(map(res => res.json()));
  }

  updateDocumentLog(id, data): Observable<any> {
    return this.api.put(`controlStudent/document/status/${id}`, data).pipe(map(res => res.json()));
  }
}
