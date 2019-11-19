import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Api } from './api.prov';

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

    update(id,data){
        return this.api.put(`user/update/user/${id}`, { data: data })
            .pipe(map(user => user.json()));
    }
}
