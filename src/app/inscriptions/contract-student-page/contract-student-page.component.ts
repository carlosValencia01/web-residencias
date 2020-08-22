import { Component, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { uInscription } from 'src/app/entities/inscriptions/inscriptions';

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

  

  emptyUInscription: uInscription;
  constructor(
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private imageToBase64Serv: ImageToBase64Service,
    private studentProv: StudentProvider,
    private loadingService: LoadingService,
  ) {
    this.currentDate = new Date();
    this.convertNumericalMonth();
    this.getIdStudent();
    this.getFolderId();
  }

  ngOnInit() {
    this.data = this.cookiesServ.getData().user;
    this.nameStudent = this.data.name.fullName;
    this.acceptedTerms = false;
    setTimeout(() => {      
      this.emptyUInscription = new uInscription(this.imageToBase64Serv,this.cookiesServ,this.inscriptionsProv);
    }, 300);
   
  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  onChange(event) {
    this.acceptedTerms = !this.acceptedTerms;
  }

  async continue() {
    this.loadingService.setLoading(true);
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
    
    
    //window.open(doc.output('bloburl'), '_blank');
    const doc = this.emptyUInscription.generateContrato(this.data.name.fullName,currentDate);
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
    this.studentProv.getDriveFolderId(this.cookiesServ.getData().user.email,eFOLDER.INSCRIPCIONES).subscribe(
      (folder)=>{
         this.folderId =  folder.folderIdInDrive;
       },
       err=>{console.log(err);
       }
       );
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

          }, () => this.loadingService.setLoading(false)
        );
      },
      err=>{
        console.log(err);
        this.loadingService.setLoading(false);
      }
    );
  }

  async nextStep(){
    var newStep = { stepWizard: 5 }
      this.inscriptionsProv.updateStudent(newStep,this._idStudent.toString()).subscribe(res => {
        //this.stepper.next();
        window.location.assign("/inscriptions/wizardInscription");
      });
  }

}
