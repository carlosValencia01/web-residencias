import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from '../app/api.prov';

@Injectable()
export class ESignatureProvider {
  constructor(private api: Api) {
  }

  createDocument(data) {
    return this.api.postE('eSignature/create', data)
      .pipe(map(res => res.json()));
  }

  renewESignature(userId, employeeId, positionId, data) {
    return this.api.putE(`eSignature/renew/${userId}/${employeeId}/${positionId}`, data)
      .pipe(map(res => res.json()));
  }

  getDocument(employeeId, positionId) {
    return this.api.getE(`eSignature/${employeeId}/${positionId}`)
      .pipe(map(data => data));
  }

  hasESignature(rfc, positionId) {
    return this.api.getE(`eSignature/has/${rfc}/${positionId}`)
      .pipe(map(res => res.json()));
  }

  sign(data) {
    return this.api.postE('eSignature/sign', data)
      .pipe(map(res => res.json()));
  }

  changeESignatureStatus(employeeId, data) {
    return this.api.putE(`eSignature/changeStatus/${employeeId}`, data)
      .pipe(map(res => res.json()));
  }

  changeESignaturePassword(userId, employeeId, positionId, data) {
    return this.api.putE(`eSignature/changePassword/${userId}/${employeeId}/${positionId}`, data)
      .pipe(map(res => res.json()));
  }
}
