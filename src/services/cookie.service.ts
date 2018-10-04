import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';


@Injectable()
export class CookiesService {

    constructor(
        private cookieService: CookieService,
    ) {

    }

    saveData(data) {
        this.cookieService.set( 'session', JSON.stringify(data) );
    }

    getData() {
        return JSON.parse( this.cookieService.get('session') );
    }

    deleteCookie() {
        this.cookieService.delete('session');
    }

    checkCookie(name: string): boolean {
        return this.cookieService.check(name);
    }
}
