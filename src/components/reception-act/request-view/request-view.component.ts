import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { iRequest } from 'src/entities/reception-act/request.model';
import { iIntegrant } from 'src/entities/reception-act/integrant.model';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { RequestService } from 'src/services/reception-act/request.service';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-request-view',
  templateUrl: './request-view.component.html',
  styleUrls: ['./request-view.component.scss']
})
export class RequestViewComponent implements OnInit {
  @ViewChild('observations') txtObservation: ElementRef;
  public frmRequest: FormGroup;
  private request: iRequest;
  public isToggle = false;
  private integrants: Array<iIntegrant> = [];
  private oRequest: uRequest;
  public showLoading: boolean = false;
  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private dateFormat: DatePipe,
    public dialog: MatDialog,
    public _RequestService: RequestService,
    private imgService: ImageToBase64Service,
  ) { }

  ngOnInit() {
    this._RequestService.requestUpdate.subscribe(
      (response: any) => {
        this.loadRequest(response.Request);
      }
    );
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
        'honorific': new FormControl({ value: false, disabled: true }, Validators.required)
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

  loadRequest(request: iRequest): void {
    this.request = request;
    this.integrants = this.request.integrants;
    this.assignName();
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
      'honorific': this.request.honorificMention,
    });

    this.isToggle = this.request.honorificMention;
    this.oRequest = new uRequest(this.request, this.imgService, this.cookiesService);
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
    window.open(`${this.requestProvider.getApiURL()}/request/${this.request._id}/file/${eFILES.PROYECTO}`, '_blank');
  }

  getRequestPDF() {
    this.showLoading = true;
    this.requestProvider.getResource(this.request._id, eFILES.SOLICITUD).subscribe(data => {
      this.showLoading = false;
      window.open(URL.createObjectURL(data), '_blank');
    }, error => {
      this.showLoading = false;
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto Recepcional', 'Error al obtener la solicitud');
      // window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
    });

  }
}
