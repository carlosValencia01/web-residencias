import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { CookiesService } from 'src/app/services/app/cookie.service';
import { iPermission } from 'src/app/entities/app/permissions.model';
import { iRole } from 'src/app/entities/app/role.model';
import { RoleService } from 'src/app/services/shared/role.service';

@Component({
  selector: 'app-sidebar-content',
  templateUrl: './sidebar-content.component.html',
  styleUrls: ['./sidebar-content.component.scss']
})
export class SidebarContentComponent implements OnInit {
  data: any;
  title = '';
  showCredentialsItems = false;
  showGraduationItems = false;
  public role: string;
  public DEFAULT_PROFILE_IMG = 'assets/icons/profile.svg';
  private status: string;
  survey: boolean; // comprobar si la url es para la encuesta
  // tslint:disable-next-line:no-output-rename
  @Output('closeMenu') menuClicked = new EventEmitter();
  public menu: iPermission[];
  public canAccessProfile = false;

  constructor(
    private cookiesServ: CookiesService,
    private roleServ: RoleService,
    private router: Router,
  ) {
    this.DEFAULT_PROFILE_IMG = this.cookiesServ.getProfileIcon() || this.DEFAULT_PROFILE_IMG;
    const fulturi = window.location.href;
    this.survey = fulturi.indexOf('survey') !== -1;
    if (!this.survey) {
      this.data = this.cookiesServ.getData().user;
      this.status = this.data.status;
      this.canAccessProfile = this.cookiesServ.isAllowed('profile');
    }
  }

  ngOnInit() {
    if (!this.survey) {
      const rol: iRole = this.data.rol;
      if (typeof (rol) !== 'undefined') {
        this.menu = this._filterMenu(this.cookiesServ.getMenu());
      }
      this.title = rol.name;
      this.roleServ.changeRole
        .subscribe((role: iRole) => {
          this.menu = (role && role.permissions) ? this._filterMenu(<iPermission[]>role.permissions) : [];
          this.title = (role && role.name) || '';
          this.canAccessProfile = (<iPermission[]>role.permissions).map((item) => item.routerLink).includes('user/profile');
        });
    }
  }

  public closeMenu(buttonName?: string) {
    switch (buttonName) {
      case 'Credenciales':
        this.showCredentialsItems = !this.showCredentialsItems;
        break;
      case 'Graduacion':
        this.showGraduationItems = !this.showGraduationItems;
        break;
      default:
        this.menuClicked.emit();
        this.showCredentialsItems = false;
        this.showGraduationItems = false;
        break;
    }
  }

  public goProfile() {
    if (this.canAccessProfile) {
      this.router.navigate(['/user/profile']);
      this.menuClicked.emit();
    }
  }

  private _filterMenu(menu: iPermission[]): iPermission[] {
    const _menu = [];
    let _currentCategory = '';
    let _categoryItems = [];
    menu.forEach((permission: iPermission) => {
      if (_currentCategory.toLowerCase() !== (permission.category || '').toLowerCase() && _categoryItems && _categoryItems.length) {
        _menu.push(_categoryItems.length > 1 ? this._createCategory(_currentCategory, _categoryItems) : _categoryItems[0]);
        _categoryItems = [];
      }
      _currentCategory = permission.category || '';
      if (permission.label.toLowerCase() !== 'perfil') {
        if (permission.label.toLowerCase() === 'inicio') {
          _menu.unshift(permission);
        } else {
          _categoryItems.push(permission);
        }
      }
    });
    if (_categoryItems && _categoryItems.length) {
      _menu.push(_categoryItems.length > 1 ? this._createCategory(_currentCategory, _categoryItems) : _categoryItems[0]);
    }
    return _menu;
  }

  private _createCategory(categoryName: string, categoryItems: iPermission[]) {
    return {
      label: categoryName,
      icon: 'keyboard_arrow_down',
      items: categoryItems
    };
  }

}
