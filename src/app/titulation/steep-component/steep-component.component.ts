import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatStepper, MAT_DIALOG_DATA } from '@angular/material';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { ESignatureProvider } from 'src/app/providers/electronic-signature/eSignature.prov';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { RequestService } from 'src/app/services/reception-act/request.service';
import { CurrentPositionService } from 'src/app/services/shared/current-position.service';
import { ERoleToAcronym } from 'src/app/enumerators/app/role.enum';

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
  public fileName: string;
  private cookies;
  private employee;
  private oRequest: uRequest;
  private folderId: string;
  private registerObservations: string;
  private filterRole: string
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
    private loadingService: LoadingService,
  ) {
    this.Request = data.Request;
    this.enableNext = true;
    this.fileFlag = false;
    this.passwordFlag = false;
    this.filterRole = (ERoleToAcronym as any)[this.cookiesService.getData().user.rol.name.toLowerCase()];
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
    this.loadingService.setLoading(true);
    switch (index) {
      case 0: {
        this.SteepOneCompleted = true;
        this.updateSteeps(1);
        this.loadingService.setLoading(false);
        break;
      }
      case 1: {
        this.SteepTwoCompleted = true;
        this.updateSteeps(2);
        this.loadingService.setLoading(false);
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
        this.loadingService.setLoading(true);
        this.notificationsServ.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Firmando registro de proyecto');
        this.eSignatureProvider.sign(dataSign).subscribe(signed => {
          if (signed) {
            this.QR = signed.qrData;
            this.EStamp = signed.eStamp;
            this.enableNext = false;
            this.notificationsServ.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Registro de proyecto firmado');
            const observation = {
              phase: eRequest.VERIFIED,
              achievementDate: new Date(),
              achievementDateString: new Date().toString(),
              user: this.cookiesService.getData().user.name.fullName,
              observation: this.registerObservations || '',
              status: eStatusRequest.ACCEPT,
            };
            this.Request.history.push(observation);
            this.oRequest.setRequest(this.Request);
            const data = {
              doer: this.cookiesService.getData().user.name.fullName,
              observation: this.registerObservations || '',
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
            this._RequestProvider.updateRequest(this.Request._id, data,this.filterRole)
              .subscribe(_ => {
                this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
                this.loadingService.setLoading(false);
                this.Next(1);
              }, _ => {
                this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
                this.loadingService.setLoading(false);
              });
          }
        }, err => {
          this.loadingService.setLoading(false);
          const error = JSON.parse(err._body).err;
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
        });
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Archivo incorrecto');
      }
    };
    fileReader.readAsText(this.file);
  }

  onSave(data) {
    this.registerObservations = data;
    this.Next(0);
  }
}
