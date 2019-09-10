import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RequestProvider } from 'src/providers/request.prov';
import { iRequest } from 'src/entities/request.model';
import { eStatusRequest } from 'src/enumerators/statusRequest.enum';
import { CookiesService } from 'src/services/cookie.service';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';

@Component({
  selector: 'app-steep-component',
  templateUrl: './steep-component.component.html',
  styleUrls: ['./steep-component.component.scss']
})
export class SteepComponentComponent implements OnInit {
  @ViewChild('stepper') stepperComponent: MatStepper;
  //@Input('Request') RequestId: String;    
  RequestId: String;
  Request: String;
  ObjectRequestTmp: iRequest;
  ObjectRequest: iRequest;
  SteepOneCompleted: boolean;
  SteepTwoCompleted: boolean;
  SteepThreeCompleted: boolean;
  constructor(public dialogRef: MatDialogRef<SteepComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data, public _RequestProvider: RequestProvider,
    private cookiesService: CookiesService, private notificationsServ: NotificationsServices) {
    this.RequestId = data.Request;
  }

  ngOnInit() {
  }
  ngAfterContentInit() {
    this.Request = this.RequestId;
    this._RequestProvider.getRequestById(this.RequestId).subscribe(
      data => {
        // console.log("reques", this.data);
        //this.ObjectRequestTmp = <iRequest>data.request[0];
        this.ObjectRequestTmp = <iRequest>data.request[0];
        this.ObjectRequestTmp.student = data.request[0].studentId;
        this.ObjectRequestTmp.studentId = this.ObjectRequestTmp.student._id;        
        console.log("object tmp", this.ObjectRequestTmp);
        // this.ObjectRequestTmp.student = data.request[0].studentId;
        // this.ObjectRequestTmp.studentId = this.ObjectRequest.student._id;
      }
    )
    //this.ObjectRequest = this.ObjectRequestTmp;
    console.log("RTEQUEST", this.RequestId);
    
  }




  Next(index: number): void {
    switch (index) {
      case 0:
        {
          //this.stepperComponent.selectedIndex = 1;
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
        let data = {
          doer: this.cookiesService.getData().user.name.fullName,
          observation: '',
          operation: eStatusRequest.ACCEPT,
          phase: this.ObjectRequestTmp.phase
        };

        this._RequestProvider.updateRequest(this.RequestId, data).subscribe(data => {
          this.notificationsServ.showNotification(eNotificationType.SUCCESS, "Titulación App", "Solicitud Actualizada");
          this.dialogRef.close(true);
        }, error => {
          this.notificationsServ.showNotification(eNotificationType.ERROR, "Titulación App", error);
          this.dialogRef.close(false);
        });
        break;
      }
    }
  }

  Back(index: number): void {
    switch (index) {
      case 1: {
        this.stepperComponent.selectedIndex = 0;
        this.SteepOneCompleted = false;
        break;
      }
      case 2: {
        this.stepperComponent.selectedIndex = 1;
        this.SteepTwoCompleted = false;
        // console.log("complete", this.SteepOneCompleted, this.SteepTwoCompleted, this.SteepThreeCompleted);        
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
