import { NotificationsService } from 'angular2-notifications';
import { Injectable } from '@angular/core';


@Injectable()
export class NotificationsServices {
    constructor(
        private _notificationsService: NotificationsService,
    ) {}

    showNotification(type: number, tittle: string, subtittle: string) {
        if (type === 1) {
          this._notificationsService.success(
            tittle,
            subtittle , {
              maxLength: 0
            }
          );
        }
        if (type === 2) {
          this._notificationsService.error(
            tittle,
            subtittle , {
              maxLength: 0
            }
          );
        }
        if (type === 3) {
          this._notificationsService.info(
            tittle,
            subtittle , {
              maxLength: 0
            }
          );
        }
      }
}
