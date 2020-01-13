import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {ESignatureProvider} from 'src/providers/electronic-signature/eSignature.prov';
import {CookiesService} from 'src/services/app/cookie.service';
import {CurrentPositionService} from 'src/services/shared/current-position.service';
import {NotificationsServices} from 'src/services/app/notifications.service';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import Swal from 'sweetalert2';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class ElectronicSignatureComponent implements OnInit {
  public formGroupPsw;
  private cookies;
  private employee;
  public eSignatureStatus;
  private fileName = '';
  public isMatchPasswords = false;
  public currentPosition;
  private docString;

  constructor(private employeeProvider: EmployeeProvider, private eSignatureProvider: ESignatureProvider ,
              private cookiesService: CookiesService, private currentPositionService: CurrentPositionService,
              private notificationsServices: NotificationsServices) {
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
    this.currentPosition = await this.currentPositionService.getCurrentPosition(); // this.getPosition();

    this.cookies = this.cookiesService.getData().user;

    this.employeeProvider.getEmployee(this.cookies.email).subscribe( res => {
      this.employee = res;
      this.fileName = res.employee.rfc + this.currentPosition.name;

      this.eSignatureProvider.hasESignature(res.employee.rfc, this.currentPosition._id)
        .subscribe( data => {
          this.docString = data.eSignatureId.docString;
          this.eSignatureStatus = moment(data.eSignatureId.expireDate).format('LL');
          this.formGroupPsw.disable();
        }, error => {
          if (error.status === 404) {
            this.eSignatureStatus = '';
          } else {
            this.notificationsServices.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error', '');
          }
          this.formGroupPsw.enable();
        });
    });
  }

  private async getPosition() {
    return await this.currentPositionService.getCurrentPosition();
  }

  onSubmit() {
    this.eSignatureProvider.createDocument({
      rfc: this.employee.employee.rfc,
      position: this.currentPosition.name,
      department: this.currentPosition.ascription.name,
      employeeId: this.employee.employee._id,
      positionId: this.currentPosition._id,
      password: this.formGroupPsw.get('psw').value
    }).subscribe(eSignature => {
      this.formGroupPsw.reset();
      this.formGroupPsw.disable();
      this.docString = eSignature.docString;
      this.eSignatureStatus = moment(eSignature.expireDate).format('LL');
      Swal.fire('Firma electrónica', 'Firma electrónica creada', 'success');
    });
  }

  onSubmit1() {
    this.eSignatureProvider.getDocument().subscribe(data => {
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
