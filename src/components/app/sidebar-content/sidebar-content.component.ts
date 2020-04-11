import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { CookiesService } from 'src/services/app/cookie.service';
import { iPermission } from 'src/entities/app/permissions.model';
import { iRole } from 'src/entities/app/role.model';
import { RoleService } from 'src/services/shared/role.service';

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

  constructor(
    private cookiesServ: CookiesService,
    private roleServ: RoleService,
    private router: Router,
  ) {
    this.DEFAULT_PROFILE_IMG =  this.cookiesServ.getProfileIcon() || this.DEFAULT_PROFILE_IMG;
    const fulturi = window.location.href;
    this.survey = fulturi.indexOf('survey') !== -1;
    if (!this.survey) {
      this.data = this.cookiesServ.getData().user;
      this.status = this.data.status;
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
          this.menu = (role && role.permissions) ? this._filterMenu(role.permissions) : [];
          this.title = (role && role.name) || '';
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
    this.router.navigate(['/profileSettings']);
    this.menuClicked.emit();
  }

  private _filterMenu(menu: iPermission[]): iPermission[] {
    const _menu = [];
    menu.forEach((permission) => {
      if (permission.label !== 'Perfil') {
        _menu.push(permission);
      }
    });
    return _menu;
  }
}
