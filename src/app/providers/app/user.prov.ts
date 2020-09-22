import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Api } from './api.prov';
import {Subject} from 'rxjs';
@Injectable()
export class UserProvider {

    private _refreshNeeded$ = new Subject<void>();
    constructor(
        public api: Api,
    ) {

    }

    get refreshNeeded$() {
        return this._refreshNeeded$;
    }

    addUser(data) {
        return this.api.post('user/register', data)
            .pipe(map(user => user.json()));
    }

    login(data) {
        return this.api.post('user/login', data)
            .pipe(map(user => user.json()));
    }

    verifyLoginSii(data) {
        return this.api.post('user/verify/studentAccount', data)
            .pipe(map(user => user.json()));
    }

    getAllUsers() {
        return this.api.get('user')
            .pipe(map(users => users.json()));
    }
    getSecretaries() {
        return this.api.get('user/secretaries')
            .pipe(map(users => users.json()));
    }

    removeUser(id) {
        return this.api.delete(`user/${id}`)
            .pipe(map(user => user.json()));
    }

    changePassword(id: string, newPassword: string) {
        return this.api.put(`user/password/${id}`, { password: newPassword })
            .pipe(map(user => user.json()));
    }

    sendEmailForResetPassword(email: string, forced: boolean) {
        return this.api.post(`user/send/code`, { email: email, forced: forced } )
        .pipe(map(user => user.json()));
    }

    sendTokenFromAPI(token) {
        this.api.setToken(token);
    }

    updateCareers(id,data,action){
        return this.api.put(`user/${action}/career/user/${id}`, data)
            .pipe(map(user => user.json())).pipe(
                tap(() => {
                  this._refreshNeeded$.next();
                })
              );;
    }
}
