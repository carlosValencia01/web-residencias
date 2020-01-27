import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { CookiesService } from 'src/services/app/cookie.service';

@Injectable()
export class Api {
    // url = 'http://localhost:3003/escolares/credenciales';
    url = 'https://api.cideti.com.mx/escolares/credenciales';
    // url = 'https://rijimenezesdev.me/escolares/credenciales';
    urlE = 'http://localhost:3000/escolares/credenciales';

    headers: Headers = new Headers();
    headersE: Headers = new Headers();

    constructor(
        private http: Http,
        private cookiesServ: CookiesService,
    ) {
        this.headers.append('Content-Type', 'application/json');
        this.headersE.append('Content-Type', 'application/json');
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

    getE(endpoint: string, params?: any) {
      const options = new RequestOptions({ headers: this.headersE });

      if (params) {
        const p = new URLSearchParams();
        // tslint:disable-next-line:forin
        for (const k in params) {
          p.set(k, params[k]);
        }
        options.search = !options.search && p || options.search;
      }
      return this.http.get(this.urlE + '/' + endpoint, options);
    }

    post(endpoint: string, body: any, isUpload = false) {
        // console.log('api:post');
        // console.log("vbody", body);
        const options = new RequestOptions({ headers: this.headers });
        if (!isUpload) {
            return this.http.post(this.url + '/' + endpoint, body, options);
        } else {
            return this.http.post(this.url + '/' + endpoint, body);
        }
        // .do(res => console.log(res));
    }

    postE(endpoint: string, body: any, isUpload = false) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.post(this.urlE + '/' + endpoint, body, options);
    }

    put(endpoint: string, body: any, isUpload = false) {
        const options = new RequestOptions({ headers: this.headers });
        if (!isUpload) {
            return this.http.put(this.url + '/' + endpoint, body, options);
        } else {
            return this.http.put(this.url + '/' + endpoint, body);
        }
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
