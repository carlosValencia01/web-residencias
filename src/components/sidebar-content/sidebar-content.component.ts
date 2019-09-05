import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CookiesService } from '../../services/cookie.service';
import { iRole } from 'src/entities/role.model';
import { iPermission } from 'src/entities/permissions.model';
@Component({
  selector: 'app-sidebar-content',
  templateUrl: './sidebar-content.component.html',
  styleUrls: ['./sidebar-content.component.scss']
})
export class SidebarContentComponent implements OnInit {

  data: any;
  title = '';
  showCredentialsItems = false;
  public role: string;
  DEFAULT_PROFILE_IMG = 'assets/icons/man.svg';
  // tslint:disable-next-line:no-output-rename
  @Output('closeMenu') menuClicked = new EventEmitter();
  menu:Array<iPermission>;
  constructor(
    private cookiesServ: CookiesService,
  ) {
    this.data = this.cookiesServ.getData().user;
  }

  ngOnInit() {
    // switch (this.cookiesServ.getData().user.role) {
    //   case 0:
    //     this.role = 'administration';
    //     this.title = 'Administrador';
    //     break;
    //   case 1:
    //     this.role = 'secretary';
    //     this.title = 'Secretario(a)';
    //     break;
    //   case 2:
    //     this.role = 'student';
    //     this.title = 'Estudiante';
    //     break;
    //   case 3:
    //     this.role = 'employee';
    //     this.title = 'Trabajador';
    //     break;
    //   case 4:
    //     this.role = 'rechumanos';
    //     this.title = 'Recursos Humanos';
    //     break;
    // }
    let rol: iRole = this.data.rol;
    if (typeof (rol) !== 'undefined') {      
      this.menu = rol.permissions;
      console.log("Menu", this.menu);
    }
    this.title = rol.name;
  }

  closeMenu(buttonName?: string) {
    switch (buttonName) {
      case 'Credenciales':
        this.showCredentialsItems = !this.showCredentialsItems;
        break;

      default:
        this.menuClicked.emit();
        this.showCredentialsItems = false;
        break;
    }
  }

  isUndefined(valor) {    
    return typeof (valor) === 'undefined' || valor.length===0;
  }

  otro(){
    console.log("dadwa");
  }
}
