import {Component, OnInit} from '@angular/core';
import {LoadingService} from '../../../services/app/loading.service';
import {CookiesService} from '../../../services/app/cookie.service';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';

@Component({
  selector: 'app-social-service-main-page',
  templateUrl: './social-service-main-page.component.html',
  styleUrls: ['./social-service-main-page.component.scss']
})
export class SocialServiceMainPageComponent implements OnInit {
  public loaded = false; // Carga de la pagina
  public permission: boolean; // Permiso para acceder a servicio social
  public releaseSocialService: boolean;
  public assistance: boolean;
  public assistanceFirstStep = false;
  public assistanceSecondStep = false;
  public firstDocuments: boolean;
  private userData; // Datos del usuario

  constructor(private loadingService: LoadingService,
              private cookiesService: CookiesService,
              private notificationsService: NotificationsServices,
              private controlStudentProv: ControlStudentProv) {
    // Obtencion de la informacion del alumno, id, nombre, carrera, revisar en localStorage
    this.userData = this.cookiesService.getData().user;
  }

  ngOnInit() {
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

}
