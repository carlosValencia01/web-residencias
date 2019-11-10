import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { MatStepper } from '@angular/material/stepper';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { Router } from '@angular/router';
import * as jsPDF from 'jspdf';

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

  //Font Montserrat
  montserratNormal: any;
  montserratBold: any;


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

  loading : boolean;

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
    this.getFonts();
    this.getFolderId();
    this.getStudentData(this._idStudent);
  }

  getFonts() {
    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Regular.ttf').then(base64 => {
        this.montserratNormal = base64.toString().split(',')[1];
    });

    this.imageToBase64Serv.getBase64('assets/fonts/Montserrat-Bold.ttf').then(base64 => {
        this.montserratBold = base64.toString().split(',')[1];
    });
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
    this.loading=true;
    await this.updateStudent(form, this._idStudent);
  }

  async updateStudent(data, id) {
    
    await this.inscriptionsProv.updateStudent(data, id).subscribe(res => {

      this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Generando Solicitud ...', '');
      this.generatePDF();
    }, err=>{});
  }

  async continue() {
    var newStep = { stepWizard: 2, inscriptionStatus: 'En Captura' }
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      this.stepper.next();
      //window.location.assign("/wizardInscription");
    });
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      // console.log(this.studentData);

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
      //this.router.navigate(['/']);
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

    // @ts-ignore
    doc.addFileToVFS('Montserrat-Regular.ttf', this.montserratNormal);
    // @ts-ignore
    doc.addFileToVFS('Montserrat-Bold.ttf', this.montserratBold);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'Normal');
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'Bold');

    // Header
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;

    doc.addImage(this.logoSep, 'PNG', 5, 5, 74, 15); // Logo SEP
    doc.addImage(this.logoTecNM, 'PNG', pageWidth - 47, 2, 39, 17); // Logo TecNM

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.setFontSize(15);
    doc.text("Instituto Tecnológico de Tepic", pageWidth / 2, 30, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(13);
    doc.text("Solicitud de Inscripción", pageWidth / 2, 37, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(13);
    doc.text("Código: ITT-POE-01-02      Revisión: 0", pageWidth / 2, 42, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(13);
    doc.text("Referencia a la Norma ISO 9001-2015:    8.2.2, 8.2.3, 8.2.1, 8.5.2", pageWidth / 2, 47, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
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
    doc.setFont('Montserrat', 'Bold');
    doc.text(15, 72, 'Datos Generales');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.text('Nombre: ', 15, 80);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.apellidoPaterno + ' ' + this.apellidoMaterno + ' ' + this.nombre, 70, 80);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Lugar de nacimiento: ', 15, 85);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.lugarNacimiento, 70, 85);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Fecha de nacimiento: ', 15, 90);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.fechaNacimiento, 70, 90);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Estado Civil: ', 15, 95);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.estadoCivil, 70, 95);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Correo Electrónico: ', 15, 100);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.correoElectronico, 70, 100);

    doc.setFont('Montserrat', 'Bold');
    doc.text('CURP: ', 15, 105);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.curp, 70, 105);

    doc.setFont('Montserrat', 'Bold');
    doc.text('NSS: ', 15, 110);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.nss, 70, 110);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Número de control: ', 15, 115);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.numeroControl, 70, 115);

    // Cuadro 2
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 125, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 135, 190, 35, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Montserrat', 'Bold');
    doc.text(15, 132, 'Dirección');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.text('Calle: ', 15, 140);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.calle, 70, 140);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Colonia: ', 15, 145);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.colonia, 70, 145);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Ciudad: ', 15, 150);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.ciudad, 70, 150);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Estado: ', 15, 155);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.estado, 70, 155);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Código Postal: ', 15, 160);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.cp + '', 70, 160);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Teléfono: ', 15, 165);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.telefono + '', 70, 165);

    // Cuadro 3
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 175, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 185, 190, 25, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Montserrat', 'Bold');
    doc.text(15, 182, 'Datos académicos');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.text('Escuela de procedencia: ', 15, 190);
    doc.setFont('Montserrat', 'Normal');
    doc.setFontSize(9);
    doc.text(this.escuelaProcedencia + ': ' + this.nombreEP, 70, 190);

    doc.setFontSize(12);
    doc.setFont('Montserrat', 'Bold');
    doc.text('Otra: ', 15, 195);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.otraEscuela, 70, 195);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Promedio: ', 15, 200);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.promedioEP + '', 70, 200);

    doc.setFont('Montserrat', 'Bold');
    doc.text('Carrera a cursar: ', 15, 205);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.carreraCursar, 70, 205);

    // Cuadro 4
    doc.setDrawColor(0);
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 215, 190, 10, 'f');

    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230);
    doc.rect(10, 225, 190, 25, 'f');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Montserrat', 'Bold');
    doc.text(15, 222, 'Datos extras');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Montserrat', 'Bold');
    doc.text('¿Perteneces a alguna Etnia? ', 15, 230);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.etnia, 85, 230);

    doc.setFont('Montserrat', 'Bold');
    doc.text('¿Cuál?', 15, 235);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.tipoEtnia, 85, 235);

    doc.setFont('Montserrat', 'Bold');
    doc.text('¿Tienes alguna discapacidad? ', 15, 240);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.discapacidad, 85, 240);

    doc.setFont('Montserrat', 'Bold');
    doc.text('¿Cuál?', 15, 245);
    doc.setFont('Montserrat', 'Normal');
    doc.text(this.tipoDiscapacidad, 85, 245);

    let document = doc.output('arraybuffer');
    let binary = this.bufferToBase64(document);

    //window.open(doc.output('bloburl'), '_blank');

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

    this.inscriptionsProv.getActivePeriod().subscribe(
      period=>{
        if(period.period){
          this.activePeriod = period.period;                      
          this.studentProv.getPeriodId(this._idStudent.toString()).subscribe(
            per=>{
              console.log(per.student.idPeriodInscription, 'idperrrrr');              
              
              if(!per.student.idPeriodInscription){
                this.studentProv.updateStudent(this._idStudent,{idPeriodInscription:this.activePeriod._id});
              }
            }
          );
          //first check folderId on Student model
          this.studentProv.getFolderId(this._idStudent).subscribe(
            student=>{
              if(student.folder){// folder exists
                if(student.folder.idFolderInDrive){
                  this.folderId = student.folder.idFolderInDrive;
                  console.log(this.folderId,'folder student exists');                     
                }
                else{ //folder doesn't exists then create it
                console.log('222');
                
                  this.createFolder();
                }         
              } else{console.log('333');
               this.createFolder();}
                
            });
        }
        else{ // no hay periodo activo
          console.log('444');
          
        }    
      }  
    );
  }

  createFolder(){
    let folderStudentName = this.data.email+' - '+ this.data.name.fullName;
  
    this.inscriptionsProv.getFoldersByPeriod(this.activePeriod._id).subscribe(
      (folders)=>{
        console.log(folders,'folderss');
        
        this.foldersByPeriod=folders.folders;                                     
        let folderPeriod = this.foldersByPeriod.filter( folder=> folder.name.indexOf(this.activePeriod.periodName) !==-1 );

        // 1 check career folder
        let folderCareer = this.foldersByPeriod.filter( folder=> folder.name === this.data.career);

        if(folderCareer.length===0){
          console.log('1');
          
          this.inscriptionsProv.createSubFolder(this.data.career,this.activePeriod._id,folderPeriod[0].idFolderInDrive).subscribe(
            career=>{
              console.log('2');
              
              // student folder doesn't exists then create new folder
              this.inscriptionsProv.createSubFolder(folderStudentName,this.activePeriod._id,career.folder.idFolderInDrive).subscribe(
                studentF=>{
                  this.folderId = studentF.folder.idFolderInDrive;                 
                  console.log('3');
                  
                  this.studentProv.updateStudent(this._idStudent,{folderId:studentF.folder._id});
                },
                err=>{console.log(err);
                }
              );
            },
            err=>{console.log(err);
            }
          );
        }else{
          console.log('2.1');
          
          this.inscriptionsProv.createSubFolder(folderStudentName,this.activePeriod._id,folderCareer[0].idFolderInDrive).subscribe(
            studentF=>{
              this.folderId = studentF.folder.idFolderInDrive;   
              console.log('3.1');
              
              this.studentProv.updateStudent(this._idStudent,{folderId:studentF.folder._id}).subscribe(
                upd=>{
                  
                  
                },
                err=>{
                }
              );
              
            },
            err=>{console.log(err);
            }
          );
        }
      },
      err=>{console.log(err,'==============error');
      }
    );
  }

  saveDocument(document) {
    this.loading=true;
    const documentInfo = {
      mimeType: "application/pdf",
      nameInDrive: this.data.email+'-SOLICITUD.pdf',
      bodyMedia: document,
      folderId: this.folderId,
      newF: true, 
      fileId: ''
    };
    
    this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
      async updated=>{        
        const documentInfo2 = {
          doc:{
            filename:updated.name,
            type:'DRIVE',          
            fileIdInDrive:updated.fileId
          },
          status : {
            name:'EN PROCESO',
            active:true,
            message:'Se envio por primera vez'
          }
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
          },()=>this.loading=false
        );
      },
      err=>{
        console.log(err);
      }
    );
  }

  checkFolders(){
    let folderPeriod = this.foldersByPeriod.filter( folder=> folder.name.indexOf(this.activePeriod.periodName) !==-1 );
    //1 search career folder
    let folderCareer = this.foldersByPeriod.filter( folder=> folder.name === this.data.career);
    
    let folderStudentName = this.data.email+' - '+ this.data.name.fullName;
    
    if(folderCareer.length>0){
      console.log('existo');
      
      // folder exists
      // 2 search folder by student
      let folderStudent = this.foldersByPeriod.filter( folder=> folder.name === folderStudentName);
      if(folderStudent.length > 0){
        // folder exists
        this.folderId = folderStudent[0].idFolderInDrive;
      }else{
        // student folder doesn't exists then create new folder
        this.inscriptionsProv.createSubFolder(folderStudentName,this.activePeriod._id,folderCareer[0].idFolderInDrive).subscribe(
          studentF=>{
            this.folderId = studentF.folder.idFolderInDrive;
          },
          err=>{console.log(err);
          }
        );
      }
    }else{
      // career folder doesn't exist then create it
      this.inscriptionsProv.createSubFolder(this.data.career,this.activePeriod._id,folderPeriod[0].idFolderInDrive).subscribe(
        career=>{
          
          // student folder doesn't exists then create new folder
          this.inscriptionsProv.createSubFolder(folderStudentName,this.activePeriod._id,career.folder.idFolderInDrive).subscribe(
            studentF=>{
              this.folderId = studentF.folder.idFolderInDrive;       
            },
            err=>{console.log(err);
            }
          );
        },
        err=>{console.log(err);
        }
      );
    }
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
