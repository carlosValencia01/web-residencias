import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import Swal from 'sweetalert2';
import { MatStepper } from '@angular/material';
import { DropzoneComponent, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { DocumentsHelpComponent } from 'src/app/inscriptions/documents-help/documents-help.component';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import { ExtendViewerComponent } from 'src/app/commons/extend-viewer/extend-viewer.component';
moment.locale('es');

@Component({
  selector: 'app-my-certificate-page',
  templateUrl: './my-certificate-page.component.html',
  styleUrls: ['./my-certificate-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyCertificatePageComponent implements OnInit {
  @ViewChild('stepper') private stepper: MatStepper;

  /* Dropzone conf */
  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
  public payConfig: DropzoneConfigInterface;
  dropzoneFileNameCOMPROBANTE: any;

  studentSub: Subscription;
  eventSub: Subscription;
  user;
  event;
  eventId;
  student;
  activeEvent;
  isGraduate: boolean = false;
  collection;

  // Stepper
  isLinear = true;
  step;
  email = '';
  emailConfirm = '';
  emailDomain = '@ittepic.edu.mx';
  folderPeriodDrive;
  payDoc;
  documentationStatus;
  isOkPeriod;

  opcionFotos: number;

  constructor(
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private firebaseSrv: FirebaseService,
    private dialog: MatDialog,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.user = this.cookiesService.getData().user;
   }

  ngOnInit() {
    const sr = this.firebaseSrv.getEventId(this.user.email).subscribe(
      ev => {
        sr.unsubscribe();
        if (ev[0]) {
          this.collection = ev[0].event;
          this.eventSub = this.firebaseSrv.getEvent(ev[0].event).subscribe(
            (event) => {
              if (event.payload.get('estatus') == '1'){
                this.isGraduate = true;
                this.event = event.payload.data();
                this.folderPeriodDrive = this.event.folderIdDrive;
                this.eventId = event.payload.id;

                let initDate = new Date (this.event.certificateInitDate.seconds * 1000);
                let endDate = new Date (this.event.certificateEndDate.seconds * 1000);
                let today = new Date();

                if(today >= initDate && today <= endDate){
                  this.isOkPeriod = true;
                  this.studentSub = this.firebaseSrv.getGraduateByControlNumber(this.user.email + '', this.eventId).subscribe(
                    (student) => {
                      console.log(student);
                      this.student = student[0];
                      this.step = this.student.data.stepCertificado ? this.student.data.stepCertificado : 1;
                      this.documentationStatus = this.student.data.documentationStatus ? this.student.data.documentationStatus : 'NO SOLICITADO';
                      this.payDoc = this.student.data.comprobantePago ? this.student.data.comprobantePago : '';
                      this.opcionFotos = this.student.data.opcionFotos ? this.student.data.opcionFotos : null;
                      this.loadStepWizard(this.step);
                      this.assingConfigForDropzone();
                  });
                } else {
                  this.isOkPeriod = false;
                }
              } else {
                this.isGraduate = false;
              }
            }
          );
        } else {
          this.isGraduate = false;
        }
      },
      err => { console.log(err); });
  }

  validateEmail(){
    if(this.email != '' && this.emailConfirm != ''){
      if(this.email == this.emailConfirm){
        return true;
      } else {
        Swal.fire({
          title: 'Atención',
          text: `Los Correos Ingresados No Coinciden`,
          type: 'info',
          allowOutsideClick: false,
          confirmButtonText: 'Aceptar'
        });
      }
    } else {
      Swal.fire({
        title: 'Atención',
        text: `Favor de Ingresar Correo Institucional`,
        type: 'info',
        allowOutsideClick: false,
        confirmButtonText: 'Aceptar'
      });
      return false;
    }
  }

  loadStepWizard(step) {
    console.log(step)
    if (step == 1) {
      this.stepper.selectedIndex = 0;
    }
    if (step == 2) {
      this.stepper.selectedIndex = 1; 
    }
    if (step == 3) {
      this.stepper.selectedIndex = 2;  
    }
    if (step == 4) {
      this.stepper.selectedIndex = 3;
    }
    if (step == 5) {
      this.stepper.selectedIndex = 4;
    }
    if (step == 6) {
      this.stepper.selectedIndex = 5;
    }
    if (step == 7) {
      this.stepper.selectedIndex = 6;
    }
  }

  continue(step){
    switch (step) {
      case 1:
        if(this.validateEmail()){
          // Guardar correo electrónico y stepCertificado en 1
          this.firebaseSrv.updateFieldGraduate(this.student.id, {correoCertificado: this.email+''+this.emailDomain, stepCertificado:2, documentationStatus : 'SOLICITADO'}, this.collection).then(() => {
          }, (error) => {
            console.log(error);
          });
        }
        break;
      case 3:
        // Verificar que tenga cargado el comprobante de pago
        if(!this.payDoc){
          Swal.fire({
            title: 'Atención',
            text: `Debe subir su comprobante de pago`,
            type: 'info',
            allowOutsideClick: false,
            confirmButtonText: 'Aceptar'
          });
          // Verificar que tenga seleccionado opción de fotos
        } else if (!this.opcionFotos){
          Swal.fire({
            title: 'Atención',
            text: `Seleccione una opción para entrega de fotos`,
            type: 'info',
            allowOutsideClick: false,
            confirmButtonText: 'Aceptar'
          });
        } else {
          // Guardar datos y avanzar al paso 4
          this.firebaseSrv.updateFieldGraduate(this.student.id, {opcionFotos: this.opcionFotos, stepCertificado:4}, this.collection).then(() => {
          }, (error) => {
            console.log(error);
          });
        }
        break;
  }
  }

  assingConfigForDropzone() {
      this.payConfig = {
        clickable: true, maxFiles: 1,
        params: { 'usuario': this.student.data.nombreApellidos, folderId: this.folderPeriodDrive, 'filename': this.student.data.nc + '-' +this.student.data.nombreApellidos, 'mimeType': '', newF: this.payDoc ? false : true, fileId: this.payDoc ? this.payDoc.doc.fileIdInDrive : '' },
        accept: (file, done) => { this.dropzoneFileNameCOMPROBANTE = file.name; done(); },
        acceptedFiles: 'image/jpeg,image/png,application/pdf',
    };
  }

    /*  DROPZONE 1 METHODS  */
    public resetDropzoneUploads(): void {
      this.componentRef.directiveRef.reset();
    }
  
    public onUploadSuccess(args: any): void {
      const documentInfo = {
        doc: {
          filename: args[1].name,
          date: moment(new Date()).format("DD/MM/YYYY"),
          fileIdInDrive: args[1].fileId,
        },
        status: {
          name: 'EN PROCESO',
          message: 'Se envio por primera vez',
          observation: ''
        }
      };

      switch (args[1].action) {
        case 'create file':
          this.firebaseSrv.uploadDocumentDrive(this.student.id,documentInfo, this.collection).then(() => {
            this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Exito', 'Documento cargado correctamente.');
          }, (error) => {
            console.log(error);
          });
        break;

        case 'update file':
          documentInfo.status.message = 'Se actualizó el documento';
          this.firebaseSrv.uploadDocumentDrive(this.student.id,documentInfo, this.collection).then(() => {
            this.notificationsServices.showNotification(eNotificationType.SUCCESS,'Exito', 'Documento actualizado correctamente.');
          }, (error) => {
            console.log(error);
          });
        break;
      }

      this.resetDropzoneUploads();

    }
  
    onErrorCommon(args: any) {
      this.resetDropzoneUploads();
      if (args[1] === `You can't upload files of this type.`) {
        this.notificationsServices.showNotification(eNotificationType.ERROR,
          '!ERROR!', "No se pueden subir archivos con esa extensión!\n Las extensiones permitidas son .jpg, .jpeg, .png y .pdf");
      } else {
        this.notificationsServices.showNotification(eNotificationType.ERROR,
          '!ERROR!', "No se pueden subir archivos tan pesados!\nEl límite es 3MB");
      }
    }
  
    collapse(ev, disabled) {
      let coll = document.getElementById(ev);
      if (coll.style.maxHeight) {
        coll.style.maxHeight = null;
        coll.style.padding = null;
      } else {
        coll.style.maxHeight = coll.scrollHeight + 80 + "px";
        coll.style.padding = '10px';
      }
    }

    help() {
      this.dialog.open(ExtendViewerComponent, {
        data: {
          source: "../assets/pdf/help_linea_captura.pdf",
          isBase64: true
        },
        disableClose: true,
        hasBackdrop: true,
        width: '60em',
        height: '600px'
      });
    }

    onMessage(message: string){
      Swal.fire({
        type: 'error',
        title: '¡Observaciones!',
        text: message
      });
    }

}
