import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { eSessionStatus } from 'src/enumerators/app/sessionStatus.enum';
import { IPosition } from 'src/entities/shared/position.model';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { UserProvider } from 'src/providers/app/user.prov';

@Component({
  selector: 'app-lock-session',
  templateUrl: './lock-session.component.html',
  styleUrls: ['./lock-session.component.scss']
})
export class LockSessionComponent implements OnInit {
  @Output('session') session = new EventEmitter();
  public passworForm = new FormControl();
  public user: any;
  public position: IPosition;
  public profileIcon: string;
  public showLoading: boolean;

  constructor(
    private cookiesServ: CookiesService,
    private notificationServ: NotificationsServices,
    private userProv: UserProvider,
  ) {
    this.passworForm = new FormControl(null, Validators.required);
  }

  ngOnInit() {
    this.user = this.cookiesServ.getData().user;
    this.position = this.cookiesServ.getPosition();
    this.profileIcon = this.cookiesServ.getProfileIcon() || 'assets/icons/profile.svg';
  }

  public login() {
    if (this.passworForm.valid) {
      this.showLoading = true;
      this.userProv.login({
        email: this.user.email,
        password: this.passworForm.value
      }).subscribe((res) => {
        this.userProv.sendTokenFromAPI(res.token);
        this.cookiesServ.saveUserToken(res.token);
        this.showLoading = false;
        this.session.emit(eSessionStatus.ACTIVE);
      }, (_) => {
        this.showLoading = false;
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Mi tec', 'Error al ingresar, inténtelo de nuevo');
      });
    } else {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'Mi tec', 'La contraseña es obligatoria');
    }
  }

  public logOut() {
    this.cookiesServ.deleteStorageData();
    window.location.replace('/');
  }

}
