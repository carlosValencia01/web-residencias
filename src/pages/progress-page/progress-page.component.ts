import { Component, OnInit, ViewChild } from '@angular/core';
import { IStudent } from 'src/entities/student.model';
import { RequestProvider } from 'src/providers/request.prov';
import { iRequest } from 'src/entities/request.model';
// import { RequestComponentComponent } from '../request-component/request-component.component';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
// import { RequestModalComponent } from 'src/modals/request-modal/request-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/services/cookie.service';
import { eStatusRequest } from 'src/enumerators/statusRequest.enum';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { RequestModalComponent } from 'src/modals/request-modal/request-modal.component';
import { ConfirmDialogComponent } from 'src/components/confirm-dialog/confirm-dialog.component';
import { eRole } from 'src/enumerators/role.enum';
import { SteepComponentComponent } from 'src/app/steep-component/steep-component.component';
import { uRequest } from 'src/entities/request';
import { ImageToBase64Service } from '../../services/img.to.base63.service';

@Component({
  selector: 'app-progress-page',
  templateUrl: './progress-page.component.html',
  styleUrls: ['./progress-page.component.scss']
})
export class ProgressPageComponent implements OnInit {
  columns: any[];
  students: IStudent[];
  request: iRequest[];
  displayedColumns: string[];
  statusOptions: { icon: string, option: string }[];
  dataSource: MatTableDataSource<iRequestSource>;
  search: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private requestProvider: RequestProvider,
    public dialog: MatDialog,
    private notifications: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private imgService: ImageToBase64Service,
  ) {
    console.log('cookie', this.cookiesService.getData());
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loadRequest();
    this.displayedColumns = ['controlNumber', 'fullName', 'career', 'phase', 'status', 'applicationDateLocal', 'action'];
    this.statusOptions = [
      { icon: 'accessibility_new', option: 'Todos' },
      { icon: 'mail', option: 'Solicitado' },
      { icon: 'verified_user', option: 'Verificado' },
      { icon: 'how_to_vote', option: 'Registrado' },
      { icon: 'lock_open', option: 'Liberado' },
      { icon: 'thumb_up', option: 'Validado' },
      { icon: 'today', option: 'Agendado' },
      { icon: 'gavel', option: 'Realizado' },
      { icon: 'school', option: 'Aprobado' }
    ];
  }

  loadRequest(): void {
    let filter = '';
    switch (this.cookiesService.getData().user.rol.name) {
      case eRole.CHIEFACADEMIC: {
        filter = 'jefe';
        break;
      }
      case eRole.COORDINATION: {
        filter = 'coordinacion';
        break;
      }
      case eRole.SECRETARY: {
        filter = 'secretaria';
        break;
      }
      default: {
        filter = 'administration';
        break;
      }
    }

    this.requestProvider.getAllRequestByStatus(filter).subscribe(
      res => {
        this.request = [];
        res.request.forEach(element => {
          const tmp: iRequest = <iRequest>element;
          tmp._id = element._id;
          tmp.status = this.convertStatus(tmp.status);
          tmp.controlNumber = element.studentId.controlNumber;
          tmp.career = element.studentId.career;
          tmp.fullName = element.studentId.fullName;
          tmp.student = element.studentId;
          tmp.studentId = element.studentId._id;
          tmp.applicationDateLocal = new Date(tmp.applicationDate).toLocaleDateString();
          this.request.push(tmp);
        });
        this.refresh();
      },
      error => {
        this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      });
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.request);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  convertStatus(status: string): string {
    let value = '';
    switch (status) {
      case 'Process':
        {
          value = 'Pendiente';
          break;
        }
      case 'Error':
        {
          value = 'Rechazado';
          break;
        }
      case 'Accept':
        {
          value = 'Aceptado';
          break;
        }
      case 'Reject':
        {
          value = 'Rechazado';
          break;
        }
      default:
        value = 'Ninguno';
    }
    return value;
  }

  // Abre el formulario de Solicitud
  checkRequest(Identificador): void {
    const ref = this.dialog.open(RequestModalComponent, {
      data: {
        Id: Identificador
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });

    ref.afterClosed().subscribe((valor: any) => {
      if (valor) {
        this.loadRequest();
      }
    }, error => {
      this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
    });
  }

  Verified(Identificador): void {
    const ref = this.dialog.open(SteepComponentComponent, {
      data: {
        Request: this.getRequestById(Identificador)
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em'
    });

    ref.afterClosed().subscribe((valor: any) => {
      if (valor) {
        this.loadRequest();
      }
    }, error => {
      this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
    });
  }

  acceptRequest(Identificador): void {
    const data = {
      doer: this.cookiesService.getData().user.name.fullName,
      observation: 'No es viable',
      operation: eStatusRequest.ACCEPT
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      disableClose: true,
      hasBackdrop: true,
      data: '¿Está seguro de confirma esta solicitud?\''
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
          this.loadRequest();
        }, error => {
          this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
        });
      } else {
        data.operation = eStatusRequest.REJECT;
        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
          this.loadRequest();
        }, error => {
          this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
        });
      }
    });

    // let data = {
    //   doer: this.cookiesService.getData().user.name.fullName,
    //   observation: 'No es viable',
    //   operation: eStatusRequest.ACCEPT
    // };

    // this.confirmationService.confirm({
    //   message: '¿Está seguro de confirma esta solicitud?',
    //   header: 'Confirmación de Solicitud',
    //   acceptLabel: 'Aceptar',
    //   rejectLabel: 'Rechazar',
    //   accept: () => {
    //     this.requestProvider.updateRequest(Identificador, data).subscribe(data => {
    //       this.notifications.showNotification(eNotificationType.SUCCESS, "Titulación App", "Solicitud Actualizada");
    //     }, error => {
    //       this.notifications.showNotification(eNotificationType.ERROR, "Titulación App", error);
    //     });
    //   },
    //   reject: () => {
    //     data.operation = eStatusRequest.REJECT;
    //     this.requestProvider.updateRequest(Identificador, data).subscribe(data => {
    //       this.notifications.showNotification(eNotificationType.SUCCESS, "Titulación App", "Solicitud Actualizada");
    //     }, error => {
    //       this.notifications.showNotification(eNotificationType.ERROR, "Titulación App", error);
    //     });
    //   }
    // });
  }

  seeRequestPDF(_id: string): void {
    const _request: iRequest = this.getRequestById(_id);
    const oRequest: uRequest = new uRequest(_request, this.imgService);
    setTimeout( () => {
      window.open(oRequest.protocolActRequest().output('bloburl'), '_blank');
    }, 500);
  }

  getRequestById(_id: string): iRequest {
    const indexRequest = this.request.findIndex(x => x._id === _id);
    return this.request[indexRequest];
  }
}

interface iRequestSource {
  _id?: string;
  controlNumber?: string;
  fullName?: string;
  career?: string;
  applicationDateLocal?: string;
  phase?: string;
  status?: string;
  action?: string;
}
