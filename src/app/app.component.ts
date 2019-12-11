import { Component, HostListener, ViewChild } from '@angular/core';
import { CookiesService } from '../services/app/cookie.service';
import { UserProvider } from '../providers/app/user.prov';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('sidenav') sideNav: MatSidenav;
  activeSession: boolean;
  opened = true;
  mode = 'side';
  smallScreen: boolean;
  sizeBoolean: boolean;
  closeOnClickOutside: boolean;
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
  ) {
    this.checkLogin();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.configureSideNav();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.configureSideNav();
  }

  configureSideNav() {
    this.smallScreen = window.innerWidth < 1300;
    this.closeOnClickOutside = this.smallScreen;
    this.opened = !this.smallScreen;
    this.sizeBoolean = this.smallScreen;
    this.mode = this.smallScreen ? 'over' : 'side';
  }

  onMenu() {
    this.sideNav.toggle();
  }

  closeMenu() {
    if (this.smallScreen) {
      this.opened = false;
    }
  }

  checkLogin() {
    const fullurl = window.location.href;
    if (this.cookiesServ.checkCookie('session')) {
      this.activeSession = true;
      this.userProv.sendTokenFromAPI(this.cookiesServ.getData().token);
    } else if (fullurl.indexOf('survey') !== -1) { // para saber si se esta ingresando por la encuesta
      this.activeSession = true;
    } else {
      this.activeSession = false;
    }
  }

  changeStatus() {
    this.activeSession = !this.activeSession;
  }
}
