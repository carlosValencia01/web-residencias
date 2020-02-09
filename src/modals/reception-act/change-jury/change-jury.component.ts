import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { CookiesService } from 'src/services/app/cookie.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { iRequest } from 'src/entities/reception-act/request.model';
import { EmployeeAdviserComponent } from '../employee-adviser/employee-adviser.component';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-change-jury',
  templateUrl: './change-jury.component.html',
  styleUrls: ['./change-jury.component.scss']
})
export class ChangeJuryComponent implements OnInit {
  public frmConsejo: FormGroup;
  public _Request: iRequest;
  @ViewChild('time') Time: NgxTimepickerFieldComponent;
  private juryInfo: Array<{ name: string, title: string, cedula: string }>;
  constructor(
    public dialogRef: MatDialogRef<ChangeJuryComponent>,
    private _NotificationsServices: NotificationsServices,
    public dialog: MatDialog,
    private _CookiesService: CookiesService,
    private _RequestProvider: RequestProvider,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this._Request = data.request;
  }

  ngOnInit() {
    this.frmConsejo = new FormGroup({
      'president': new FormControl(this._Request.jury[0].name, Validators.required),
      'secretary': new FormControl(this._Request.jury[1].name, Validators.required),
      'vocal': new FormControl(this._Request.jury[2].name, Validators.required),
      'substitute': new FormControl(this._Request.jury[3].name, Validators.required),
      'duration': new FormControl(this._Request.duration, Validators.required)
    });
    this.juryInfo = this._Request.jury;
    const hour = this._Request.proposedHour / 60;
    const minutes = this._Request.proposedHour % 60;
    this.Time.writeValue(hour + ":" + minutes);

  }


  selectEmployee(button): void {
    if (this.frmConsejo.disabled) {
      return;
    }
    this.frmConsejo.get(button).markAsUntouched();
    this.frmConsejo.get(button).setErrors(null);
    console.log("ESTUDENTE CARRERA", this._Request.student.career)
    const ref = this.dialog.open(EmployeeAdviserComponent, {
      data: {
        carrer: this._Request.student.career
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });

    ref.afterClosed().subscribe((result) => {

      if (typeof (result) != "undefined") {
        if (this.juryInfo.findIndex(x => x.name === result.ExtraInfo.name) !== -1) {
          this._NotificationsServices.showNotification(eNotificationType.ERROR, "Acto recepcional", "Empleado ya asignado");
        } else {
          switch (button) {
            case "president": {
              this.frmConsejo.patchValue({ 'president': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[0].name = result.ExtraInfo.name;
              this.juryInfo[0].title = result.ExtraInfo.title;
              this.juryInfo[0].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "secretary": {

              this.frmConsejo.patchValue({ 'secretary': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[1].name = result.ExtraInfo.name;
              this.juryInfo[1].title = result.ExtraInfo.title;
              this.juryInfo[1].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "vocal": {
              this.frmConsejo.patchValue({ 'vocal': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[2].name = result.ExtraInfo.name;
              this.juryInfo[2].title = result.ExtraInfo.title;
              this.juryInfo[2].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "substitute": {
              this.frmConsejo.patchValue({ 'substitute': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[3].name = result.ExtraInfo.name;
              this.juryInfo[3].title = result.ExtraInfo.title;
              this.juryInfo[3].cedula = result.ExtraInfo.cedula;
              break;
            }
          }
        }
      }
    });
  }


  async onSave() {
    const response = await this.showAlert("¿Está seguro de realizar este cambio?", { accept: "Si", cancel: "No" });
    if (response) {
      const time: number = Number(this.Time.hour * 60) + Number(this.Time.minute);
      this._RequestProvider.updateJury(this._Request._id, {
        Jury: this.juryInfo,
        Hour: time,
        Duration: this.frmConsejo.get('duration').value,
        Doer: this._CookiesService.getData().user.name.fullName
      }).subscribe(response => {
        this.dialogRef.close({ response: true });
      }, error => {
        this._NotificationsServices.showNotification(eNotificationType.ERROR,
          "Acto Recepcional", "Cambio de jurado no realizado");
      })
    }
  }


  showAlert(message: string, buttons: { accept: string, cancel: string } = { accept: "Aceptar", cancel: "Cancelar" }) {
    return new Promise((resolve) => {
      Swal.fire({
        title: message,
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: buttons.cancel,
        confirmButtonText: buttons.accept
      }).then((result) => {
        if (result.value)
          resolve(true);
        else
          resolve(false);
      });
    });
  }
}
