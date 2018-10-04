import { Component, HostListener } from '@angular/core';
import { CookiesService } from '../services/cookie.service';
import { UserProvider } from '../providers/user.prov';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  activeSession: boolean;

  optionsNotifications = {
    position: ['top', 'right'],
    timeOut: 4000,
    showProgressBar: false,
    pauseOnHover: false,
    clickToClose: true,
    maxLength: 10
  };

  constructor(
    private cookiesServ: CookiesService,
    private userProv: UserProvider,
    private cookieServ: CookiesService,
  ) {
    this.checkLogin();
  }

  checkLogin() {
    if (this.cookiesServ.checkCookie('session')) {
      this.activeSession = true;
      console.log('Aqui mandare el token');
      this.userProv.sendTokenFromAPI(this.cookiesServ.getData().token);
    } else {
      this.activeSession = false;
      console.log('No hay sesión iniciada');
    }
  }

  changeStatus() {
    // console.log('Significa que cambiare el status');
    this.activeSession = !this.activeSession;
  }

}
