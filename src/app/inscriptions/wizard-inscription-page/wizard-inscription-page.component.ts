import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import {Router, ActivatedRoute } from '@angular/router';
import { StudentProvider } from 'src/app/providers/shared/student.prov';

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

  validateStudent: boolean;
  semesterStudent;
  controlNumberStudent: string;
  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private cookiesServ: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private studentProv: StudentProvider
  ){
    this.init();
    console.log('2');

    if (!this.cookiesServ.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }

  }

  ngOnInit() {

  }

  init(){
    this.inscriptionsProv.getActivePeriod().subscribe(
      period=>{
        if(period.period){
          this.isOkPeriod= 0;
          let initDate = new Date(period.period.insPerInitDate);
          let endDate = new Date(period.period.insPerEndDate);
          let today = new Date();

          this.isOpen = today >= initDate ? today <= endDate ? 0 : 2 : 1;
          this.getIdStudent();
          this.getStudentData(this._idStudent);
        }else{
          this.isOkPeriod=2;
        }
      }, err => {
        this.isOkPeriod=2;
      }
    );
  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;

    this._idStudent = this.data._id;
    this.controlNumberStudent = this.data.email;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      this.step = this.studentData.stepWizard ? this.studentData.stepWizard : 0;
      this.semesterStudent = this.studentData.semester ? this.studentData.semester : 0;
      if(this.studentData.inscriptionStatus){
        this.validateStudent = true;
        if(this.step == 7){
          this.router.navigate(['/inscriptions/profileInscription']);
        }
      } else {
        this.studentProv.isStudentInscription(this.controlNumberStudent).subscribe(
          (forInscription)=>{
            this.validateStudent = true;
          },
          (err)=>{
            this.validateStudent = false;
          }
        );
      } 
    });
  }
  
}
