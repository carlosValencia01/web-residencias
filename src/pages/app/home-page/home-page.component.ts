import { Component, OnInit } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';
import { iRole } from 'src/entities/app/role.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public rol: iRole;

  constructor(
    private cookiesServ: CookiesService,
  ) {
    this.rol = this.cookiesServ.getData().user.rol;
  }

  ngOnInit() {
  }
}
