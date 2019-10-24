import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from '../app/api.prov';

@Injectable()
export class UserProvider {
  constructor(
    public api: Api,
  ) {

  }

  addUser(data) {
    return this.api.post('user/register', data)
      .pipe(map(user => user.json()));
  }

  login(data) {
    return this.api.post('user/login', data)
      .pipe(map(user => user.json()));
  }

  getAllUsers() {
    return this.api.get('user')
      .pipe(map(users => users.json()));
  }
}
