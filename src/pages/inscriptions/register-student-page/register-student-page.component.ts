import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-register-student-page',
  templateUrl: './register-student-page.component.html',
  styleUrls: ['./register-student-page.component.scss']
})
export class RegisterStudentPageComponent implements OnInit {
  registerForm: FormGroup;
  _idStudent: String;
  data: any;
  studentData: any;
  stepWizard : Number;


  // Datos Alumno
  apellidoPaterno: String;
  apellidoMaterno: String;
  nombre: String;
  numeroControl: any;
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

  // Expresiones regulares
  eRCurp = '^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$';
  eRNss = '^[0-9]{11}$';
  eRTelefono = '^[0-9]{10}$';
  eRCp = '^[0-9]{4,5}$';

  constructor(
    private formBuilder: FormBuilder,
    private inscriptionsProv: InscriptionsProvider, 
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
  ) {
    this.estadoCivil = 'Soltero(a)'
    this.estado = 'Nayarit'
    this.etnia = 'No';
    this.tipoEtnia = '';
    this.discapacidad = 'No';
    this.tipoDiscapacidad = '';
    this.escuelaProcedencia = 'CBTIS';
    this.otraEscuela = '';
    this.carreraCursar = 'INGENIERÍA BIOQUÍMICA';
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {
  }

  getIdStudent(){
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  validateForm() {
    this.registerForm = this.formBuilder.group({
      'fatherLastName': [this.apellidoPaterno, [Validators.required]],
      'motherLastName': [this.apellidoMaterno, Validators.required],
      'firstName': [this.nombre, Validators.required],
      'controlNumber': [this.numeroControl, Validators.required],
      'birthPlace': [this.lugarNacimiento, Validators.required],
      'civilStatus' : [this.estadoCivil, Validators.required],
      'email': [this.correoElectronico, [Validators.email,Validators.required]],
      'curp': [this.curp,[Validators.pattern(this.eRCurp),Validators.required]],
      'nss': [this.nss,[Validators.pattern(this.eRNss),Validators.required]],
      'street': [this.calle, Validators.required],
      'suburb': [this.colonia, Validators.required],
      'city': [this.ciudad, Validators.required],
      'state' : [this.estado, Validators.required],
      'cp': [this.cp, [Validators.pattern(this.eRCp),Validators.required]],
      'phone': [this.telefono, [Validators.pattern(this.eRTelefono),Validators.required]],
      'etnia': [this.etnia, Validators.required],
      'typeEtnia' : [this.tipoEtnia, Validators.required],
      'disability' : [this.discapacidad, Validators.required],
      'typeDisability' : [this.tipoDiscapacidad, Validators.required],
      'originSchool' : [this.escuelaProcedencia, Validators.required],
      'otherSchool' : [this.otraEscuela, Validators.required],
      'nameOriginSchool' : [this.nombreEP, Validators.required],
      'averageOriginSchool' : [this.promedioEP, Validators.required],
      'career' : [this.carreraCursar, Validators.required],
    });
  }

  async onFormSubmit(form: NgForm) {
    await this.updateStudent(form,this._idStudent);
  }

  async updateStudent(data,id) {
    await this.inscriptionsProv.updateStudent(data,id).subscribe(res => {
      this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Exito', 'Datos Actualizados');
      var newStep = {stepWizard:2}
      this.inscriptionsProv.updateStudent(newStep,id).subscribe(res => {
        this.stepper.next();
        this.stepper.next();
      });
    });
  }

  getStudentData(id) {
     this.inscriptionsProv.getStudent(id).subscribe(res => {
        this.studentData = res.student[0];
        console.log(this.studentData);

        // Obtener Paso del Wizard
        this.stepWizard = this.studentData.stepWizard ? this.studentData.stepWizard : 1;
        
        // Datos Alumno
        this.apellidoPaterno = this.studentData.fatherLastName ? this.studentData.fatherLastName : '';
        this.apellidoMaterno = this.studentData.motherLastName ? this.studentData.motherLastName : '';
        this.nombre = this.studentData.firstName ? this.studentData.firstName : '';
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

        this.loadStepWizard(this.stepWizard);
        this.validateForm();

        this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Exito', 'Datos Cargados');        
     });
  }

  loadStepWizard(index){
      //this.stepper.selectedIndex = index - 1;
      if(index == 2){
        this.stepper.next();
      }
      if(index == 3){
        this.stepper.next();
        this.stepper.next();
      }
      if(index == 4){
        this.stepper.next();
        this.stepper.next();
        this.stepper.next();
      }
      if(index == 5){
        this.stepper.next();
        this.stepper.next();
        this.stepper.next();
        this.stepper.next();
      }
  }

}
