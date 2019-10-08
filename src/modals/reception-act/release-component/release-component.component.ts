import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { EmployeeAdviserComponent } from 'src/modals/reception-act/employee-adviser/employee-adviser.component';
import { CookiesService } from 'src/services/app/cookie.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-release-component',
  templateUrl: './release-component.component.html',
  styleUrls: ['./release-component.component.scss']
})
export class ReleaseComponentComponent implements OnInit {  
  private fileData: any;  
  public frmConsejo: FormGroup;
  private userInformation: any;
  constructor(public dialogRef: MatDialogRef<ReleaseComponentComponent>,
    private notifications: NotificationsServices, public dialog: MatDialog,
    private cookiesService: CookiesService) {
    this.userInformation = this.cookiesService.getData().user;
  }

  ngOnInit() {
    this.frmConsejo = new FormGroup({
      'president': new FormControl(null, Validators.required),
      'secretary': new FormControl(null, Validators.required),
      'vocal': new FormControl(null, Validators.required),
      'substitute': new FormControl(null, Validators.required)
    });
  }

  selectEmployee(button): void {
    if (this.frmConsejo.disabled) {
      return;
    }

    this.frmConsejo.get(button).markAsUntouched();
    this.frmConsejo.get(button).setErrors(null);
    const ref = this.dialog.open(EmployeeAdviserComponent, {
      data: {
        carrer: this.userInformation.career
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });

    ref.afterClosed().subscribe((result) => {
      switch (button) {
        case "president": {
          this.frmConsejo.patchValue({
            'president': typeof (result) !== 'undefined'
              ? result.Employee : ""
          });
          break;
        }
        case "secretary": {

          this.frmConsejo.patchValue({
            'secretary': typeof (result) !== 'undefined'
              ? result.Employee : ""
          });
          break;
        }
        case "vocal": {
          this.frmConsejo.patchValue({
            'vocal': typeof (result) !== 'undefined'
              ? result.Employee : ""
          });
          break;
        }
        case "substitute": {
          this.frmConsejo.patchValue({
            'substitute': typeof (result) !== 'undefined'
              ? result.Employee : ""
          });
          break;

        }
      }
    });
  }

  onUpload(event): void {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        this.fileData = event.target.files[0];                        
      } else {
        this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App',
          'Error, su archivo debe ser de tipo PDF');
      }
    }
  }

  onSave(): void {
    if (typeof (this.fileData) !== 'undefined') {
      this.dialogRef.close(
        {
          file: this.fileData,
          jury: [
            this.frmConsejo.get("president").value,
            this.frmConsejo.get("secretary").value,
            this.frmConsejo.get("vocal").value,
            this.frmConsejo.get("substitute").value
          ]
        });
    }
    else {
      this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App',
        'Error, archivo no cargado');
    }
  }
}
