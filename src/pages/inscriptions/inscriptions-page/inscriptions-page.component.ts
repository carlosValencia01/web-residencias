import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router, ActivatedRoute } from '@angular/router';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-inscriptions-page',
  templateUrl: './inscriptions-page.component.html',
  styleUrls: ['./inscriptions-page.component.scss']
})
export class InscriptionsPageComponent implements OnInit {

  @ViewChild('emailinput') emailInput: ElementRef;
  public formEmail: FormGroup;
  public optionsTemplate: Array<string>;
  public emails: Array<string>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.emails = [];
    this.optionsTemplate = [
      'Seleccionar plantilla',
      'Proceso de inscripción',
      'Cursos de inglés',
      'Información de credencial',
    ];
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

  addEmail(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value.toLocaleLowerCase().trim();
    this.formEmail.patchValue({ 'emailInput': value });
    const index = this.emails.indexOf(value);

    if (value && this.formEmail.get('emailInput').valid && index === -1) {
      this.emails.push(value);
    } else if (index !== -1) {
      return this.notificationsServices.showNotification(eNotificationType.INFORMATION,
        'Email repetido', `El correo ${value} ya fue agregado`);
    } else {
      return this.notificationsServices.showNotification(eNotificationType.INFORMATION,
        'Email inválido', 'Revise que el correo sea correcto');
    }

    if (input) {
      input.value = '';
    }
  }

  removeEmail(email: string) {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  sendEmail() {
    if (this.emails.length) {
      const template = this.formEmail.get('template').value;
      this.inscriptionsProv.sendEmail({ 'to_email': this.emails, 'index': Number(template), 'many': false })
        .subscribe((res) => {
          console.log(res);
          if (res.code === 200) {
            this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Envío de correo',
              `${this.emails.length === 1 ? 'El correo' : 'Los correos'} ha sido enviado con éxito.`);
            this.emailInput.nativeElement.focus();
            this.emailInput.nativeElement.value = '';
            this.emails = [];
          } else {
            this.notificationsServices.showNotification(eNotificationType.ERROR, 'Envío de correo',
              `Ha ocurrido un error al envíar ${this.emails.length === 1 ? 'el correo' : 'los correos'}, inténtalo de nuevo`);
            this.emailInput.nativeElement.focus();
          }
        });
    } else {
      if (!this.emails.length) {
        return this.notificationsServices.showNotification(eNotificationType.INFORMATION,
          'Envío de correo', 'Es necesario ingresar por lo menos un correo');
      }
      return this.notificationsServices.showNotification(eNotificationType.INFORMATION,
        'Envío de correo', 'Es necesario seleccionar una plantilla');
    }
  }
}
