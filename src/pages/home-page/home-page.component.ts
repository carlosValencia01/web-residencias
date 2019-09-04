import { Component, OnInit } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public role: string;
  private status: string;

  constructor(
    private cookiesServ: CookiesService,
  ) {
    this.status = this.cookiesServ.getData().user.status;
  }

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
        this.role = this.status === 'egresado' ? 'graduate' : 'student';
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

}
