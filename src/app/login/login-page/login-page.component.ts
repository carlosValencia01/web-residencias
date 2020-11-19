import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SelectPositionComponent } from 'src/app/commons/select-position/select-position.component';
import { IEmployee } from 'src/app/entities/shared/employee.model';
import { IPosition } from 'src/app/entities/shared/position.model';
import { eSessionStatus } from 'src/app/enumerators/app/sessionStatus.enum';
import { UserProvider } from 'src/app/providers/app/user.prov';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { CurrentPositionService } from 'src/app/services/shared/current-position.service';
import { RoleService } from 'src/app/services/shared/role.service';
import Swal from 'sweetalert2';
import { ESignatureProvider } from '../../providers/electronic-signature/eSignature.prov';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  @Output('session') session = new EventEmitter();

  public formLogin: FormGroup;
  public showAlertDiv = false;
  public messageAlertDiv = '';

  constructor(
    private userProv: UserProvider,
    private employeeProv: EmployeeProvider,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private currentPositionService: CurrentPositionService,
    private roleServ: RoleService,
    private eSignatureProvider: ESignatureProvider,
    private router: Router,
  ) {
    this.formLogin = new FormGroup({
      'usernameInput': new FormControl(null, Validators.required),
      'passwordInput': new FormControl(null, Validators.required),
    });
  }

  ngOnInit() { }

  public login() {
    if (this.formLogin.invalid) {
      return;
    }
    this.userProv.login({
      email: this.formLogin.get('usernameInput').value,
      password: this.formLogin.get('passwordInput').value
    })
      .subscribe((res) => {
        this.userProv.sendTokenFromAPI(res.token);
        if (res.user.rol && res.user.rol.name && res.user.rol.name.toUpperCase().indexOf('ESTUDIANTE') > -1) {
          this._studentLogin(res);
          return;
        }
        this._employeeLogin(res);
        this.showAlertDiv = false;
      }, (error) => {
        const msg = JSON.parse(error._body);
        this.messageAlertDiv = msg.error;
        this.showAlertDiv = true;
      });
  }

  private loginIsSuccessful(res: any) {
    this.roleServ.setRole(res.user.rol);
    this.cookiesServ.saveData(res);
    this.showAlertDiv = false;
    this.session.emit(eSessionStatus.ACTIVE);
  }

  private _getEmployee(email: string) {
    return new Promise(resolve => {
      this.employeeProv.getEmployee(email).subscribe(
        res => resolve(res.employee),
        _ => resolve(null)
      );
    });
  }

  public viewInscriptionsVideo() {
    // Tutorial Nuevo Ingreso
    window.open('https://drive.google.com/file/d/1Zt0L3VmS6fj_tHzAgjpLJRaMeZCh0SIA/view');
  }

  public viewReceptionActVideo() {
    // Tutorial Acto Recepcional
    window.open('https://drive.google.com/file/d/1o4WxNZ-RCPuqkb9cnK0ybulchgx8uLVp/view?usp=sharing');
  }

  private _studentLogin(res: any) {
    const _defaultGender = 'DESCONOCIDO';
    const _defaultProfileIcon = 'assets/icons/profile.svg';
    res.gender = ((res.gender === 'F') ? 'femenino'
      : (res.gender === 'M') ? 'masculino' : _defaultGender).toLowerCase();
    res.profileIcon = (res.gender === 'femenino') ? 'assets/icons/woman-student.svg'
      : (res.gender === 'masculino') ? 'assets/icons/man-student.svg' : _defaultProfileIcon;
    this.loginIsSuccessful(res);
  }

  private async _employeeLogin(res: any) {
    let _employee: IEmployee;
    _employee = <IEmployee>await this._getEmployee(res.user.email);
    const _positions = _employee.positions;

    if (_positions && _positions.length > 1) {
      const dialogRef = this.dialog.open(SelectPositionComponent, {
        width: '25em',
        data: { positions: _positions },
        hasBackdrop: true,
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this._completeEmployeeLogin(res, result, _employee);
        }
      });
    } else if (_positions && _positions.length > 0) {
      this._completeEmployeeLogin(res, _positions[0], _employee);
    } else {
      Swal.fire({
        type: 'error',
        title: 'Usuario sin puesto',
        text: 'Para agregar puestos, acudir al departamento de recursos humanos',
        showCloseButton: true,
      });
    }
  }

  private _completeEmployeeLogin(res: any, selectedPosition: IPosition, employee: IEmployee) {
    const _defaultRole = { name: '', permissions: [] };
    const _defaultGender = 'DESCONOCIDO';
    const _defaultProfileIcon = 'assets/icons/profile.svg';
    res.gender = (employee.gender || _defaultGender).toLowerCase();
    res.profileIcon = (res.gender === 'femenino') ? 'assets/icons/woman.svg'
      : (res.gender === 'masculino') ? 'assets/icons/man.svg' : _defaultProfileIcon;
    this.currentPositionService.setCurrentPosition(selectedPosition);
    res.user.position = selectedPosition._id;
    res.user.eid = employee._id;
    res.user.rol = selectedPosition.role || _defaultRole;
    this.cookiesServ.saveEmployeePositions(<IPosition[]>employee.positions);
    this.cookiesServ.savePosition(selectedPosition);
    this.loginIsSuccessful(res);
    this._verifyESignatureExpiration(selectedPosition, employee);
  }

  private _verifyESignatureExpiration(currentPosition: IPosition, employee: IEmployee) {
    this.eSignatureProvider.hasESignature(employee.rfc, currentPosition._id)
      .subscribe(data => {
        moment.locale('es');

        let showAlert = false;
        let message = 'Su firma electrónica @DAYS_MSJ. Favor de renovarla.';
        const expireDate = moment(new Date(data.expireDate).setHours(0, 0, 0, 0));
        const today = new Date().setHours(0, 0, 0, 0);
        const twoWeeksAfter = moment(today).add(2, 'weeks');
        const daysExpired = Math.abs(moment(expireDate).diff(today, 'days'));
        const message_days = daysExpired > 1 ? 'días' : 'día';

        if (expireDate.isBetween(today, twoWeeksAfter)) {
          message = message.replace('@DAYS_MSJ', `vencerá en ${daysExpired} ${message_days}`);
          showAlert = true;
        }
        if (expireDate.isBefore(today)) {
          message = message.replace('@DAYS_MSJ', `venció hace ${daysExpired} ${message_days}`);
          showAlert = true;
        }
        if (expireDate.isSame(today)) {
          message = message.replace('@DAYS_MSJ', 'venció hoy');
          showAlert = true;
        }
        if (showAlert) {
          Swal.fire({
            title: 'Firma electrónica',
            text: message,
            type: 'info',
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: 'green',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ir a renovarla',
            cancelButtonText: 'Dejar para después'
          }).then((result) => {
            if (result.value) {
              this.router.navigate(['/rrhh/electronicSignature']);
            }
          });
        }
      });
  }

}
