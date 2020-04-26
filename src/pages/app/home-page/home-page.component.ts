import { Component, OnInit } from '@angular/core';

import { CookiesService } from 'src/services/app/cookie.service';
import { iRole } from 'src/entities/app/role.model';
import { iPermission } from 'src/entities/app/permissions.model';
import { RoleService } from 'src/services/shared/role.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public menu: iPermission[] = [];
  public homeItems: iPermission[] = [];
  public rol;

  constructor(
    private cookiesServ: CookiesService,
    private roleServ: RoleService,
  ) {
    this.menu = this.cookiesServ.getMenu();
    this.rol = this.cookiesServ.getData().user.rol;
  }

  ngOnInit() {
    this.homeItems = this._generateHomeItems(this.menu);
    this.roleServ.changeRole
      .subscribe((role: iRole) => {
        this.homeItems = (role && role.permissions) ? this._generateHomeItems(<iPermission[]>role.permissions) : [];
      });
  }

  private _generateHomeItems(menu: iPermission[]): iPermission[] {
    let homeItems = [];
    if (menu && menu.length) {
      menu.forEach(permission => {
        if (permission.items) {
          homeItems = homeItems.concat(permission.items);
        }
      });
    }
    return homeItems;
  }
}
