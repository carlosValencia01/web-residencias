import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import {Router } from '@angular/router';

@Component({
  selector: 'app-wizard-inscription-page',
  templateUrl: './wizard-inscription-page.component.html',
  styleUrls: ['./wizard-inscription-page.component.scss'],
})
export class WizardInscriptionPageComponent implements OnInit {
  isLinear = false;

  _idStudent: String;
  data: any;
  studentData: any;
  
  isOkPeriod = 3;
  isOpen = 3;

  step;

  constructor( 
    private inscriptionsProv: InscriptionsProvider,
    private cookiesServ: CookiesService,
    private router: Router,
  ){
    this.init();
  }

  ngOnInit() {
    
  }

  init(){
    this.inscriptionsProv.getActivePeriod().subscribe(
      period=>{ 
        if(period.period){
          this.isOkPeriod= 0;
          // console.log(period.period);
          let initDate = new Date(period.period.insPerInitDate);
          let endDate = new Date(period.period.insPerEndDate);
          let today = new Date();

          this.isOpen = today >= initDate ? today <= endDate ? 0 : 2 : 1;
          console.log(this.isOpen);
          
          this.getIdStudent();
          this.getStudentData(this._idStudent);
        }else{
          this.isOkPeriod=2;
        }
      }
    );
  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      this.step = this.studentData.stepWizard;
      // console.log(this.step);
      if(this.step == 6){
        //window.location.assign("/profileInscription");
        this.router.navigate(['/profileInscription']);
      }
    });
  }
}
