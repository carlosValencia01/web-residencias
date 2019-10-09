import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-electronic-signature',
  templateUrl: './electronic-signature.component.html',
  styleUrls: ['./electronic-signature.component.scss']
})
export class ElectronicSignatureComponent implements OnInit {
  public formGroupPsw;

  constructor() {
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

  }

}
