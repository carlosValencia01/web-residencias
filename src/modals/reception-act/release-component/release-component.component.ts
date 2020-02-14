import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { EmployeeAdviserComponent } from 'src/modals/reception-act/employee-adviser/employee-adviser.component';
import { CookiesService } from 'src/services/app/cookie.service';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { iRequest } from 'src/entities/reception-act/request.model';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import Swal from 'sweetalert2';
import { eRequest } from 'src/enumerators/reception-act/request.enum';

@Component({
  selector: 'app-release-component',
  templateUrl: './release-component.component.html',
  styleUrls: ['./release-component.component.scss']
})
export class ReleaseComponentComponent implements OnInit {
  public fileData: any;
  public frmConsejo: FormGroup;
  private userInformation: any;
  public isReject: boolean;
  public information: { jury: Array<{ name: string, title: string, cedula: string }>, observation: string, minutes: number, id: string, folder: string, duration: number, request: iRequest };
  public folderId;
  private juryInfo: Array<{ name: string, title: string, cedula: string }>;
  private oRequest: uRequest;
  public activeReleased: boolean = false;
  public enableUpload: boolean = false;
  @ViewChild('time') Time: NgxTimepickerFieldComponent;
  private studentCareer: string;
  public showLoading: boolean = false;

  constructor(public dialogRef: MatDialogRef<ReleaseComponentComponent>,
    private notifications: NotificationsServices, public dialog: MatDialog,
    private cookiesService: CookiesService,
    private _RequestProvider: RequestProvider,
    public _ImageToBase64Service: ImageToBase64Service,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.information = data;
    this.isReject = typeof (this.information.observation) !== 'undefined' && this.information.observation.length > 0;
    this.userInformation = this.cookiesService.getData().user;
    this.studentCareer = this.information.request.career;
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
      this.Time.writeValue(hour + ":" + minutes);
      this.activeReleased = this.isReject || this.juryInfo.reduce((value, current) => current.name.length > 0 && value, true);
      this.enableUpload = this.activeReleased;
      if (this.isReject) {
        this.loadFile();
      }
    } else {
      this.juryInfo = [
        { name: this.information.request.adviser.name, title: this.information.request.adviser.title, cedula: this.information.request.adviser.cedula },
        { name: '', title: '', cedula: '' },
        { name: '', title: '', cedula: '' },
        { name: '', title: '', cedula: '' }
      ];
      this.Time.writeValue("7:00");
    }

  }

  loadFile(): void {
    this.showLoading = true;
    this._RequestProvider.getResource(this.information.request._id, eFILES.RELEASED).subscribe(data => {
      this.fileData = data;
      this.showLoading = false;
    }, error => {
      this.showLoading = false;
      this.notifications.showNotification(eNotificationType.ERROR, "Acto Recepcional", "Recuperación Fallida");
    });
  }
  obtenerCarreras(): Array<string> {
    let tmpArray: Array<string> = [];
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
          return 'Número de oficio obligatorio'
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
        carrer: this.studentCareer
      },
      disableClose: true,
      hasBackdrop: true,
      width: '50em'
    });

    ref.afterClosed().subscribe((result) => {

      if (typeof (result) != "undefined") {
        this.enableUpload = false;
        if (this.juryInfo.findIndex(x => x.name === result.ExtraInfo.name) !== -1) {
          this.notifications.showNotification(eNotificationType.ERROR, "Acto recepcional", "Empleado ya asignado");
        } else {
          switch (button) {
            case "president": {
              this.frmConsejo.patchValue({ 'president': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[0].name = result.ExtraInfo.name;
              this.juryInfo[0].title = result.ExtraInfo.title;
              this.juryInfo[0].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "secretary": {

              this.frmConsejo.patchValue({ 'secretary': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[1].name = result.ExtraInfo.name;
              this.juryInfo[1].title = result.ExtraInfo.title;
              this.juryInfo[1].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "vocal": {
              this.frmConsejo.patchValue({ 'vocal': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[2].name = result.ExtraInfo.name;
              this.juryInfo[2].title = result.ExtraInfo.title;
              this.juryInfo[2].cedula = result.ExtraInfo.cedula;
              break;
            }
            case "substitute": {
              this.frmConsejo.patchValue({ 'substitute': typeof (result) !== 'undefined' ? result.Employee : "" });
              this.juryInfo[3].name = result.ExtraInfo.name;
              this.juryInfo[3].title = result.ExtraInfo.title;
              this.juryInfo[3].cedula = result.ExtraInfo.cedula;
              break;
            }
          }
        }
        const isCompleted = this.juryInfo.reduce((value, current) => { return current.name.length > 0 && value; }, true);
        if (isCompleted) {
          this.oRequest = new uRequest(this.information.request, this._ImageToBase64Service, this.cookiesService);
        }
        this.activeReleased = isCompleted;//this.juryInfo.length === 4;
      }
    });
    // const time: number = Number(this.Time.hour * 60) + Number(this.Time.minute);
  }

  onUpload(event): void {
    this.showLoading = true;
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === 'application/pdf') {
        // this.fileData = event.target.files[0];
        let frmData = new FormData();
        frmData.append('file', event.target.files[0]);
        frmData.append('folderId', this.information.folder);
        frmData.append('Document', eFILES.RELEASED);
        frmData.append('IsEdit', 'true');
        frmData.append('phase', this.information.request.phase);
        this._RequestProvider.uploadFile(this.information.id, frmData).subscribe(data => {
          this.fileData = event.target.files[0];
          this.showLoading = false;
        }, error => {
          this.notifications.showNotification(eNotificationType.ERROR,
            "Acto recepcional", error);
          this.showLoading = false;
        });

      } else {
        this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional',
          'Error, su archivo debe ser de tipo PDF');
        this.showLoading = false;
      }
    }
  }

  onSave(): void {
    // if (typeof (this.fileData) !== 'undefined') {
    const time: number = Number(this.Time.hour * 60) + Number(this.Time.minute);
    this.dialogRef.close(
      {
        file: this.fileData,
        proposedHour: time,
        jury: this.juryInfo,
        upload: typeof (this.fileData) !== 'undefined',
        duration: this.frmConsejo.get('duration').value
      });
    // }
    // else {
    //   this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional',
    //     'Error, archivo no cargado');
    // }
  }

  async releaseGenerate() {
    this.information.request.jury = this.juryInfo;
    this.information.request.proposedDate = new Date();
    this.information.request.proposedHour = Number(this.Time.hour * 60) + Number(this.Time.minute);
    // await this.delay(1000);
    window.open(this.oRequest.projectReleaseNew().output('bloburl'), '_blank');
    this.enableUpload = true;
    // async () => {
    //   await this.delay(400);
    //   window.open(this.oRequest.projectReleaseNew().output('bloburl'), '_blank');
    // }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
