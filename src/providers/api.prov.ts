import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { CookiesService } from '../services/cookie.service';


// import { UserService } from '../services/user.service';

@Injectable()
export class Api {
    // url = 'http://localhost:3005/escolares/credenciales';
    url = 'https://api.cideti.com.mx/escolares/credenciales';
    headers: Headers = new Headers();

    constructor(
        private http: Http,
        private cookiesServ: CookiesService,
    ) {
        this.headers.append('Content-Type', 'application/json');
        // this.headers.append('Authorization', `Bearer ${this.cookiesServ.getData().token}`);
    }

    getURL() {
        return this.url;
    }

    setToken(token) {
        this.headers.delete('Authorization');
        this.headers.append('Authorization', `Bearer ${token}`);
    }

    get(endpoint: string, params?: any) {
        const options = new RequestOptions({ headers: this.headers });

        // Support easy query params for GET requests
        if (params) {
            const p = new URLSearchParams();

            // tslint:disable-next-line:forin
            for (const k in params) {
                p.set(k, params[k]);
            }

            // Set the search field if we have params and don't already have
            // a search field set in options.
            options.search = !options.search && p || options.search;
        }

        return this.http.get(this.url + '/' + endpoint, options);
        // .do(res => console.log(res));
    }

    get2(endpoint: string, params?: any) {
        const options = new RequestOptions({ headers: this.headers });

        // Support easy query params for GET requests
        if (params) {
            const p = new URLSearchParams();

            // tslint:disable-next-line:forin
            for (const k in params) {
                p.set(k, params[k]);
            }

            // Set the search field if we have params and don't already have
            // a search field set in options.
            options.search = !options.search && p || options.search;
        }

        return this.http.get('https://api.cideti.com.mx/inifap/v1' + '/' + endpoint, options);
        // .do(res => console.log(res));
    }

    post(endpoint: string, body: any) {
        // console.log('api:post');
        const options = new RequestOptions({ headers: this.headers });
        return this.http.post(this.url + '/' + endpoint, body, options);
        // .do(res => console.log(res));
    }

    put(endpoint: string, body: any) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.put(this.url + '/' + endpoint, body, options);
        // .do(res => console.log(res));
    }

    delete(endpoint: string) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.delete(this.url + '/' + endpoint, options);
        // .do(res => console.log(res));
    }

    patch(endpoint: string, body: any) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.put(this.url + '/' + endpoint, body, options);
        // .do(res => console.log(res));
    }
}
