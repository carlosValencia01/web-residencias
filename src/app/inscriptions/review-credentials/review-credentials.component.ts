import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

@Component({
  selector: 'app-review-credentials',
  templateUrl: './review-credentials.component.html',
  styleUrls: ['./review-credentials.component.scss']
})
export class ReviewCredentialsComponent implements OnInit {

  title = 'CREDENCIALES A IMPRIMIR';
  textButton = 'Cambiar Estatus de Credenciales';
  pdfSrc;
  showDocument = false;

  constructor(
    public dialogRef: MatDialogRef<ReviewCredentialsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private inscriptionsProv: InscriptionsProvider,
    private notificationService: NotificationsServices,
    private loadingService: LoadingService,
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
    this.loadingService.setLoading(true);
    this.pdfSrc = credentials;
    this.showDocument = true;
    this.loadingService.setLoading(false);
  }

  changeStatusCredentials() {
    if(this.data.students.length == undefined){
      this.loadingService.setLoading(true);
      this.updateStudent(this.data.students._id);
      this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
      this.loadingService.setLoading(false);
      this.onClose();
    } else {
        for (var i = 0; i < this.data.students.length; i++) {
          this.loadingService.setLoading(true);
          this.updateStudent(this.data.students[i]._id);
          if(i == this.data.students.length-1){
            this.notificationService.showNotification(eNotificationType.SUCCESS, 'Éxito', 'Impresión Registrada.');
            this.loadingService.setLoading(false);
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
