import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RequestProvider } from 'src/providers/request.prov';
import { iRequest } from 'src/entities/request.model';
import { eStatusRequest } from 'src/enumerators/statusRequest.enum';
import { CookiesService } from 'src/services/cookie.service';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
import { RequestService } from 'src/services/request.service';
import { eRequest } from 'src/enumerators/request.enum';

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
  constructor(public dialogRef: MatDialogRef<SteepComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data, public _RequestProvider: RequestProvider,
    private cookiesService: CookiesService, private notificationsServ: NotificationsServices,
    public _RequestService: RequestService) {
    this.Request = data.Request;
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    // this.updateRequest(this.Request);
    this._RequestService.AddRequest(this.Request, eRequest.VERIFIED);    
  }

  // async updateRequest(request) {
  //   await this.delay(150);    
  // }

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

}
