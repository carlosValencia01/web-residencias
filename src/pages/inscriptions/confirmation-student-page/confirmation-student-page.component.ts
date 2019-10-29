import { Component, OnInit } from '@angular/core';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { MatStepper } from '@angular/material/stepper';
import { ExtendViewerComponent } from 'src/modals/shared/extend-viewer/extend-viewer.component';
import { MatDialog } from '@angular/material';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation-student-page',
  templateUrl: './confirmation-student-page.component.html',
  styleUrls: ['./confirmation-student-page.component.scss']
})
export class ConfirmationStudentPageComponent implements OnInit {
  _idStudent: String;
  data: any;
  studentData: any;

    //Documentos
    docSolicitud;
    docContrato;

  constructor(
    private inscriptionsProv: InscriptionsProvider,
    private notificationsServices: NotificationsServices,
    private cookiesServ: CookiesService,
    private stepper: MatStepper,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private router: Router,
  ) {
    this.getIdStudent();
    this.getStudentData(this._idStudent);
  }

  ngOnInit() {

  }

  getIdStudent() {
    this.data = this.cookiesServ.getData().user;
    this._idStudent = this.data._id;
  }

  getStudentData(id) {
    this.inscriptionsProv.getStudent(id).subscribe(res => {
      this.studentData = res.student[0];
      this.getIdDocuments();
    });
  }

  getIdDocuments() {
    this.docSolicitud = this.filterDocuments('SOLICITUD');
    this.docContrato = this.filterDocuments('CONTRATO');
  }

  filterDocuments(filename) {
    return this.studentData.documents.filter(function (alumno) {
      return alumno.filename.toLowerCase().indexOf(filename.toLowerCase()) > -1;
    });
  }

  onView(file) {
    switch (file) {
      case "Solicitud": {
        this.inscriptionsProv.getFile(this.docSolicitud[0].fileIdInDrive, this.docSolicitud[0].filename).subscribe(data => {
          var pubSolicitud = data.file;
          let buffSolicitud = new Buffer(pubSolicitud.data);
          var pdfSrcSolicitud = buffSolicitud;
          var blob = new Blob([pdfSrcSolicitud], {type: "application/pdf"});
          FileSaver.saveAs(blob,this.data.email+'-Solicitud.pdf');
        }, error => {
          console.log(error);
        });
        break;
      }
      case "Contrato": {
        this.inscriptionsProv.getFile(this.docContrato[0].fileIdInDrive, this.docContrato[0].filename).subscribe(data => {
          var pubContrato = data.file;
          let buffContrato = new Buffer(pubContrato.data);
          var pdfSrcContrato = buffContrato;
          var blob = new Blob([pdfSrcContrato], {type: "application/pdf"});
          FileSaver.saveAs(blob,this.data.email+'-Contrato.pdf');
        }, error => {
          console.log(error);
        });
        break;
      }
    }
  }

  mostrarAdvertencia() {
    Swal.fire({
      title: 'ATENCIÓN',
      text: 'Debes descargar la "Solicitud" y "Contrato", mismos que debes entregar en el Departamento de Servicios Escolares.',
      type: 'info',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Regresar',
      confirmButtonText: 'Continuar'
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          type: 'success',
          title: 'Proceso Finalizado',
          showConfirmButton: false,
          timer: 2000
        })
        this.continue();
      }
     });
  }

  async continue() {
    var newStep = { stepWizard: 6 }
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      //this.router.navigate(['/wizardInscription']);
      window.location.assign("/");
    });    
  }


}
