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

    isAllowed(url: string): boolean {        
        let array = this.getData().user.rol.permissions;
        for (let i = 0; i < array.length; i++) {
            let isCorrect = false;            
            if (typeof (array[i].items) !== 'undefined' && array[i].items.length > 0) {
                isCorrect = array[i].items.findIndex(x => { return x.routerLink === url; }) !== -1;
            }
            else {                
                isCorrect = array[i].routerLink === url;
            }             
            if (isCorrect) {
                return true;
            }
        }
        return false;
    }
}
