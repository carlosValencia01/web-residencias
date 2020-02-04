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
import { UploadDeliveredComponent } from 'src/modals/reception-act/upload-delivered/upload-delivered.component';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { CurrentPositionService } from 'src/services/shared/current-position.service';
import { ICareer } from 'src/entities/shared/career.model';
import { BookComponent } from 'src/modals/reception-act/book/book.component';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';

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
  careers: Array<string>; //Ca
  allCarrers: Array<string>;
  allPhases: Array<string>;
  isAllCarrers: boolean; //Variable para indicar que se marco el toggle de Todas las carreras
  isAllPhases: boolean; //Variable para indicar que se marco el toggle de Todas las fases
  reset: boolean;
  phases: Array<string>;
  search: string;
  role: string;
  public showLoading: boolean
  departmentCareers: Array<ICareer>; //Carreras del puesto
  private folderId: string;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private requestProvider: RequestProvider,
    public dialog: MatDialog,
    private _NotificationsServices: NotificationsServices,
    private _CookiesService: CookiesService,
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _ImageToBase64Service: ImageToBase64Service,
    private _StudentProvider: StudentProvider,
    public _RequestService: RequestService
  ) {
    this.careers = [];
    this.phases = [];
    this.allCarrers = ['ARQUITECTURA', 'INGENIERÍA CIVIL', 'INGENIERÍA ELÉCTRICA', 'INGENIERÍA INDUSTRIAL',
      'INGENIERÍA EN SISTEMAS COMPUTACIONALES', 'INGENIERÍA BIOQUÍMICA', 'INGENIERÍA QUÍMICA', 'LICENCIATURA EN ADMINISTRACIÓN', 'INGENIERÍA EN GESTIÓN EMPRESARIAL', 'INGENIERÍA MECATRÓNICA', 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES'];
    this.allPhases = ['Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado', 'Validado', 'Asignado', 'Realizado', 'Generado', 'Finalized','Titulado'];
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.role = this._CookiesService.getData().user.rol.name.toLowerCase();
    //Asigno las carreras asociadas al puesto
    this.departmentCareers = this._CookiesService.getPosition().ascription.careers;
    console.log("DEPARTAMENTO CARRERAS", this.departmentCareers, "r", this.role);
    console.log("DEPARTAMENTO CARRERAS", this._CookiesService.getPosition().ascription.careers);

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

  reload(): void {
    this.loadRequest(false);
  }

  loadRequest(isInit: boolean = false): void {
    let filter = '';
    switch (this.role) {
      case eRole.CHIEFACADEMIC.toLowerCase(): {
        filter = 'jefe';
        break;
      }
      case eRole.COORDINATION.toLowerCase(): {
        filter = 'coordinacion';
        break;
      }
      case eRole.SECRETARYACEDMIC.toLowerCase(): {
        filter = 'secretaria';
        break;
      }
      case eRole.HEADSCHOOLSERVICE.toLowerCase(): {
        filter = 'escolares';
        break;
      }
      case eRole.STUDENTSERVICES.toLowerCase(): {
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
          let tmpRequest: iRequest = this.castRequest(element);
          if (this.role !== 'jefe académico' && this.role !== 'secretaria académica') {
            this.request.push(tmpRequest);
          } else {
            //Verifico si la carrera de la solicitud pertenece a las carreras asociadas al departamento del empleado se asigna            
            let index = this.departmentCareers.findIndex(x => x.fullName === tmpRequest.career);
            if (index !== -1)
              this.request.push(tmpRequest);
          }
        });
        this.requestFilter = this.request.slice(0);
        if (isInit) {
          this.careers = this.allCarrers.slice(0);
          this.phases = this.allPhases.slice(0);
          this.isAllCarrers = true;
          this.isAllPhases = true;
        }
        this.reset = true;
        this.requestFilter = this.filter(this.careers, this.phases).slice(0);
        this.refresh();
      },
      error => {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
      });
  }

  public castRequest(element: any): iRequest {
    let tmp: iRequest = new Object();//<iRequest>element;
    tmp._id = element._id;
    tmp.status = this.convertStatus(element.status);
    tmp.controlNumber = element.studentId.controlNumber;
    tmp.phase = element.phase;
    tmp.career = element.studentId.career;
    tmp.fullName = element.studentId.fullName;
    tmp.student = element.studentId;
    tmp.studentId = element.studentId._id;
    tmp.jury = element.jury;
    tmp.duration = element.duration;
    tmp.proposedHour = element.proposedHour;
    tmp.proposedDate = element.proposedDate;
    tmp.adviser = element.adviser;
    tmp.history = element.history;
    tmp.honorificMention = element.honorificMention;
    tmp.observation = element.observation;
    tmp.noIntegrants = element.noIntegrants;
    tmp.projectName = element.projectName;
    tmp.telephone = element.telephone;
    tmp.integrants = element.integrants;
    tmp.email = element.email;
    tmp.product = element.product;
    tmp.titulationOption = element.titulationOption;
    tmp.place = element.place;
    tmp.grade = element.grade;
    tmp.department = element.department;
    tmp.applicationDateLocal = new Date(element.applicationDate).toLocaleDateString();
    tmp.lastModifiedLocal = new Date(element.lastModified).toLocaleDateString();
    tmp.registry = element.registry;
    return tmp;
  }

  refresh() {
    this.dataSource = new MatTableDataSource(this.requestFilter);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filter(carrers: string[], phases: string[]): Array<iRequest> {
    //Filtro las solicitudes de acuerdo a los filtros de los toggle button
    return this.request.filter(function (element) {
      if (phases.length === 0) {
        //Si no hay una fase
        return carrers.findIndex(x => x === element.career) !== -1;
      }
      else {
        return carrers.findIndex(x => x === element.career) !== -1 &&
          phases.findIndex(x => x === element.phase) !== -1;
      }
    });
  }

  signProof(Identificador: string) {
    const _request: iRequest = this.getRequestById(Identificador);
    const oRequest: uRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
    this.getFolder(_request.controlNumber);

    const ref = this.dialog.open(UploadDeliveredComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '25em',
      data: { reqId: Identificador }
    });

    ref.afterClosed().subscribe((valor: { QR: any, ESTAMP: any, RESPONSE: boolean }) => {
      if (typeof (valor) !== 'undefined') {
        this.showLoading = true;
        const data = {
          doer: this._CookiesService.getData().user.name.fullName,
          observation: '',
          operation: eStatusRequest.ACCEPT,
          file: {
            mimetype: "application/pdf",
            data: oRequest.documentSend(eFILES.INCONVENIENCE, valor.QR, valor.ESTAMP),
            name: eFILES.INCONVENIENCE + '.pdf'
          },
          folderId: this.folderId,
          phase: eRequest.VALIDATED
        };

        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.showLoading = false;
          this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
          this.loadRequest();

        }, error => {
          this.showLoading = false;
          this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
        });


      }
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
    });
  }

  changedPhase(event) {
    if (event.value === 'ALL') {
      this.isAllPhases = event.event.checked;
      this.phases = this.isAllPhases ? this.allPhases.slice(0) : [];
      this.requestFilter = this.filter(this.careers, this.phases).slice(0);
    } else {
      const key = <eRequest><keyof typeof eRequest>event.value;
      let value = eRequest[key];
      const isCedula = eRequest[key] === eRequest.CEDULA;
      const checked = event.event.checked;
      const index = this.phases.findIndex(x => x === value);
      if (index !== -1 && !checked) {
        this.phases.splice(index, 1);
      }
      if (index == -1 && checked) {
        this.phases.push(value);
      }
      let tmpRequest = this.requestFilter = this.filter(this.careers, this.phases).slice(0);
      // console.log("rquest", tmpRequest);
      this.requestFilter = tmpRequest;//(value === eRequest.TITLED) ? this.filterCedula(tmpRequest, isCedula) : tmpRequest;
    }
    this.refresh();
  }

  changed(event) {
    if (event.value === 'ALL') {
      this.isAllCarrers = event.event.checked;
      this.careers = this.isAllCarrers ? this.allCarrers.slice(0) : [];
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
      case 'Printed': {
        value = 'Impreso';
        break;
      }
      default:
        // value = 'Ninguno'; //17/11
        value = 'Pendiente';
    }
    return value;
  }

  openDiary(Identificador: string) {
    const lRequest = this.getRequestById(Identificador);
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
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
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
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
    });
  }


  async releasedRequest(Identificador) {
    let lJury: Array<string> = [];
    let lObservation: string;
    let lMinutes: number = 420;
    let lDuration: number = 60;

    const tmpRequest = this.getRequestById(Identificador);
    if (tmpRequest.status === 'Rechazado' || tmpRequest.jury.length > 0) {
      const value = tmpRequest.history.filter(x => x.phase === 'Liberado').slice(0).sort(
        function (a, b) {
          const bDate: Date = new Date(b.achievementDate);
          const aDate: Date = new Date(a.achievementDate);
          return bDate.getTime() - aDate.getTime();
        }
      );
      lJury = tmpRequest.jury;
      lObservation = tmpRequest.status === 'Rechazado' ? value[0].observation : "";
      lMinutes = tmpRequest.proposedHour;
      lDuration = tmpRequest.duration;
    }

    let folder = await new Promise(resolve => {
      this._StudentProvider.getDriveFolderId(tmpRequest.controlNumber, eFOLDER.TITULACION).subscribe(folder => {
        if (folder) {
          if (typeof (folder.folderIdInDrive) !== 'undefined' || folder.folderIdInDrive !== '')
            resolve(folder.folderIdInDrive);
          else {
            this._NotificationsServices.showNotification(eNotificationType.ERROR, "Acto Recepcional", "El folder del estudiante ha desaparecido");
            resolve('');
          }
        }
        else {
          this._NotificationsServices.showNotification(eNotificationType.ERROR, "Acto Recepcional", "El folder del estudiante ha desaparecido");
          resolve('');
        }
      });
    });

    if (folder !== '') {
      const ref = this.dialog.open(ReleaseComponentComponent, {
        data: {
          jury: lJury,
          observation: lObservation,
          minutes: lMinutes,
          id: Identificador,
          folder: folder,
          duration: lDuration,
          request: tmpRequest
        },
        disableClose: true,
        hasBackdrop: true,
        width: '60em'
      });

      ref.afterClosed().subscribe(result => {
        if (typeof (result) !== 'undefined') {
          this.requestProvider.releasedRequest(Identificador, {
            email: tmpRequest.email,
            proposedHour: result.proposedHour,
            duration: result.duration,
            upload: result.upload,
            Doer: this._CookiesService.getData().user.name.fullName,
            jury: result.jury
          }).subscribe(data => {
            this.loadRequest();
          }, error => {
            this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
          });
        } else {
          this.loadRequest();
        }
      });
    }
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
        const linkModal = this.dialog.open(BookComponent, {
          data: {
            operation: 'create'
          },
          disableClose: true,
          hasBackdrop: true,
          width: '50em',
          height: '400px'
        });
        linkModal.afterClosed().subscribe(
          (book) => {
            let data = {
              doer: this._CookiesService.getData().user.name.fullName,
              observation: '',
              operation: eStatusRequest.ACCEPT,
              registry: {},
              phase: eRequest.REALIZED
            };
            if (typeof (result.value) !== 'undefined') {
              data.observation = '';
            }
            else {
              data.observation = 'Acto recepcional no aprobado';
              data.operation = eStatusRequest.REJECT;
            }
            if (book.action === 'create') {
              data.registry = book.book;
              this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
                this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
                this.loadRequest();
              }, error => {
                let tmpJson = JSON.parse(error._body);
                this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Titulación App', tmpJson.message);
              });
            }
          },
          err => console.log(err)
        );


      }

    })
  }

  async reImprimir(Identificador: string) {
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Reimprimiendo Acta de Examen');
    this.showLoading = true;
    const _request: iRequest = this.getRequestById(Identificador);
    const oRequest: uRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
    await this.delay(3000);
    window.open(oRequest.testReport().output('bloburl'), '_blank');
    this.showLoading = false;
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
          doer: this._CookiesService.getData().user.name.fullName,
          observation: '',
          phase: eRequest.GENERATED,
          operation: eOperation// eStatusRequest.PROCESS
        };

        this.requestProvider.updateRequest(Identificador, data).subscribe(async (_) => {
          if (eOperation === eStatusRequest.PROCESS) {
            this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Creando Acta de Examen');
            this.showLoading = true;
            const _request: iRequest = this.getRequestById(Identificador);
            const oRequest: uRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
            await this.delay(3000);
            window.open(oRequest.testReport().output('bloburl'), '_blank');
            this.showLoading = false;
            // setTimeout(() => {window.open(oRequest.testReport().output('bloburl'), '_blank');}, 500);
          }
          this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
            (eOperation === eStatusRequest.PROCESS ? 'Acta de Examen Generada' : (eOperation === eStatusRequest.PRINTED) ? 'Acta de Examen Impresa' : 'Acta de Examen Entregada'));
          this.loadRequest();
        }, error => {
          let tmpJson = JSON.parse(error._body);
          this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', tmpJson.message);
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
              doer: this._CookiesService.getData().user.name.fullName,
              observation: '',
              phase: eRequest.TITLED,
              operation: eOperation// eStatusRequest.PROCESS
            };
            this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
              this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
                (eOperation === eStatusRequest.PROCESS ? 'Alumno notificado' : 'Título Profesional Entregado'));
              this.loadRequest();
            }, error => {
              let tmpJson = JSON.parse(error._body);
              this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', tmpJson.message);
            });
          }
        })
        break;
      }
      case eStatusRequest.ACCEPT: {
        this.router.navigate([Identificador + '/titled'], { relativeTo: this._ActivatedRoute });
      }
    }
  }

  Review(Identificador): void {
    this.router.navigate([Identificador], { relativeTo: this._ActivatedRoute });
  }

  seeRecord(Identificador): void {
    this.router.navigate([Identificador + '/expediente'], { relativeTo: this._ActivatedRoute });
  }

  seeRequestPDF(_id: string): void {
    const _request: iRequest = this.getRequestById(_id);
    const oRequest: uRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
    setTimeout(() => {
      window.open(oRequest.protocolActRequest().output('bloburl'), '_blank');
    }, 500);
  }

  checkReleased(_id: string) {
    const Request = this.getRequestById(_id);
    this.requestProvider.getResource(_id, eFILES.RELEASED).subscribe(data => {
      const dialogRef = this.dialog.open(ReleaseCheckComponent, {
        data: { file: data, jury: Request.jury },
        disableClose: true,
        hasBackdrop: true,
        width: '65em'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof (result) !== 'undefined') {
          let data;
          if (result) {
            data = {
              doer: this._CookiesService.getData().user.name.fullName,
              observation: '',
              operation: eStatusRequest.ACCEPT,
              phase: 'Liberado'//Request.phase
            };
            this.requestProvider.updateRequest(Request._id, data).subscribe(
              data => {
                this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
                this.loadRequest();
              },
              error => {
                this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
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
                  doer: this._CookiesService.getData().user.name.fullName,
                  observation: result.value,
                  operation: eStatusRequest.REJECT,
                  phase: Request.phase
                };
                this.requestProvider.updateRequest(Request._id, data).subscribe(
                  data => {
                    this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
                    this.loadRequest();
                  },
                  error => {
                    this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
                  }
                );
              }
            });
          }
        }
      },
        error => {
          this._NotificationsServices.showNotification(eNotificationType.ERROR,
            'Acto recepcional', error);
        });
    }, error => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR,
        'Acto recepcional', error);
    });
  }

  getRequestById(_id: string): iRequest {
    const indexRequest = this.request.findIndex(x => x._id === _id);
    return this.request[indexRequest];
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  async juryNotification(_id: string) {
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, "Acto Recepcional", "Generando documentación");
    this.showLoading = true;
    let _request = this.getRequestById(_id);
    let oRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
    this.getFolder(_request.controlNumber);
    await this.delay(3000);
    window.open(oRequest.notificationOffice().output('bloburl'), '_blank');
    const data = {
      file: {
        mimetype: "application/pdf",
        data: oRequest.documentSend(eFILES.JURAMENTO_ETICA),
        name: eFILES.JURAMENTO_ETICA + '.pdf',
      },
      folderId: this.folderId,
      isJsPdf: true,
      Document: eFILES.JURAMENTO_ETICA,
      phase: _request.phase,
      IsEdit: 'true'
    }
    this.requestProvider.uploadFile(_id, data).subscribe((response) => {
      window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
      this.showLoading = false;
    }, error => {
      this.showLoading = false;
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
    });


  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  getFolder(controlNumber: string): void {
    this._StudentProvider.getDriveFolderId(controlNumber, eFOLDER.TITULACION).subscribe(folder => {
      this.folderId = folder.folderIdInDrive;
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
  //         this.notifications.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
  //         this.loadRequest();
  //       }, error => {
  //         this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
  //       });
  //     } else {
  //       data.operation = eStatusRequest.REJECT;
  //       this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
  //         this.notifications.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
  //         this.loadRequest();
  //       }, error => {
  //         this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
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
  //   //       this.notifications.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
  //   //       this.loadRequest();
  //   //     }, error => {
  //   //       this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
  //   //     });
  //   //   } else {
  //   //     data.operation = eStatusRequest.REJECT;
  //   //     this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
  //   //       this.notifications.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud Actualizada');
  //   //       this.loadRequest();
  //   //     }, error => {
  //   //       this.notifications.showNotification(eNotificationType.ERROR, 'Acto recepcional', error);
  //   //     });
  //   //   }
  //   // });
  // }
