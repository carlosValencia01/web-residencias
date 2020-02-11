import { Component, OnInit, Output, EventEmitter, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { DatePipe } from '@angular/common';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { iIntegrant } from 'src/entities/reception-act/integrant.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import Swal from 'sweetalert2';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

@Component({
  selector: 'app-request-modal',
  templateUrl: './request-modal.component.html',
  styleUrls: ['./request-modal.component.scss']
})
export class RequestModalComponent implements OnInit {
  // tslint:disable-next-line: no-output-rename
  @Output('onSubmit') btnSubmitRequest = new EventEmitter<boolean>();
  @ViewChild('observations') txtObservation: ElementRef;
  public frmRequest: FormGroup;
  private userInformation: any;
  private request: iRequest;
  public isToggle = false;
  private integrants: Array<iIntegrant> = [];
  private oRequest: uRequest;
  private folderId: string;
  public showLoading: boolean;
  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private dateFormat: DatePipe,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private imgService: ImageToBase64Service,
  ) {
    this.userInformation = this.cookiesService.getData().user;
  }

  ngOnInit() {
    this.frmRequest = new FormGroup(
      {
        'name': new FormControl({ value: null, disabled: true }, Validators.required),
        'lastname': new FormControl({ value: null, disabled: true }, Validators.required),
        'telephone': new FormControl({ value: null, disabled: true }, [Validators.required,
        Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$')]),
        'email': new FormControl({ value: null, disabled: true }, [Validators.required, Validators.email]),
        'project': new FormControl({ value: null, disabled: true }, Validators.required),
        'product': new FormControl({ value: null, disabled: true }, Validators.required),
        'observations': new FormControl(null),
        'adviser': new FormControl({ value: '', disabled: true }, Validators.required),
        'noIntegrants': new FormControl({ value: 1, disabled: true }, [Validators.required, Validators.pattern('^[1-9]\d*$')]),
        // 'dateProposed': new FormControl({ value: null, disabled: true }, Validators.required),
        'honorific': new FormControl({ value: false, disabled: true }, Validators.required)
      });

    this.requestProvider.getRequestById(this.data.Id).subscribe(res => {
      this.loadRequest(res);
      this.getFolder();
    }, error => {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto Recepcional', error);
    });
  }

  getFolder(): void {
    this.studentProvider.getDriveFolderId(this.request.student.controlNumber, eFOLDER.TITULACION).subscribe(folder => {
      this.folderId = folder.folderIdInDrive;
    });
  }

  assignName(): void {
    const nameArray = this.request.student.fullName.split(/\s*\s\s*/);
    let name = '';
    const maxIteration = nameArray.length - 2;
    for (let i = 0; i < maxIteration; i++) {
      name += nameArray[i] + ' ';
    }
    this.request.student.name = name;
    this.request.student.lastName = nameArray[nameArray.length - 2] + ' ' + nameArray[nameArray.length - 1];
  }

  loadRequest(request: any): void {
    this.request = <iRequest>request.request[0];
    this.request.student = request.request[0].studentId;
    this.request.studentId = this.request.student._id;
    this.integrants = this.request.integrants;
    this.assignName();
    this.oRequest = new uRequest(this.request, this.imgService, this.cookiesService);
    this.frmRequest.setValue({
      'name': this.request.student.name,
      'lastname': this.request.student.lastName,
      'telephone': this.request.telephone,
      'email': this.request.email,
      'adviser': this.request.adviser.name,
      'noIntegrants': this.request.noIntegrants,
      'observations': this.request.observation,
      'project': this.request.projectName,
      'product': this.request.product,
      // 'dateProposed': this.dateFormat.transform(this.request.proposedDate, 'yyyy-MM-dd'),
      'honorific': this.request.honorificMention,
    });
    this.isToggle = this.request.honorificMention;

  }

  accept(): void {
    Swal.fire({
      title: '¿Está seguro de aceptar la solicitud?',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        const data = {
          file: {
            mimetype: "application/pdf",
            data: this.oRequest.documentSend(eFILES.SOLICITUD),
            name: eFILES.SOLICITUD + '.pdf'
          },
          phase: eRequest.SENT,
          folderId: this.folderId,
          doer: this.cookiesService.getData().user.name.fullName,
          operation: eStatusRequest.ACCEPT,
          observation: this.frmRequest.get('observations').value
        };
        this.updateRequest(data);
      }
    });
  }

  reject(): void {
    const observation = String(this.frmRequest.get('observations').value).trim();
    if (typeof (observation) === 'undefined' || observation === '') {
      Swal.fire({
        type: 'error',
        title: 'Oops...',
        text: 'Es necesario agregar una observación',
        showCloseButton: true,
      });
      this.txtObservation.nativeElement.focus();
      return;
    }

    Swal.fire({
      title: '¿Está seguro de rechazar la solicitud?',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        const data = {
          doer: this.cookiesService.getData().user.name.fullName,
          observation: observation,
          operation: eStatusRequest.REJECT,
          phase: eRequest.SENT
        };
        this.updateRequest(data);
      }
    });


  }

  updateRequest(data: any) {
    this.showLoading = true;
    this.notificationsServ.showNotification(eNotificationType.INFORMATION, "Acto Recepcional", "Procesando Solicitud");
    this.requestProvider.updateRequest(this.request._id, data).subscribe(_ => {
      this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto Recepcional', 'Solicitud Actualizada');
      this.showLoading = false;
      this.dialogRef.close(true);
    }, error => {
      this.showLoading = false;
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto Recepcional', error);
      this.dialogRef.close(false);
    });
  }

  watchObservations(): void {
    const ref = this.dialog.open(ObservationsComponentComponent, {
      data: {
        phase: 'Solicitado',
        request: this.request
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });
  }

  getProjectCover() {
    // window.open(`${this.requestProvider.getApiURL()}/student/document/${eFILES.PROYECTO}/${this.request._id}`, '_blank');
    // window.open(`${this.requestProvider.getApiURL()}/request/${this.request._id}/file/${eFILES.PROYECTO}`, '_blank');
    this.showLoading = true;
    this.requestProvider.getResource(this.request._id, eFILES.PROYECTO).subscribe(data => {
      this.showLoading = false;
      window.open(URL.createObjectURL(data), '_blank');
    }, error => {
      this.showLoading = false;
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto Recepcional', 'Error al obtener la portada');
    });
  }

  getRequestPDF() {
    window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
  }
}
