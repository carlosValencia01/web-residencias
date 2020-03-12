import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { RequestService } from 'src/services/reception-act/request.service';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { ESignatureProvider } from 'src/providers/electronic-signature/eSignature.prov';
import { CurrentPositionService } from 'src/services/shared/current-position.service';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';

@Component({
  selector: 'app-steep-component',
  templateUrl: './steep-component.component.html',
  styleUrls: ['./steep-component.component.scss']
})
export class SteepComponentComponent implements OnInit {
  @ViewChild('stepper') stepperComponent: MatStepper;
  Request: iRequest;
  SteepOneCompleted: boolean;
  SteepTwoCompleted: boolean;
  SteepThreeCompleted: boolean;
  public file;
  public password;
  public QR;
  public EStamp;
  public currentPosition;
  public enableNext;
  public fileFlag;
  public passwordFlag;
  public showLoading = false;
  private cookies;
  private employee;
  private oRequest: uRequest;
  private folderId: string;
  public fileName: string;

  constructor(
    public dialogRef: MatDialogRef<SteepComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public _RequestProvider: RequestProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    public _RequestService: RequestService,
    private employeeProvider: EmployeeProvider,
    private eSignatureProvider: ESignatureProvider,
    private currentPositionService: CurrentPositionService,
    private _ImageToBase64Service: ImageToBase64Service,
    public _StudentProvider: StudentProvider,
  ) {
    this.Request = data.Request;
    this.enableNext = true;
    this.fileFlag = false;
    this.passwordFlag = false;
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    this.currentPosition = await this.currentPositionService.getCurrentPosition(); // this.getPosition();

    this.cookies = this.cookiesService.getData().user;

    this.employeeProvider.getEmployee(this.cookies.email).subscribe(res => {
      this.employee = res;
    });
    this.oRequest = new uRequest(this.Request, this._ImageToBase64Service, this.cookiesService);
    this.getFolder();
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentInit() {
    this.updateRequest(this.Request);
  }

  async updateRequest(request) {
    await this.delay(300);
    this._RequestService.AddRequest(request, eRequest.VERIFIED);
  }

  getFolder(): void {
    this._StudentProvider.getDriveFolderId(this.Request.student.controlNumber, eFOLDER.TITULACION).subscribe(folder => {
      this.folderId = folder.folderIdInDrive;
    });
  }

  Next(index: number): void {
    this.showLoading = true;
    switch (index) {
      case 0: {
        this.SteepOneCompleted = true;
        this.updateSteeps(1);
        this.showLoading = false;
        break;
      }
      case 1: {
        this.SteepTwoCompleted = true;
        this.updateSteeps(2);
        this.showLoading = false;
        break;
      }
      case 2: {
        this.dialogRef.close(true);
        break;
      }
    }
  }

  Back(index: number): void {
    switch (index) {
      case 1: {
        this.updateSteeps(0);
        break;
      }
      case 2: {
        this.updateSteeps(1);
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

  fileChanged(e) {
    this.file = e.target.files[0];
    this.fileFlag = true;
    this.fileName = this.file ? this.file.name : undefined;
  }

  signProjectRegister() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (this.file.name.substring(this.file.name.length - 3) === 'itt') {
        const dataSign = {
          password: this.password,
          encrDocString: fileReader.result,
          employeeId: this.employee.employee._id,
          positionId: this.currentPosition._id,
          documentCode: 'ITT-POS-02-02',
          outDepartmentName: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES'
        };
        this.showLoading = true;
        this.notificationsServ.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Firmando registro de proyecto');
        this.eSignatureProvider.sign(dataSign).subscribe(signed => {
          if (signed) {
            this.QR = signed.qrData;
            this.EStamp = signed.eStamp;
            this.enableNext = false;
            this.notificationsServ.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Registro de proyecto firmado');
            const data = {
              doer: this.cookiesService.getData().user.name.fullName,
              observation: '',
              operation: eStatusRequest.ACCEPT,
              phase: eRequest.VERIFIED,
              folderId: this.folderId,
              file: {
                mimetype: 'application/pdf',
                data: this.oRequest.documentSend(eFILES.REGISTRO, this.QR, this.EStamp),
                name: eFILES.REGISTRO + '.pdf'
              }
            };
            this.notificationsServ.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Actualizando solicitud');
            this._RequestProvider.updateRequest(this.Request._id, data)
              .subscribe(_ => {
                this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
                this.showLoading = false;
                this.Next(1);
              }, _ => {
                this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
                this.showLoading = false;
              });
          }
        }, err => {
          this.showLoading = false;
          const error = JSON.parse(err._body).err;
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
        });
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Archivo incorrecto');
      }
    };
    fileReader.readAsText(this.file);
  }
}
