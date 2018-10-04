import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { NotificationsServices } from '../../services/notifications.service';

import { UserProvider } from '../../providers/user.prov';
import { CookiesService } from '../../services/cookie.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  @Output() loginSuccessful = new EventEmitter();

  formLogin: FormGroup;
  errorForm = false;
  errorUsernameInput = false;
  errorPasswordInput = false;
  showAlertDiv = false;

  constructor(
    public formBuilder: FormBuilder,
    private userProv: UserProvider,
    private cookiesServ: CookiesService,
    private notificationsServ: NotificationsServices,
  ) { }

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
        .subscribe(res => {
          console.log(res);
          // Aqui emitiremos la señal, de que todo esta correcto y se cambiara la pagina.
          this.userProv.sendTokenFromAPI(res.token);


          this.cookiesServ.saveData(res);
          this.showAlertDiv = false;
          this.loginSuccessful.emit();
        }, error => {
          // console.log(error);
          this.showAlertDiv = true;
        });

    }
  }

}
