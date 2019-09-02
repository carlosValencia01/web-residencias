import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-request-modal-content',
  templateUrl: './request-modal-content.component.html',
  styleUrls: ['./request-modal-content.component.scss']
})
export class RequestModalContentComponent implements OnInit {
  @Input() request;
  private formRequestData: FormGroup;

  constructor() {
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.formRequestData = new FormGroup({
      'name': new FormControl({
        value: this.request.graduate.name.fullName,
        disabled: true
      }),
      'telephone': new FormControl({
        value: this.request.telephoneContact,
        disabled: true
      }),
      'email': new FormControl({
        value: this.request.graduate.email,
        disabled: true
      }),
      'projectName': new FormControl({
        value: this.request.request.projectName,
        disabled: true
      }),
      'proposedDate': new FormControl({
        value: moment(this.request.request.proposedDate).format('LL'),
        disabled: true
      }),
      'honorificMention': new FormControl({
        value: `${this.request.request.honorificMention}`,
        disabled: true
      }),
      'numberParticipants': new FormControl({
        value: this.request.request.numberParticipants,
        disabled: true
      }),
      'projectFile': new FormControl({
        value: this.request.request.projectFile,
        disabled: true
      }),
      'product': new FormControl({
        value: this.request.request.product,
        disabled: true
      }),
      'address': new FormControl({
        value: this.request.graduate.address,
        disabled: true
      }),
    });
  }
}
