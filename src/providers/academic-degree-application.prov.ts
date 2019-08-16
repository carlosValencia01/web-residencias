import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Api } from './api.prov';

@Injectable()
export class AcademicDegreeApplicationProvider {
  constructor(
    private api: Api
  ) {}

  saveRequest(data: any) {
    return this.api.post('', data)
      .pipe(map(res => res.json()));
  }
}