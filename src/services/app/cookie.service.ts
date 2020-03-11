import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { IPosition } from 'src/entities/shared/position.model';


@Injectable()
export class CookiesService {

    constructor(
        private cookieService: CookieService,
    ) {

    }

    saveData(data) {
        // console.log(data,'=============');
        // console.log(data,'===d===');
        const menu = data.user.rol.permissions.map(
            (per)=> ({
                label:per.label,
                items: per.items.length > 0 ? per.items : undefined,
                icon: per.icon,                
                routerLink: per.routerLink
            })
        );
        data.user.rol.permissions = undefined;
        data.action = undefined;                             
        // expiration: number of days for cookie actie. 0.04166667 aprox 1 hour; 0.5 => 12 hrs
        // 0.5 / 12 = 0.04166667 aprox 1 hour
        this.cookieService.set('session', JSON.stringify(data), 0.04166667);
        this.cookieService.set('menu', JSON.stringify(menu), 0.04166667);
    }    

    getData() {
        
        try {
            return JSON.parse(this.cookieService.get('session').trim());
        } catch (e) {
            console.log(e);
            this.deleteCookie();
            return false;    
        }
    }
    getMenu(){
        try {
            return JSON.parse(this.cookieService.get('menu').trim());
        } catch (e) {
            console.log(e);
            this.deleteCookie();
            return false;    
        }
    }

    saveFolder(folder) {
        this.cookieService.set('folder', folder, 1);        
    }

    getFolder() {
        return this.cookieService.get('folder');
    }

    savePosition(position: IPosition) {
        this.cookieService.set('position', JSON.stringify(position), 0.04166667);
    }

    getPosition(): IPosition {
        return JSON.parse(this.cookieService.get('position'));
    }

    saveBosses(bosses: any) {        
        this.cookieService.set('bosses', JSON.stringify(bosses), 0.04166667);
    }

    getBosses(): any {
        return JSON.parse(this.cookieService.get('bosses'));
    }

    deleteCookie() {
        this.cookieService.delete('session');
        this.cookieService.delete('bosses');
        this.cookieService.delete('position');
        this.cookieService.delete('folder');
        this.cookieService.delete('menu');
    }

    checkCookie(name: string): boolean {
        return this.cookieService.check(name);
    }

    isAllowed(url: string): boolean {
        const array = this.getMenu();
        for (let i = 0; i < array.length; i++) {
            let isCorrect = false;
            if (typeof (array[i].items) !== 'undefined' && array[i].items.length > 0) {
                isCorrect = array[i].items.findIndex(x => x.routerLink === url) !== -1;
            } else {
                isCorrect = array[i].routerLink === url;
            }
            if (isCorrect) {
                return true;
            }
        }
        return false;
    }
}
