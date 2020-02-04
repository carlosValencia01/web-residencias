import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from '../../../enumerators/app/notificationType.enum';
import { EmployeeProvider } from 'src/providers/shared/employee.prov';
import { ESignatureProvider } from 'src/providers/electronic-signature/eSignature.prov';
import { CurrentPositionService } from 'src/services/shared/current-position.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from '../../../services/app/cookie.service';
import { uRequest } from 'src/entities/reception-act/request';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { eRequest } from '../../../enumerators/reception-act/request.enum';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';



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
  private request;

  constructor(
    public dialogRef: MatDialogRef<UploadDeliveredComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private employeeProvider: EmployeeProvider,
    private eSignatureProvider: ESignatureProvider,
    private currentPositionService: CurrentPositionService,
    private notificationsServ: NotificationsServices,
    private cookiesService: CookiesService,
    private requestProvider: RequestProvider,
    private imgService: ImageToBase64Service, ) {
    this.reqId = this.data.reqId;
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
          documentCode: 'ITT-POS-03-02',
          outDepartmentName: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES'
        };
        this.eSignatureProvider.sign(data).subscribe(signed => {
          if (signed) {
            this.QR = signed.qrData;
            this.EStamp = signed.eStamp;
            const req = this.request.request[0];
            req.student = req.studentId;
            this.oRequest.setRequest(req);
            this.dialogRef.close({ QR: this.QR, ESTAMP: this.EStamp, RESPONSE: true });
            // window.open(this.oRequest.noInconvenience(this.QR, this.EStamp).output('bloburl'), '_blank');            
          }
        }, err => {
          const error = JSON.parse(err._body).err;
          this.notificationsServ.showNotification(eNotificationType.ERROR, error, '');
        });
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Archivo incorrecto', '');
      }
    };
    fileReader.readAsText(this.file);
  }

}
