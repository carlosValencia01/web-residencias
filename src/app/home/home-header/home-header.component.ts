import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { SelectPositionComponent } from 'src/app/commons/select-position/select-position.component';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eSessionStatus } from 'src/app/enumerators/app/sessionStatus.enum';
import { UserProvider } from 'src/app/providers/app/user.prov';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { CurrentPositionService } from 'src/app/services/shared/current-position.service';
import { RoleService } from 'src/app/services/shared/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('size') size;
  // tslint:disable-next-line:no-output-rename
  @Output('onMenu') menuClicked = new EventEmitter();
  @Output('session') session = new EventEmitter();

  public role: string;
  survey: boolean; // comprobar si la url es para la encuesta
  public roleName: string;
  public profileIcon: string;

  constructor(
    private cookiesServ: CookiesService,
    private currentPositionService: CurrentPositionService,
    private dialog: MatDialog,
    private employeeProv: EmployeeProvider,
    private notificationServ: NotificationsServices,
    private router: Router,
    private userProv: UserProvider,
    private roleServ: RoleService,
    private loadingService: LoadingService,
  ) {
    const fulturi = window.location.href;
    this.survey = fulturi.indexOf('survey') !== -1;
  }

  ngOnInit() {
    if (!this.survey) {
      this.roleName = this.cookiesServ.getData().user.rol.name;
      this.profileIcon = this.cookiesServ.getProfileIcon() || 'assets/icons/profile.svg';
      switch (this.cookiesServ.getData().user.role) {
        case 0:
          this.role = 'administration';
          break;
        case 1:
          this.role = 'secretary';
          break;
        case 2:
          this.role = 'student';
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
        case 9:
          this.role = 'recfinancieros';
          break;
      }
    }
  }

  public logOut() {
    this.cookiesServ.deleteStorageData();
    window.location.replace('/');
  }

  public onMenu() {
    this.menuClicked.emit();
  }

  public viewProfile() {
    this.router.navigate(['/user/profile']);
  }

  public async changePosition() {
    const _user =  this.cookiesServ.getData().user;
    let _employee;
    this.loadingService.setLoading(true);
    _employee = await this._getEmployee(_user.email);
    this.loadingService.setLoading(false);
    const positions = _employee.positions;
    const otherPositions = positions.filter(pos => pos._id !== _user.position);

    if (!positions || (positions && !otherPositions.length)) {
      this.notificationServ
        .showNotification(eNotificationType.INFORMATION, 'Cambio de puesto', 'Solo tiene un puesto activo, no se puede continuar');
      return;
    }
    if (positions.length <= 2) {
      this._showDialogPassword(_user, otherPositions[0], positions, _employee);
      return;
    }
    const dialogRef = this.dialog.open(SelectPositionComponent, {
      width: '25em',
      data: { positions: otherPositions },
      hasBackdrop: true,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(position => {
      if (position) {
        this._showDialogPassword(_user, position, positions, _employee);
      }
    });
  }

  public lockSession() {
    const _data = this.cookiesServ.getData();
    let _status = eSessionStatus.LOCK;
    if (!_data || (_data && !_data.user)) {
      _status = eSessionStatus.INACTIVE;
    }
    this.cookiesServ.deleteSessionData();
    this.session.emit(_status);
  }

  private _getEmployee(email) {
    return new Promise(resolve => {
      this.employeeProv.getEmployee(email)
        .subscribe(
          res => resolve(res.employee),
          _ => resolve(null)
        );
    });
  }

  private _showDialogPassword(user, position, positions, employee) {
    Swal.fire({
      title: `Ingrese su contraseña para cambiar al perfil de ${position.name}`,
      text: '',
      type: 'warning',
      input: 'password',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      preConfirm: (value) => {
        if (value) {
          return value;
        } else {
          Swal.showValidationMessage('El campo es requerido');
        }
      },
    }).then((result) => {
      if (result.value) {
        this._authenticate(user.email, result.value, position, positions, employee);
      }
    });
  }

  private _authenticate(user, password, position, positions, employee) {
    this.userProv.login({
      email: user,
      password: password
    })
      .subscribe((res) => {
        const _defaultRole = { name: '', permissions: [] };
        this.userProv.sendTokenFromAPI(res.token);
        this.currentPositionService.setCurrentPosition(position);
        res.user.position = position._id;
        res.user.eid = employee._id;
        res.user.rol = position.role || _defaultRole;
        this.roleServ.setRole(position.role || _defaultRole);
        this.cookiesServ.saveData(res);
        this.cookiesServ.savePosition(position);
        this.cookiesServ.saveEmployeePositions(positions);
        this.router.navigate(['/']);
      }, _ => {
        this.notificationServ
          .showNotification(eNotificationType.ERROR, 'Cambio de puesto', 'No se pudo cambiar de puesto, inténte de nuevo');
      });
  }

  public canAccess(role: string): boolean {
    return (role !== 'Estudiante' && role !== 'Empresa');
  }

}
