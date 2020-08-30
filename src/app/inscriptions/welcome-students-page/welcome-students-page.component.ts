import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from '../../providers/inscriptions/inscriptions.prov';

@Component({
  selector: 'app-welcome-students-page',
  templateUrl: './welcome-students-page.component.html',
  styleUrls: ['./welcome-students-page.component.scss']
})
export class WelcomeStudentsPageComponent implements OnInit {
  search = '';
  studentData;

  constructor(
    private loadingService: LoadingService,
    private notificationService: NotificationsServices,
    private inscriptionProvider: InscriptionsProvider
  ) { 

  }

  ngOnInit() {
  }

  searchInfo(){
    if(this.search != ''){
      this.loadingService.setLoading(true);
      this.inscriptionProvider.getWelcomeStudentInformation(this.search.toUpperCase()).subscribe(res => {
        if(res.data){
          this.notificationService.showNotification(eNotificationType.SUCCESS, 'Registro Encontrado', '');
          this.studentData = res.data.students[0];
        } else {
          this.notificationService.showNotification(eNotificationType.INFORMATION, 'Registro No Encontrado', '');
          this.studentData = null;
        }
      });
      this.loadingService.setLoading(false);
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'Ingrese su CURP', '');
      this.studentData = null;
    }
  }

}
