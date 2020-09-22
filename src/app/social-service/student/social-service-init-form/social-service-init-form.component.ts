import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {InitRequest} from '../../../entities/social-service/initRequest';
import {ImageToBase64Service} from '../../../services/app/img.to.base63.service';
import {CookiesService} from '../../../services/app/cookie.service';
import * as moment from 'moment';
moment.locale('es');
import {MatDialog} from '@angular/material';
import { DialogVerificationComponent } from '../../components/dialog-verification/dialog-verification.component';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';

interface Category {
  option: string;
  value: string;
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
  @Input() folderId: string;
  @Output() sendInformation: EventEmitter<any> = new EventEmitter();
  public formRequest: FormGroup;
  public communityName: FormControl;
  public emailStudent: FormControl;
  public code: FormControl;
  public minDate: Date;
  public maxDate: Date;
  public categories: Category[] = [
    {option: 'a', value: 'Educacion para adultos'},
    {option: 'b', value: 'Desarrollo de comunidad: Urbano, suburbano, rural'},
    {option: 'c', value: 'Asesoría académica a niños primaria, secundaria o bachillerato de zonas vulnerables de escuelas publicas'},
    {option: 'd', value: 'Promocion social, cultural o deportiva en la comunidad'},
    {option: 'e', value: 'Dependencia de Gobierno'},
    {option: 'f', value: 'I.T de Tepic'},
    {option: 'g', value: 'Instituciones educativas privadas'}
  ];
  public communityFlag = false;
  public verificationResult = false;
  public fieldMessages = {
    '1': 'Nombre  y teléfono de la dependencia en la que se pretende realizar el Servicio Social.'
  };
  initRequest: InitRequest;
  public localEmail: string;
  @ViewChild('dialogverification') dialogVerification: DialogVerificationComponent;

  constructor(private formBuilder: FormBuilder,
              private controlStudentProv: ControlStudentProv,
              private inscriptionsProv: InscriptionsProvider,
              private loadingService: LoadingService,
              public imgSrv: ImageToBase64Service,
              private cookiesService: CookiesService,
              private notificationsService: NotificationsServices,
              public dialog: MatDialog) {
    const currentYear = new Date().getFullYear();
    const currentMont = new Date().getMonth();
    this.minDate = new Date(currentYear, currentMont - 1, 1);
    this.maxDate = new Date();
    const data = JSON.parse(localStorage.getItem('user'));
    this.localEmail = data.email;
  }

  ngOnInit() {
    this._initialize();

    this.communityName = new FormControl('');
    this.emailStudent = new FormControl({value: this.email, disabled: this.sendEmailCode}, Validators.required);
    this.code = new FormControl({value: '', disabled: (!this.sendEmailCode || this.verificationEmail)}, Validators.required);

    this.controlStudentProv.getStudentInformationByControlId(this.controlStudentId)
      .subscribe( async data => {
        this.controlStudentProv.getActivePeriod().toPromise().then( res => {
          // Init para documentos para la información del estudiante y del periodo activo
          this.initRequest = new InitRequest( { student: data.student, periodId: res.period }, this.imgSrv, this.cookiesService);
        }).catch( err => {
          console.log(err);
        });
      }, error => {
        const message = JSON.parse(error._body).msg;
        this.notificationsService.showNotification(eNotificationType.ERROR, message, '');
      });
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
      const dialogRef = this.dialog.open(DialogVerificationComponent, { data: { email: this.localEmail }, });
      dialogRef.afterClosed().subscribe(result => {
        this.verificationResult = result;
        if (this.verificationResult) {
          this.loadingService.setLoading(true);
          // Obtener el texto del tipo de programa para la eleccion de la variable categoria
          const programType = this.categories.find(c => c.option === this.formRequest.get('dependencyProgramType').value);
          // Si la categoria es true, significa que se eligio la comunidad donde el alumno tendra que escribir la comunidad
          if (this.communityFlag) {
            if (this.communityName.invalid) {
              // Si se deja el campo de comunidad vacio no continua con el proceso
              this.notificationsService.showNotification(eNotificationType.ERROR, 'Por favor describa su comunidad', '');
              return;
            } else {
              // Guardar dentro de la variable viewValue el valor del texto y la comunidad
              programType.value = programType.value + ': ' + this.communityName.value;
            }
          }
          this.formRequest.get('dependencyProgramType').setValue(programType);

          // Se asigna el valor del formulario del alumno a la clase de initRequest para el documento de solicitud
          this.initRequest.setRequest(this.formRequest.value);

          // Se guarda la informacion del estudiante en la base de datos y se emite el cambio de estatus en la pagina principal
          // asi como su actualizacion para el documento enviado
          this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId, this.formRequest.value)
            .subscribe( res => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');

              // Se obtiene el documento pdf de Servicio Social
              const document = this.initRequest.socialServiceSolicitude().output('arraybuffer');
              const binary = this.bufferToBase64(document);
              this.sendInformation.emit({doc: binary});
            }, () => {
              this.notificationsService.showNotification(eNotificationType.ERROR, 'Error',
                'No se ha podido guardar la información, favor de intentarlo mas tarde');
              this.loadingService.setLoading(false);
            }, () => this.loadingService.setLoading(false));
        }
      }
      );
    }
  }// registerRequest

  bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  getDate(event) {
    const time = moment();
    const newDate = moment(event.value).set({
      hour: time.get('hour'),
      minute: time.get('minute'),
      second: time.get('second')
    }).toDate();
    this.formRequest.get('initialDate').setValue(newDate);
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
      dependencyProgramModality: ['', Validators.required],
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
          this.code.disable();
          this.verificationEmail = true;
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
