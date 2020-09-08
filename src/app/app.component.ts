import { Component, HostListener, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { eSessionStatus } from 'src/app/enumerators/app/sessionStatus.enum';
import { UserProvider } from 'src/app/providers/app/user.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { WebSocketService } from './services/app/web-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('sidenav') sideNav: MatSidenav;
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
  public sessionStatus: string;
  public loading = false;

  constructor(
    private cookiesServ: CookiesService,
    private userProv: UserProvider,
    private loadingService: LoadingService,
    private webSocketService: WebSocketService
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
    this.loadingService.isLoading.subscribe((status) => this.loading = status);

    //guardar el clientId para socket.id
    this.webSocketService.listen('app:connection').subscribe(
        data=>this.cookiesServ.saveClientId(data.connectionId)    
    );
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
    const _session = this.cookiesServ.getData();
    const _status = this.cookiesServ.getSessionStatus();
    if (_session && _session.user && _session.token && _status === eSessionStatus.ACTIVE) {
      this._setSessionStatus(eSessionStatus.ACTIVE);
      this.userProv.sendTokenFromAPI(_session.token);
    } else if (fullurl.indexOf('survey') !== -1 || fullurl.indexOf('welcome-students') !== -1) { // para saber si se esta ingresando por la encuesta
      this._setSessionStatus(eSessionStatus.ACTIVE);
    } else {
      const _allStatus = Object.values(eSessionStatus);
      let _sessionStatus;
      if (!_session || (_session && !_session.user)) {
        _sessionStatus = eSessionStatus.INACTIVE;
      } else {
        _sessionStatus = (_status && _status !== eSessionStatus.ACTIVE && _allStatus.includes(<eSessionStatus>_status))
          ? _status : eSessionStatus.INACTIVE;
      }
      this._setSessionStatus(_sessionStatus);
    }
  }

  public changeSessionStatus(status: string) {
    this._setSessionStatus(status);
  }

  private _setSessionStatus(status: string) {
    this.cookiesServ.saveSessionStatus(status);
    this.sessionStatus = status;
  }
}
