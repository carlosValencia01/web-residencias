import { Component, OnInit } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';
import { MatStepper } from '@angular/material/stepper';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { StudentProvider } from 'src/providers/shared/student.prov';



const jsPDF = require('jspdf');

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
  currentUsername: String;

  activePeriod;
  folderId;
  foldersByPeriod = [];

  alumno: Object;
  fieldFirstName: String;
  fieldLastNameFather: String;
  fieldLastNameMother: String;
  currentDate: Date;
  currentMonth: String;

  loading : boolean;

  // Imagenes para Reportes
  public logoTecNM: any;
  public logoSep: any;
  public logoTecTepic: any;
  public firmaDirector: any;

  constructor(
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private imageToBase64Serv: ImageToBase64Service,
    private studentProv: StudentProvider,
  ) {
    this.currentDate = new Date();
    this.convertNumericalMonth();
    this.getIdStudent();
    this.getFolderId();
    // console.log(this.currentDate);
  }

  ngOnInit() {
    this.data = this.cookiesServ.getData().user;
    this.nameStudent = this.data.name.fullName;
    this.acceptedTerms = false;
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
    this.imageToBase64Serv.getBase64('assets/imgs/firmaDirector.png').then(res4 => {
      this.firmaDirector = res4;
    })
  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  onChange(event) {
    this.acceptedTerms = !this.acceptedTerms;
    // console.log(this.acceptedTerms);
  }

  async continue() {
    this.loading=true;
    var data = { acceptedTerms: this.acceptedTerms, dateAcceptedTerms: this.currentDate }
    await this.updateStudent(data, this._idStudent);
    
  }

  async updateStudent(data, id) {
    await this.inscriptionsProv.updateStudent(data, id).subscribe(res => {
        this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Generando Contrato ...', 'Esto puede tardar unos minutos');
        this.generatePDF();
    });
  }  

  convertNumericalMonth() {
    switch (this.currentDate.getMonth()) {
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

  async generatePDF() {
    const currentDate = new Date();
    const img = new Image();
    img.src = 'https://i.ibb.co/yy0GrBq/Contrato-Estudiante-ITT.jpg';
    const doc = new jsPDF();

    doc.addImage(img, 'jpg', 0, 0, 200, 295);

    doc.setFontSize(8);
    doc.setFontType('bold');
    doc.text(`${this.data.name.fullName}`, 132, 262);

    doc.addImage(this.firmaDirector, 'jpg', 25, 220, 80, 43);

    doc.setFontSize(8);
    doc.setFontType('bold');
    doc.text(currentDate.getDate() + '', 129, 45);

    doc.setFontSize(8);
    doc.setFontType('bold');
    const currentMonth = currentDate.getMonth();
    let newMonth;
    switch (currentMonth) {
      case 0: {
        newMonth = 'Enero'; break;
      }
      case 1: {
        newMonth = 'Febrero'; break;
      }
      case 2: {
        newMonth = 'Marzo'; break;
      }
      case 3: {
        newMonth = 'Abril'; break;
      }
      case 4: {
        newMonth = 'Mayo'; break;
      }
      case 5: {
        newMonth = 'Junio'; break;
      }
      case 6: {
        newMonth = 'Julio'; break;
      }
      case 7: {
        newMonth = 'Agosto'; break;
      }
      case 8: {
        newMonth = 'Septiembre'; break;
      }
      case 9: {
        newMonth = 'Octubre'; break;
      }
      case 10: {
        newMonth = 'Noviembre'; break;
      }
      case 11: {
        newMonth = 'Diciembre'; break;
      }
    }
    doc.text(newMonth, 149, 45);

    doc.setFontSize(8);
    doc.setFontType('bold');
    doc.text(currentDate.getFullYear() + '', 174, 45);

    //window.open(doc.output('bloburl'), '_blank');

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
    this.studentProv.getFolderId(this._idStudent).subscribe(
      student=>{
        // console.log(student,'contratooo');
        if(student.folder){// folder exists
          if(student.folder.idFolderInDrive){
            this.folderId = student.folder.idFolderInDrive;
            // console.log(this.folderId,'folder student exists');                     
          }
        }          
      });
  }

  saveDocument(document) {
    const documentInfo = {
      mimeType: "application/pdf",
      nameInDrive: this.data.email+'-CONTRATO.pdf',
      bodyMedia: document,
      folderId: this.folderId,
      newF: true, 
      fileId: ''
    };
    
    this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
      updated=>{
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
        this.studentProv.uploadDocumentDrive(this.data._id,documentInfo2).subscribe(
          updated=>{
            this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Exito', 'Contrato enviada correctamente.');    
            this.nextStep();
          },
          err=>{
            console.log(err);
            
          }, ()=>this.loading=false
        );
      },
      err=>{
        console.log(err);
        this.loading=false
      }
    );
  }

  async nextStep(){
    var newStep = { stepWizard: 4 }
      this.inscriptionsProv.updateStudent(newStep,this._idStudent.toString()).subscribe(res => {
        //this.stepper.next();
        window.location.assign("/wizardInscription");
      });
  }

}
