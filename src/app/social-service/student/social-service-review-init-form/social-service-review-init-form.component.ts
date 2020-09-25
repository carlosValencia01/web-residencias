import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DialogVerificationComponent} from '../../components/dialog-verification/dialog-verification.component';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {InscriptionsProvider} from '../../../providers/inscriptions/inscriptions.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {MatDialog} from '@angular/material';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';

interface Category {
  option: string;
  value: string;
}

@Component({
  selector: 'app-social-service-review-init-form',
  templateUrl: './social-service-review-init-form.component.html',
  styleUrls: ['./social-service-review-init-form.component.scss']
})
export class SocialServiceReviewInitFormComponent implements OnInit {
  @Input() controlStudentId: string;
  @Input() controlNumber: string;
  @Input() folderId: string;
  @Output() sendInformation: EventEmitter<any> = new EventEmitter();
  public formRequest: FormGroup;
  public communityName: FormControl;
  public communityFlag = false;
  private readonly today: Date;
  public categories: Category[] = [
    {option: 'a', value: 'Educacion para adultos'},
    {option: 'b', value: 'Desarrollo de comunidad: Urbano, suburbano, rural'},
    {option: 'c', value: 'Asesoría académica a niños primaria, secundaria o bachillerato de zonas vulnerables de escuelas publicas'},
    {option: 'd', value: 'Promocion social, cultural o deportiva en la comunidad'},
    {option: 'e', value: 'Dependencia de Gobierno'},
    {option: 'f', value: 'I.T de Tepic'},
    {option: 'g', value: 'Instituciones educativas privadas'}
  ];
  public fieldMessages = {
    '1': 'Nombre  y teléfono de la dependencia en la que se pretende realizar el Servicio Social.'
  };
  @ViewChild('dialogverification') dialogVerification: DialogVerificationComponent;
  public errorFieldsMessage: Array<any> = [];
  public errorFieldsValidate: Array<any> = [];
  public fileId = '';

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
    this.controlStudentProv.getControlStudentById(this.controlStudentId)
      .subscribe(res => {
        const data = this._castToForm(res.controlStudent);
        this.formRequest.setValue(data);
        res.controlStudent.verificationDepartment.information.forEach( dep => {
          dep.validation ? this.formRequest.get(dep.fieldName).disable() : this.formRequest.get(dep.fieldName).enable();
          this.errorFieldsValidate[dep.fieldName] = dep.validation;
          if (!dep.validation) {
            this.errorFieldsMessage[dep.fieldName] = dep.message;
          }
        });
      });
  }

  async registerRequest() {
    if (this.formRequest.invalid) {
      this.notificationsService.showNotification(eNotificationType.ERROR, 'Por favor de llenar todos los campos', '');
    } else {
      const dialogRef = this.dialog.open(DialogVerificationComponent, { data: { email: this.controlNumber }, });
      dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadingService.setLoading(true);
            if (this.formRequest.value.hasOwnProperty('dependencyProgramType')) {
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
            }
            this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId,
              Object.assign(this.formRequest.value, {'verification.solicitude': 'send', 'verification.solicitudeSign': new Date()}))
              .subscribe( res => {
                this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
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

  community(event) {
    if (event.value === 'd') {
      this.communityName.setValidators(Validators.required);
      return this.communityFlag = true;
    }
    this.communityName.clearValidators();
    return this.communityFlag = false;
  }

  _initialize() {
    this.formRequest = this.formBuilder.group({
      dependencyName: ['', Validators.required],
      dependencyPhone: ['', Validators.required],
      dependencyAddress: ['', Validators.required],
      dependencyHeadline: ['', Validators.required],
      dependencyHeadlinePosition: ['', Validators.required],
      dependencyDepartment: ['', Validators.required],
      dependencyDepartmentManager: ['', Validators.required],
      dependencyDepartmentManagerEmail: ['', Validators.required],
      dependencyProgramName: ['', Validators.required],
      dependencyProgramModality: ['', Validators.required],
      initialDate: [this.today, Validators.required],
      dependencyActivities: ['', Validators.required],
      dependencyProgramType: ['', Validators.required],
      dependencyProgramObjective: ['', Validators.required],
      dependencyProgramLocationInside: ['', Validators.required],
      dependencyProgramLocation: ['', Validators.required]
    });
  }

  private _castToForm(data) {
    return {
      dependencyName: data.dependencyName,
      dependencyPhone: data.dependencyPhone,
      dependencyAddress: data.dependencyAddress,
      dependencyHeadline: data.dependencyHeadline,
      dependencyHeadlinePosition: data.dependencyHeadlinePosition,
      dependencyDepartment: data.dependencyDepartment,
      dependencyDepartmentManager: data.dependencyDepartmentManager,
      dependencyDepartmentManagerEmail: data.dependencyDepartmentManagerEmail,
      dependencyProgramName: data.dependencyProgramName,
      dependencyProgramModality: data.dependencyProgramModality,
      initialDate: this.today,
      dependencyActivities: data.dependencyActivities,
      dependencyProgramType: data.dependencyProgramType.value,
      dependencyProgramObjective: data.dependencyProgramObjective,
      dependencyProgramLocationInside: data.dependencyProgramLocationInside,
      dependencyProgramLocation: data.dependencyProgramLocation,
    };
  }
}
