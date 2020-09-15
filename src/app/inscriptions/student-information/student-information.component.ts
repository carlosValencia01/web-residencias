import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

@Component({
  selector: 'app-student-information',
  templateUrl: './student-information.component.html',
  styleUrls: ['./student-information.component.scss']
})
export class StudentInformationComponent implements OnInit {

  title = 'INFORMACIÓN DEL ESTUDIANTE';
  registerForm: FormGroup;
  studentData: any;

  // Datos Alumno
  apellidoPaterno: String;
  apellidoMaterno: String;
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

   // Expresiones regulares
   eRCurp = '^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$';
   eRNss = '^[0-9]{11}$';
   eRTelefono = '^[0-9]{10}$';
   eRCp = '^[0-9]{4,5}$';

  constructor(
    public dialogRef: MatDialogRef<StudentInformationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inscriptionsProv: InscriptionsProvider,
    private formBuilder: FormBuilder,
    private notificationsServices: NotificationsServices,
    private loadingService: LoadingService,
  ) {
    this.getInformation();
  }

  ngOnInit() {
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  getInformation(){
    this.studentData = this.data.student;

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
    this.etnia = this.studentData.etnia ? this.studentData.etnia : 'No';
    this.tipoEtnia = this.studentData.typeEtnia ? this.studentData.typeEtnia : ' ';
    this.discapacidad = this.studentData.disability ? this.studentData.disability : 'No';
    this.tipoDiscapacidad = this.studentData.typeDisability ? this.studentData.typeDisability : ' ';
    // Datos Académicos
    this.escuelaProcedencia = this.studentData.originSchool ? this.studentData.originSchool : 'CBTIS';
    this.otraEscuela = this.studentData.otherSchool ? this.studentData.otherSchool : ' ';
    this.nombreEP = this.studentData.nameOriginSchool ? this.studentData.nameOriginSchool : '';
    this.promedioEP = this.studentData.averageOriginSchool ? this.studentData.averageOriginSchool : '';
    this.carreraCursar = this.studentData.career ? this.studentData.career : '';

    if (this.etnia == 'No') {
      this.tipoEtnia = ' ';
    }
    if (this.discapacidad == 'No') {
      this.tipoDiscapacidad = ' ';
    }
    if (this.escuelaProcedencia != 'OTRO') {
      this.otraEscuela = ' ';
    }
    this.validateForm();
  }

  validateForm() {
    this.registerForm = this.formBuilder.group({
      'fatherLastName': [this.apellidoPaterno, [Validators.required]],
      'motherLastName': [this.apellidoMaterno],
      'firstName': [this.nombre, Validators.required],
      'controlNumber': [this.numeroControl, Validators.required],
      'birthPlace': [this.lugarNacimiento, Validators.required],
      'civilStatus': [this.estadoCivil, Validators.required],
      'email': [this.correoElectronico, [Validators.email, Validators.required]],
      'curp': [this.curp, [Validators.pattern(this.eRCurp), Validators.required]],
      'nss': [this.nss, [Validators.pattern(this.eRNss), Validators.required]],
      'street': [this.calle, Validators.required],
      'suburb': [this.colonia, Validators.required],
      'city': [this.ciudad, Validators.required],
      'state': [this.estado, Validators.required],
      'cp': [this.cp, [Validators.pattern(this.eRCp), Validators.required]],
      'phone': [this.telefono, [Validators.pattern(this.eRTelefono), Validators.required]],
      'etnia': [this.etnia, Validators.required],
      'typeEtnia': [this.tipoEtnia,Validators.required],
      'disability': [this.discapacidad, Validators.required],
      'typeDisability': [this.tipoDiscapacidad,Validators.required],
      'originSchool': [this.escuelaProcedencia, Validators.required],
      'otherSchool': [this.otraEscuela, Validators.required],
      'nameOriginSchool': [this.nombreEP, Validators.required],
      'averageOriginSchool': [this.promedioEP, Validators.required],
      'career': [this.carreraCursar, Validators.required],
    });
  }

  async onFormSubmit(form: NgForm) {
    this.loadingService.setLoading(true);
    await this.updateStudent(form, this.studentData._id);
  }

  async updateStudent(data, id) {
    await this.inscriptionsProv.updateStudent(data, id).subscribe(res => {
      // Actualizar fullName
      var newFullName = data.firstName+' '+data.fatherLastName+' '+data.motherLastName ;
      this.inscriptionsProv.updateStudent({fullName:newFullName}, id).subscribe(res => {
      });
    }, err=>{},
    ()=>{
      this.loadingService.setLoading(false)
      this.onClose();
      this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Datos Actualizados.');
    });
  }

  changeEventEtnia(){
    if (this.etnia == 'No') {
      this.tipoEtnia = ' ';
    }
    if (this.etnia == 'Si') {
      this.tipoEtnia = '';
    }
    this.validateForm();
  }

  changeEventDiscapacidad(){
    if (this.discapacidad == 'No') {
      this.tipoDiscapacidad = ' ';
    }
    if (this.discapacidad == 'Si') {
      this.tipoDiscapacidad = '';
    }
    this.validateForm();
  }

  changeEventEProcedencia(){
    if (this.escuelaProcedencia != 'OTRO') {
      this.otraEscuela = ' ';
    }
    if (this.escuelaProcedencia == 'OTRO') {
      this.otraEscuela = '';
    }
    this.validateForm();
  }

}
