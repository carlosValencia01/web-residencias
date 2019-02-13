import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {

  public role: string;

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
    }
  }

  logOut() {
    this.cookiesServ.deleteCookie();
    window.location.replace('/');
  }

}
