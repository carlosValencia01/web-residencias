import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { MatDialog } from '@angular/material/dialog';

import { SelectPositionComponent } from 'src/modals/electronic-signature/select-position/select-position.component';

import { UserProvider } from 'src/providers/app/user.prov';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { CurrentPositionService } from 'src/services/shared/current-position.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IBoss } from 'src/entities/reception-act/boss.model';

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
  datos;
  user: any;

  constructor(
    public formBuilder: FormBuilder,
    private userProv: UserProvider,
    private employeeProv: EmployeeProvider,
    private cookiesServ: CookiesService,
    private notificationsServ: NotificationsServices,
    private router: Router,
    public dialog: MatDialog,
    private currentPositionService: CurrentPositionService
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
          console.log("RES", res.user.rol.name);
          if (res.user.rol.name.toUpperCase() === 'ESTUDIANTE') {
            this.loginIsSuccessful(res);
            return;
          }

          let positions;
          positions = await this.getPositions(res.user.email);

          if (positions.length > 1) {
            const dialogRef = this.dialog.open(SelectPositionComponent, {
              width: '25em',
              data: { positions: positions },
              hasBackdrop: true,
              disableClose: true
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.loginIsSuccessful(res, result);
              }
            });
          } else if (positions.length > 0) {
            this.loginIsSuccessful(res, positions[0]);
          } else {
            Swal.fire({
              type: 'error',
              title: 'Usuario sin puesto',
              text: 'Para agregar puestos, acudir al departamento de recursos humanos',
              showCloseButton: true,
            });
          }
        }, (error) => {
          // console.log(error);
          const msg = JSON.parse(error._body);
          this.messageAlertDiv = msg.error;
          this.showAlertDiv = true;
        });
    }
  }

  private loginIsSuccessful(res, position?) {
    this.getBosses();
    if (position) {      
      this.cookiesServ.savePosition(position);
      this.currentPositionService.setCurrentPosition(position);
      res.user.position = position._id;
    }
    this.cookiesServ.saveData(res);
    this.showAlertDiv = false;
    this.loginSuccessful.emit();
  }

  async getBosses() {
    const JDeptoDiv = await this.getBoss({ Department: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES', Position: 'JEFE DE DEPARTAMENTO' });
    const CDeptoDiv = await this.getBoss({ Department: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES', Position: 'COORDINADOR DE TITULACIÓN' });
    const JDeptoEsc = await this.getBoss({ Department: 'DEPARTAMENTO DE SERVICIOS ESCOLARES', Position: 'JEFE DE DEPARTAMENTO' });
    const Director = await this.getBoss({ Department: 'DIRECCIÓN', Position: 'DIRECTOR' });
    const Bosses = {
      JDeptoDiv: JDeptoDiv,
      CDeptoDiv: CDeptoDiv,
      JDeptoEsc: JDeptoEsc,
      Director: Director,
    };
    this.cookiesServ.saveBosses(Bosses);
  }

  getBoss(search: { Department: string, Position: string }) {
    return new Promise(resolve => {
      this.employeeProv.searchEmployee(
        search
      ).subscribe(response => {
        resolve(response.Employee);
      }, error => {
        resolve(null);
      });
    });
  }

  getPositions(email) {
    return new Promise(resolve => {
      this.employeeProv.getEmployee(email).subscribe(
        res => {
          resolve(res.employee.positions);
        }
      );
    });
  }
  viewVideo() {
    window.open('https://drive.google.com/file/d/1QlVOPP6_wy89Ld7sJsDKFNNH6gMn3V-B/view?usp=sharing');
  }

}
