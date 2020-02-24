import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { environment } from 'src/environments/environment';
import { eFILES } from 'src/enumerators/reception-act/document.enum';

@Component({
  selector: 'app-stepper-document',
  templateUrl: './stepper-document.component.html',
  styleUrls: ['./stepper-document.component.scss']
})
export class StepperDocumentComponent implements OnInit {
  @ViewChild('stepper') stepperComponent: MatStepper;
  SteepOneCompleted: boolean;
  SteepTwoCompleted: boolean;
  SteepThreeCompleted: boolean;
  fileUpload: any;
  private tmpFileData: string;
  public fileData: string;
  public pdf: any;
  public existsFileHelper: boolean;
  public existsVideoHelper: boolean;
  public URLFile: string;
  public URLVideo: string;
  public title: string;
  private MAX_SIZE_FILE = 2097152;

  constructor(
    public dialogRef: MatDialogRef<StepperDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _NotificationsServices: NotificationsServices,
  ) {
    this.onLoad(data.Documento);
  }

  onLoad(document: string): void {
    const type = <eFILES><keyof typeof eFILES>document;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        this.title = 'AYUDA DE ACTA DE NACIMIENTO';
        this.existsFileHelper = environment.documentHelper.birthCertificate.file !== '';
        this.existsVideoHelper = environment.documentHelper.birthCertificate.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.birthCertificate.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.birthCertificate.video : '';
        break;
      }
      case eFILES.CURP: {
        this.title = 'AYUDA DE CURP';
        this.existsFileHelper = environment.documentHelper.curp.file !== '';
        this.existsVideoHelper = environment.documentHelper.curp.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.curp.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.curp.video : '';
        break;
      }
      case eFILES.CERTIFICADO_B: {
        this.title = 'AYUDA DE CERTIFICADO DE BACHILLERATO';
        this.existsFileHelper = environment.documentHelper.bachlersDegree.file !== '';
        this.existsVideoHelper = environment.documentHelper.bachlersDegree.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.bachlersDegree.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.bachlersDegree.video : '';
        break;
      }
      case eFILES.CEDULA: {
        this.title = 'AYUDA DE CÉDULA TÉCNICA';
        this.existsFileHelper = environment.documentHelper.technicalID.file !== '';
        this.existsVideoHelper = environment.documentHelper.technicalID.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.technicalID.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.technicalID.video : '';
        break;
      }
      case eFILES.CERTIFICADO_L: {
        this.title = 'AYUDA DE CERTIFICADO DE LICENCIATURA';
        this.existsFileHelper = environment.documentHelper.degreeCertificate.file !== '';
        this.existsVideoHelper = environment.documentHelper.degreeCertificate.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.degreeCertificate.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.degreeCertificate.video : '';
        break;
      }
      case eFILES.SERVICIO: {
        this.title = 'AYUDA DE SERVICIO SOCIAL';
        this.existsFileHelper = environment.documentHelper.socialService.file !== '';
        this.existsVideoHelper = environment.documentHelper.socialService.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.socialService.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.socialService.video : '';
        break;
      }
      case eFILES.INGLES: {
        this.title = 'AYUDA DE LIBERACIÓN DE INGLÉS';
        this.existsFileHelper = environment.documentHelper.constancyOfEnglish.file !== '';
        this.existsVideoHelper = environment.documentHelper.constancyOfEnglish.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.constancyOfEnglish.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.constancyOfEnglish.video : '';
        break;
      }
      case eFILES.PAGO: {
        this.title = 'AYUDA DE RECIBO DE PAGO';
        this.existsFileHelper = environment.documentHelper.receiptOfPayment.file !== '';
        this.existsVideoHelper = environment.documentHelper.receiptOfPayment.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.receiptOfPayment.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.receiptOfPayment.video : '';
        break;
      }
      case eFILES.CERTIFICADO_R: {
        this.title = 'AYUDA DE REVALIDACIÓN';
        this.existsFileHelper = environment.documentHelper.revalidation.file !== '';
        this.existsVideoHelper = environment.documentHelper.revalidation.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.revalidation.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.revalidation.video : '';
        break;
      }
      case eFILES.INE: {
        this.title = 'AYUDA DE INE';
        this.existsFileHelper = environment.documentHelper.ine.file !== '';
        this.existsVideoHelper = environment.documentHelper.ine.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.ine.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.ine.video : '';
        break;
      }
      case eFILES.XML: {
        this.title = 'AYUDA DE XML DE CÉDULA';
        this.existsFileHelper = environment.documentHelper.xml.file !== '';
        this.existsVideoHelper = environment.documentHelper.xml.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.xml.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.xml.video : '';
        break;
      }
      case eFILES.CED_PROFESIONAL: {
        this.title = 'AYUDA DE CÉDULA PROFESIONAL';
        this.existsFileHelper = environment.documentHelper.professionalID.file !== '';
        this.existsVideoHelper = environment.documentHelper.professionalID.video !== '';
        this.URLFile = this.existsFileHelper ? environment.documentHelper.professionalID.file : '';
        this.URLVideo = this.existsVideoHelper ? environment.documentHelper.professionalID.video : '';
        break;
      }
    }
  }
  ngOnInit() {
  }


  onUpload(event): void {
    this.fileUpload = null;
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        if (event.target.files[0].size > this.MAX_SIZE_FILE) {
          this._NotificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, su archivo debe ser inferior a 2MB');
        } else {
          this.fileUpload = event.target.files[0];
          this.pdf = URL.createObjectURL(this.fileUpload);
        }
      } else {
        this._NotificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, su archivo debe ser de tipo PDF');
      }
    }
  }

  Next(index: number): void {
    switch (index) {
      case 0:
        {
          this.SteepOneCompleted = true;
          this.updateSteeps(1);
          break;
        }
      case 1: {
        this.SteepTwoCompleted = true;
        this.fileData = undefined;
        this.updateSteeps(2);
        break;
      }
      case 2: {
        this.dialogRef.close({ file: this.fileUpload });
        break;
      }
    }
  }

  Back(index: number): void {
    switch (index) {
      case 1: {
        this.updateSteeps(0);
        this.SteepOneCompleted = false;
        break;
      }
      case 2: {
        this.fileData = this.tmpFileData;
        this.fileUpload = undefined;
        this.updateSteeps(1);
        this.SteepTwoCompleted = false;
        break;
      }
    }
  }

  async updateSteeps(index: number) {
    await this.delay(150);
    this.stepperComponent.selectedIndex = index;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
