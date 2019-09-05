import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CookiesService } from '../services/cookie.service';
import { UserProvider } from '../providers/user.prov';
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
  mode = 'push';
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
    private cookieServ: CookiesService,
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
    this.smallScreen = window.innerWidth < 1300 ? true : false;
    this.closeOnClickOutside = this.smallScreen ? true : false;
    this.opened = this.smallScreen ? false : true;
    this.sizeBoolean = this.smallScreen ? true : false;
    this.mode = this.smallScreen ? 'over' : 'push';
  }

  onMenu() {
    this.sideNav.toggle();
    // if (this.opened) {
    //   this.opened = false;
    //   this.sizeBoolean = true;
    // } else {
    //   this.opened = true;
    //   if (!this.smallScreen) {
    //     this.sizeBoolean = false;
    //   }
    // }
  }

  closeMenu() {
    // console.log('Cerrare el menu si esta en small');
    if (this.smallScreen) {
      this.opened = false;
    }
  }

  checkLogin() {
    if (this.cookiesServ.checkCookie('session')) {
      this.activeSession = true;
      // console.log('Aqui mandare el token');
      this.userProv.sendTokenFromAPI(this.cookiesServ.getData().token);
    } else {
      this.activeSession = false;
      // console.log('No hay sesión iniciada');
    }
  }

  changeStatus() {
    // console.log('Significa que cambiare el status');
    this.activeSession = !this.activeSession;
  }

}
