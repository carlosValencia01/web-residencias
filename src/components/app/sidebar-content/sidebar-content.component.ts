import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';
import { iRole } from 'src/entities/app/role.model';
import { iPermission } from 'src/entities/app/permissions.model';

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
  DEFAULT_PROFILE_IMG = 'assets/icons/man.svg';
  private status: string;
  survey: boolean; //comprobar si la url es para la encuesta
  // tslint:disable-next-line:no-output-rename
  @Output('closeMenu') menuClicked = new EventEmitter();
  menu: Array<iPermission>;

  constructor(
    private cookiesServ: CookiesService,
  ) {
    const fulturi = window.location.href;
    this.survey = fulturi.indexOf('survey') !== -1;
    if (!this.survey) {
      this.data = this.cookiesServ.getData().user;
      // console.log(this.data);
      this.status = this.data.status;
    }
  }

  ngOnInit() {
    if (!this.survey) {
      const rol: iRole = this.data.rol;
      if (typeof (rol) !== 'undefined') {
        this.menu = rol.permissions;
        // console.log('Menu', this.menu);
      }
      this.title = rol.name;
    }
  }

  closeMenu(buttonName?: string) {
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

  isUndefined(valor) {
    return typeof (valor) === 'undefined' || valor.length === 0;
  }

  otro() {
    console.log('dadwa');
  }
}
