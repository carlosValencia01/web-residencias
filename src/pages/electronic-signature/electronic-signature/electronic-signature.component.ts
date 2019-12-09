import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {ESignatureProvider} from 'src/providers/electronic-signature/eSignature.prov';
import {CookiesService} from 'src/services/app/cookie.service';

@Component({
  selector: 'app-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class ElectronicSignatureComponent implements OnInit {
  public formGroupPsw;
  public cookies;
  public employee;
  public eSignatureStatus;
  public fileName = '';
  public isMatchPasswords = false;

  constructor(private employeeProvider: EmployeeProvider, private eSignatureProvider: ESignatureProvider ,
              private cookiesService: CookiesService) {
  }

  ngOnInit() {
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
    this.cookies = this.cookiesService.getData();

    this.employeeProvider.getEmployee(this.cookies.user.email).subscribe( res => {
      this.employee = res;
      this.fileName = res.employee.rfc;

      this.eSignatureProvider.hasESignature(res.employee.rfc)
        .subscribe( data => {
          if (data !== null) {
            this.eSignatureStatus = data.expireDate.substring(0, 10);
          } else {
            this.eSignatureStatus = '';
          }
      });
    });
  }

  onSubmit() {
    this.eSignatureProvider.createDocument({
      rfc: this.employee.employee.rfc,
      position: this.employee.employee.position,
      password: this.formGroupPsw.get('psw').value
    }).subscribe(_ => {
      alert('Firma electrónica creada');
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
