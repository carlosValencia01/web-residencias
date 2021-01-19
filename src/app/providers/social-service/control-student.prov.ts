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

  getControlStudentFolderById(_id) {
    return this.api.get(`controlStudent/control/student/folder/${_id}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentByStudentId(studentId) {
    return this.api.get(`controlStudent/${studentId}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentByGeneralStatus(eStatus) {
    return this.api.get(`controlStudent/student/status/${eStatus}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentByNotEqualGeneralStatus(eStatus) {
    return this.api.get(`controlStudent/student/status/not/${eStatus}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getStudentInformationByControlId(_id) {
    return this.api.get(`controlStudent/student/${_id}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getFullStudentInformationByControlId(_id) {
    return this.api.get(`controlStudent/full/student/${_id}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentByDocumentAndStatus(documentName, status) {
    return this.api.get(`controlStudent/document/status/${documentName}/${status}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getControlStudentAccessToSocialService(_id) {
    return this.api.get(`controlStudent/student/access/${_id}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }


  getRequests(status) {
    return this.api.get(`controlStudent/request/${status}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getResource(driveId: string, resource: string): Observable<Blob> {
    return this.api.getFile(`controlStudent/${driveId}/file/${resource.toLocaleLowerCase()}`)
      .pipe(map(res => res.blob()));
  }

  sendCodeForEmailConfirmation(_id, email) {
    return this.api.get(`controlStudent/verify/${_id}/${email}`)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  getFile(fileId, fileName) {
    return this.api.post('drive/get/file', { fileId: fileId, fileName: fileName}).pipe(map(
      res => res.json()
    ));
  }

  signAllConstancyDocumentsForDepartment(constancy) {
    return this.api.post('controlStudent/sign/constancy', constancy)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  createRegisterByControlNumber(controlNumber) {
    return this.api.post('controlStudent/create/register', {controlNumber: controlNumber})
      .pipe(map(controlStudent => controlStudent.json()));
  }

  addOneReportToStudent(_id) {
    return this.api.post('controlStudent/report/' + _id, {})
      .pipe(map(controlStudent => controlStudent.json()));
  }

  removeOneReportToStudent(_id) {
    return this.api.delete('controlStudent/report/' + _id)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  uploadFile2(data) {
    return this.api.post('controlStudent/upload/file2', data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  verifyCode(data) {
    return this.api.post('controlStudent/verify', data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  createHistoryDocumentStatus(controlStudentId, data) {
    return this.api.post('controlStudent/history/' + controlStudentId, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  pushHistoryDocumentStatus(controlStudentId, documentId, data) {
    return this.api.put(`controlStudent/history/${controlStudentId}/${documentId}`, data)
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

  updateReportFromDepartmentEvaluation(_id, data) {
    return this.api.put(`controlStudent/report/status/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  updateDocumentEvaluationFromDepartmentEvaluation(_id, data) {
    return this.api.put(`controlStudent/report/multiple/status/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  updateOneVerificationDepartmentReport(_id, data) {
    return this.api.put(`controlStudent/report/department/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  updateManagerEvaluationScore(_id, data) {
    return this.api.put(`controlStudent/managerEvaluation/score/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  updateSelfEvaluationScore(_id, data) {
    return this.api.put(`controlStudent/selfEvaluation/score/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  updateLastSelfEvaluationScore(_id, data) {
    return this.api.put(`controlStudent/lastSelfEvaluation/score/${_id}`, data)
      .pipe(map(controlStudent => controlStudent.json()));
  }

  saveWorkPlan(id, data) {
    return this.api.put(`controlStudent/saveWorkPlan/${id}`, data); // .pipe(map(res => res.json()));
  }

}
