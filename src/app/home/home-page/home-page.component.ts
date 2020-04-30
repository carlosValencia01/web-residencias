import { Component, OnInit } from '@angular/core';

import { CookiesService } from 'src/app/services/app/cookie.service';
import { iRole } from 'src/app/entities/app/role.model';
import { iPermission } from 'src/app/entities/app/permissions.model';
import { RoleService } from 'src/app/services/shared/role.service';

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
    let _currentCategory = '';
    let _categoryItems = [];
    if (menu && menu.length) {
      menu.forEach(permission => {
        if (_currentCategory.toLowerCase() !== (permission.category || '').toLowerCase() && _categoryItems && _categoryItems.length) {
          homeItems = _categoryItems.length > 1 ? homeItems.concat(_categoryItems) : homeItems;
          _categoryItems = [];
        }
        _currentCategory = permission.category || '';
        if (permission.label.toLowerCase() !== 'perfil' && permission.label.toLowerCase() !== 'inicio') {
          _categoryItems.push(permission);
        }
      });
      if (_categoryItems && _categoryItems.length) {
        homeItems = _categoryItems.length > 1 ? homeItems.concat(_categoryItems) : homeItems;
      }
    }
    return homeItems;
  }

}
