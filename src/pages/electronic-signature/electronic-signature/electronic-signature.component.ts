import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {ESignatureProvider} from 'src/providers/electronic-signature/eSignature.prov';
import {CookiesService} from 'src/services/app/cookie.service';
import {CurrentPositionService} from 'src/services/shared/current-position.service';
import {NotificationsServices} from 'src/services/app/notifications.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class ElectronicSignatureComponent implements OnInit {
  public currentPosition;
  public eSignatureStatus;
  public formGroupPsw;
  public formGroupPswChange;
  public isMatchPasswords = false;
  public isMatchPasswordsChange = false;
  public update = false;
  private user;
  private docString;
  private employee;
  private fileName = '';

  constructor(
    private employeeProvider: EmployeeProvider,
    private eSignatureProvider: ESignatureProvider ,
    private cookiesService: CookiesService,
    private currentPositionService: CurrentPositionService,
    private notification: NotificationsServices) {
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
      this.formGroupPswChange = new FormGroup({
        'pswChange': new FormControl(null, [
          Validators.required
        ]),
        'confPswChange': new FormControl(null, [
          Validators.required
        ]),
        'eSigPswChange': new FormControl(null, [
          Validators.required
        ])
      });
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.currentPosition = await this.currentPositionService.getCurrentPosition();

    this.user = this.cookiesService.getData().user;

    this.employeeProvider.getEmployee(this.user.email).subscribe( res => {
      this.employee = res;
      this.fileName = res.employee.rfc + this.currentPosition.name;

      this.eSignatureProvider.hasESignature(res.employee.rfc, this.currentPosition._id)
        .subscribe( data => {
          this.update = data.update;
          this.docString = data.docString;
          this.eSignatureStatus = moment(data.expireDate).format('LL');
          if (this.update) {
            this.formGroupPsw.enable();
            this.formGroupPswChange.disable();
          } else {
            this.formGroupPsw.disable();
          }
        }, error => {
          if (error.status === 404) {
            this.eSignatureStatus = '';
          } else {
            this.notification.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error', '');
          }
          this.formGroupPsw.enable();
        });
    });
  }

  createDocument() {
    this.eSignatureProvider.createDocument({
      employeeId: this.employee.employee._id,
      positionId: this.currentPosition._id,
      userId: this.user._id,
      userPsw: this.formGroupPsw.get('loginPsw').value,
      rfc: this.employee.employee.rfc,
      department: this.currentPosition.ascription.name,
      position: this.currentPosition.name,
      password: this.formGroupPsw.get('psw').value
    }).subscribe(eSignature => {
      this.formGroupPsw.reset();
      this.formGroupPsw.disable();
      this.docString = eSignature.docString;
      this.eSignatureStatus = moment(eSignature.expireDate).format('LL');
      this.notification.showNotification(eNotificationType.SUCCESS, 'Firma electrónica creada', '');
    }, error => {
      this.notification.showNotification(eNotificationType.ERROR, 'Contraseña incorrecta', '');
    });
  }

  renew() {
    const passwords = {
      eSigPsw: this.formGroupPsw.get('loginPsw').value,
      newPsw: this.formGroupPsw.get('psw').value
    };
    this.eSignatureProvider.renewESignature(this.user._id, this.employee.employee._id, this.currentPosition._id, passwords)
      .subscribe(data => {
        this.update = false;
        this.formGroupPsw.reset();
        this.formGroupPsw.disable();
        const currentDate = new Date();
        const year = currentDate.getFullYear() + 2;
        const month = currentDate.getMonth();
        const day = currentDate.getDate();
        const expireDate = new Date(year, month, day);
        this.eSignatureStatus = moment(expireDate).format('LL');
        this.notification.showNotification(eNotificationType.SUCCESS, data.message, '');
    }, error => {
      this.notification.showNotification(eNotificationType.ERROR, error.message, '');
    });
  }

  getDocument() {
    this.eSignatureProvider.getDocument(this.employee.employee._id, this.currentPosition._id).subscribe(data => {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data.text(), `${this.fileName}.itt`);
      } else {
        const newBlob = new Blob([data.text()], {type: 'text/plain'});
        const url = URL.createObjectURL(newBlob);
        const a = document.createElement('a');

        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = `${this.fileName}.itt`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    });
  }

  changePassword() {
    if (this.isMatchPasswordsChange) {
      this.eSignatureProvider.changeESignaturePassword(this.user._id, this.employee.employee._id, this.currentPosition._id, {
        eSigPsw: this.formGroupPswChange.get('eSigPswChange').value,
        newPsw: this.formGroupPswChange.get('pswChange').value,
      }).subscribe(res => {
          if (res.status) {
            this.notification.showNotification(eNotificationType.ERROR, res.message, '');
          } else {
            this.notification.showNotification(eNotificationType.SUCCESS, 'Contraseña actualizada correctamente', '');
            this.formGroupPsw.reset();
          }
        }, err => {
          this.notification.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error', '');
        }
      );
    } else {
      this.notification.showNotification(eNotificationType.ERROR, 'Las contraseñas no coinciden', '');
    }
  }

  validateMatchPassword() {
    this.isMatchPasswords = this.formGroupPsw.get('psw').value === this.formGroupPsw.get('confPsw').value ;
  }

  validateMatchPasswordChange() {
    this.isMatchPasswordsChange = this.formGroupPswChange.get('pswChange').value === this.formGroupPswChange.get('confPswChange').value ;
  }
}
