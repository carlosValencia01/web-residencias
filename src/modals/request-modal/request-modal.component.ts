import { Component, OnInit, Output, EventEmitter, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { StudentProvider } from 'src/providers/student.prov';
import { CookiesService } from 'src/services/cookie.service';
import { eFILES } from 'src/enumerators/document.enum';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
import { RequestProvider } from 'src/providers/request.prov';
import { DatePipe } from '@angular/common';
import { iRequest } from 'src/entities/request.model';
import { eStatusRequest } from 'src/enumerators/statusRequest.enum';
import { Router, ActivatedRoute } from '@angular/router';
import { ObservationsComponentComponent } from 'src/components/observations-component/observations-component.component';
import { iIntegrant } from 'src/entities/integrant.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Api } from 'src/providers/api.prov';

@Component({
  selector: 'app-request-modal',
  templateUrl: './request-modal.component.html',
  styleUrls: ['./request-modal.component.scss']
})
export class RequestModalComponent implements OnInit {
  @Output('onSubmit') btnSubmitRequest = new EventEmitter<boolean>();
  @ViewChild('observations') txtObservation: ElementRef;
  public frmRequest: FormGroup;
  private userInformation: any;
  private request: iRequest;
  private isToggle = false;
  private isLoadImage: boolean;
  private resource: string;
  private integrants: Array<iIntegrant> = [];

  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private dateFormat: DatePipe,
    private router: Router,
    private routeActive: ActivatedRoute,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<RequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: Api,
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
        'dateProposed': new FormControl({ value: null, disabled: true }, Validators.required),
        'honorific': new FormControl({ value: false, disabled: true }, Validators.required)
      });

    this.requestProvider.getRequestById(this.data.Id).subscribe(res => {
      this.loadRequest(res);
    }, error => {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
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
    this.frmRequest.setValue({
      'name': this.request.student.name,
      'lastname': this.request.student.lastName,
      'telephone': this.request.telephone,
      'email': this.request.email,
      'adviser': this.request.adviser,
      'noIntegrants': this.request.noIntegrants,
      'observations': this.request.observation,
      'project': this.request.projectName,
      'product': this.request.product,
      'dateProposed': this.dateFormat.transform(this.request.proposedDate, 'yyyy-MM-dd'),
      'honorific': this.request.honorificMention,
    });

    this.isToggle = this.request.honorificMention;
    this.studentProvider.getResource(this.request.studentId, eFILES.PROYECTO).subscribe(
      data => {
        this.generateImageFromBlob(data);
      }
    );
  }

  generateImageFromBlob(image: Blob): void {
    const reader = new FileReader();
    this.isLoadImage = false;
    reader.addEventListener('load', () => {
      const result: any = reader.result;
      this.resource = result;
      this.isLoadImage = true;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  accept(): void {
    const data = {
      doer: this.cookiesService.getData().user.name.fullName,
      operation: eStatusRequest.ACCEPT,
      observation: this.frmRequest.get('observations').value
    };
    this.updateRequest(data);
  }

  reject(): void {
    const observation = String(this.frmRequest.get('observations').value).trim();
    if (typeof (observation) === 'undefined' || observation === '') {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', 'Es necesario agregar una observación');
      this.txtObservation.nativeElement.focus();
      return;
    }
    const data = {
      doer: this.cookiesService.getData().user.name.fullName,
      observation: observation,
      operation: eStatusRequest.REJECT,
      phase: this.request.phase
    };
    this.updateRequest(data);
  }

  updateRequest(data: any) {
    this.requestProvider.updateRequest(this.request._id, data).subscribe(data => {
      this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
      this.dialogRef.close(true);
    }, error => {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
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
    window.open(`${this.api.getURL()}/student/projectCover/${this.request._id}`, '_blank');
  }
}
