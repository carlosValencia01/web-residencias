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
  formEmail: FormGroup;
  optionsTemplate: Array<string>;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
  ) {
    this.optionsTemplate = ['Seleccionar plantilla', 'Proceso de inscripción', 'Cursos de inglés'];
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.formEmail = new FormGroup({
      'emailInput': new FormControl({ value: null, disabled: false }, [Validators.required, Validators.email]),
      'template': new FormControl({ value: 1, disabled: false }, [Validators.required, Validators.pattern('^[1-9]')]),
    });
    this.emailInput.nativeElement.focus();
  }

  sendEmail() {
    if (this.emailInput.nativeElement.value) {
      const email = this.formEmail.get('emailInput').value;
      const template = this.formEmail.get('template').value;
      this.inscriptionsProv.sendEmail({ 'to_email': email.trim(), 'template': template, 'subject': this.optionsTemplate[template] })
      .subscribe((res) => {
        console.log(res);
        if (res.code === 200) {
          this.notificationsServices.showNotification(1, 'Envío de correo', 'El correo ha sido enviado con éxito.');
          this.emailInput.nativeElement.focus();
          this.emailInput.nativeElement.value = '';
        } else {
          this.notificationsServices.showNotification(2, 'Envío de correo', 'Ha ocurrido un error al envíar el correo, inténtalo de nuevo');
          this.emailInput.nativeElement.focus();
        }
      });
    } else {
      if (!this.emailInput.nativeElement.value) {
        return this.notificationsServices.showNotification(3, 'Envío de correo', 'Es necesario ingresar un correo');
      }
      return this.notificationsServices.showNotification(3, 'Envío de correo', 'Es necesario seleccionar una plantilla');
    }
  }
}
