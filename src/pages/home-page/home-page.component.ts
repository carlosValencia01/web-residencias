import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  student = false;

  constructor(
    private cookiesServ: CookiesService,
  ) { }

  ngOnInit() {
    console.log(this.cookiesServ.getData().user.role);
    this.student = this.cookiesServ.getData().user.role===2;
  }

}
