import { Component, OnInit } from '@angular/core';
import { eFILES } from 'src/enumerators/document.enum';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {

  public UploadActa: any;
  public UploadCurp: any;
  public UploadCertificado: any;
  public UploadCedula: any;
  public UploadLicenciatura: any;
  public UploadServicio: any;
  public UploadIngles: any;
  public UploadPago: any;
  public UploadRevalidacion: any;
  constructor() { }

  ngOnInit() {
  }

  onRemove(file): void {

    const type = <eFILES><keyof typeof eFILES>file;
    switch (type) {
      case eFILES.ACTA_NACIMIENTO: {
        this.UploadActa = null;
        break;
      }
      case eFILES.CURP: {
        this.UploadCurp = null;
        break;
      }
      case eFILES.CERTIFICADO_B: {
        this.UploadCertificado =null;
        break;
      }
      case eFILES.CEDULA: {
        this.UploadCedula = null;
        break;
      }
      case eFILES.CERTIFICADO_L: {
        this.UploadLicenciatura =null;
        break;
      }
      case eFILES.SERVICIO: {
        this.UploadServicio = null;
        break;
      }
      case eFILES.INGLES: {
        this.UploadIngles = null;
        break;
      }
      case eFILES.PAGO: {
        this.UploadPago = null;
        break;
      }
      case eFILES.CERTIFICADO_R: {
        this.UploadRevalidacion = null;
        break;
      }
    }
  }

  onUpload(event, file): void {
    console.log("event", event);
    if (typeof (event.target.files) !== 'undefined' && event.target.files.length > 0) {
      const type = <eFILES><keyof typeof eFILES>file;
      switch (type) {
        case eFILES.ACTA_NACIMIENTO: {
          this.UploadActa = event.target.files[0];
          break;
        }
        case eFILES.CURP: {
          this.UploadCurp = event.target.files[0];
          break;
        }
        case eFILES.CERTIFICADO_B: {
          this.UploadCertificado = event.target.files[0];
          break;
        }
        case eFILES.CEDULA: {
          this.UploadCedula = event.target.files[0];
          break;
        }
        case eFILES.CERTIFICADO_L: {
          this.UploadLicenciatura = event.target.files[0];
          break;
        }
        case eFILES.SERVICIO: {
          this.UploadServicio = event.target.files[0];
          break;
        }
        case eFILES.INGLES: {
          this.UploadIngles = event.target.files[0];
          break;
        }
        case eFILES.PAGO: {
          this.UploadPago = event.target.files[0];
          break;
        }
        case eFILES.CERTIFICADO_R: {
          this.UploadRevalidacion = event.target.files[0];
          break;
        }
      }
    }
  }
}
