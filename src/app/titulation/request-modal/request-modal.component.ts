import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { iIntegrant } from 'src/app/entities/reception-act/integrant.model';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { ObservationsComponentComponent } from 'src/app/titulation/observations-component/observations-component.component';
import Swal from 'sweetalert2';
import { ERoleToAcronym } from 'src/app/enumerators/app/role.enum';

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
  private filterRole: string;
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
    private loadingService: LoadingService,
  ) {
    this.userInformation = this.cookiesService.getData().user;
    this.filterRole = (ERoleToAcronym as any)[this.userInformation.rol.name.toLowerCase()];
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
    this.loadingService.setLoading(true);
    this.requestProvider.getRequestById(this.data.Id).subscribe(res => {
      this.loadRequest(res);
      this.getFolder();
      this.loadingService.setLoading(false);
    }, _ => {
      this.loadingService.setLoading(false);
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener solicitud');
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
            mimetype: 'application/pdf',
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
        title: '¡Acto recepcional!',
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
    this.loadingService.setLoading(true);
    this.notificationsServ.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Procesando solicitud');
    this.requestProvider.updateRequest(this.request._id, data,this.filterRole).subscribe(_ => {
      this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
      this.loadingService.setLoading(false);
      this.dialogRef.close(true);
    }, _ => {
      this.loadingService.setLoading(false);
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
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
    this.loadingService.setLoading(true);
    this.requestProvider.getResource(this.request._id, eFILES.PROYECTO).subscribe(data => {
      this.loadingService.setLoading(false);
      window.open(URL.createObjectURL(data), '_blank');
    }, _ => {
      this.loadingService.setLoading(false);
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener la portada');
    });
  }

  getRequestPDF() {
    window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
  }
}
