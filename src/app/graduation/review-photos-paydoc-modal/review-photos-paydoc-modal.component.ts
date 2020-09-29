import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { ReviewExpedientComponent } from 'src/app/inscriptions/review-expedient/review-expedient.component';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-review-photos-paydoc-modal',
  templateUrl: './review-photos-paydoc-modal.component.html',
  styleUrls: ['./review-photos-paydoc-modal.component.scss']
})
export class ReviewPhotosPaydocModalComponent implements OnInit {

  URLFile: string;
  constructor(
    public dialogRef: MatDialogRef<ReviewExpedientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private inscriptionsProv: InscriptionsProvider,
    private firebaseServ: FirebaseService,
    private notificationsServices: NotificationsServices,
  ) { }

  ngOnInit() {
  
    this.URLFile = `https://drive.google.com/file/d/${this.data.student.comprobantePago.doc.fileIdInDrive}/preview`;
    
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  async changeStatus(status: string){
    
    let confirmdialog = false;
    let query = {
      comprobantePago: {
        status:{
          name: status,
          message: 'Documento aceptado',
          observation: ''
        },
        doc: this.data.student.comprobantePago.doc
      },      
      stepCertificado:5
    };
    if(status === 'ACEPTADO'){
      confirmdialog = await this.swalDialog(`¿ ACEPTAR RECIBO DE PAGO ?`, '', 'question');
    } else {
      confirmdialog = await this.swalDialogInput('¿ RECHAZAR RECIBO DE PAGO ?','Especifique el motivo');
      query.comprobantePago.status.message = 'Documento rechazado';
      query.comprobantePago.status.observation = confirmdialog+'';
      delete query.stepCertificado;
    }

    if (confirmdialog) {
      
      this.firebaseServ.updateFieldGraduate(this.data.student.id,query,this.data.collection).then(upd=>{this.notificationsServices.showNotification(eNotificationType.SUCCESS,
        'Graduación', 'Estatus actualizado correctamente.');});
      

      if (status == "RECHAZADO") {
        this.inscriptionsProv.sendNotification(this.data.student.correoCertificado, "Documento Rechazado para Certificado", this.data.student.name, "El RECIBO DE PAGO para el certificado fue RECHAZADO y necesita ser cambiado desde la opción 'Mi Certificado' en https://mitec.ittepic.edu.mx/", "Documento para Certificado Rechazado", "Servicios Escolares <servescolares@ittepic.edu.mx>").subscribe(
          res => {
            this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Notificación enviada a:', this.data.student.correoCertificado);
          },
          err => {
            this.notificationsServices.showNotification(eNotificationType.ERROR, 'No se pudo enviar el correo a:', this.data.student.correoCertificado);
          }
        );
      }
      this.onClose();
    }
  }

  swalDialogInput(title,msg) {
    return Swal.fire({
      title: title,
      text: msg,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar',
      input: 'text',
      inputValidator: (value)=>{
        if(!value){
          return 'DEBE INGRESAR EL MOTIVO';
        }
      }
    }).then((result) => {
      return result.value ?  result.value !== '' ? result.value : false : false;
    });
  }

  swalDialog(title, msg, type) {
    return Swal.fire({
      title: title,
      text: msg,
      type: type,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) return true;
      else return false;
    });
  }
}
