import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import {Router } from '@angular/router';

@Component({
  selector: 'app-wizard-inscription-page',
  templateUrl: './wizard-inscription-page.component.html',
  styleUrls: ['./wizard-inscription-page.component.scss'],
})
export class WizardInscriptionPageComponent implements OnInit {
  isLinear = false;

  _idStudent: String;
  data: any;
  studentData: any;

  step;

  constructor( 
    private inscriptionsProv: InscriptionsProvider,
    private cookiesServ: CookiesService,
    private router: Router,
  ){
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {

  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      this.step = this.studentData.stepWizard;
      console.log(this.step);
      if(this.step == 6){
        //window.location.assign("/profileInscription");
        this.router.navigate(['/profileInscription']);
      }
    });
  }
}
