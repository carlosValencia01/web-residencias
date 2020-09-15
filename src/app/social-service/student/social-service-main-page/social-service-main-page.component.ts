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
  public releaseSocialService: boolean; // Condicion para saber si ha liberado el servicio social
  public assistance: boolean; // Condicion para saber si ya tiene la asistencia registrada (si existe su registro en BD)
  public assistanceFirstStep = false; // Condicion para el stepper de ASISTENCIA, controlamos que hasta que no sea verdadero no se continua
  public assistanceSecondStep = false;
  public firstDocuments: boolean; // Condicion para saber si tiene el registro de información para los primeros documentos
  public statusFirstDocuments: string; // Condicion para saber si el estudiante ya envio toda la información o esta en revisión
  private userData; // Datos del usuario
  public controlStudentId: string;
  public emailStudent: string;
  public sendEmailCode: boolean;
  public verificationEmail: boolean;



  constructor(private loadingService: LoadingService,
              private cookiesService: CookiesService,
              private notificationsService: NotificationsServices,
              private controlStudentProv: ControlStudentProv) {
    // Obtencion de la informacion del alumno, id, nombre, carrera, revisar en localStorage
    this.userData = this.cookiesService.getData().user;
  }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getControlStudentByStudentId(this.userData._id).subscribe( res => {
      this.controlStudentId = res.controlStudent._id;
      this.emailStudent = res.controlStudent.emailStudent || '';
      this.sendEmailCode = res.controlStudent.verification.sendEmailCode;
      this.verificationEmail = res.controlStudent.verification.verificationEmail;
      this.statusFirstDocuments = res.controlStudent.verification['solicitude'];
      this.permission = false;
      this.releaseSocialService = false;
      this.assistance = false;
      this.firstDocuments = false;
    }, error => {
      this.notificationsService.showNotification(eNotificationType.INFORMATION,
        'Atención',
        'No se ha encontrado su información por favor de recargar la página o volver a intentarlo mas tarde');
      this._loadPage();
    }, () => this._loadPage());
  }

  _loadPage() {
    this.loadingService.setLoading(false);
    this.loaded = true;
  }

  changeStatusSendInformation() {
    this.controlStudentProv.updateGeneralControlStudent(this.controlStudentId, { 'verification.solicitude': 'send'})
      .subscribe( () => {
        this.ngOnInit();
      }, error => {
        this.notificationsService.showNotification(eNotificationType.INFORMATION,
          'Atención',
          'No se ha actualizado el estatus de tu información por favor, vuelve a enviar la información de tu servicio');
        this.ngOnInit();
      });
  }

}

