import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-resume-student-page',
  templateUrl: './resume-student-page.component.html',
  styleUrls: ['./resume-student-page.component.scss']
})
export class ResumeStudentPageComponent implements OnInit {
  _idStudent: String;
  data: any;
  studentData: any;

  // Datos Alumno
  nombre: String;
  numeroControl: any;
  fechaNacimiento: String;
  lugarNacimiento: String;
  estadoCivil: String;
  correoElectronico: String;
  curp: String;
  nss: any;

  // Dirección
  calle: String;
  colonia: String;
  ciudad: String;
  estado: String;
  cp: any;
  telefono: any;
  etnia: String;
  tipoEtnia: String;
  discapacidad: String;
  tipoDiscapacidad: String;

  // Datos Académicos
  escuelaProcedencia: String;
  otraEscuela: String;
  nombreEP: String;
  promedioEP: Number;
  carreraCursar: String;


  constructor(
    private inscriptionsProv: InscriptionsProvider, 
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
  ) { 
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {
  }

  getIdStudent(){
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
       this.studentData = res.student[0];
       console.log(this.studentData);
       
       // Datos Alumno
       this.nombre = this.studentData.fullName ? this.studentData.fullName : '';
       this.numeroControl = this.studentData.controlNumber ? this.studentData.controlNumber : '';
       this.lugarNacimiento = this.studentData.birthPlace ? this.studentData.birthPlace : '';
       this.estadoCivil = this.studentData.civilStatus ? this.studentData.civilStatus : '';
       this.correoElectronico = this.studentData.email ? this.studentData.email : '';
       this.curp = this.studentData.curp ? this.studentData.curp : '';
       this.nss = this.studentData.nss ? this.studentData.nss : '';
       // Dirección
       this.calle = this.studentData.street ? this.studentData.street : '';
       this.colonia = this.studentData.suburb ? this.studentData.suburb : '';
       this.ciudad = this.studentData.city ? this.studentData.city : '';
       this.estado = this.studentData.state ? this.studentData.state : '';
       this.cp = this.studentData.cp ? this.studentData.cp : '';
       this.telefono = this.studentData.phone ? this.studentData.phone : '';
       this.etnia = this.studentData.etnia ? this.studentData.etnia : '';
       this.tipoEtnia = this.studentData.typeEtnia ? this.studentData.typeEtnia : '';
       this.discapacidad = this.studentData.disability ? this.studentData.disability : '';
       this.tipoDiscapacidad = this.studentData.typeDisability ? this.studentData.typeDisability : '';
       // Datos Académicos
       this.escuelaProcedencia = this.studentData.originSchool ? this.studentData.originSchool : '';
       this.otraEscuela = this.studentData.otherSchool ? this.studentData.otherSchool : '';
       this.nombreEP = this.studentData.nameOriginSchool ? this.studentData.nameOriginSchool : '';
       this.promedioEP = this.studentData.averageOriginSchool ? this.studentData.averageOriginSchool : '';
       this.carreraCursar = this.studentData.career ? this.studentData.career : '';
       
       if(this.etnia == 'No'){
         this.tipoEtnia = ' ';
       }
       if(this.discapacidad == 'No'){
         this.tipoDiscapacidad = ' ';
       }
       if(this.escuelaProcedencia != 'OTRO'){
         this.nombreEP == ' ';
       }
       this.obtenerFechaNacimiento(this.curp);
    });
 }

 obtenerFechaNacimiento(curp){
  var day = curp.substring(8,10);
  var month = curp.substring(6,8);
  var year = curp.substring(4,6);

  this.fechaNacimiento = day+"/"+month+"/"+year;
 }

  async continue(){
    var newStep = {stepWizard:5}
    await this.inscriptionsProv.updateStudent(newStep,this._idStudent.toString()).subscribe(res => {
      this.stepper.next();
    });
  }

}
