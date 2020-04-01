import { Injectable } from '@angular/core';
import { IPosition } from 'src/entities/shared/position.model';
import { Storage } from 'src/services/app/storage.service';
import { environment } from 'src/environments/environment';


@Injectable()
export class CookiesService {

    constructor(
        private storage: Storage,
    ) {

    }

    saveData(data) {
        const menu = data.user.rol.permissions.map(
            (per) => ({
                label: per.label,
                items: per.items.length > 0 ? per.items : undefined,
                icon: per.icon,
                routerLink: per.routerLink
            })
        );
        data.user.rol.permissions = undefined;
        data.action = undefined;

        this.storage.saveLocalData('menu', JSON.stringify(menu));
        this.storage.saveCookieData('_mt_user_jwt', data.token, 1 / 24, environment.production);
        this.storage.saveLocalData('user', JSON.stringify(data.user));
    }

    getData() {
        try {
            const user = JSON.parse(this.storage.getLocalData('user').trim());
            const token = this.storage.getCookieData('_mt_user_jwt');
            return {
                user: user,
                token: token
            };
        } catch (_) {
            return null;
        }
    }

    getMenu() {
        try {
            return JSON.parse(this.storage.getLocalData('menu').trim());
        } catch (_) {
            return null;
        }
    }

    saveFolder(folder) {
        this.storage.saveLocalData('folder', folder);
    }

    getFolder() {
        return this.storage.getLocalData('folder');
    }

    savePosition(position: IPosition) {
        this.storage.saveLocalData('position', JSON.stringify(position));
    }

    getPosition(): IPosition {
        return JSON.parse(this.storage.getLocalData('position'));
    }

    saveBosses(bosses: any) {
        this.storage.saveLocalData('bosses', JSON.stringify(bosses));
    }

    getBosses(): any {
        return JSON.parse(this.storage.getLocalData('bosses'));
    }

    saveUser(user: any): boolean {
        if (!user) {
            return false;
        }
        try {
            this.storage.saveLocalData('user', JSON.stringify(user));
            return true;
        } catch (_) {
            return false;
        }
    }

    deleteStorageData() {
        this.storage.deleteAllCookieData();
        this.storage.deleteAllLocalData();
        this.storage.deleteAllSessionData();
    }

    checkStorageData(name: string): boolean {
        if (!name) {
            return false;
        }
        if (this.storage.getCookieData(name)) {
            return true;
        }
        if (this.storage.getLocalData(name)) {
            return true;
        }
        if (this.storage.getSessionData(name)) {
            return true;
        }
        return false;
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
