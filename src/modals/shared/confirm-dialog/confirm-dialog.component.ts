import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  public Configuration: iConfirmDialog;
  public existText: boolean;
  public readOnly: boolean;
  public existError: boolean;
  public motivo: string;
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.Configuration = data.Configuration;
    this.readOnly = true;
    this.motivo = '';
    this.existText = typeof (this.Configuration.Message.Text) !== 'undefined';
  }

  onClick(value: boolean): void {
    if (value) {
      if (this.readOnly) {
        this.dialogRef.close({
          confirm: true, motivo:
            this.Configuration.Status === eStatusRequest.CANCELLED ?
              'Por un un imprevisto mayor, su fecha de titulación ha sido cancelada. Registre una nueva fecha' :
              'Su petición de titulación ha sido rechazada. Registre una nueva fecha'
        });
      }
      else {
        this.existError = this.motivo.trim().length === 0;
        if (!this.existError)
          this.dialogRef.close({ confirm: true, motivo: this.motivo + ". Registre una nueva fecha" });
      }
    }
    else
      this.dialogRef.close({ confirm: false, motivo: '' });
  }

  checked(event): void {
    this.readOnly = !event.srcElement.checked;
    if (!event.srcElement.checked) {
      this.motivo = "";
    }
  }
  ngOnInit() {
  }
}
interface iConfirmDialog {
  Status: eStatusRequest,
  Message: { Title: string, Text?: string },
  Buttons: { ConfirmText?: string, CancelText?: string }
}