import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {eNotificationType} from 'src/app/enumerators/app/notificationType.enum';
import {EmployeeProvider} from 'src/app/providers/shared/employee.prov';
import {ESignatureProvider} from 'src/app/providers/electronic-signature/eSignature.prov';
import {CookiesService} from 'src/app/services/app/cookie.service';
import {CurrentPositionService} from 'src/app/services/shared/current-position.service';
import {NotificationsServices} from 'src/app/services/app/notifications.service';
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
  public isMatchPasswords = false;
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
          this.docString = data.docString;
          this.eSignatureStatus = moment(data.expireDate).format('LL');
          this.formGroupPsw.disable();
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

  validateMatchPassword() {
    this.isMatchPasswords = this.formGroupPsw.get('psw').value === this.formGroupPsw.get('confPsw').value ;
  }
}
