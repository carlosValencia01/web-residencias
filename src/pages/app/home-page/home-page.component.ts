import { Component, OnInit } from '@angular/core';
import { CookiesService } from 'src/services/app/cookie.service';
import { iRole } from 'src/entities/app/role.model';
import {iPermission} from 'src/entities/app/permissions.model';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {ESignatureProvider} from 'src/providers/electronic-signature/eSignature.prov';
import {CurrentPositionService} from 'src/services/shared/current-position.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import {NotificationsServices} from '../../../services/app/notifications.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public rol: iRole;
  public homeItems: Array<iPermission> = [];
  public currentPosition;
  public eSignatureStatus;
  public update = false;
  private user;
  private employee;

  constructor(
    private cookiesServ: CookiesService,
    private employeeProvider: EmployeeProvider,
    private eSignatureProvider: ESignatureProvider,
    private currentPositionService: CurrentPositionService,
    private notification: NotificationsServices
  ) {
    this.rol = this.cookiesServ.getData().user.rol;
  }

  ngOnInit() {
    this.rol.permissions.forEach(permission => {
      if (permission.items.length) {
        this.homeItems = this.homeItems.concat(permission.items);
      }
    });

    this.init();
  }

  async init() {
    this.currentPosition = await this.currentPositionService.getCurrentPosition();

    this.user = this.cookiesServ.getData().user;

    this.employeeProvider.getEmployee(this.user.email).subscribe( res => {
      this.employee = res;

      this.eSignatureProvider.hasESignature(res.employee.rfc, this.currentPosition._id)
        .subscribe( data => {
          let days;
          if (data.nDaysLeft === 1) {
            days = 'día';
          } else if (data.nDaysLeft > 1) {
            days = 'días';
          }
          if (data.nDaysLeft) {
            Swal.fire({
              title: 'Firma electrónica',
              text: 'Su firma electrónica vencerá en ' + data.nDaysLeft + ' ' + days + ' . Favor de renovarla',
              type: 'info',
              allowOutsideClick: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            });
          }
        }, error => {
          if (error.status === 404) {
            this.eSignatureStatus = '';
          } else {
            this.notification.showNotification(eNotificationType.ERROR, 'Ha ocurrido un error', '');
          }
        });
    });
  }
}
