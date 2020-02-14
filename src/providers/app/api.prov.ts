import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { CookiesService } from 'src/services/app/cookie.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class Api {
    url = environment.apiURL;
    urlE = environment.eSignatureURL;

    headers: Headers = new Headers();
    FileHeaders: Headers = new Headers();
    constructor(
        private http: Http,
        private cookiesServ: CookiesService,
    ) {
        this.headers.append('Content-Type', 'application/json');
    }

    getURL() {
        return this.url;
    }

    setToken(token) {
        this.headers.delete('Authorization');
        this.headers.append('Authorization', `Bearer ${token}`);
        this.FileHeaders.delete('Authorization');
        this.FileHeaders.append('Authorization', `Bearer ${token}`);
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
    }

    getFile(endpoint: string) {
        let options: RequestOptions = new RequestOptions({ headers: this.FileHeaders });
        // options.headers.append('responseType', 'blob');
        options.responseType = 3;
        console.log("options", options);
        return this.http.get(this.url + '/' + endpoint, options);
    }
    getE(endpoint: string, params?: any) {
        const options = new RequestOptions({ headers: this.headers });

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
        const options = new RequestOptions({ headers: this.headers });
        if (!isUpload) {
            return this.http.post(this.url + '/' + endpoint, body, options);
        } else {
            const options = new RequestOptions({ headers: this.FileHeaders });
            return this.http.post(this.url + '/' + endpoint, body, options);
        }
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
            const options = new RequestOptions({ headers: this.FileHeaders });
            return this.http.put(this.url + '/' + endpoint, body, options);
        }
    }

    putE(endpoint: string, body: any) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.put(this.urlE + '/' + endpoint, body, options);
    }

    delete(endpoint: string) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.delete(this.url + '/' + endpoint, options);
    }

    deleteE(endpoint: string) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.delete(this.urlE + '/' + endpoint, options);
    }

    patch(endpoint: string, body: any) {
        const options = new RequestOptions({ headers: this.headers });
        return this.http.put(this.url + '/' + endpoint, body, options);
    }
}
