import { Component, OnInit } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';
import { iRole } from 'src/entities/app/role.model';
import {iPermission} from 'src/entities/app/permissions.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public menu: Array<iPermission> = [];
  public homeItems: Array<iPermission> = [];
  public rol;
  constructor(
    private cookiesServ: CookiesService,
  ) {
    this.menu = this.cookiesServ.getMenu();
    this.rol = this.cookiesServ.getData().user.rol;
  }

  ngOnInit() {
    this.menu.forEach(permission => {            
      if (permission.items) {
        this.homeItems = this.homeItems.concat(permission.items);
      }
    });
  }
}
