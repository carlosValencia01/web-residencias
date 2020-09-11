import {Component, OnInit} from '@angular/core';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

interface Category {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-social-service-main-page',
  templateUrl: './social-service-main-page.component.html',
  styleUrls: ['./social-service-main-page.component.scss']
})
export class SocialServiceMainPageComponent implements OnInit {
  public formRequest: FormGroup;
  public loaded = false; // Carga de la pagina
  public permission: boolean; // Permiso para acceder a servicio social
  public releaseSocialService: boolean;
  public assistance: boolean;
  public assistanceFirstStep = false;
  public assistanceSecondStep = false;
  public firstDocuments: boolean;
  private userData; // Datos del usuario
  selectedCategory: string;
  categories: Category[] = [
    {value: 'a', viewValue: 'Educacion para adultos'},
    {value: 'b', viewValue: 'Desarrollo de comunidad: Urbano, suburbano, rural'},
    {value: 'c', viewValue: 'Asesoría académica a niños primaria, secundaria o bachillerato de zonas vulnerables de escuelas publicas'},
    {value: 'd', viewValue: 'Promocion social, cultural o deportiva en la comunidad'},
    {value: 'e', viewValue: 'Dependencia de Gobierno'},
    {value: 'f', viewValue: 'I.T de Tepic'},
    {value: 'g', viewValue: 'Instituciones educativas privadas'}
  ];
  comunityFlag=false;


  constructor(private loadingService: LoadingService,
              private cookiesService: CookiesService,
              private notificationsService: NotificationsServices,
              private controlStudentProv: ControlStudentProv,
              private formBuilder: FormBuilder) {
    // Obtencion de la informacion del alumno, id, nombre, carrera, revisar en localStorage
    this.userData = this.cookiesService.getData().user;
  }

  ngOnInit() {
    this._initialize();
    this.loadingService.setLoading(true);
    this.permission = false; // Condicion para saber si tiene permiso de acceder a
    this.releaseSocialService = false; // Condicion para saber si ha liberado el servicio social
    this.assistance = false; // Condicion para saber si ya tiene la asistencia registrada (si existe su registro en BD)
    this.firstDocuments = false; // Condicion para saber si tiene el registro de información para los primeros documentos
    setTimeout( () => {
      this._loadPage();
    }, 1500);
  }

  _loadPage() {
    this.loadingService.setLoading(false);
    this.loaded = true;
  }

  // Creación o Registro de asistencia mediante numero de control del estudiante
  registerAssistance() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.createAssistanceByControlNumber(this.userData.email).subscribe( res => {
      this.notificationsService.showNotification(eNotificationType.SUCCESS, res.msg, '');
    }, err => {
      const error = JSON.parse(err._body);
      this._loadPage();
      this.notificationsService.showNotification(eNotificationType.ERROR, error.msg, '');
    }, () => this._loadPage());
  }

  comunity(event){
    if(event.value==='d'){
      return this.comunityFlag=true;
    }
    return this.comunityFlag=false;
  }

  async registerRequest(){
    console.log(this.formRequest.get('dependency').value);
  }

  _initialize(){
    this.formRequest = this.formBuilder.group({
      dependency:['',Validators.required],
      dependencyPhone:['',Validators.required],
      dependencyHead:['',Validators.required],
      position:['',Validators.required],
      department:['',Validators.required],
      inChargeName:['',Validators.required],
      inChargeEmail:['',Validators.required],
      inChargePosition:['',Validators.required],
      programName:['',Validators.required],
      modality:[true,Validators.required],
      startDate:['',Validators.required],
      activities:['',Validators.required],
      category:['',Validators.required],
      comunityName:['',],
      age:['',Validators.required],
      credits:['',Validators.required],
      objetive:['',Validators.required],
      modalityDependency:[true,Validators.required],
      where:['',Validators.required],
      dependencyAddress:['',Validators.required]
    });
  }

  getErrorMessages(field){
    return this.formRequest.get(field).hasError('required') ? 'Campo obligatorio':
    '';
  }

}

