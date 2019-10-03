import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';

@Component({
  selector: 'app-release-component',
  templateUrl: './release-component.component.html',
  styleUrls: ['./release-component.component.scss']
})
export class ReleaseComponentComponent implements OnInit {
  public fileName: String;
  private fileData: any;
  public pdf: any;
  constructor(public dialogRef: MatDialogRef<ReleaseComponentComponent>,
    private notifications: NotificationsServices, ) { }

  ngOnInit() {
  }

  onUpload(event): void {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {        
        this.fileData = event.target.files[0];
        this.fileName = String(this.fileData.name).toUpperCase();
        this.pdf=URL.createObjectURL(this.fileData.source);
      } else {
        this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App',
          'Error, su archivo debe ser de tipo PDF');
      }
    }
  }

  Save(): void {
    if (typeof (this.fileData) !== 'undefined') {
      this.dialogRef.close(this.fileData);
    }
    else {
      this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App',
        'Error, archivo no cargado');
    }
  }

}
