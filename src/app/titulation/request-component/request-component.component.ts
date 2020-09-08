import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { iIntegrant } from 'src/app/entities/reception-act/integrant.model';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eOperation } from 'src/app/enumerators/reception-act/operation.enum';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { eCAREER } from 'src/app/enumerators/shared/career.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { EmployeeAdviserComponent } from 'src/app/titulation/employee-adviser/employee-adviser.component';
import { IntegrantsComponentComponent } from 'src/app/titulation/integrants-component/integrants-component.component';
import Swal from 'sweetalert2';
import { ERoleToAcronym } from 'src/app/enumerators/app/role.enum';

@Component({
  selector: 'app-request-component',
  templateUrl: './request-component.component.html',
  styleUrls: ['./request-component.component.scss']
})
export class RequestComponentComponent implements OnInit {
  // CONSTANTES
  // tslint:disable-next-line: no-input-rename
  @Input('request') _request: iRequest;
  // tslint:disable-next-line: no-output-rename
  @Output('onSubmit') btnSubmitRequest = new EventEmitter<boolean>();
  private MAX_SIZE_FILE = 3145728;

  public frmRequest: FormGroup;
  public fileData: any;
  public operationMode: eOperation;
  public isToggle = false;
  public observations: string;
  public viewObservation = false;
  public isEdit = false;
  public folderId: String;
  public activePeriod;
  public foldersByPeriod = [];
  public isSentVerificationCode: Boolean;
  private frmData: any;
  private isLoadFile: boolean;
  private userInformation: any;
  private typeCareer: any;
  private request: iRequest;
  private deptoInfo: { name: string, boss: string };
  private integrants: Array<iIntegrant> = [];
  private oRequest: uRequest;
  private adviserInfo: { name: string, title: string, cedula: string, email?: string };
  private product = 'INFORME TÉCNICO DE RESIDENCIA PROFESIONAL';
  private titulationOption = 'XI - TITULACIÓN INTEGRAL';
  private filterRole: string;
  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private router: Router,
    private routeActive: ActivatedRoute,
    public dialog: MatDialog,
    private imgService: ImageToBase64Service,
    private loadingService: LoadingService,
  ) {
    this.userInformation = this.cookiesService.getData().user;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.typeCareer = <keyof typeof eCAREER>this.userInformation.career;
    this.filterRole = (ERoleToAcronym as any)[this.userInformation.rol.name.toLowerCase()];
    this.getFolderId();
  }

  ngOnInit() {
    this.frmRequest = new FormGroup(
      {
        'name': new FormControl({ value: this.userInformation.name.firstName, disabled: true }, Validators.required),
        'lastname': new FormControl({ value: this.userInformation.name.lastName, disabled: true }, Validators.required),
        'telephone': new FormControl(null, [Validators.required,
        Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$')]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'project': new FormControl(null, Validators.required),
        'product': new FormControl({ value: this.product, disabled: true }, Validators.required),
        'observations': new FormControl(null),
        'adviser': new FormControl({ value: '', disabled: true }, Validators.required),
        'noIntegrants': new FormControl(1, [Validators.required, Validators.pattern('^[1-9]\d*$')]),
        'honorific': new FormControl(false, Validators.required),
        'titulationOption': new FormControl({ value: this.titulationOption, disabled: true }, Validators.required)
      });
    this.getRequest();
  }

  private getRequest() {
    this.loadingService.setLoading(true);
    this.studentProvider.getRequest(this.userInformation._id).subscribe(res => {
      if (typeof (res) !== 'undefined' && res.request.length > 0
        && (res.request[0].phase === 'Capturado' && res.request[0].phase !== 'None')
      ) {
        this.loadRequest(res);
        this.operationMode = this.request.verificationStatus ? eOperation.EDIT : eOperation.VERIFICATION;
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
      this.loadingService.setLoading(false);
    }, error => {
      this.operationMode = eOperation.NEW;
      this.loadingService.setLoading(false);
    });
  }

  private loadRequest(request: any): void {
    this.request = <iRequest>request.request[0];
    this.request.student = request.request[0].studentId;
    this.request.studentId = this.request.student._id;
    this.integrants = this.request.integrants;
    this.deptoInfo = request.request[0].department;
    this.adviserInfo = request.request[0].adviser;
    this.request.student.name = this.userInformation.name.firstName;
    this.request.student.lastName = this.userInformation.name.lastName;
    this.oRequest = new uRequest(this.request, this.imgService, this.cookiesService);

    this.frmRequest.setValue({
      'name': this.request.student.name,
      'lastname': this.request.student.lastName,
      'telephone': this.request.telephone,
      'email': this.request.email.toLowerCase(),
      'adviser': this.request.adviser.name,
      'noIntegrants': this.request.noIntegrants,
      'observations': this.request.observation,
      'project': this.request.projectName,
      'product': this.request.product,
      'honorific': this.request.honorificMention,
      'titulationOption': this.request.titulationOption,
    });
    this.disabledControl();
    this.isToggle = this.request.honorificMention;
    this.isSentVerificationCode = typeof (this._request) === 'undefined' ?
      this.request.sentVerificationCode : this._request.sentVerificationCode;
  }

  public Edit(): void {
    this.isEdit = !this.isEdit;
    if (this.operationMode === eOperation.VERIFICATION) {
      this.operationMode = eOperation.EDIT;
    }
    this.disabledControl();
  }

  private disabledControl(): void {
    this.frmRequest.get('name').markAsUntouched();
    this.frmRequest.get('lastname').markAsUntouched();
    this.frmRequest.get('telephone').markAsUntouched();
    this.frmRequest.get('email').markAsUntouched();
    this.frmRequest.get('project').markAsUntouched();
    this.frmRequest.get('observations').markAsUntouched();
    this.frmRequest.get('noIntegrants').markAsUntouched();
    this.frmRequest.get('honorific').markAsUntouched();
    this.frmRequest.get('titulationOption').markAsUntouched();

    if (this.isEdit) {
      this.frmRequest.get('telephone').enable();
      this.frmRequest.get('email').enable();
      this.frmRequest.get('project').enable();
      this.frmRequest.get('observations').enable();
      this.frmRequest.get('adviser').disable();
      this.frmRequest.get('noIntegrants').enable();
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
      this.frmRequest.get('honorific').disable();
      this.frmRequest.get('titulationOption').disable();
    }
  }

  public onUpload(event): void {
    this.isLoadFile = false;
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        if (event.target.files[0].size > this.MAX_SIZE_FILE) {
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional',
            'Error, su archivo debe ser inferior a 3MB');
        } else {
          this.fileData = event.target.files[0];
          this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
            'Archivo ' + this.fileData.name + ' cargado correctamente');
          this.isLoadFile = true;
        }
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional',
          'Error, su archivo debe ser de tipo PDF');
      }
    }
  }

  public onToggle(): void {
    this.isToggle = !this.isToggle;
    this.frmRequest.patchValue({ 'honorific': this.isToggle });
  }

  public onSave(): void {
    let errorExists = false;
    if (!this.isLoadFile && this.operationMode === eOperation.NEW) {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'No se ha cargado archivo de portada');
      errorExists = true;
    }

    if (this.frmRequest.get('noIntegrants').value > 1 && (typeof (this.integrants) === 'undefined' || this.integrants.length === 0)) {
      this.frmRequest.get('noIntegrants').setErrors({ 'notEntered': true });
      this.frmRequest.get('noIntegrants').markAsTouched();
      errorExists = true;
    }

    if (typeof (this.frmRequest.get('adviser').value) === 'undefined' || !this.frmRequest.get('adviser').value || !this.adviserInfo) {
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'No se ha seleccionado asesor');
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
    this.frmData.append('folderId', this.folderId);
    this.frmData.append('ControlNumber', this.userInformation.email);
    this.frmData.append('FullName', this.userInformation.name.fullName);
    this.frmData.append('Career', this.typeCareer);
    this.frmData.append('Document', eFILES.PROYECTO);
    // Data
    this.frmData.append('adviserName', this.adviserInfo.name);
    this.frmData.append('adviserTitle', this.adviserInfo.title);
    this.frmData.append('adviserCedula', this.adviserInfo.cedula);
    this.frmData.append('adviserEmail', this.adviserInfo.email);
    this.frmData.append('noIntegrants', this.frmRequest.get('noIntegrants').value);
    this.frmData.append('projectName', this.frmRequest.get('project').value.trim().replace(/\s+/g, ' '));
    this.frmData.append('email', this.frmRequest.get('email').value);
    this.frmData.append('status', 'Process');
    this.frmData.append('phase', eRequest.CAPTURED);
    this.frmData.append('telephone', this.frmRequest.get('telephone').value);
    this.frmData.append('honorificMention', this.frmRequest.get('honorific').value);
    this.frmData.append('lastModified', this.frmRequest.get('project').value);
    this.frmData.append('product', this.frmRequest.get('product').value);
    this.frmData.append('department', this.deptoInfo.name);
    this.frmData.append('boss', this.deptoInfo.boss);
    this.frmData.append('titulationOption', this.frmRequest.get('titulationOption').value);
    this.loadingService.setLoading(true);
    switch (this.operationMode) {
      case eOperation.NEW: {
        this.studentProvider.request(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(data.request._id, this.integrants).subscribe(_ => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud guardada correctamente');
            this.loadingService.setLoading(false);
            this.btnSubmitRequest.emit(true);
          }, _ => {
            this.loadingService.setLoading(false);
            this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al guardar integrantes');
            this.btnSubmitRequest.emit(false);
          });
          this.loadingService.setLoading(false);
          if (data.code && data.code !== 200) {
            this.notificationsServ
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al enviar código de verificación');
          } else {
            this.notificationsServ
              .showNotification(eNotificationType.INFORMATION, 'Acto recepcional',
                'Su código de verificación ha sido enviado al correo ingresado');
          }
        }, _ => {
          this.loadingService.setLoading(false);
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al guardar solicitud');
          this.btnSubmitRequest.emit(false);
        });
        break;
      }
      case eOperation.EDIT: {
        console.log('EDITADO');
        const value = this.request.documents.find(x => x.nameFile === eFILES.PROYECTO);
        let isEmailChanged = false;
        this.frmData.append('fileId', value.driveId);
        if (this._request.email !== this.frmData.get('email')) {
          this.frmData.append('verificationCode', '000000');
          this.frmData.append('verificationStatus', 'false');
          this.frmData.append('sentVerificationCode', 'false');
          isEmailChanged = true;
        }
        this.studentProvider.updateRequest(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(this.request._id, this.integrants).subscribe(_ => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud editada correctamente');
            this.isEdit = false;
            this.viewObservation = false;
            this.loadingService.setLoading(false);
            if (isEmailChanged) {
              if (data.code && data.code !== 200) {
                this.notificationsServ
                  .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al enviar código de verificación');
              } else {
                this.notificationsServ
                  .showNotification(eNotificationType.INFORMATION, 'Acto recepcional',
                    'Su código de verificación ha sido enviado al correo ingresado');
              }
            }
            this.getRequest();
            this.btnSubmitRequest.emit(true);
          }, _ => {
            this.loadingService.setLoading(false);
            this.notificationsServ
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error al agregar integrantes');
            this.btnSubmitRequest.emit(false);
          });
        }, _ => {
          this.loadingService.setLoading(false);
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
          this.btnSubmitRequest.emit(false);
        });
        break;
      }
    }
  }

  public Send(): void {
    this.loadingService.setLoading(true);
    const data = {
      operation: eStatusRequest.ACCEPT,
      doer: this.cookiesService.getData().user.name.fullName,
      phase: eRequest.CAPTURED,
      department: this.request.department.name,
      boss: this.request.department.boss
    };
    this.requestProvider.updateRequest(this.request._id, data,this.filterRole).subscribe(_ => {
      this.loadingService.setLoading(false);
      this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto Recepcional', 'Solicitud Enviada');
      this.btnSubmitRequest.emit(true);
    }, error => {
      this.loadingService.setLoading(false);
      this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto Recepcional', error);
      this.btnSubmitRequest.emit(false);
    });
  }

  public selectAdviser(): void {
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
        this.frmRequest.patchValue({ 'adviser': result.Employee.trim() });
        this.deptoInfo = result.Depto;
        this.adviserInfo = result.ExtraInfo;
      }
    });
  }

  public addIntegrants(): void {
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

  public generateRequestPDF() {
    window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
  }

  private getFolderId() {
    this.studentProvider.getDriveFolderId(this.userInformation.email, eFOLDER.TITULACION).subscribe(folder => {
      this.folderId = folder.folderIdInDrive;
    });
  }

  public showHelp(): void {
    Swal.fire({
      type: 'info',
      title: '¡Ayuda!',
      text: 'Sube en un archivo PDF la carátula de tu proyecto de residencia firmada con el visto bueno de tu asesor',
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
    });
  }

  public verifyEmail() {
    Swal.fire({
      title: 'Verificación de correo',
      text: 'Ingrese el código de verificación que llegó a su correo',
      type: 'warning',
      input: 'text',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'blue',
      cancelButtonColor: 'red',
      confirmButtonText: 'Verificar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      preConfirm: (code) => {
        if (code) {
          return code;
        } else {
          Swal.showValidationMessage('El campo es requerido');
        }
      },
    }).then((result) => {
      if (result.value) {
        this.requestProvider.verifyCode(this.request._id, result.value)
          .subscribe(res => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Verificación de correo', res.message);
            this.operationMode = eOperation.EDIT;
            this.request.verificationStatus = true;
          }, err => {
            const message = JSON.parse(err._body).error;
            this.notificationsServ.showNotification(eNotificationType.ERROR, 'Verificación de correo', message);
          });
      }
    });
  }

  public cancelEdit() {
    this.isEdit = false;
    if (this.request.verificationStatus) {
      this.operationMode = eOperation.EDIT;
    } else {
      this.operationMode = eOperation.VERIFICATION;
    }
    this.disabledControl();
    this._resetValues(this.request);
  }

  public sendVerificationCode() {
    this.requestProvider.sendVerificationCode(this._request._id)
      .subscribe(_ => {
        this.notificationsServ
          .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Correo envíado con éxito');
        this.isSentVerificationCode = true;
        this._request.sentVerificationCode = true;
      }, err => {
        const message = JSON.parse(err._body).error;
        this.notificationsServ
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
      });
  }

  public cleanForm() {
    this.frmRequest.get('telephone').reset();
    this.frmRequest.get('email').reset();
    this.frmRequest.get('adviser').reset();
    this.frmRequest.get('project').reset();

    this.adviserInfo = {name: '', title: '', cedula: ''};
    this.isToggle = false;
    this.isLoadFile = false;
    this.fileData = null;
  }

  private _resetValues(request: iRequest) {
    this.frmRequest.setValue({
      'name': request.student.name,
      'lastname': request.student.lastName,
      'telephone': request.telephone,
      'email': request.email.toLowerCase(),
      'adviser': request.adviser.name,
      'noIntegrants': request.noIntegrants,
      'observations': request.observation,
      'project': request.projectName,
      'product': request.product,
      'honorific': request.honorificMention,
      'titulationOption': request.titulationOption,
    });
    this.adviserInfo = request.adviser;
    this.isToggle = this.request.honorificMention;
  }
}
