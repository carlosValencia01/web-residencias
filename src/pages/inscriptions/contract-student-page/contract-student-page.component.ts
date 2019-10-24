import { Component, OnInit } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';
import { MatStepper } from '@angular/material/stepper';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-contract-student-page',
  templateUrl: './contract-student-page.component.html',
  styleUrls: ['./contract-student-page.component.scss']
})
export class ContractStudentPageComponent implements OnInit {
  data: any;
  nameStudent: String;
  _idStudent: String;

  acceptedTerms: boolean;
  currentUsername : String;  

  alumno: Object;
  fieldFirstName : String;
  fieldLastNameFather : String;
  fieldLastNameMother : String;
  currentDate : Date;
  currentMonth : String;

  constructor(
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    private inscriptionsProv: InscriptionsProvider, 
    private notificationsServices: NotificationsServices,
  ) {
    this.currentDate = new Date();
    this.convertNumericalMonth();
    this.getIdStudent();
    console.log(this.currentDate);
  }

  ngOnInit() {
    this.data = this.cookiesServ.getData().user;
    this.nameStudent = this.data.name.fullName;
    this.acceptedTerms = false;
  }

  getIdStudent(){
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  onChange(event) {
    this.acceptedTerms = !this.acceptedTerms;
    console.log(this.acceptedTerms);
  }

  async continue(){
    var data = {acceptedTerms:this.acceptedTerms,dateAcceptedTerms:this.currentDate}
    await this.updateStudent(data,this._idStudent);
  }

  async updateStudent(data,id) {
    await this.inscriptionsProv.updateStudent(data,id).subscribe(res => {
      this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Exito', 'Contrato Aceptado');
      var newStep = {stepWizard:4}
      this.inscriptionsProv.updateStudent(newStep,id).subscribe(res => {
        this.stepper.next();
      });
    });
  }

  convertNumericalMonth(){
    switch(this.currentDate.getMonth()){
      case 0: {
        this.currentMonth = "Enero";
        break;
      }
      case 1: {
        this.currentMonth = "Febrero";
        break;
      }
      case 2: {
        this.currentMonth = "Marzo";
        break;
      }
      case 3: {
        this.currentMonth = "Abril";
        break;
      }
      case 4: {
        this.currentMonth = "Mayo";
        break;
      }
      case 5: {
        this.currentMonth = "Junio";
        break;
      }
      case 6: {
        this.currentMonth = "Julio";
        break;
      }
      case 7: {
        this.currentMonth = "Agosto";
        break;
      }
      case 8: {
        this.currentMonth = "Septiembre";
        break;
      }
      case 9: {
        this.currentMonth = "Octubre";
        break;
      }
      case 10: {
        this.currentMonth = "Noviembre";
        break;
      }
      case 11: {
        this.currentMonth = "Diciembre";
        break;
      } 
    }
  }

}
