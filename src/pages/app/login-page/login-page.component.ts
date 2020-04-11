import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { SelectPositionComponent } from 'src/modals/electronic-signature/select-position/select-position.component';
import { UserProvider } from 'src/providers/app/user.prov';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { CurrentPositionService } from 'src/services/shared/current-position.service';
import { RoleService } from 'src/services/shared/role.service';
import { eSessionStatus } from 'src/enumerators/app/sessionStatus.enum';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  @ViewChild('loginInputUser') loginInputUser: ElementRef;
  @Output('session') session = new EventEmitter();

  formLogin: FormGroup;
  errorForm = false;
  errorUsernameInput = false;
  errorPasswordInput = false;
  showAlertDiv = false;
  messageAlertDiv = '';
  datos;
  user: any;

  constructor(
    public formBuilder: FormBuilder,
    private userProv: UserProvider,
    private employeeProv: EmployeeProvider,
    private cookiesServ: CookiesService,
    public dialog: MatDialog,
    private currentPositionService: CurrentPositionService,
    private roleServ: RoleService,
  ) { }

  ngOnInit() {
    this._initializeForm();
  }

  private _initializeForm() {
    this.formLogin = this.formBuilder.group({
      'usernameInput': ['', [Validators.required]],
      'passwordInput': ['', [Validators.required]],
    });

    this.formLogin.get('usernameInput').setValue('');
    this.formLogin.get('passwordInput').setValue('');
    this.loginInputUser.nativeElement.focus();
  }

  public login() {
    if (this.formLogin.invalid) {
      this.errorForm = true;

      if (this.formLogin.get('usernameInput').errors) {
        this.errorUsernameInput = true;
      }

      if (this.formLogin.get('passwordInput').errors) {
        this.errorPasswordInput = true;
      }
      return;
    }
    this.userProv.login({
      email: this.formLogin.get('usernameInput').value,
      password: this.formLogin.get('passwordInput').value
    })
    .subscribe((res) => {
      this.userProv.sendTokenFromAPI(res.token);

      if (res.user.rol && res.user.rol.name.toUpperCase() === 'ESTUDIANTE') {
        this._getBosses();
        this._studentLogin(res);
        return;
      }
      this._employeeLogin(res);
    }, (error) => {
      const msg = JSON.parse(error._body);
      this.messageAlertDiv = msg.error;
      this.showAlertDiv = true;
    });
  }

  private loginIsSuccessful(res) {
    this.roleServ.setRole(res.user.rol);
    this.cookiesServ.saveData(res);
    this.showAlertDiv = false;
    this.session.emit(eSessionStatus.ACTIVE);
  }

  private async _getBosses() {
    const JDeptoDiv = await this._getBoss({
      Department: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES',
      Position: 'JEFE DE DEPARTAMENTO' });
    const CDeptoDiv = await this._getBoss({
      Department: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES',
      Position: 'COORDINADOR DE TITULACIÓN' });
    const JDeptoEsc = await this._getBoss({
      Department: 'DEPARTAMENTO DE SERVICIOS ESCOLARES',
      Position: 'JEFE DE DEPARTAMENTO' });
    const Director = await this._getBoss({ Department: 'DIRECCIÓN', Position: 'DIRECTOR' });
    const Bosses = {
      JDeptoDiv: JDeptoDiv,
      CDeptoDiv: CDeptoDiv,
      JDeptoEsc: JDeptoEsc,
      Director: Director,
    };
    this.cookiesServ.saveBosses(Bosses);
  }

  private _getBoss(search: { Department: string, Position: string }) {
    return new Promise(resolve => {
      this.employeeProv.searchEmployee(
        search
      ).subscribe(response => {
        resolve(response.Employee);
      }, _ => {
        resolve(null);
      });
    });
  }

  private _getEmployee(email) {
    return new Promise(resolve => {
      this.employeeProv.getEmployee(email).subscribe(
        res => resolve(res.employee),
        _ => resolve(null)
      );
    });
  }

  public viewVideo() {
    // Tutorial Nuevo Ingreso
    window.open('https://drive.google.com/file/d/1QlVOPP6_wy89Ld7sJsDKFNNH6gMn3V-B/view?usp=sharing');    
  }

  public viewVideoReceptionAct() {
    // Tutorial Acto Recepcional
    window.open('https://drive.google.com/file/d/1o4WxNZ-RCPuqkb9cnK0ybulchgx8uLVp/view?usp=sharing');
  }

  private _studentLogin(res) {
    const _defaultGender = 'DESCONOCIDO';
    const _defaultProfileIcon = 'assets/icons/profile.svg';
    res.gender = ((res.gender === 'F') ? 'femenino'
      : (res.gender === 'M') ? 'masculino' : _defaultGender).toLowerCase();
    res.profileIcon = (res.gender === 'femenino') ? 'assets/icons/woman-student.svg'
      : (res.gender === 'masculino') ? 'assets/icons/man-student.svg' : _defaultProfileIcon;
    this._getBosses();
    this.loginIsSuccessful(res);
  }

  private async _employeeLogin(res) {
    let _employee;
    _employee = await this._getEmployee(res.user.email);
    const _positions = _employee.positions;

    if (_positions.length > 1) {
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
    } else if (_positions.length > 0) {
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

  private _completeEmployeeLogin(res, selectedPosition, employee) {
    const _defaultRole = { name: '', permissions: [] };
    const _defaultGender = 'DESCONOCIDO';
    const _defaultProfileIcon = 'assets/icons/profile.svg';
    res.gender = (employee.gender || _defaultGender).toLowerCase();
    res.profileIcon = (res.gender === 'femenino') ? 'assets/icons/woman.svg'
      : (res.gender === 'masculino') ? 'assets/icons/man.svg' : _defaultProfileIcon;
    this._getBosses();
    this.currentPositionService.setCurrentPosition(selectedPosition);
    res.user.position = selectedPosition._id;
    res.user.eid = employee._id;
    res.user.rol = selectedPosition.role || _defaultRole;
    this.cookiesServ.saveEmployeePositions(employee.positions);
    this.cookiesServ.savePosition(selectedPosition);
    this.loginIsSuccessful(res);
  }

}
