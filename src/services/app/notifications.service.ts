import { NotificationsService } from 'angular2-notifications';
import { Injectable } from '@angular/core';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';


@Injectable()
export class NotificationsServices {
  constructor(
    private _notificationsService: NotificationsService,
  ) { }

  showNotification(type: eNotificationType, tittle: string, subtittle: string) {
    switch (type) {
      case eNotificationType.SUCCESS: {
        this._notificationsService.success(
          tittle,
          subtittle, {
            maxLength: 0,
            showProgressBar: true,
            pauseOnHover: true,
          }
        );
        break;
      }
      case eNotificationType.ERROR: {
        this._notificationsService.error(
          tittle,
          subtittle, {
            maxLength: 0,
            showProgressBar: true,
            pauseOnHover: true,
          }
        );
        break;
      }
      case eNotificationType.INFORMATION: {
        this._notificationsService.info(
          tittle,
          subtittle, {
            maxLength: 0,
            showProgressBar: true,
            pauseOnHover: true,
          }
        );
      }
    }
  }
}
