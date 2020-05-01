import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class Storage {

    constructor(
        private cookieService: CookieService,
    ) { }

    // Cookies
    public saveCookieData(name: string, value: string, expireTime?, secure = false): boolean {
        if (!name || !value) {
            return false;
        }
        try {
            if (this.cookieService.check(name)) {
                this.cookieService.delete(name);
            }
            this.cookieService.set(name, value, expireTime, undefined, undefined, secure);
            return true;
        } catch (_) {
            return false;
        }
    }

    public getCookieData(name: string): string {
        if (!name) {
            return null;
        }
        try {
            return this.cookieService.get(name);
        } catch (_) {
            return null;
        }
    }

    public deleteCookieData(name: string): boolean {
        if (!name || !this.cookieService.check(name)) {
            return false;
        }
        try {
            this.cookieService.delete(name);
            return true;
        } catch (_) {
            return false;
        }
    }

    public deleteAllCookieData(): boolean {
        try {
            this.cookieService.deleteAll();
            return true;
        } catch (_) {
            return false;
        }
    }

    // Local storage
    public saveLocalData(name: string, value: string): boolean {
        if (!name || !value) {
            return false;
        }
        try {
            localStorage.setItem(name, value);
            return true;
        } catch (_) {
            return false;
        }
    }

    public getLocalData(name: string): string {
        if (!name) {
            return null;
        }
        try {
            return localStorage.getItem(name);
        } catch (_) {
            return null;
        }
    }

    public deleteLocalData(name: string): boolean {
        if (!name || !this.getLocalData(name)) {
            return false;
        }
        try {
            localStorage.removeItem(name);
            return true;
        } catch (_) {
            return false;
        }
    }

    public deleteAllLocalData(): boolean {
        try {
            localStorage.clear();
            return true;
        } catch (_) {
            return false;
        }
    }

    // Session storage
    public saveSessionData(name: string, value: string): boolean {
        if (!name || !value) {
            return false;
        }
        try {
            sessionStorage.setItem(name, value);
            return true;
        } catch (_) {
            return false;
        }
    }

    public getSessionData(name: string): string {
        if (!name) {
            return null;
        }
        try {
            return sessionStorage.getItem(name);
        } catch (_) {
            return null;
        }
    }

    public deleteSessionData(name: string): boolean {
        if (!name || !this.getSessionData(name)) {
            return false;
        }
        try {
            sessionStorage.removeItem(name);
            return true;
        } catch (_) {
            return false;
        }
    }

    public deleteAllSessionData(): boolean {
        try {
            sessionStorage.clear();
            return true;
        } catch (_) {
            return false;
        }
    }
}
