import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { NotificationsServices } from 'src/services/app/notifications.service';
import {MatDialog} from '@angular/material/dialog';

import {SelectPositionComponent} from 'src/modals/electronic-signature/select-position/select-position.component';

import { UserProvider } from 'src/providers/app/user.prov';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  @ViewChild('loginInputUser') loginInputUser: ElementRef;

  @Output() loginSuccessful = new EventEmitter();

  formLogin: FormGroup;
  errorForm = false;
  errorUsernameInput = false;
  errorPasswordInput = false;
  showAlertDiv = false;
  messageAlertDiv = '';

  constructor(
    public formBuilder: FormBuilder,
    private userProv: UserProvider,
    private employeeProv: EmployeeProvider,
    private cookiesServ: CookiesService,
    private notificationsServ: NotificationsServices,
    private router: Router,
    public dialog: MatDialog
  ) {
    console.log('login');
   }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.formLogin = this.formBuilder.group({
      'usernameInput': ['', [Validators.required]],
      'passwordInput': ['', [Validators.required]],
    });

    this.formLogin.get('usernameInput').setValue('');
    this.formLogin.get('passwordInput').setValue('');
    this.loginInputUser.nativeElement.focus();
  }

  login() {
    if (this.formLogin.invalid) {
      this.errorForm = true;

      if (this.formLogin.get('usernameInput').errors) {
        this.errorUsernameInput = true;
      }

      if (this.formLogin.get('passwordInput').errors) {
        this.errorPasswordInput = true;
      }
    } else {
      this.userProv.login({ email: this.formLogin.get('usernameInput').value, password: this.formLogin.get('passwordInput').value })
        .subscribe(async (res) => {
          // console.log(res);
          // Aqui emitiremos la señal, de que todo esta correcto y se cambiara la pagina.

          this.userProv.sendTokenFromAPI(res.token);

          let positions;
          positions = await this.getPositions(res.user.email);

          const dialogRef = this.dialog.open(SelectPositionComponent, {
            width: '280px',
            data: {positions: positions},
            backdropClass: 'backdropBackground'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result.code === 'Ok') {
              this.cookiesServ.saveData(res);
              this.showAlertDiv = false;
              this.loginSuccessful.emit();
            }
          });
        }, (error) => {
          console.log(error);
          const msg = JSON.parse(error._body);
          this.messageAlertDiv = msg.error;
          this.showAlertDiv = true;
        });
    }
  }

  getPositions(email) {
    return new Promise(resolve => {
      this.employeeProv.getEmployee(email).subscribe(
        res => {
          this.employeeProv.getEmployeesPositions(res.employee.rfc).subscribe(
            data => {
              resolve(data);
            }
          );
        }
      );
    });
  }

}
