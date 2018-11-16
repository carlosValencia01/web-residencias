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

    switch (this.cookiesServ.getData().user.role) {
      case 1:
        this.role = "secretary";
        break;
      case 2:
        this.role = "student";
        break;
      case 3:
        this.role = "secretary";
        break;
    }
  }

  logOut() {
    this.cookiesServ.deleteCookie();
    window.location.replace('/');
  }

}
