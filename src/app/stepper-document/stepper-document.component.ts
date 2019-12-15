import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';



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
  constructor(public dialogRef: MatDialogRef<StepperDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _NotificationsServices: NotificationsServices) {
    this.fileData = `../../assets/docs/${data.Documento}.pdf`;
    this.tmpFileData = `../../assets/docs/${data.Documento}.pdf`;
    console.log("File path", this.fileData);
  }

  ngOnInit() {
  }

  onUpload(event): void {
    // [src]="'../../assets/Requisitos.pdf'"
    // console.log("event",event);
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        this.fileUpload = event.target.files[0];
        this.pdf = URL.createObjectURL(this.fileUpload);
        console.log("PDF", this.pdf);
      } else {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App',
          'Error, su archivo debe ser de tipo PDF');
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
        this.fileUpload=undefined;
        this.updateSteeps(1);
        this.SteepTwoCompleted = false;
        break;
      }
    }
  }

  async updateSteeps(index: number) {
    await this.delay(150);
    this.stepperComponent.selectedIndex = index;
    console.log("STEEP", this.stepperComponent)
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
