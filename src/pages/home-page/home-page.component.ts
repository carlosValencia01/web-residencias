import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public role: string;

  constructor(
    private cookiesServ: CookiesService,
  ) { }

  ngOnInit() {
    // console.log(this.cookiesServ.getData().user.role);
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
    }
  }

}
