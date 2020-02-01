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
import * as moment from 'moment';
import {FormControl, Validators} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {IDepartment} from '../../../entities/shared/department.model';
import {DepartmentProvider} from 'src/providers/shared/department.prov';

@Component({
  selector: 'app-steep-component',
  templateUrl: './steep-component.component.html',
  styleUrls: ['./steep-component.component.scss']
})
export class SteepComponentComponent implements OnInit {
  @ViewChild('stepper') stepperComponent: MatStepper;
  Request: iRequest;
  ObjectRequestTmp: iRequest;
  ObjectRequest: iRequest;
  SteepOneCompleted: boolean;
  SteepTwoCompleted: boolean;
  SteepThreeCompleted: boolean;
  public file;
  public password;
  private QR;
  public EStamp;
  private cookies;
  private employee;
  public currentPosition;
  public departmentControl: FormControl;
  public filteredDepartments: Observable<Array<IDepartment>>;
  private departments: Array<IDepartment>;
  public enableNext;
  public fileFlag;
  public passwordFlag;

  constructor(
    public dialogRef: MatDialogRef<SteepComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public _RequestProvider: RequestProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    public _RequestService: RequestService,
    private employeeProvider: EmployeeProvider,
    private eSignatureProvider: ESignatureProvider,
    private currentPositionService: CurrentPositionService
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

    this.employeeProvider.getEmployee(this.cookies.email).subscribe( res => {
      this.employee = res;
    });
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentInit() {
    this.updateRequest(this.Request);
    // this._RequestService.AddRequest(this.Request, eRequest.VERIFIED);
  }

  async updateRequest(request) {
    await this.delay(150);
    this._RequestService.AddRequest(request, eRequest.VERIFIED);
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
        this.updateSteeps(2);
        break;
      }
      case 2: {
        const data = {
          doer: this.cookiesService.getData().user.name.fullName,
          observation: '',
          operation: eStatusRequest.ACCEPT,
          phase: this.Request.phase
        };

        this._RequestProvider.updateRequest(this.Request._id, data).subscribe(data => {
          this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
          this.dialogRef.close(true);
        }, error => {
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
          this.dialogRef.close(false);
        });
        break;
      }
    }
  }

  Back(index: number): void {
    switch (index) {
      case 1: {
        // this.stepperComponent.selectedIndex = 0;
        // this.SteepOneCompleted = false;
        this.updateSteeps(0);
        break;
      }
      case 2: {
        this.updateSteeps(1);
        // this.stepperComponent.selectedIndex = 1;
        // this.SteepTwoCompleted = false;
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
          documentCode: 'ITT-POS-02-02',
          outDepartmentName: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES'
        };
        this.eSignatureProvider.sign(data).subscribe(signed => {
          if (signed) {
            this.QR = signed.qrData;
            this.EStamp = signed.eStamp;
            this.enableNext = false;
            this.Next(1);
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
