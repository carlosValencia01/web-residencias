import {Component, OnInit} from '@angular/core';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CookiesService} from 'src/services/app/cookie.service';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
  public formGroupData;
  public formGroupPsw;
  public email;
  public employee;
  private user;
  public isMatchPasswords = false;

  constructor(
      private employeeProvider: EmployeeProvider,
      private cookiesService: CookiesService,
      private notification: NotificationsServices,
      private activedRoute: ActivatedRoute,
      private router: Router
  ) {
    this.user = this.cookiesService.getData().user;
    if (!this.cookiesService.isAllowed(this.activedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.formGroupData = new FormGroup({
        'name': new FormControl(null, [
          Validators.required
        ]),
        'lastName': new FormControl(null, [
          Validators.required
        ]),
        'position': new FormControl({value: '', disabled: true}),
        'area': new FormControl({value: '', disabled: true}),
        'loginPsw': new FormControl(null, [
          Validators.required
        ])
    });
    this.formGroupPsw = new FormGroup({
        'psw': new FormControl(null, [
          Validators.required
        ]),
        'confPsw': new FormControl(null, [
          Validators.required
        ]),
        'loginPsw': new FormControl(null, [
          Validators.required
        ])
    });

    this.email = this.cookiesService.getData();
    this.employeeProvider.getEmployee(this.email.user.email).subscribe(res => {
      this.employee = res;
      this.formGroupData.setValue({
        'name': res.employee.name.firstName,
        'lastName': res.employee.name.lastName,
        'position': res.employee.position,
        'area': res.employee.area,
        'loginPsw': ''
      });
    });
  }

  onSubmit() {
    const firstName = this.formGroupData.get('name').value;
    const lastName = this.formGroupData.get('lastName').value;
    this.employee.employee.name.firstName = firstName;
    this.employee.employee.name.lastName = lastName;
    this.employee.employee.name.fullName = `${firstName} ${lastName}`;
    this.employeeProvider.updateProfile(this.employee.employee._id, {
      user: {
        oldPassword: this.formGroupData.get('loginPsw').value
      },
      employee: this.employee.employee
    }).subscribe(res => {
      if (res.status) {
        this.notification.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
      } else {
        this.notification.showNotification(eNotificationType.SUCCESS, 'Datos actualizados correctamente', '');
        this.formGroupData.get('loginPsw').reset();
      }
    }, err => {
      this.notification.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
    });
  }

  onSubmit1() {
    if (this.isMatchPasswords) {
      this.employeeProvider.updateProfile(this.employee.employee._id, {
        user: {
          oldPassword: this.formGroupPsw.get('loginPsw').value,
          newPassword: this.formGroupPsw.get('psw').value,
        }
      }).subscribe(res => {
          if (res.status) {
            this.notification.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
          } else {
            this.notification.showNotification(eNotificationType.SUCCESS, 'Contraseña actualizada correctamente', '');
            this.formGroupPsw.reset();
          }
        }, err => {
        this.notification.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
        }
      );
    } else {
      this.notification.showNotification(eNotificationType.ERROR, 'Las contraseñas no coinciden', '');
    }
  }

  validateMatchPassword() {
    this.isMatchPasswords = this.formGroupPsw.get('psw').value === this.formGroupPsw.get('confPsw').value ;
  }

}
