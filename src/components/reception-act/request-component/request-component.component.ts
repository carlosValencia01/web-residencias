import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import { DropzoneConfigInterface, DropzoneComponent } from 'ngx-dropzone-wrapper';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-request-component',
  templateUrl: './request-component.component.html',
  styleUrls: ['./request-component.component.scss']
})
export class RequestComponentComponent implements OnInit {
  //CONSTANTES
  // tslint:disable-next-line: no-input-rename
  @Input('request') _request: iRequest;
  // tslint:disable-next-line: no-output-rename
  @Output('onSubmit') btnSubmitRequest = new EventEmitter<boolean>();
  private MAX_SIZE_FILE: number = 3145728;
  public frmRequest: FormGroup;
  public fileData: any;
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
  private URL: string;
  private oRequest: uRequest;
  // public dropZone: DropzoneConfigInterface;
  public folderId: String;
  public activePeriod;
  public foldersByPeriod = [];
  private adviserInfo: { name: string, title: string, cedula: string };
  public isSentVerificationCode: Boolean;
  // @ViewChild('dropZone') drop: any;

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
    private _InscriptionsProvider: InscriptionsProvider,
  ) {
    this.userInformation = this.cookiesService.getData().user;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.typeCareer = <keyof typeof eCAREER>this.userInformation.career;
    this.getFolderId();
  }

  ngOnInit() {
    this.oRequest = new uRequest(this._request, this.imgService);
    console.log("Information", this.userInformation);
    this.frmRequest = new FormGroup(
      {
        'name': new FormControl({ value: this.firstName(this.userInformation.name.fullName), disabled: true }, Validators.required),
        'lastname': new FormControl({ value: this.lastName(this.userInformation.name.fullName), disabled: true }, Validators.required),
        'telephone': new FormControl(null, [Validators.required,
        Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$')]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'project': new FormControl(null, Validators.required),
        'product': new FormControl({ value: 'MEMORIA DE RESIDENCIA PROFESIONAL', disabled: true }, Validators.required),
        'observations': new FormControl(null),
        'adviser': new FormControl({ value: '', disabled: true }, Validators.required),
        'noIntegrants': new FormControl(1, [Validators.required, Validators.pattern('^[1-9]\d*$')]),
        'honorific': new FormControl(false, Validators.required),
        'titulationOption': new FormControl({ value: 'XI - TITULACIÓN INTEGRAL', disabled: true}, Validators.required)
      });
    this.getRequest();
  }

  private firstName(fullName: string): string {
    const name: String[] = fullName.split(/\s+/);
    const longitud = name.length;
    let firstName: string = "";
    if (longitud > 2) {
      for (let i = 0; i < longitud - 2; i++)
        firstName += name[i] + " ";
    }
    else
      firstName = "Sin Capturar ";
    return firstName.substr(0, firstName.length - 1);
  }

  private lastName(fullName: string): string {
    const name: String[] = fullName.split(/\s+/).reverse();
    const longitud = name.length;
    let lastName: string = "";
    if (longitud > 2) {
      for (let i = 0; i < 2; i++)
        lastName += name[i] + " ";
    }
    else
      lastName = "Sin Capturar ";
    return lastName.substr(0, lastName.length - 1);
  }

  getRequest() {
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
        console.log("opera", this.operationMode);
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
    this.deptoInfo = request.request[0].department;
    this.adviserInfo = request.request[0].adviser;

    this.assignName();

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
    this.isSentVerificationCode = this._request.sentVerificationCode;
  }

  Edit(): void {
    this.isEdit = !this.isEdit;
    if (this.operationMode === eOperation.VERIFICATION) {
      this.operationMode = eOperation.EDIT;
    }
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

  onUpload(event): void {
    this.isLoadFile = false;
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        if (event.target.files[0].size > this.MAX_SIZE_FILE) {
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App',
            'Error, su archivo debe ser inferior a 3MB');
        } else {
          this.fileData = event.target.files[0];
          this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App',
            'Archivo ' + this.fileData.name + ' cargado correctamente');
          this.isLoadFile = true;
        }
      } else {
        this.notificationsServ.showNotification(eNotificationType.ERROR, 'Titulación App',
          'Error, su archivo debe ser de tipo PDF');
      }
    }
  }

  onToggle(): void {
    this.isToggle = !this.isToggle;
    this.frmRequest.patchValue({ 'honorific': this.isToggle });
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

    if (typeof (this.frmRequest.get('adviser').value) === 'undefined' || !this.frmRequest.get('adviser').value || !this.adviserInfo) {
      this.notificationsServ.showNotification(eNotificationType.ERROR, '', 'No se ha seleccionado asesor');
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
    this.frmData.append('noIntegrants', this.frmRequest.get('noIntegrants').value);
    this.frmData.append('projectName', this.frmRequest.get('project').value);
    this.frmData.append('email', this.frmRequest.get('email').value);
    this.frmData.append('status', 'Process');
    this.frmData.append('phase', 'Solicitado');
    this.frmData.append('telephone', this.frmRequest.get('telephone').value);
    this.frmData.append('honorificMention', this.frmRequest.get('honorific').value);
    this.frmData.append('lastModified', this.frmRequest.get('project').value);
    this.frmData.append('product', this.frmRequest.get('product').value);
    this.frmData.append('department', this.deptoInfo.name);
    this.frmData.append('boss', this.deptoInfo.boss);
    this.frmData.append('titulationOption', this.frmRequest.get('titulationOption').value);
    switch (this.operationMode) {
      case eOperation.NEW: {
        this.studentProvider.request(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(data.request._id, this.integrants).subscribe(_ => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud guardada correctamente');
            this.btnSubmitRequest.emit(true);
          }, error => {
            console.log('error2', error);
            this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al guardar integrantes');
            this.btnSubmitRequest.emit(false);
          });
          if (data.code && data.code !== 200) {
            this.notificationsServ
              .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Error al enviar código de verificación');
          } else {
            this.notificationsServ
              .showNotification(eNotificationType.INFORMATION,
                'Acto recepcional', 'Su código de verificación ha sido enviado al correo ingresado');
          }
        }, error => {
          console.log('error', error);
          this.notificationsServ.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al guardar solicitud');
          this.btnSubmitRequest.emit(false);
        });
        break;
      }
      case eOperation.EDIT: {
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
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Editada Correctamente');
            this.isEdit = false;
            this.viewObservation = false;
            if (isEmailChanged) {
              if (data.code && data.code !== 200) {
                this.notificationsServ
                  .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Error al enviar código de verificación');
              } else {
                this.notificationsServ
                  .showNotification(eNotificationType.INFORMATION,
                    'Acto recepcional', 'Su código de verificación ha sido enviado al correo ingresado');
              }
            }
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
        this.frmRequest.patchValue({ 'adviser': result.Employee.trim() });
        this.deptoInfo = result.Depto;
        this.adviserInfo = result.ExtraInfo;
        console.log("depto", this.deptoInfo);
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

  getFolderId() {
    let _idStudent = this.userInformation._id;
    this._InscriptionsProvider.getActivePeriod().subscribe(
      period => {
        console.log("periodo", period);
        if (period.period) {
          this.activePeriod = period.period;
          console.log("ActivePeriod", this.activePeriod);
          this.studentProvider.getPeriodId(_idStudent.toString()).subscribe(
            per => {
              console.log("per", per);
              if (!per.student.idPeriodInscription) {
                this.studentProvider.updateStudent(_idStudent, { idPeriodInscription: this.activePeriod._id });
              }
            }
          );
          //first check folderId on Student model
          this.studentProvider.getFolderId(_idStudent).subscribe(
            student => {
              if (student.folder) {// folder exists
                if (student.folder.idFolderInDrive) {
                  this.folderId = student.folder.idFolderInDrive;                  
                }
                else { //folder doesn't exists then create it                  
                  this.createFolder();
                }
              } else {
                this.createFolder();
              }
            });
        }
      }
    );
  }

  createFolder() {
    const _idStudent = this.userInformation._id;
    let folderStudentName = this.userInformation.email + ' - ' + this.userInformation.name.fullName;
    console.log("Periodo", this.activePeriod._id,"--", folderStudentName);
    this._InscriptionsProvider.getFoldersByPeriod(this.activePeriod._id, 2).subscribe(
      (folders) => {
         console.log(folders,'folderss');

        this.foldersByPeriod = folders.folders;
        let folderPeriod = this.foldersByPeriod.filter(folder => folder.name.indexOf(this.activePeriod.periodName) !== -1);

        // 1 check career folder
        let folderCareer = this.foldersByPeriod.filter(folder => folder.name === this.userInformation.career);

        if (folderCareer.length === 0) {
          // console.log('1');

          this._InscriptionsProvider.createSubFolder(this.userInformation.career, this.activePeriod._id, folderPeriod[0].idFolderInDrive, 2).subscribe(
            career => {
              // console.log('2');

              // student folder doesn't exists then create new folder
              this._InscriptionsProvider.createSubFolder(folderStudentName, this.activePeriod._id, career.folder.idFolderInDrive, 2).subscribe(
                studentF => {
                  this.folderId = studentF.folder.idFolderInDrive;                 
                  this.studentProvider.updateStudent(this.userInformation._id, { folderId: studentF.folder._id });
                },
                err => {
                  console.log(err);
                }
              );
            },
            err => {
              console.log(err);
            }
          );
        } else {
          this._InscriptionsProvider.createSubFolder(folderStudentName, this.activePeriod._id, folderCareer[0].idFolderInDrive, 2).subscribe(
            studentF => {
              this.folderId = studentF.folder.idFolderInDrive;                            
              this.studentProvider.updateStudent(this.userInformation._id, { folderId: studentF.folder._id }).subscribe(
                upd => { },
                err => { }
              );
            },
            err => { console.log(err); }
          );
        }
      },
      err => {
        console.log(err, '==============error');
      }
    );
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
