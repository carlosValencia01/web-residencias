import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {CookiesService} from 'src/services/app/cookie.service';

@Component({
  selector: 'app-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class ElectronicSignatureComponent implements OnInit {
  public formGroupPsw;
  public email;
  public employee;

  constructor(private employeeProvider: EmployeeProvider, private cookiesService: CookiesService) {
  }

  ngOnInit() {
    this.formGroupPsw = new FormGroup(
      {
        'psw': new FormControl(null),
        'confPsw': new FormControl(null),
        'loginPsw': new FormControl(null)
      });
  }

  onSubmit() {
    this.email = this.cookiesService.getData();
    this.employeeProvider.getEmployee(this.email.user.email).subscribe(res => {
      this.employee = res;
    });
  }

}
