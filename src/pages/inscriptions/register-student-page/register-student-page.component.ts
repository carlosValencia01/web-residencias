import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatStepper } from '@angular/material/stepper';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { Router } from '@angular/router';

const jsPDF = require('jspdf');

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
  stepWizard: Number;

  activePeriod;
  folderId;
  foldersByPeriod = [];

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
  eRCurp = '^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$';
  eRNss = '^[0-9]{11}$';
  eRTelefono = '^[0-9]{10}$';
  eRCp = '^[0-9]{4,5}$';

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;

  constructor(
    private formBuilder: FormBuilder,
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    private imageToBase64Serv: ImageToBase64Service,
    private studentProv: StudentProvider,
    private router: Router,
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
    this.getFolderId();
    this.getStudentData(this._idStudent);

  }

  ngOnInit() {
    // Convertir imágenes a base 64 para los reportes
    this.imageToBase64Serv.getBase64('assets/imgs/logoTecNM.png').then(res1 => {
      this.logoTecNM = res1;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoEducacionSEP.png').then(res2 => {
      this.logoSep = res2;
    });
    this.imageToBase64Serv.getBase64('assets/imgs/logoITTepic.png').then(res3 => {
      this.logoTecTepic = res3;
    });
  }

  validateForm() {
    this.registerForm = this.formBuilder.group({
      'fatherLastName': [this.apellidoPaterno, [Validators.required]],
      'motherLastName': [this.apellidoMaterno, Validators.required],
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
      'typeEtnia': [this.tipoEtnia,''],
      'disability': [this.discapacidad, Validators.required],
      'typeDisability': [this.tipoDiscapacidad,''],
      'originSchool': [this.escuelaProcedencia, Validators.required],
      'otherSchool': [this.otraEscuela, Validators.required],
      'nameOriginSchool': [this.nombreEP, Validators.required],
      'averageOriginSchool': [this.promedioEP, Validators.required],
      'career': [this.carreraCursar, Validators.required],
    });
  }

  async onFormSubmit(form: NgForm) {
    await this.updateStudent(form, this._idStudent);
  }

  async updateStudent(data, id) {
    await this.inscriptionsProv.updateStudent(data, id).subscribe(res => {
      this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Generando Solicitud ...', '');
      this.generatePDF();
    });
  }

  async continue() {
    var newStep = { stepWizard: 2 }
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      this.stepper.next();
      //window.location.assign("/wizardInscription");
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

      if (this.etnia == 'No') {
        this.tipoEtnia = ' ';
      }
      if (this.discapacidad == 'No') {
        this.tipoDiscapacidad = ' ';
      }
      if (this.escuelaProcedencia != 'OTRO') {
        this.nombreEP == ' ';
      }
      this.obtenerFechaNacimiento(this.curp);
      this.loadStepWizard(this.stepWizard);
      this.validateForm();
    });
  }

  loadStepWizard(index) {
    if (index == 2) {
      this.stepper.next();
    }
    if (index == 3) {
      this.stepper.next();
      this.stepper.next();
    }
    if (index == 4) {
      this.stepper.next();
      this.stepper.next();
      this.stepper.next();
    }
    if (index == 5) {
      this.stepper.next();
      this.stepper.next();
      this.stepper.next();
      this.stepper.next();
    }
    if (index == 6){
      this.router.navigate(['/']);
      //window.location.assign("/");
    }
  }

  obtenerFechaNacimiento(curp) {
    var day = curp.substring(8, 10);
    var month = curp.substring(6, 8);
    var year = curp.substring(4, 6);

    this.fechaNacimiento = day + "/" + month + "/" + year;
  }

  async generatePDF() {
    const doc = new jsPDF();

    // Header
    var pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.addImage(this.logoSep, 'PNG', 5, 5, 65, 18); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 68, 2, 60, 20); // Logo TecNM

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(15);
    doc.setFontStyle('bold');
    doc.text("Instituto Tecnológico de Tepic", pageWidth / 2, 30, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFontType('normal');
    doc.setFontSize(13);
    doc.text("Solicitud de Inscripción", pageWidth / 2, 37, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFontType('normal');
    doc.setFontSize(13);
    doc.text("Código: ITT-POE-01-02      Revisión: 0", pageWidth / 2, 42, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFontType('normal');
    doc.setFontSize(13);
    doc.text("Referencia a la Norma ISO 9001-2015:    8.2.2, 8.2.3, 8.2.1, 8.5.2", pageWidth / 2, 47, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFontType('bold');
    doc.setFontSize(15);
    doc.text("SOLICITUD DE INSCRIPCIÓN", pageWidth / 2, 60, 'center');

    // Cuadro 1
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 65, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 75, 190, 45, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Times');
    doc.setFontType('bold');
    doc.text(15, 72, 'Datos Generales');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Times');

    doc.setFontType('bold');
    doc.text('Nombre: ', 15, 80);
    doc.setFontType('normal');
    doc.text(this.apellidoPaterno + ' ' + this.apellidoMaterno + ' ' + this.nombre, 80, 80);

    doc.setFontType('bold');
    doc.text('Lugar de nacimiento: ', 15, 85);
    doc.setFontType('normal');
    doc.text(this.lugarNacimiento, 80, 85);

    doc.setFontType('bold');
    doc.text('Fecha de nacimiento: ', 15, 90);
    doc.setFontType('normal');
    doc.text(this.fechaNacimiento, 80, 90);

    doc.setFontType('bold');
    doc.text('Estado Civil: ', 15, 95);
    doc.setFontType('normal');
    doc.text(this.estadoCivil, 80, 95);

    doc.setFontType('bold');
    doc.text('Correo Electrónico: ', 15, 100);
    doc.setFontType('normal');
    doc.text(this.correoElectronico, 80, 100);

    doc.setFontType('bold');
    doc.text('CURP: ', 15, 105);
    doc.setFontType('normal');
    doc.text(this.curp, 80, 105);

    doc.setFontType('bold');
    doc.text('NSS: ', 15, 110);
    doc.setFontType('normal');
    doc.text(this.nss, 80, 110);

    doc.setFontType('bold');
    doc.text('Número de control: ', 15, 115);
    doc.setFontType('normal');
    doc.text(this.numeroControl, 80, 115);

    // Cuadro 2
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 125, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 135, 190, 35, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Times');
    doc.setFontType('bold');
    doc.text(15, 132, 'Dirección');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Times');

    doc.setFontType('bold');
    doc.text('Calle: ', 15, 140);
    doc.setFontType('normal');
    doc.text(this.calle, 80, 140);

    doc.setFontType('bold');
    doc.text('Colonia: ', 15, 145);
    doc.setFontType('normal');
    doc.text(this.colonia, 80, 145);

    doc.setFontType('bold');
    doc.text('Ciudad: ', 15, 150);
    doc.setFontType('normal');
    doc.text(this.ciudad, 80, 150);

    doc.setFontType('bold');
    doc.text('Estado: ', 15, 155);
    doc.setFontType('normal');
    doc.text(this.estado, 80, 155);

    doc.setFontType('bold');
    doc.text('Código Postal: ', 15, 160);
    doc.setFontType('normal');
    doc.text(this.cp + '', 80, 160);

    doc.setFontType('bold');
    doc.text('Teléfono: ', 15, 165);
    doc.setFontType('normal');
    doc.text(this.telefono + '', 80, 165);

    // Cuadro 3
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 175, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 185, 190, 25, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Times');
    doc.setFontType('bold');
    doc.text(15, 182, 'Datos académicos');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Times');

    doc.setFontType('bold');
    doc.text('Escuela de procedencia: ', 15, 190);
    doc.setFontType('normal');
    doc.text(this.escuelaProcedencia + ': ' + this.nombreEP, 80, 190);

    doc.setFontType('bold');
    doc.text('Otra: ', 15, 195);
    doc.setFontType('normal');
    doc.text(this.otraEscuela, 80, 195);

    doc.setFontType('bold');
    doc.text('Promedio: ', 15, 200);
    doc.setFontType('normal');
    doc.text(this.promedioEP + '', 80, 200);

    doc.setFontType('bold');
    doc.text('Carrera a cursar: ', 15, 205);
    doc.setFontType('normal');
    doc.text(this.carreraCursar, 80, 205);

    // Cuadro 4
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 215, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 225, 190, 25, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Times');
    doc.setFontType('bold');
    doc.text(15, 222, 'Datos extras');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Times');

    doc.setFontType('bold');
    doc.text('¿Perteneces a alguna Etnia? ', 15, 230);
    doc.setFontType('normal');
    doc.text(this.etnia, 80, 230);

    doc.setFontType('bold');
    doc.text('¿Cuál?', 15, 235);
    doc.setFontType('normal');
    doc.text(this.tipoEtnia, 80, 235);

    doc.setFontType('bold');
    doc.text('¿Tienes alguna discapacidad? ', 15, 240);
    doc.setFontType('normal');
    doc.text(this.discapacidad, 80, 240);

    doc.setFontType('bold');
    doc.text('¿Cuál?', 15, 245);
    doc.setFontType('normal');
    doc.text(this.tipoDiscapacidad, 80, 245);

    let document = doc.output('arraybuffer');
    let binary = this.bufferToBase64(document);
    await this.saveDocument(binary);
  }

  bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte)=> {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  getFolderId() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
    this.inscriptionsProv.getAllPeriods().subscribe(
      periods => {
        this.activePeriod = periods.periods.filter(period => period.active === true)[0];
        if (this.activePeriod) {
          this.inscriptionsProv.getFoldersByPeriod(this.activePeriod._id).subscribe(
            folders => {
              this.foldersByPeriod = folders.folders;
              if (this.foldersByPeriod.length > 0) {
                let folderStudentName = this.data.email + ' - ' + this.data.name.fullName;
                let folderStudent = this.foldersByPeriod.filter(folder => folder.name === folderStudentName);
                if (folderStudent.length > 0) {
                  // folder exists
                  this.folderId = folderStudent[0].idFolderInDrive;
                }
              }
            },
            err => {
              console.log(err, '==============error');
            }
          );
        }
      }
    );
  }

  saveDocument(document) {
    const documentInfo = {
      mimeType: "application/pdf",
      nameInDrive: this.data.email+'-SOLICITUD.pdf',
      bodyMedia: document,
      folderId: this.folderId
    };
    
    this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
      async updated=>{
        const documentInfo2 = {
          filename:updated.name,
          type:'DRIVE',
          status:'EN PROCESO',
          fileIdInDrive:updated.fileId
        };
        await this.studentProv.uploadDocumentDrive(this.data._id,documentInfo2).subscribe(
          updated=>{
            this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud enviada correctamente.'); 
            if(updated){
              this.continue();   
            }   
          },
          err=>{
            console.log(err);
          }
        );
      },
      err=>{
        console.log(err);
      }
    );
  }

}
