import {Component, OnInit} from '@angular/core';
import {EmployeeProvider} from '../../providers/employee.prov';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CookiesService} from 'src/services/cookie.service';
import {NotificationsServices} from 'src/services/notifications.service';
import {eNotificationType} from 'src/enumerators/notificationType.enum';

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

  constructor(
      private employeeProvider: EmployeeProvider,
      private cookiesService: CookiesService,
      private notification: NotificationsServices,
  ) { }

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

    this.email = this.cookiesService.getData()
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
    this.employee.employee.name.firstName = this.formGroupData.get('name').value;
    this.employee.employee.name.lastName = this.formGroupData.get('lastName').value;
    this.employeeProvider.updateProfile(this.employee.employee._id, {
      user: {
        oldPassword: this.formGroupData.get('loginPsw').value
      },
      employee: this.employee.employee
    }).subscribe(res => {
      if (res.status) {
        alert('Ocurrió un error');
      } else {
        alert('Datos actualizados correctamente');
      }
    }, err => {
      alert('Ocurrió un error');
    });
  }

  onSubmit1() {
    if (this.formGroupPsw.get('psw').value === this.formGroupPsw.get('confPsw').value) {
      this.employeeProvider.updateProfile(this.employee.employee._id, {
        user: {
          oldPassword: this.formGroupPsw.get('loginPsw').value,
          newPassword: this.formGroupPsw.get('psw').value,
        }
      }).subscribe(res => {
          if (res.status) {
            alert('Ocurrió un error');
          } else {
            alert('Contraseña actualizada correctamente');
          }
        }, err => {
          alert('Ocurrió un error');
        }
      );
    } else {
      this.notification.showNotification(eNotificationType.ERROR, 'Las contraseñas no coinciden', '');
    }
  }

}
