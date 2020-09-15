import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';

interface Category {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-social-service-init-form',
  templateUrl: './social-service-init-form.component.html',
  styleUrls: ['./social-service-init-form.component.scss']
})
export class SocialServiceInitFormComponent implements OnInit {
  @Input() controlStudentId: string;
  @Input() sendEmailCode: boolean;
  @Input() verificationEmail: boolean;
  @Input() email: string;
  @Output() sendInformation: EventEmitter<any> = new EventEmitter();
  public formRequest: FormGroup;
  public communityName: FormControl;
  public emailStudent: FormControl;
  public code: FormControl;
  public categories: Category[] = [
    {value: 'a', viewValue: 'Educacion para adultos'},
    {value: 'b', viewValue: 'Desarrollo de comunidad: Urbano, suburbano, rural'},
    {value: 'c', viewValue: 'Asesoría académica a niños primaria, secundaria o bachillerato de zonas vulnerables de escuelas publicas'},
    {value: 'd', viewValue: 'Promocion social, cultural o deportiva en la comunidad'},
    {value: 'e', viewValue: 'Dependencia de Gobierno'},
    {value: 'f', viewValue: 'I.T de Tepic'},
    {value: 'g', viewValue: 'Instituciones educativas privadas'}
  ];
  public communityFlag = false;
  public fieldMessages = {
    '1': 'Nombre  y teléfono de la dependencia en la que se pretende realizar el Servicio Social.'
  };

  constructor(private formBuilder: FormBuilder,
              private controlStudentProv: ControlStudentProv,
              private loadingService: LoadingService,
              private notificationsService: NotificationsServices) {
  }

  ngOnInit() {
    this._initialize();
    this.communityName = new FormControl('');
    this.emailStudent = new FormControl({value: this.email, disabled: this.sendEmailCode}, Validators.required);
    this.code = new FormControl({value: '', disabled: (!this.sendEmailCode || this.verificationEmail)}, Validators.required);
  }

  community(event) {
    if (event.value === 'd') {
      this.communityName.setValidators(Validators.required);
      return this.communityFlag = true;
    }
    this.communityName.clearValidators();
    return this.communityFlag = false;
  }

  async registerRequest() {
    if (this.formRequest.invalid) {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Por favor de llenar todos los campos', '');
    } else {
      let programType = this.categories.find(c => c.value === this.formRequest.get('dependencyProgramType').value).viewValue;
      if (this.communityFlag) {
        if (this.communityName.invalid) {
          this.notificationsService.showNotification(eNotificationType.ERROR, 'Por favor describa su comunidad', '');
          return;
        } else {
          programType = programType + ' ' + this.communityName.value;
        }
      }
      this.formRequest.get('dependencyProgramType').setValue(programType);
      this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId, this.formRequest.value)
        .subscribe( res => {
          this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
          this.sendInformation.emit();
        }, error => {
          this.loadingService.setLoading(true);
        }, () => this.loadingService.setLoading(false));
    }
  }

  _initialize() {
    this.formRequest = this.formBuilder.group({
      dependencyName: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyPhone: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyAddress: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyHeadline: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyHeadlinePosition: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyDepartment: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyDepartmentManager: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyDepartmentManagerEmail: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramName: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramModality: [true, Validators.required],
      initialDate: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyActivities: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramType: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramObjective: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramLocationInside: [true, Validators.required],
      dependencyProgramLocation: [{value: '', disabled: !this.verificationEmail}, Validators.required]
    });
  }

  sendEmailConfirmation() {
    if (this.emailStudent.invalid) {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Verifica que el correo escrito sea correcto', '');
    } else {
      this.loadingService.setLoading(true);
      this.controlStudentProv.sendCodeForEmailConfirmation(this.controlStudentId, this.emailStudent.value)
        .subscribe(res => {
          if (res.error) {
            this.notificationsService.showNotification(eNotificationType.INFORMATION, res.msg, '');
          } else {
            this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
            this.sendEmailCode = true;
            this.code.enable();
            this.emailStudent.disable();
          }
        }, error => {
          this.loadingService.setLoading(false);
          const message = JSON.parse(error._body).msg;
          this.notificationsService.showNotification(eNotificationType.ERROR, 'Error', message);
        }, () => this.loadingService.setLoading(false));
    }
  }

  verifyCode() {
    if (this.code.invalid) {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Verifica el campo de código por favor', '');
    } else {
      this.controlStudentProv.verifyCode({_id: this.controlStudentId, code: this.code.value})
        .subscribe( res => {
          this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
          this.verificationEmail = true;
          this.code.disable();
        }, error => {
          this.loadingService.setLoading(false);
          const message = JSON.parse(error._body).msg;
          this.notificationsService.showNotification(eNotificationType.ERROR, 'Error', message);
        }, () => this.loadingService.setLoading(false));
    }
  }

  getErrorMessages(field) {
    return this.formRequest.get(field).hasError('required') ? 'Campo obligatorio' : '';
  }

}
