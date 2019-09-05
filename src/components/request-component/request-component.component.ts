import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { StudentProvider } from 'src/providers/student.prov';
import { CookiesService } from 'src/services/cookie.service';
import { eCAREER } from 'src/enumerators/career.enum';
import { eFILES } from 'src/enumerators/document.enum';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
import { RequestProvider } from 'src/providers/request.prov';
import { eOperation } from 'src/enumerators/operation.enum';
import { DatePipe } from '@angular/common';
import { iRequest } from 'src/entities/request.model';
import { IEmployee } from 'src/entities/employee.model';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeAdviserComponent } from 'src/components/employee-adviser/employee-adviser.component';
import { IntegrantsComponentComponent } from 'src/components/integrants-component/integrants-component.component';
import { iIntegrant } from 'src/entities/integrant.model';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-request-component',
  templateUrl: './request-component.component.html',
  styleUrls: ['./request-component.component.scss']
})
export class RequestComponentComponent implements OnInit {
  @Output('onSubmit') btnSubmitRequest = new EventEmitter<boolean>();

  public frmRequest: FormGroup;
  private fileData: any;
  private frmData: any;
  private isLoadFile: boolean;
  private isLoadImage: boolean;
  private userInformation: any;
  private typeCareer: any;
  private operationMode: eOperation;
  private request: iRequest;
  private resource: string;
  private employees: IEmployee[];
  private isToggle: boolean = false;
  public observations:string;
  private viewObservation: boolean = false;
  private deptoInfo: { name: string, boss: string };
  private integrants: Array<iIntegrant> = [];
  constructor(
    public studentProvider: StudentProvider,
    private cookiesService: CookiesService,
    private notificationsServ: NotificationsServices,
    private requestProvider: RequestProvider,
    private dateFormat: DatePipe,
    private router: Router,
    private routeActive: ActivatedRoute
    , public dialog: MatDialog
  ) {
    this.userInformation = this.cookiesService.getData().user;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.typeCareer = <keyof typeof eCAREER>this.userInformation.career;
  }

  ngOnInit() {
    this.frmRequest = new FormGroup(
      {
        'name': new FormControl(this.userInformation.name.firstName, Validators.required),
        'lastname': new FormControl(this.userInformation.name.lastName, Validators.required),
        'telephone': new FormControl(null, [Validators.required,
        Validators.pattern("^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$")]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        "project": new FormControl(null, Validators.required),
        "product": new FormControl(null, Validators.required),
        "observations": new FormControl(null),
        "adviser": new FormControl({ value: '', disabled: true }, Validators.required),
        "noIntegrants": new FormControl(1, [Validators.required, Validators.pattern('^[1-9]\d*$')]),
        "dateProposed": new FormControl(null, Validators.required),
        "honorific": new FormControl(false, Validators.required)
      });

    this.studentProvider.getRequest(this.userInformation._id).subscribe(res => {
      if (typeof (res) !== 'undefined' && res.request.length > 0) {
        this.loadRequest(res);
        this.operationMode = eOperation.EDIT;
        this.observations=this.request.observation;
        this.viewObservation=true;            
      } else {
        this.operationMode = eOperation.NEW;
      }
    }, error => {
      this.operationMode = eOperation.NEW;
    });
  }

  revisedView():void{
    this.viewObservation=false;
  }
  assignName(): void {
    let nameArray = this.request.student.fullName.split(/\s*\s\s*/);
    let name = "";
    let maxIteration = nameArray.length - 2;
    for (let i = 0; i < maxIteration; i++) {
      name += nameArray[i] + " ";
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
      "adviser": this.request.adviser,
      "noIntegrants": this.request.noIntegrants,
      "observations": this.request.observation,
      'project': this.request.projectName,
      'product': this.request.product,
      'dateProposed': this.dateFormat.transform(this.request.proposedDate, 'yyyy-MM-dd'),
      'honorific': this.request.honorificMention,
    });
    this.isToggle = this.request.honorificMention
    this.studentProvider.getResource(this.request.studentId, eFILES.PROYECTO).subscribe(
      data => {
        this.generateImageFromBlob(data);
      }
    );
  }

  onUpload(event): void {
    if (event.target.files && event.target.files[0]) {
      this.fileData = event.target.files[0];
      this.notificationsServ.showNotification(eNotificationType.SUCCESS, "Titulación App", "Archivo " + this.fileData.name + " cargado correctamente");
      this.isLoadFile = true;
    }
  }

  generateImageFromBlob(image: Blob): void {
    const reader = new FileReader();
    this.isLoadImage = false;
    reader.addEventListener('load', () => {
      let result: any = reader.result;
      this.resource = result;
      this.isLoadImage = true;
    }, false);
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  onToggle(): void {
    this.isToggle = !this.isToggle;
    this.frmRequest.patchValue(
      { 'honorific': this.isToggle }
    );
  }

  onSave(event): void {
    let errorExists = false;
    if (!this.isLoadFile && this.operationMode === eOperation.NEW) {
      this.notificationsServ.showNotification(eNotificationType.ERROR, '', 'No se ha cargado archivo de portada');
      errorExists = true;
    }

    if (this.frmRequest.get('noIntegrants').value > 1 && (typeof (this.integrants) === 'undefined' || this.integrants.length == 0)) {
      this.frmRequest.get('noIntegrants').setErrors({ 'notEntered': true })
      this.frmRequest.get("noIntegrants").markAsTouched();      
      errorExists = true;
    }

    if (typeof (this.frmRequest.get("adviser").value) === 'undefined' || !this.frmRequest.get('adviser').value) {
      this.frmRequest.get("adviser").setErrors({ required: true });
      this.frmRequest.get("adviser").markAsTouched();
      errorExists = true;
    }
    if (errorExists)
      return;
    //Data FormData
    this.frmData = new FormData();
    this.frmData.append('file', this.fileData);
    this.frmData.append('ControlNumber', this.userInformation.email);
    this.frmData.append('FullName', this.userInformation.name.fullName);
    this.frmData.append('Career', this.typeCareer);
    this.frmData.append('Document', eFILES.PROYECTO);
    //Data
    this.frmData.append('adviser', this.frmRequest.get('adviser').value);
    this.frmData.append('noIntegrants', this.frmRequest.get('noIntegrants').value);
    this.frmData.append('projectName', this.frmRequest.get('project').value);
    this.frmData.append('email', this.frmRequest.get('email').value);
    this.frmData.append('proposedDate', this.frmRequest.get('dateProposed').value);
    this.frmData.append('status', "Process");
    this.frmData.append('phase', "Solicitado");
    this.frmData.append('telephone', this.frmRequest.get('telephone').value);
    this.frmData.append('honorificMention', this.frmRequest.get('honorific').value);
    this.frmData.append('lastModified', this.frmRequest.get('project').value);
    this.frmData.append('product', this.frmRequest.get('product').value);

    switch (this.operationMode) {
      case eOperation.NEW: {
        this.frmData.append('department', this.deptoInfo.name);
        this.frmData.append('boss', this.deptoInfo.boss);
        this.studentProvider.request(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(data.request._id, this.integrants).subscribe(data => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, "Titulación App", "Solicitud Enviada Correctamente");
            this.btnSubmitRequest.emit(true);
          }, error => {
            this.notificationsServ.showNotification(eNotificationType.ERROR, "Titulación App", error);
            this.btnSubmitRequest.emit(false);
          });
        }, error => {
          this.notificationsServ.showNotification(eNotificationType.ERROR, "Titulación App", error);
          this.btnSubmitRequest.emit(false);
        });
        break;
      }

      case eOperation.EDIT: {
        this.studentProvider.updateRequest(this.userInformation._id, this.frmData).subscribe(data => {
          this.studentProvider.addIntegrants(this.request._id, this.integrants).subscribe(data => {
            this.notificationsServ.showNotification(eNotificationType.SUCCESS, "Titulación App", "Solicitud Enviada Correctamente");
            this.btnSubmitRequest.emit(true);
          }, error => {
            this.notificationsServ.showNotification(eNotificationType.ERROR, "Titulación App", error);
            this.btnSubmitRequest.emit(false);
          });
        }, error => {
          this.notificationsServ.showNotification(eNotificationType.ERROR, "Titulación App", error);
          this.btnSubmitRequest.emit(false);
        });
        break;
      }
    }
  }

  valor(): void {
    console.log(typeof (this.frmRequest.get('adviser').value) === 'undefined')
    console.log(!(this.frmRequest.get('adviser').value))
  }

  selectAdviser(): void {
    this.frmRequest.get('adviser').markAsUntouched();
    this.frmRequest.get('adviser').setErrors(null);
    const ref = this.dialog.open(EmployeeAdviserComponent, {
      data: {
        carrer: this.userInformation.career
      },
      width: '45em'
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        console.log("result", result.Employee.name);
        this.frmRequest.patchValue({ 'adviser': result.Employee });
        //if(this.operationMode===eOperation.NEW)
        this.deptoInfo = result.Depto;
      }
    });
  }

  addIntegrants(): void {
    this.frmRequest.get('noIntegrants').setErrors(null);
    const ref = this.dialog.open(IntegrantsComponentComponent, {
      data: {
        integrants: this.operationMode === eOperation.NEW ? [] : this.request.integrants
      },
      width: '45em'
    });

    ref.afterClosed().subscribe((integrants) => {
      if (typeof (integrants) !== 'undefined') {
        if (this.operationMode === eOperation.EDIT) {
          this.request.integrants = integrants;
          this.integrants = integrants;
        }
        else {
          this.integrants = integrants;
        }
      }
    });
  }
}
