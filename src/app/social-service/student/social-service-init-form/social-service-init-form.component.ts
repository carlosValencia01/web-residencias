import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {MatDialog} from '@angular/material';
import { DialogVerificationComponent } from '../../components/dialog-verification/dialog-verification.component';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';

interface Category {
  option: string;
  value: string;
}

interface State {
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
  @Input() controlNumber: string;
  @Input() folderId: string;
  @Output() sendInformation: EventEmitter<any> = new EventEmitter();
  public formRequest: FormGroup;
  public communityName: FormControl;
  public emailStudent: FormControl;
  public code: FormControl;
  public today: Date;
  public categories: Category[] = [
    {option: 'a', value: 'Educacion para adultos'},
    {option: 'b', value: 'Desarrollo de comunidad: Urbano, suburbano, rural'},
    {option: 'c', value: 'Asesoría académica a niños primaria, secundaria o bachillerato de zonas vulnerables de escuelas publicas'},
    {option: 'd', value: 'Promocion social, cultural o deportiva en la comunidad'},
    {option: 'e', value: 'Dependencia de Gobierno'},
    {option: 'f', value: 'I.T de Tepic'},
    {option: 'g', value: 'Instituciones educativas privadas'}
  ];
  public states: State[] = [
    {option: 'Aguascalientes', value: 'Aguascalientes'},
    {option: 'Baja California', value: 'Baja California'},
    {option: 'Baja California Sur', value: 'Baja California Sur'},
    {option: 'Campeche', value: 'Campeche'},
    {option: 'Chiapas', value: 'Chiapas'},
    {option: 'Chihuahua', value: 'Chihuahua'},
    {option: 'Ciudad de México', value: 'Ciudad de México'},
    {option: 'Coahuila de Zaragoza', value: 'Coahuila de Zaragoza'},
    {option: 'Colima', value: 'Colima'},
    {option: 'Durango', value: 'Durango'},
    {option: 'Estado de México', value: 'Estado de México'},
    {option: 'Guanajuato', value: 'Guanajuato'},
    {option: 'Guerrero', value: 'Guerrero'},
    {option: 'Hidalgo', value: 'Hidalgo'},
    {option: 'Jalisco', value: 'Jalisco'},
    {option: 'Michoacán de Ocampo', value: 'Michoacán de Ocampo'},
    {option: 'Morelos', value: 'Morelos'},
    {option: 'Nayarit', value: 'Nayarit'},
    {option: 'Nuevo León', value: 'Nuevo León'},
    {option: 'Oaxaca', value: 'Oaxaca'},
    {option: 'Puebla', value: 'Puebla'},
    {option: 'Querétaro', value: 'Querétaro'},
    {option: 'Quintana Roo', value: 'Quintana Roo'},
    {option: 'San Luis Potosí', value: 'San Luis Potosí'},
    {option: 'Sinaloa', value: 'Sinaloa'},
    {option: 'Sonora', value: 'Sonora'},
    {option: 'Tabasco', value: 'Tabasco'},
    {option: 'Tamaulipas', value: 'Tamaulipas'},
    {option: 'Tlaxcala', value: 'Tlaxcala'},
    {option: 'Veracruz', value: 'Veracruz'},
    {option: 'Yucatán', value: 'Yucatán'},
    {option: 'Zacatecas', value: 'Zacatecas'},
  ];
  public communityFlag = false;
  public fieldMessages = {
    '1': 'Número de teléfono particular.',
    '2': 'Calle y número de domicilio particular.',
    '3': 'Colonia de domicilio particular.',
    '4': 'Código postal de domicilio particular.',
    '5': 'Municipio donde vive.',
    '6': 'Nombre de la dependencia en la que se pretende realizar el servicio social.',
    '7': 'Número de teléfono de la dependencia en la que se pretende realizar el servicio social.',
    '8': 'Domicilio de la dependencia en la que se pretende realizar el servicio social.',
    '9': 'Nombre completo del titular de la dependencia.',
    '10': 'Nombre del puesto.',
    '11': 'Unidad orgánica o departamento de adscripción.',
    '12': 'Nombre completo del encargado de la unidad orgánica o departamento.',
    '13': 'Correo electrónico del encargado.',
    '14': 'Nombre del programa.',
    '15': 'Fecha de inicio del servicio social.',
    '16': 'Actividades que se realizarán.',
    '17': 'Indicar el objetivo del programa de servicio social a desarrollar en la dependencia u organismo.',
    '18': 'Anote el lugar en donde realizará sus actividades.',
  };
  // initRequest: InitRequest;
  @ViewChild(DialogVerificationComponent) dialogVerification: DialogVerificationComponent;
  private patterPhone = /[(]?[0-9]{3}[)]?[-\s\\.]?[0-9]{3}[-\s\\.]?[0-9]{4}$/;
  private patterName = /^(([ñÑA-Za-z\u00E0-\u00FC]+[\-\']?)*([ñÑA-Za-z\u00E0-\u00FC]+)?\s)+([ñÑA-Za-z\u00E0-\u00FC]+[\-\']?)+([ñÑA-Za-z\u00E0-\u00FC]+)?$/;

  constructor(private formBuilder: FormBuilder,
              private controlStudentProv: ControlStudentProv,
              private inscriptionsProv: InscriptionsProvider,
              private loadingService: LoadingService,
              private cookiesService: CookiesService,
              private notificationsService: NotificationsServices,
              public dialog: MatDialog) {
    this.today = new Date();
  }

  ngOnInit() {
    this._initialize();

    this.communityName = new FormControl('');
    this.emailStudent = new FormControl({value: this.email, disabled: this.sendEmailCode}, Validators.compose([Validators.required, Validators.email]));
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
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Por favor de llenar todos los campos e indicaciones', '');
    } else {
      const dialogRef = this.dialog.open(DialogVerificationComponent, { data: { email: this.controlNumber }, });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
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

          // Se guarda la informacion del estudiante en la base de datos y se emite el cambio de estatus en la pagina principal
          // asi como su actualizacion para el documento enviado
          this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId,
            Object.assign(this.formRequest.value, {'verification.solicitude': 'send', 'verification.signs.solicitude.signStudentDate': new Date()}))
            .subscribe( res => {
              this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
              this._createHistoryDocumentStatus(
                'ITT-POC-08-02 Solicitud de Servicio Social.pdf',
                'SE ENVIO',
                'REGISTRO DE INFORMACIÓN DEL ESTUDIANTE',
                this.cookiesService.getData().user.fullName
              );
              this.sendInformation.emit();
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

  _createHistoryDocumentStatus(nameDocument, nameStatus, messageStatus, responsible) {
    this.controlStudentProv.createHistoryDocumentStatus(this.controlStudentId,
      {name: nameDocument,
        status: [{  name: nameStatus,
          message: messageStatus,
          responsible: responsible }]
      }).subscribe( created => {
      this.notificationsService.showNotification(eNotificationType.SUCCESS,
        'Exito', created.msg);
    }, error => {
      const message = JSON.parse(error._body).msg || 'Error al guardar el registro';
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', message);
    });
  }

  _initialize() {
    this.formRequest = this.formBuilder.group({
      studentPhone: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      studentGender: [{value: 'H', disabled: !this.verificationEmail}, Validators.required],
      studentStreet: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      studentSuburb: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      studentZip: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      studentCity: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      studentState: [{value: '', disabled: !this.verificationEmail}, Validators.required],

      dependencyName: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyPhone: [{value: '', disabled: !this.verificationEmail}, Validators.compose([Validators.required, Validators.pattern(this.patterPhone)])],
      dependencyAddress: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyHeadline: [{value: '', disabled: !this.verificationEmail}, Validators.compose([Validators.required, Validators.pattern(this.patterName)])],
      dependencyHeadlinePosition: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyDepartment: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyDepartmentManager: [{value: '', disabled: !this.verificationEmail}, Validators.compose([Validators.required, Validators.pattern(this.patterName)])],
      dependencyDepartmentManagerEmail: [{value: '', disabled: !this.verificationEmail}, Validators.compose([Validators.required, Validators.email])],
      dependencyProgramName: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramModality: [{value: 'Interno', disabled: !this.verificationEmail}, Validators.required],
      initialDate: [{value: this.today, disabled: !this.verificationEmail}, Validators.required],
      dependencyActivities: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramType: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramObjective: [{value: '', disabled: !this.verificationEmail}, Validators.required],
      dependencyProgramLocationInside: [{value: true, disabled: !this.verificationEmail}, Validators.required],
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
          this.formRequest.enable();
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

  getFieldRequiredMessage(field: string) {
    return this.formRequest.get(field).hasError('required') ? 'Campo obligatorio' :
        this.formRequest.get(field).hasError('pattern') && field === 'dependencyPhone' ? 'Escriba su teléfono de 10 dígitos' :
          this.formRequest.get(field).hasError('pattern') && field === 'dependencyHeadline' || field === 'dependencyDepartmentManager'  ? 'Escriba el nombre completo' :
            this.formRequest.get(field).hasError('email') ? 'Correo electrónico invalido' :
              '';
  }

}
