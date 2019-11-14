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

  getDocument() {
    return this.api.getE('eSignature')
      .pipe(map(data => data));
  }

  hasESignature(rfc) {
    return this.api.getE(`eSignature/has/${rfc}`)
      .pipe(map(res => res.json()));
  }
}
