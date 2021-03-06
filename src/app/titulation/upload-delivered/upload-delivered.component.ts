import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { ESignatureProvider } from 'src/app/providers/electronic-signature/eSignature.prov';
import { CurrentPositionService } from 'src/app/services/shared/current-position.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { uRequest } from 'src/app/entities/reception-act/request';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';

import { eFILESCODE } from 'src/app/enumerators/reception-act/document.code.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eRole } from 'src/app/enumerators/app/role.enum';

@Component({
  selector: 'app-upload-delivered',
  templateUrl: './upload-delivered.component.html',
  styleUrls: ['./upload-delivered.component.scss']
})
export class UploadDeliveredComponent implements OnInit {
  private QR;
  public EStamp;
  private cookies;
  private employee;
  public currentPosition;
  public file;
  public password;
  public fileFlag;
  private oRequest: uRequest;
  private reqId;
  private deparment;
  private request;
  public fileName: string;
  public departmentOut: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    public dialogRef: MatDialogRef<UploadDeliveredComponent>,
    private employeeProvider: EmployeeProvider,
    private eSignatureProvider: ESignatureProvider,
    private currentPositionService: CurrentPositionService,
    private notificationsServ: NotificationsServices,
    private cookiesService: CookiesService,
    private requestProvider: RequestProvider,
    private imgService: ImageToBase64Service,
  ) {
    this.reqId = this.data.reqId;
    this.deparment = this.data.department;
    this.departmentOut = this.data.departmentOut ? this.data.departmentOut : '';
  }

  ngOnInit() {
    this.init();
    this.requestProvider.getRequestById(this.reqId).subscribe(data => {
      this.request = data;
    });
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentInit() {
    this.oRequest = new uRequest(this.request, this.imgService, this.cookiesService);
  }

  async init() {
    this.currentPosition = await this.currentPositionService.getCurrentPosition();

    this.cookies = this.cookiesService.getData().user;

    this.employeeProvider.getEmployee(this.cookies.email).subscribe(res => {
      this.employee = res;
    });
  }

  fileChanged(e) {
    this.file = e.target.files[0];
    this.fileFlag = true;
    this.fileName = this.file ? this.file.name : undefined;
  }

  uploadDocument() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (this.file.name.substring(this.file.name.length - 3) === 'itt') {
        const data = {
          password: this.password,
          encrDocString: fileReader.result,
          employeeId: this.employee.employee._id,
          positionId: this.currentPosition._id,
          documentCode: this.deparment === eRole.HEADSCHOOLSERVICE ? eFILESCODE.NO_INCONVENIENCE : eFILESCODE.JURY_OFFICE,
          outDepartmentName: this.deparment === eRole.HEADSCHOOLSERVICE ? 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES' : this.departmentOut
        };
        this.notificationsServ
          .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', this.deparment === eRole.HEADSCHOOLSERVICE ? 'Firmando constancia de no inconveniencia' : 'Firmando oficio de jurado');
        this.eSignatureProvider.sign(data).subscribe(signed => {
          if (signed) {
            this.notificationsServ
              .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', this.deparment === eRole.HEADSCHOOLSERVICE ? 'Constancia de no inconveniencia firmada con éxito' : 'Oficio de jurado firmado con éxito');
            this.QR = signed.qrData;
            this.EStamp = signed.eStamp;
            const req = this.request.request[0];
            req.student = req.studentId;
            this.oRequest.setRequest(req);
            this.dialogRef.close({ response: true, data: { QR: this.QR, ESTAMP: this.EStamp, RESPONSE: true } });
          }
        }, (err: { _body: string }) => {
          const error = err && err._body ? JSON.parse(err._body).err : 'Ocurrió un error';
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', error || 'Ocurrió un error');
        });
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Archivo incorrecto');
      }
    };
    fileReader.readAsText(this.file);
  }
}
