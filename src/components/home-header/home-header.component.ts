import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {

  student = false;
  constructor(
    private cookiesServ: CookiesService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.router.url); //  /routename
    this.student = this.cookiesServ.getData().user.role===2;
  }

  logOut() {
    this.cookiesServ.deleteCookie();
    window.location.replace('/');
  }

}
