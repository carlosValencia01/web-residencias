import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { InscriptionsProvider } from '../../providers/inscriptions.prov';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  errorEmail: boolean = false;
  errorForm: boolean = false;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.emails = [];
    this.subject = "Proceso de inscripción";
    this.initializeForm();
  }

  initializeForm() {
    this.formEmail = this.formBuilder.group({
      'emailInput': ['', [Validators.required, Validators.email]]
    });
    this.emailInput.nativeElement.focus();
  }

  formValidation(): boolean {
    let invalid = false;
    this.errorForm = false;
    this.errorEmail = false;
    if (this.formEmail.invalid) {
      this.errorForm = true;
      this.errorEmail = true;
      invalid = true;
    }
    return invalid;
  }

  sendInfography() {
    if (!this.formValidation()) {
      let email = this.formEmail.get('emailInput').value;
      this.inscriptionsProv.sendInfography(email.trim(), this.subject)
      .subscribe((res) => {
        console.log(res);
        if (res.code === 200) {
          this.formEmail.setValue({'emailInput': ""});
          this.emailInput.nativeElement.focus();
        } else {
          alert("Ha ocurrido un error al envíar el correo, inténtalo de nuevo");
          this.emailInput.nativeElement.focus();
        }
      });
    }
  }
}
