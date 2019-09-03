import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {

  public role: string;
  // tslint:disable-next-line:no-output-rename
  @Output('onMenu') menuClicked = new EventEmitter();
  // tslint:disable-next-line:no-input-rename
  @Input('size') size;

  constructor(
    private cookiesServ: CookiesService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.router.url); //  /routename

    console.log(this.cookiesServ.getData().user.role);

    switch (this.cookiesServ.getData().user.role) {
      case 0:
        this.role = 'administration';
        break;
      case 1:
        this.role = 'secretary';
        break;
      case 2:
        this.role = 'student';
        break;
      case 3:
        this.role = 'employee';
        break;
      case 4:
        this.role = 'rechumanos';
        break;
      case 5:
        this.role = 'comunication';
        break;
      case 6:
        this.role = 'coordinator';
        break;
      case 7:
        this.role = 'degreeCoordinator';
        break;
      case 8:
        this.role = 'chiefAcademic';
        break;
    }
  }

  logOut() {
    this.cookiesServ.deleteCookie();
    window.location.replace('/');
  }

  onMenu() {
    this.menuClicked.emit();
  }

}
