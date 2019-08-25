import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Api } from './api.prov';

@Injectable()
export class AcademicDegreeApplicationProvider {
  constructor(
    private api: Api
  ) { }

  getRequestByControlNumber(controlNumber: any) {
    return this.api.get(`graduate/request/${controlNumber}`)
      .pipe(map(request => request.json()));
  }

  saveRequest(data: any) {
    return this.api.post('graduate/request', data)
      .pipe(map(request => request.json()));
  }

  editRequest(data: any, _id: any) {
    return this.api.put(`graduate/request/${_id}`, data)
      .pipe(map(request => request.json()));
  }

  updateRequestStatus(data: any, _id: any) {
    return this.api.put(`graduate/request/status/${_id}`, data)
      .pipe(map(request => request.json()));
  }
}