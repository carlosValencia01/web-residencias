import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ShowOnDirtyErrorStateMatcher } from '@angular/material';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-review-credentials',
  templateUrl: './review-credentials.component.html',
  styleUrls: ['./review-credentials.component.scss']
})
export class ReviewCredentialsComponent implements OnInit {

  title = 'CREDENCIALES A IMPRIMIR';
  textButton = 'Cambiar Estatus de Credenciales';
  pdfSrc;
  loading: boolean;
  showDocument = false;

  constructor(
    public dialogRef: MatDialogRef<ReviewCredentialsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inscriptionsProv: InscriptionsProvider,
    private notificationService: NotificationsServices,
  ) {
    if(this.data.students.length == undefined){
      this.title = 'CREDENCIAL DE: '+this.data.students.fullName+' - '+this.data.students.controlNumber
      this.textButton = 'Cambiar Estatus de Credencial';
    }
    this.showCredentials(this.data.credentials);
  }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  showCredentials(credentials) {
    this.loading = true;
    this.pdfSrc = credentials;
    this.showDocument = true;
    this.loading = false;
  }

  changeStatusCredentials() {
    if(this.data.students.length == undefined){
      this.loading = true;
      this.updateStudent(this.data.students._id);
      this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
      this.loading = false;
      this.onClose();
    } else {
        for (var i = 0; i < this.data.students.length; i++) {
          this.loading = true;
          this.updateStudent(this.data.students[i]._id);
          if(i == this.data.students.length-1){
            this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
            this.loading = false;
            this.onClose();
          }
        }
    }
  }

  async updateStudent(_id){
    return new Promise(resolve => {
      this.inscriptionsProv.updateStudent({ printCredential: true },_id).subscribe(res => {
      }, err => { },
        () => { resolve(); });
    });
  }

}
