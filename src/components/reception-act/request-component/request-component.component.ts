import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { eCAREER } from 'src/enumerators/shared/career.enum';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { DatePipe } from '@angular/common';
import { iRequest } from 'src/entities/reception-act/request.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeAdviserComponent } from 'src/modals/reception-act/employee-adviser/employee-adviser.component';
import { IntegrantsComponentComponent } from 'src/modals/reception-act/integrants-component/integrants-component.component';
import { iIntegrant } from 'src/entities/reception-act/integrant.model';
import { MatDialog } from '@angular/material';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';

@Component({
  selector: 'app-request-component',
  templateUrl: './request-component.component.html',
  styleUrls: ['./request-component.component.scss']
})
export class RequestComponentComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('request') _request: iRequest;
  // tslint:disable-next-line: no-output-rename
  @Output('onSubmit') btnSubmitRequest = new EventEmitter<boolean>();
  public frmRequest: FormGroup;
  private fileData: any;
  private frmData: any;
  private isLoadFile: boolean;
  private userInformation: any;
  private typeCareer: any;
  public operationMode: eOperation;
  private request: iRequest;
  public isToggle = false;
  public observations: string;
  public viewObservation = false;
  private deptoInfo: { name: string, boss: string };
  private integrants: Array<iIntegrant> = [];
  public isEdit = false;
  private oRequest: uRequest;

  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private dateFormat: DatePipe,
    private router: Router,
    private routeActive: ActivatedRoute,
    public dialog: MatDialog,
    private imgService: ImageToBase64Service,
  ) {
    this.userInformation = this.cookiesService.getData().user;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.typeCareer = <keyof typeof eCAREER>this.userInformation.career;
  }

  ngOnInit() {
    this.oRequest = new uRequest(this._request, this.imgService);
    this.frmRequest = new FormGroup(
      {
        'name': new FormControl(this.userInformation.name.firstName, Validators.required),
        'lastname': new FormControl(this.userInformation.name.lastName, Validators.required),
        'telephone': new FormControl(null, [Validators.required,
        Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$')]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'project': new FormControl(null, Validators.required),
        'product': new FormControl({ value: 'MEMORIA DE RESIDENCIA PROFESIONAL', disabled: true }, Validators.required),
        'observations': new FormControl(null),
        'adviser': new FormControl({ value: '', disabled: true }, Validators.required),
        'noIntegrants': new FormControl(1, [Validators.required, Validators.pattern('^[1-9]\d*$')]),
        // 'dateProposed': new FormControl(null, Validators.required),
        'honorific': new FormControl(false, Validators.required)
      });
    this.getRequest();
  }

  getRequest() {
    this.studentProvider.getRequest(this.userInformation._id).subscribe(res => {
      if (typeof (res) !== 'undefined' && res.request.length > 0) {
        this.loadRequest(res);
        this.operationMode = eOperation.EDIT;
        this.observations = this.request.observation;
        if (typeof (this.request.history) !== 'undefined' && this.request.history.length > 0) {
          const lastHistoryIndex = this.request.history.length - 1;
          if (this.request.history[lastHistoryIndex].status === eStatusRequest.REJECT && this.request.observation) {
            this.viewObservation = true;
          }
        }
      } else {
        this.operationMode = eOperation.NEW;
      }
    }, error => {
      this.operationMode = eOperation.NEW;
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
      'email': this.request.email.toLowerCase(),
      'adviser': this.request.adviser,
      'noIntegrants': this.request.noIntegrants,
      'observations': this.request.observation,
      'project': this.request.projectName,
      'product': this.request.product,
      // 'dateProposed': this.dateFormat.transform(this.request.proposedDate, 'yyyy-MM-dd'),
      'honorific': this.request.honorificMention,
    });
    this.disabledControl();
    this.isToggle = this.request.honorificMention;
  }

  Edit(): void {
    this.isEdit = !this.isEdit;
    this.disabledControl();
  }

  disabledControl(): void {
    this.frmRequest.get('name').markAsUntouched();
    this.frmRequest.get('lastname').markAsUntouched();
    this.frmRequest.get('telephone').markAsUntouched();
    this.frmRequest.get('email').markAsUntouched();
    this.frmRequest.get('project').markAsUntouched();
    this.frmRequest.get('observations').markAsUntouched();
    this.frmRequest.get('noIntegrants').markAsUntouched();
    // this.frmRequest.get('dateProposed').markAsUntouched();
    this.frmRequest.get('honorific').markAsUntouched();

    if (this.isEdit) {
      this.frmRequest.get('name').enable();
      this.frmRequest.get('lastname').enable();
      this.frmRequest.get('telephone').enable();
      this.frmRequest.get('email').enable();
      this.frmRequest.get('project').enable();
      this.frmRequest.get('observations').enable();
      this.frmRequest.get('adviser').disable();
      this.frmRequest.get('noIntegrants').enable();
      // this.frmRequest.get('dateProposed').enable();
      this.frmRequest.get('honorific').enable();
    } else {
      this.frmRequest.get('name').disable();
      this.frmRequest.get('lastname').disable();
      this.frmRequest.get('telephone').disable();
      this.frmRequest.get('email').disable();
      this.frmRequest.get('project').disable();
      this.frmRequest.get('observations').disable();
      this.frmRequest.get('adviser').disable();
      this.frmRequest.get('noIntegrants').disable();
      // this.frmRequest.get('dateProposed').disable();
      this.frmRequest.get('honorific').disable();
    }
  }

  onUpload(event): void {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        this.fileData = event.target.files[0];
        this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App',
          'Archivo ' + this.fileData.name + ' cargado correctamente');
        this.isLoadFile = true;
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App',
          'Error, su archivo debe ser de tipo PDF');
      }
    }
  }

  onToggle(): void {
    this.isToggle = !this.isToggle;
    this.frmRequest.patchValue(
      { 'honorific': this.isToggle }
    );
  }

  onSave(): void {
    let errorExists = false;
    if (!this.isLoadFile && this.operationMode === eOperation.NEW) {
      this.notificationsServ.showNotification(eNotificationType.ERROR, '', 'No se ha cargado archivo de portada');
      errorExists = true;
    }

    if (this.frmRequest.get('noIntegrants').value > 1 && (typeof (this.integrants) === 'undefined' || this.integrants.length === 0)) {
      this.frmRequest.get('noIntegrants').setErrors({ 'notEntered': true });
      this.frmRequest.get('noIntegrants').markAsTouched();
      errorExists = true;
    }

    if (typeof (this.frmRequest.get('adviser').value) === 'undefined' || !this.frmRequest.get('adviser').value) {
      this.frmRequest.get('adviser').setErrors({ required: true });
      this.frmRequest.get('adviser').markAsTouched();
      errorExists = true;
    }
    if (errorExists) {
      return;
    }
    // Data FormData
    this.frmData = new FormData();
    this.frmData.append('file', this.fileData);
    this.frmData.append('ControlNumber', this.userInformation.email);
    this.frmData.append('FullName', this.userInformation.name.fullName);
    this.frmData.append('Career', this.typeCareer);
    this.frmData.append('Document', eFILES.PROYECTO);
    // Data
    this.frmData.append('adviser', this.frmRequest.get('adviser').value);
    this.frmData.append('noIntegrants', this.frmRequest.get('noIntegrants').value);
    this.frmData.append('projectName', this.frmRequest.get('project').value);
    this.frmData.append('email', this.frmRequest.get('email').value);
    // this.frmData.append('proposedDate', this.frmRequest.get('dateProposed').value);
    this.frmData.append('status', 'Process');
    this.frmData.append('phase', 'Solicitado');
    this.frmData.append('telephone', this.frmRequest.get('telephone').value);
    this.frmData.append('honorificMention', this.frmRequest.get('honorific').value);
    this.frmData.append('lastModified', this.frmRequest.get('project').value);
    this.frmData.append('product', this.frmRequest.get('product').value);

    switch (this.operationMode) {
      case eOperation.NEW: {
        this.frmData.append('department', this.deptoInfo.name);
        this.frmData.append('boss', this.deptoInfo.boss);
        this.studentProvider.request(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(data.request._id, this.integrants).subscribe(_ => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Guardada Correctamente');
            this.btnSubmitRequest.emit(true);
          }, error => {
            this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
            this.btnSubmitRequest.emit(false);
          });
        }, error => {
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
          this.btnSubmitRequest.emit(false);
        });
        break;
      }

      case eOperation.EDIT: {
        this.studentProvider.updateRequest(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(this.request._id, this.integrants).subscribe(_ => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Editada Correctamente');
            this.isEdit = false;
            this.viewObservation = false;
            this.getRequest();
            this.btnSubmitRequest.emit(true);
          }, error => {
            this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
            this.btnSubmitRequest.emit(false);
          });
        }, error => {
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
          this.btnSubmitRequest.emit(false);
        });
        break;
      }
    }
  }

  Send(): void {
    const data = {
      operation: eStatusRequest.ACCEPT,
      doer: this.cookiesService.getData().user.name.fullName
    };
    this.requestProvider.updateRequest(this.request._id, data).subscribe(_ => {
      this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Enviada');
      this.btnSubmitRequest.emit(true);
    }, error => {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      this.btnSubmitRequest.emit(false);
    });
  }

  valor(): void {
    console.log(typeof (this.frmRequest.get('adviser').value) === 'undefined');
    console.log(!(this.frmRequest.get('adviser').value));
  }

  selectAdviser(): void {
    if (this.frmRequest.disabled) {
      return;
    }
    this.frmRequest.get('adviser').markAsUntouched();
    this.frmRequest.get('adviser').setErrors(null);
    const ref = this.dialog.open(EmployeeAdviserComponent, {
      data: {
        carrer: this.userInformation.career
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.frmRequest.patchValue({ 'adviser': result.Employee });
        this.deptoInfo = result.Depto;
      }
    });
  }

  addIntegrants(): void {
    if (this.frmRequest.disabled) {
      return;
    }
    this.frmRequest.get('noIntegrants').setErrors(null);
    const ref = this.dialog.open(IntegrantsComponentComponent, {
      data: {
        integrants: this.operationMode === eOperation.NEW
          ? (typeof (this.integrants) !== 'undefined' ? this.integrants : [])
          : this.request.integrants
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });

    ref.afterClosed().subscribe((integrants) => {
      if (typeof (integrants) !== 'undefined') {
        if (this.operationMode === eOperation.EDIT) {
          this.request.integrants = integrants;
          this.integrants = integrants;
        } else {
          this.integrants = integrants;
        }
      }
    });
  }

  generateRequestPDF() {
    window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
  }
}
