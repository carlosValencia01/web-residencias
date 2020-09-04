import {Component, OnInit} from '@angular/core';
import {ControlStudentProv} from '../../../providers/social-service/control-student.prov';
import {LoadingService} from '../../../services/app/loading.service';
import {NotificationsServices} from '../../../services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';

@Component({
  selector: 'app-control-students-main-page',
  templateUrl: './control-students-main-page.component.html',
  styleUrls: ['./control-students-main-page.component.scss']
})
export class ControlStudentsMainPageComponent implements OnInit {

  constructor( private controlStudentProv: ControlStudentProv,
               private loadingService: LoadingService,
               private notificationsService: NotificationsServices ) { }

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.controlStudentProv.getAllControlStudents().subscribe( res => {
      this.notificationsService.showNotification(eNotificationType.SUCCESS,
        'Exito', 'Se ha obtenido la información correctamente');
      console.log(res.controlStudents);
    }, error => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
  }

}
