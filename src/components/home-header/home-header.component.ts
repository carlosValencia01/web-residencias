import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {

  constructor(
    private cookiesServ: CookiesService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.router.url); //  /routename
  }

  logOut() {
    this.cookiesServ.deleteCookie();
    window.location.replace('/');
  }

}
