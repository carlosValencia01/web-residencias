import { Component, OnInit, ViewChild } from '@angular/core';
import { IStudent } from 'src/entities/shared/student.model';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { iRequest } from 'src/entities/reception-act/request.model';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/services/app/cookie.service';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { RequestModalComponent } from 'src/modals/reception-act/request-modal/request-modal.component';
// import { ConfirmDialogComponent } from 'src/modals/shared/confirm-dialog/confirm-dialog.component';
import { eRole } from 'src/enumerators/app/role.enum';
import { SteepComponentComponent } from 'src/modals/reception-act/steep-component/steep-component.component';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { ReleaseComponentComponent } from 'src/modals/reception-act/release-component/release-component.component';
import { RequestService } from 'src/services/reception-act/request.service';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { DocumentReviewComponent } from 'src/pages/reception-act/document-review/document-review.component';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { ReleaseCheckComponent } from 'src/modals/reception-act/release-check/release-check.component';
import Swal from 'sweetalert2';
import { eCAREER } from 'src/enumerators/shared/career.enum';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { UploadDeliveredComponent } from 'src/app/upload-delivered/upload-delivered.component';

@Component({
  selector: 'app-progress-page',
  templateUrl: './progress-page.component.html',
  styleUrls: ['./progress-page.component.scss']
})
export class ProgressPageComponent implements OnInit {
  columns: any[];
  students: IStudent[];
  request: iRequest[];
  requestFilter: iRequest[];
  displayedColumns: string[];
  statusOptions: { icon: string, option: string }[];
  dataSource: MatTableDataSource<iRequestSource>;
  careers: Array<string>;
  allCarrers: Array<string>;
  isAll: boolean;
  reset: boolean;
  phases: Array<string>;
  search: string;
  role: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private requestProvider: RequestProvider,
    public dialog: MatDialog,
    private notifications: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private imgService: ImageToBase64Service,
    public _RequestService: RequestService,
  ) {
    this.careers = [];
    this.phases = [];
    this.allCarrers = ['ARQUITECTURA', 'INGENIERÍA CIVIL', 'INGENIERÍA ELÉCTRICA', 'INGENIERÍA INDUSTRIAL',
      'INGENIERÍA EN SISTEMAS COMPUTACIONALES', 'INGENIERÍA BIOQUÍMICA', 'INGENIERÍA QUÍMICA', 'LICENCIATURA EN ADMINISTRACIÓN', 'INGENIERÍA EN GESTIÓN EMPRESARIAL', 'INGENIERÍA MECATRÓNICA', 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES'];
    if (!this.cookiesService.isAllowed(this.activeRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.role = this.cookiesService.getData().user.rol.name;
  }

  ngOnInit() {
    this.loadRequest(true);
    this.displayedColumns = ['controlNumber', 'fullName', 'career', 'phase', 'status', 'applicationDateLocal', 'lastModifiedLocal', 'action'];
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

  loadRequest(isInit: boolean = false): void {
    let filter = '';
    console.log("dd", this.role);
    // switch (this.cookiesService.getData().user.rol.name) {
    switch (this.role) {
      case eRole.CHIEFACADEMIC: {
        filter = 'jefe';
        break;
      }
      case eRole.COORDINATION: {
        filter = 'coordinacion';
        break;
      }
      case eRole.SECRETARYACEDMIC: {
        filter = 'secretaria';
        break;
      }
      case eRole.HEADSCHOOLSERVICE: {
        filter='escolares'
        break;
      }
      case eRole.STUDENTSERVICES: {
        filter = 'servicios';
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
          tmp.lastModifiedLocal = new Date(tmp.lastModified).toLocaleDateString();
          this.request.push(tmp);
        });
        this.requestFilter = this.request.slice(0);
        if (isInit) {
          this.careers = this.allCarrers.slice(0);
          this.isAll = true;
        }
        this.reset = true;
        this.requestFilter = this.filter(this.careers, this.phases).slice(0);
        this.refresh();
      },
      error => {
        this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      });
  }

  refresh(): void {
    this.dataSource = new MatTableDataSource(this.requestFilter);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filter(carrers: string[], phases: string[]): Array<iRequest> {
    return this.request.filter(function (element) {
      if (phases.length === 0) {
        return carrers.findIndex(x => x === element.career) !== -1;
      }
      else {
        return carrers.findIndex(x => x === element.career) !== -1 &&
          phases.findIndex(x => x === element.phase) !== -1;
      }
    });
  }
  signProof(Identificador: string) {
    const ref = this.dialog.open(UploadDeliveredComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '30em'
    });

    ref.afterClosed().subscribe((valor: boolean) => {
      if (valor) {
        const data = {
          doer: this.cookiesService.getData().user.name.fullName,
          observation: '',
          operation: eStatusRequest.ACCEPT
        };
        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
          this.loadRequest();
        }, error => {
          this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
        });
      }
    }, error => {
      this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
    });
  }

  changedPhase(event) {
    const key = <eRequest><keyof typeof eRequest>event.value;
    const value = eRequest[key];
    const checked = event.event.checked;
    const index = this.phases.findIndex(x => x === value);
    if (index !== -1 && !checked) {
      this.phases.splice(index, 1);
    }
    if (index == -1 && checked) {
      this.phases.push(value);
    }
    this.requestFilter = this.filter(this.careers, this.phases).slice(0);
    this.refresh();
  }
  changed(event) {
    if (event.value === 'ALL') {
      this.isAll = event.event.checked;
      this.careers = this.isAll ? this.allCarrers.slice(0) : [];
    } else {
      const key = <eCAREER><keyof typeof eCAREER>event.value;
      const value = eCAREER[key];
      const checked = event.event.checked;
      const index = this.careers.findIndex(x => x === value);
      if (index !== -1 && !checked) {
        this.careers.splice(index, 1);
      }
      if (index == -1 && checked) {
        this.careers.push(value);
      }
    }
    this.requestFilter = this.filter(this.careers, this.phases).slice(0);
    this.refresh();
  }
  convertStatus(status: string): string {
    let value = '';
    switch (status) {
      case 'Process':
        {
          // value = 'Pendiente'; 17/11
          value = 'Proceso';
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
      case 'Finalized': {
        value = 'Finalizado';
        break;
      }
      default:
        // value = 'Ninguno'; //17/11
        value = 'Pendiente';
    }
    console.log('value de status', value);
    return value;
  }

  openDiary(Identificador: string) {
    const lRequest = this.getRequestById(Identificador);
    console.log("propse", lRequest.proposedDate);
    if (typeof (lRequest.proposedDate) !== 'undefined') {
      localStorage.setItem("Appointment", new Date(lRequest.proposedDate).toDateString());
    }
    this.router.navigate(['diary']);
  }
  // Abre el formulario de Solicitud
  checkRequest(Identificador): void {
    const ref = this.dialog.open(RequestModalComponent, {
      data: {
        Id: Identificador
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

  Verified(Identificador): void {
    // this._RequestService.AddRequest(this.getRequestById(Identificador), eRequest.VERIFIED);

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

  releasedRequest(Identificador): void {
    let lJury: Array<string> = [];
    let lObservation: string;
    let lMinutes: number = 420;
    const tmpRequest = this.getRequestById(Identificador);
    if (tmpRequest.status === 'Rechazado') {
      lJury = tmpRequest.jury;
      const value = tmpRequest.history.filter(x => x.phase === 'Liberado').slice(0).sort(
        function (a, b) {
          const bDate: Date = new Date(b.achievementDate);
          const aDate: Date = new Date(a.achievementDate);
          return bDate.getTime() - aDate.getTime();
        }
      );
      console.log("Liberado", value);
      console.log("Liberado", value[0]);
      lObservation = value[0].observation;
      lMinutes = tmpRequest.proposedHour;
    }

    const ref = this.dialog.open(ReleaseComponentComponent, {
      data: {
        jury: lJury,
        observation: lObservation,
        minutes: lMinutes
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em'
    });

    ref.afterClosed().subscribe(result => {
      if (typeof (result) !== 'undefined') {
        let frmData = new FormData();
        frmData.append('file', result.file);
        frmData.append('ControlNumber', tmpRequest.student.controlNumber);
        frmData.append('FullName', tmpRequest.student.fullName);
        frmData.append('Career', tmpRequest.student.career);
        frmData.append('Document', eFILES.RELEASED);
        frmData.append('President', result.jury[0]);
        frmData.append('Secretary', result.jury[1]);
        frmData.append('Vocal', result.jury[2]);
        frmData.append('Substitute', result.jury[3]);
        frmData.append('proposedHour', result.proposedHour);
        frmData.append('Doer', this.cookiesService.getData().user.name.fullName);
        console.log("proposed", result.proposedHour);
        this.requestProvider.releasedRequest(Identificador, frmData).subscribe(data => {
          this.loadRequest();
        }, error => {
          this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
        });
      }
    });
  }

  approve(Identificador): void {
    Swal.fire({
      title: 'Estatus del Acto Recepcional',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Reprobar',
      confirmButtonText: 'Aprobar'
    }).then(async (result) => {
      let response = await Swal.fire({
        title: '¿Está seguro de confirmar esta operacion?',
        text: '¡No podrás revertir esto!',
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      });
      if (typeof (response.value) !== 'undefined') {
        let data = {
          doer: this.cookiesService.getData().user.name.fullName,
          observation: '',
          operation: eStatusRequest.ACCEPT
        };
        if (typeof (result.value) !== 'undefined') {
          data.observation = '';
        }
        else {
          data.observation = 'Acto recepcional no aprobado';
          data.operation = eStatusRequest.REJECT;
        }

        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
          this.loadRequest();
        }, error => {
          let tmpJson = JSON.parse(error._body);
          this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', tmpJson.message);
        });
      }

    })
  }

  generated(Identificador: string, operation: string): void {
    Swal.fire({
      title: '¿Está seguro de continuar con la operación?',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        const eOperation = <eStatusRequest><keyof typeof eStatusRequest>operation;
        let data = {
          doer: this.cookiesService.getData().user.name.fullName,
          observation: '',
          operation: eOperation// eStatusRequest.PROCESS
        };
        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App',
            (eOperation === eStatusRequest.PROCESS ? 'Acta de Examen Generada' : 'Acta de Examen Entregada'));
          this.loadRequest();
        }, error => {
          let tmpJson = JSON.parse(error._body);
          this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', tmpJson.message);
        });
      }
    });
  }

  titled(Identificador: string, operation: string): void {
    const eOperation = <eStatusRequest><keyof typeof eStatusRequest>operation;
    switch (eOperation) {
      case eStatusRequest.PROCESS: {

      }
      case eStatusRequest.FINALIZED: {
        Swal.fire({
          title: '¿Está seguro de continuar con la operación?',
          type: 'question',
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.value) {
            let data = {
              doer: this.cookiesService.getData().user.name.fullName,
              observation: '',
              operation: eOperation// eStatusRequest.PROCESS
            };
            this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
              this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App',
                (eOperation === eStatusRequest.PROCESS ? 'Alumno notificado' : 'Título Profesional Entregado'));
              this.loadRequest();
            }, error => {
              let tmpJson = JSON.parse(error._body);
              this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', tmpJson.message);
            });
          }
        })
        break;
      }
      case eStatusRequest.ACCEPT: {
        this.router.navigate([Identificador + '/titled'], { relativeTo: this.activeRoute });
      }
    }
  }

  Review(Identificador): void {
    this.router.navigate([Identificador], { relativeTo: this.activeRoute });
  }

  seeRecord(Identificador): void {
    this.router.navigate([Identificador + '/expediente'], { relativeTo: this.activeRoute });
  }

  // acceptRequest(Identificador): void {
  //   const data = {
  //     doer: this.cookiesService.getData().user.name.fullName,
  //     observation: 'No es viable',
  //     operation: eStatusRequest.ACCEPT
  //   };

  //   Swal.fire({
  //     title: '¿Está seguro de confirma esta solicitud?',
  //     type: 'question',
  //     showCancelButton: true,
  //     allowOutsideClick: false,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     cancelButtonText: 'Cancelar',
  //     confirmButtonText: 'Aceptar'
  //   }).then((result) => {
  //     if (result.value) {
  //       this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
  //         this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
  //         this.loadRequest();
  //       }, error => {
  //         this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
  //       });
  //     } else {
  //       data.operation = eStatusRequest.REJECT;
  //       this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
  //         this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
  //         this.loadRequest();
  //       }, error => {
  //         this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
  //       });
  //     }
  //   })
  //   // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //   //   width: '350px',
  //   //   disableClose: true,
  //   //   hasBackdrop: true,
  //   //   data: '¿Está seguro de confirma esta solicitud?\''
  //   // });
  //   // dialogRef.afterClosed().subscribe(result => {
  //   //   if (result) {
  //   //     this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
  //   //       this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
  //   //       this.loadRequest();
  //   //     }, error => {
  //   //       this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
  //   //     });
  //   //   } else {
  //   //     data.operation = eStatusRequest.REJECT;
  //   //     this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
  //   //       this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
  //   //       this.loadRequest();
  //   //     }, error => {
  //   //       this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
  //   //     });
  //   //   }
  //   // });
  // }

  seeRequestPDF(_id: string): void {
    const _request: iRequest = this.getRequestById(_id);
    const oRequest: uRequest = new uRequest(_request, this.imgService);
    setTimeout(() => {
      window.open(oRequest.protocolActRequest().output('bloburl'), '_blank');
    }, 500);
  }

  checkReleased(_id: string) {
    const Request = this.getRequestById(_id);
    this.requestProvider.getResource(_id, eFILES.RELEASED).subscribe(data => {
      const dialogRef = this.dialog.open(ReleaseCheckComponent, {
        data: data,
        disableClose: true,
        hasBackdrop: true,
        width: '50em'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof (result) !== 'undefined') {
          let data;
          if (result) {
            data = {
              doer: this.cookiesService.getData().user.name.fullName,
              observation: '',
              operation: eStatusRequest.ACCEPT,
              phase: Request.phase
            };
            this.requestProvider.updateRequest(Request._id, data).subscribe(
              data => {
                this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
                this.loadRequest();
              },
              error => {
                this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
              }
            );
          } else {

            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-outline-success mx-2',
                cancelButton: 'btn btn-outline-danger'
              },
              buttonsStyling: false
            });

            swalWithBootstrapButtons.fire({
              title: 'Motivo',
              input: 'textarea',
              confirmButtonText: 'Guardar',
              cancelButtonText: 'Cancelar',
              showCloseButton: true,
              showCancelButton: true,
              inputValidator: (value) => {
                if (!value) {
                  return 'Motivo obligatorio'
                }
              }
            }).then((result) => {
              if (result.value) {
                data = {
                  doer: this.cookiesService.getData().user.name.fullName,
                  observation: result.value,
                  operation: eStatusRequest.REJECT,
                  phase: Request.phase
                };
                this.requestProvider.updateRequest(Request._id, data).subscribe(
                  data => {
                    this.notifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
                    this.loadRequest();
                  },
                  error => {
                    this.notifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
                  }
                );
              }
            });
          }
        }
      },
        error => {
          this.notifications.showNotification(eNotificationType.ERROR,
            'Titulación App', error);
        });
    }, error => {
      this.notifications.showNotification(eNotificationType.ERROR,
        'Titulación App', error);
    });
  }

  getRequestById(_id: string): iRequest {
    const indexRequest = this.request.findIndex(x => x._id === _id);
    return this.request[indexRequest];
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewHistory(_id: string): void {
    const tmpRequest = this.getRequestById(_id);
    const ref = this.dialog.open(ObservationsComponentComponent, {
      data: {
        phase: 'Solicitado',
        request: tmpRequest
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });
  }
}

// tslint:disable-next-line: class-name
interface iRequestSource {
  _id?: string;
  controlNumber?: string;
  fullName?: string;
  career?: string;
  applicationDateLocal?: string;
  lastModifiedLocal?: string;
  phase?: string;
  status?: string;
  action?: string;
}
