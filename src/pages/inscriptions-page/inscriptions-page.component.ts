import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import { InscriptionsProvider } from '../../providers/inscriptions.prov';
import { NotificationsServices } from '../../services/notifications.service';

@Component({
  selector: 'app-inscriptions-page',
  templateUrl: './inscriptions-page.component.html',
  styleUrls: ['./inscriptions-page.component.scss']
})
export class InscriptionsPageComponent implements OnInit {

  @ViewChild('emailinput') emailInput:  ElementRef;

  emails: Array<string>;
  subject: string;
  formEmail: FormGroup;
  errorEmail = false;
  errorForm = false;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
  ) { }

  ngOnInit() {
    this.emails = [];
    this.subject = 'Proceso de inscripción';
    this.initializeForm();
  }

  initializeForm() {
    this.formEmail = new FormGroup({
      'emailInput': new FormControl({ value: null, disabled: false }, [Validators.required, Validators.email])
    });
    this.emailInput.nativeElement.focus();
  }

  formValidation(): boolean {
    let valid = true;
    this.errorForm = false;
    this.errorEmail = false;
    if (this.formEmail.invalid) {
      this.errorForm = true;
      this.errorEmail = true;
      valid = false;
    }
    return valid;
  }

  sendInfography() {
    if (this.formValidation() && this.emailInput.nativeElement.value) {
      const email = this.formEmail.get('emailInput').value;
      this.inscriptionsProv.sendInfography(email.trim(), this.subject)
      .subscribe((res) => {
        console.log(res);
        if (res.code === 200) {
          this.notificationsServices.showNotification(1, 'Envío de correo', 'El correo ha sido enviado con éxito.');
          // this.formEmail.setValue({'emailInput': ''});
          this.emailInput.nativeElement.focus();
          this.emailInput.nativeElement.value = '';
          this.errorForm = false;
          this.errorEmail = false;
        } else {
          this.notificationsServices.showNotification(2, 'Envío de correo', 'Ha ocurrido un error al envíar el correo, inténtalo de nuevo');
          this.emailInput.nativeElement.focus();
        }
      });
    }
  }
}
