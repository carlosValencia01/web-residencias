import {Component, OnInit} from '@angular/core';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CookiesService} from 'src/services/app/cookie.service';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {CurrentPositionService} from 'src/services/shared/current-position.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
  public formGroupData;
  public formGroupPsw;
  private user;
  public isMatchPasswords = false;
  private position;

  constructor(
      private employeeProvider: EmployeeProvider,
      private cookiesService: CookiesService,
      private notification: NotificationsServices,
      private activedRoute: ActivatedRoute,
      private router: Router,
      private currentPositionService: CurrentPositionService
  ) {
    if (!this.cookiesService.isAllowed(this.activedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }

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
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.user = this.cookiesService.getData().user;
    this.position = await this.currentPositionService.getCurrentPosition(); // this.getPosition();
    this.currentPositionService.changedPosition.subscribe(position => {
      if (position) {
        this.position = position;
        this.setFormGroupData();
      }
    });
    this.setFormGroupData();
  }

  private setFormGroupData() {
    this.formGroupData.setValue({
      'name': this.user.name.firstName,
      'lastName': this.user.name.lastName,
      'position': this.position.name,
      'area': this.position.ascription.name,
      'loginPsw': ''
    });
  }

  onSubmit() {
    const firstName = this.formGroupData.get('name').value;
    const lastName = this.formGroupData.get('lastName').value;
    const name = {
      firstName: firstName,
      lastName: lastName,
      fullName: `${firstName} ${lastName}`
    };
    this.employeeProvider.updateProfile(this.user._id, {
      user: {
        oldPassword: this.formGroupData.get('loginPsw').value
      },
      employee: {
        name: name
      }
    }).subscribe(res => {
      if (res.status) {
        this.notification.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
      } else {
        this.notification.showNotification(eNotificationType.SUCCESS, 'Datos actualizados correctamente', '');
        this.user.name = name;
        this.cookiesService.saveData(this.user);
        this.setFormGroupData();
        this.formGroupData.get('loginPsw').reset();
      }
    }, err => {
      this.notification.showNotification(eNotificationType.ERROR, 'Ocurrió un error', '');
    });
  }

  onSubmit1() {
    if (this.isMatchPasswords) {
      this.employeeProvider.updateProfile(this.user._id, {
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
