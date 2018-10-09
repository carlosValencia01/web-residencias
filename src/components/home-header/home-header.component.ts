import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {

  constructor(
    private cookiesServ: CookiesService,
  ) { }

  ngOnInit() {
  }

  logOut() {
    this.cookiesServ.deleteCookie();
    window.location.replace('/');
  }

}
