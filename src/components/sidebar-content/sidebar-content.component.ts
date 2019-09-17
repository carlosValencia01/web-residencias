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
    let fulturi = window.location.href;
    this.survey = fulturi.indexOf('survey') !== -1;
    if(!this.survey){
      
      this.data = this.cookiesServ.getData().user;
      console.log(this.data);
      this.status = this.data.status;
    }
  }

  ngOnInit() {
    if(!this.survey){

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
      //     this.role = this.status === 'egresado' ? 'graduate' : 'student';
      //     this.title = this.status === 'egresado' ? 'Egresado' : 'Estudiante';
      //     break;
      //   case 3:
      //     this.role = 'employee';
      //     this.title = 'Trabajador';
      //     break;
      //   case 4:
      //     this.role = 'rechumanos';
      //     this.title = 'Recursos Humanos';
      //     break;
      //   case 5:
      //     this.role = 'comunication';
      //     this.title = 'Comunicación y Difusión';
      //     break;
      //   case 6:
      //       this.role = 'coordinator';
      //       this.title = 'Coordinador';
      //       break;
      //   case 7:
      //     this.role = 'degreeCoordinator';
      //     this.title = 'Coordinador(a) de titulación';
      //     break;
      //   case 8:
      //     this.role = 'chiefAcademic';
      //     this.title = 'Jefe(a) de departamento';
      //     break;
      //   case 9:
      //     this.role = 'recfinancieros';
      //     this.title = 'Recursos Financieros';
      //     break;
      // }
      const rol: iRole = this.data.rol;
      if (typeof (rol) !== 'undefined') {
        this.menu = rol.permissions;
        console.log('Menu', this.menu);
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
