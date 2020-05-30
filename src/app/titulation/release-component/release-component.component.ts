import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { EmployeeAdviserComponent } from 'src/app/titulation/employee-adviser/employee-adviser.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-release-component',
  templateUrl: './release-component.component.html',
  styleUrls: ['./release-component.component.scss']
})
export class ReleaseComponentComponent implements OnInit {
  @ViewChild('time') Time: NgxTimepickerFieldComponent;
  public fileData: any;
  public frmConsejo: FormGroup;
  public isReject: boolean;
  public information: {
    jury: Array<{ name: string, title: string, cedula: string, email: string }>,
    observation: string,
    minutes: number,
    id: string,
    folder: string,
    duration: number,
    request: iRequest
  };
  public activeReleased = false;
  public enableUpload = false;
  public folderId;
  private userInformation: any;
  private juryInfo: Array<{ name: string, title: string, cedula: string, email?: string }>;
  private oRequest: uRequest;
  private studentCareer: string;
  private studentCareerAcronym: string;

  constructor(
    public dialogRef: MatDialogRef<ReleaseComponentComponent>,
    private notifications: NotificationsServices,
    public dialog: MatDialog,
    private cookiesService: CookiesService,
    private _RequestProvider: RequestProvider,
    public _ImageToBase64Service: ImageToBase64Service,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadingService: LoadingService,
  ) {
    this.information = data;
    this.isReject = typeof (this.information.observation) !== 'undefined' && this.information.observation.length > 0;
    this.userInformation = this.cookiesService.getData().user;
    this.studentCareer = this.information.request.career;
    this.studentCareerAcronym = this.information.request.careerAcronym;
    this.oRequest = new uRequest(this.information.request, this._ImageToBase64Service, this.cookiesService);
  }

  ngOnInit() {
    this.frmConsejo = new FormGroup({
      'president': new FormControl(this.information.request.adviser.name, Validators.required),
      'secretary': new FormControl(null, Validators.required),
      'vocal': new FormControl(null, Validators.required),
      'substitute': new FormControl(null, Validators.required),
      'duration': new FormControl('60', Validators.required)
    });
    this.Time.format = 24;
    if (this.isReject || this.information.jury.length > 0) {
      this.juryInfo = this.information.jury;
      this.frmConsejo.setValue({
        'president': this.juryInfo[0].name,
        'secretary': this.juryInfo[1].name,
        'vocal': this.juryInfo[2].name,
        'substitute': this.juryInfo[3].name,
        'duration': this.information.duration
      });
      const hour = this.information.minutes / 60;
      const minutes = this.information.minutes % 60;
      this.Time.writeValue(hour + ':' + minutes);
      this.activeReleased = this.isReject || this.juryInfo.reduce((value, current) => current.name.length > 0 && value, true);
      this.enableUpload = this.activeReleased;
      if (this.isReject) {
        this.loadFile();
      }
    } else {
      this.juryInfo = [
        {
          name: this.information.request.adviser.name,
          title: this.information.request.adviser.title,
          cedula: this.information.request.adviser.cedula,
          email: this.information.request.adviser.email
        },
        { name: '', title: '', cedula: '', email: '' },
        { name: '', title: '', cedula: '', email: '' },
        { name: '', title: '', cedula: '', email: '' }
      ];
      this.Time.writeValue('7:00');
    }

  }

  loadFile(): void {
    this.loadingService.setLoading(true);
    this._RequestProvider.getResource(this.information.request._id, eFILES.RELEASED).subscribe(data => {
      this.fileData = data;
      this.loadingService.setLoading(false);
    }, _ => {
      this.loadingService.setLoading(false);
      this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al recuperar recurso');
    });
  }

  obtenerCarreras(): Array<string> {
    const tmpArray: Array<string> = [];
    if (typeof (this.cookiesService.getPosition()) !== 'undefined') {
      this.cookiesService.getPosition().ascription.careers.forEach(e => {
        tmpArray.push(e.fullName);
      });
    }
    return tmpArray;
  }

  seeTrade() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-outline-success mx-2',
        cancelButton: 'btn btn-outline-danger'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: 'Número de oficio',
      input: 'textarea',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Número de oficio obligatorio';
        }
      }
    }).then((result) => {
      if (result.value) {
        window.open(this.oRequest.notificationAdvisory(result.value).output('bloburl'), '_blank');
      }
    });
  }

  selectEmployee(button): void {
    if (this.frmConsejo.disabled) {
      return;
    }
    this.frmConsejo.get(button).markAsUntouched();
    this.frmConsejo.get(button).setErrors(null);

    const ref = this.dialog.open(EmployeeAdviserComponent, {
      data: {
        carrer: this.studentCareer,
        careerAcronym: this.studentCareerAcronym,
        synodal: button,
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });

    ref.afterClosed().subscribe((result) => {

      if (typeof (result) != 'undefined') {
        this.enableUpload = false;
        if (this.juryInfo.findIndex(x => x.name === result.ExtraInfo.name) !== -1) {
          this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Empleado ya asignado');
        } else {
          switch (button) {
            case 'president': {
              this.frmConsejo.patchValue({ 'president': typeof (result) !== 'undefined' ? result.Employee : '' });
              this.juryInfo[0].name = result.ExtraInfo.name;
              this.juryInfo[0].title = result.ExtraInfo.title;
              this.juryInfo[0].cedula = result.ExtraInfo.cedula;
              this.juryInfo[0].email = result.ExtraInfo.email;
              break;
            }
            case 'secretary': {
              this.frmConsejo.patchValue({ 'secretary': typeof (result) !== 'undefined' ? result.Employee : '' });
              this.juryInfo[1].name = result.ExtraInfo.name;
              this.juryInfo[1].title = result.ExtraInfo.title;
              this.juryInfo[1].cedula = result.ExtraInfo.cedula;
              this.juryInfo[1].email = result.ExtraInfo.email;
              break;
            }
            case 'vocal': {
              this.frmConsejo.patchValue({ 'vocal': typeof (result) !== 'undefined' ? result.Employee : '' });
              this.juryInfo[2].name = result.ExtraInfo.name;
              this.juryInfo[2].title = result.ExtraInfo.title;
              this.juryInfo[2].cedula = result.ExtraInfo.cedula;
              this.juryInfo[2].email = result.ExtraInfo.email;
              break;
            }
            case 'substitute': {
              this.frmConsejo.patchValue({ 'substitute': typeof (result) !== 'undefined' ? result.Employee : '' });
              this.juryInfo[3].name = result.ExtraInfo.name;
              this.juryInfo[3].title = result.ExtraInfo.title;
              this.juryInfo[3].cedula = result.ExtraInfo.cedula;
              this.juryInfo[3].email = result.ExtraInfo.email;
              break;
            }
          }
        }
        const isCompleted = this.juryInfo.reduce((value, current) => current.name.length > 0 && value, true);
        if (isCompleted) {
          this.oRequest = new uRequest(this.information.request, this._ImageToBase64Service, this.cookiesService);
        }
        this.activeReleased = isCompleted; // this.juryInfo.length === 4;
      }
    });
  }

  onUpload(event): void {
    this.loadingService.setLoading(true);
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        const frmData = new FormData();
        frmData.append('file', event.target.files[0]);
        frmData.append('folderId', this.information.folder);
        frmData.append('Document', eFILES.RELEASED);
        frmData.append('IsEdit', 'true');
        frmData.append('phase', this.information.request.phase);
        this._RequestProvider.uploadFile(this.information.id, frmData).subscribe(data => {
          this.fileData = event.target.files[0];
          this.loadingService.setLoading(false);
        }, _ => {
          this.notifications
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
          this.loadingService.setLoading(false);
        });

      } else {
        this.notifications
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, su archivo debe ser de tipo PDF');
        this.loadingService.setLoading(false);
      }
    }
  }

  onSave(): void {
    const time: number = Number(this.Time.hour * 60) + Number(this.Time.minute);
    this.dialogRef.close(
      {
        file: this.fileData,
        proposedHour: time,
        jury: this.juryInfo,
        upload: typeof (this.fileData) !== 'undefined',
        duration: this.frmConsejo.get('duration').value
      });
  }

  async releaseGenerate() {
    this.information.request.jury = this.juryInfo;
    this.information.request.proposedDate = new Date();
    this.information.request.proposedHour = Number(this.Time.hour * 60) + Number(this.Time.minute);
    window.open(this.oRequest.projectReleaseNew().output('bloburl'), '_blank');
    this.enableUpload = true;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
