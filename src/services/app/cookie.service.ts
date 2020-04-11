import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { IPosition } from 'src/entities/shared/position.model';
import { Storage } from 'src/services/app/storage.service';


@Injectable()
export class CookiesService {

    constructor(
        private storage: Storage,
    ) {

    }

    public saveData(data) {
        let menu = [];
        if (data.user.rol) {
            menu = data.user.rol.permissions.map(
                (per) => ({
                    label: per.label,
                    items: per.items.length > 0 ? per.items : undefined,
                    icon: per.icon,
                    routerLink: per.routerLink
                })
            );
            data.user.rol.permissions = undefined;
        }
        if (data.hasOwnProperty('gender')) {
            this.saveGender(data.gender);
        }
        if (data.hasOwnProperty('profileIcon')) {
            this.saveProfileIcon(data.profileIcon);
        }
        data.action = undefined;

        this.storage.saveLocalData('menu', JSON.stringify(menu));
        this.storage.saveCookieData('_mt_user_jwt', data.token, 1 / 24, environment.production);
        this.storage.saveLocalData('user', JSON.stringify(data.user));
    }

    public getData() {
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

    public getMenu() {
        try {
            return JSON.parse(this.storage.getLocalData('menu').trim());
        } catch (_) {
            return null;
        }
    }

    public saveFolder(folder) {
        this.storage.saveLocalData('folder', folder);
    }

    public getFolder() {
        return this.storage.getLocalData('folder');
    }

    public savePosition(position: IPosition) {
        position.role = undefined;
        this.storage.saveLocalData('position', JSON.stringify(position));
    }

    public getPosition(): IPosition {
        return JSON.parse(this.storage.getLocalData('position'));
    }

    public saveBosses(bosses: any) {
        this.storage.saveLocalData('bosses', JSON.stringify(bosses));
    }

    public getBosses(): any {
        return JSON.parse(this.storage.getLocalData('bosses'));
    }

    public saveUser(user: any): boolean {
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

    public saveEmployeePositions(positions: IPosition[]): boolean {
        if (!positions || !positions.length) {
            return false;
        }
        try {
            const _positions = positions.map(_pos => {
                _pos.role = undefined;
                return _pos;
            });
            this.storage.saveLocalData('active_positions', JSON.stringify(_positions));
            return true;
        } catch (_) {
            return false;
        }
    }

    public getEmployeePositions(): IPosition[] {
        try {
            const _positions = JSON.parse(this.storage.getLocalData('active_positions'));
            return _positions;
        } catch (_) {
            return null;
        }
    }

    public checkStorageData(name: string): boolean {
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

    public isAllowed(url: string): boolean {
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

    public deleteStorageData() {
        this.storage.deleteAllCookieData();
        this.storage.deleteAllLocalData();
        this.storage.deleteAllSessionData();
    }

    public deleteSessionData() {
        this.storage.deleteCookieData('_mt_user_jwt');
    }

    public saveSessionStatus(status: string): boolean {
        return this.storage.saveLocalData('status', status);
    }

    public getSessionStatus(): string {
        return this.storage.getLocalData('status');
    }

    public saveGender(gender: string): boolean {
        return this.storage.saveLocalData('gender', gender);
    }

    public getGender(): string {
        return this.storage.getLocalData('gender');
    }

    public saveProfileIcon(iconPath: string): boolean {
        return this.storage.saveLocalData('profile_icon', iconPath);
    }

    public getProfileIcon(): string {
        return this.storage.getLocalData('profile_icon');
    }

    public saveUserToken(userToken: string): boolean {
        return this.storage.saveCookieData('_mt_user_jwt', userToken, 1 / 24, environment.production);
    }
}
