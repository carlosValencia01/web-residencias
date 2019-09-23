import { Component, OnInit, Output, ViewChild, EventEmitter, ElementRef, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { iRequest } from 'src/entities/request.model';
import { iIntegrant } from 'src/entities/integrant.model';
import { StudentProvider } from 'src/providers/student.prov';
import { CookiesService } from 'src/services/cookie.service';
import { RequestProvider } from 'src/providers/request.prov';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
import { eFILES } from 'src/enumerators/document.enum';
import { ObservationsComponentComponent } from 'src/components/observations-component/observations-component.component';

@Component({
  selector: 'app-request-view',
  templateUrl: './request-view.component.html',
  styleUrls: ['./request-view.component.scss']
})
export class RequestViewComponent implements OnInit {
  @Input('Request') RequestId: String;
  @ViewChild('observations') txtObservation: ElementRef;
  public frmRequest: FormGroup;
  private fileData: any;
  private userInformation: any;
  private request: iRequest;
  private isToggle = false;
  private isLoadFile: boolean;
  private isLoadImage: boolean;
  private resource: string;
  private integrants: Array<iIntegrant> = [];
  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private dateFormat: DatePipe,
    public dialog: MatDialog
  ) {
    console.log('VIEW RES', this.RequestId);
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
  }

  ngAfterContentInit() {
    this.requestProvider.getRequestById(this.RequestId).subscribe(res => {
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

}
