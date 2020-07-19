import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';
import { LoadingBarService } from 'ngx-loading-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { ICareer } from 'src/app/entities/shared/career.model';
import { IPeriod } from 'src/app/entities/shared/period.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eRole, ERoleToAcronym } from 'src/app/enumerators/app/role.enum';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { eStatusRequest } from 'src/app/enumerators/reception-act/statusRequest.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { BookProvider } from 'src/app/providers/reception-act/book.prov';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import { ActNotificacionComponent } from 'src/app/titulation/act-notificacion/act-notificacion.component';
import { BookComponent } from 'src/app/titulation/book/book.component';
import { ChangeJuryComponent } from 'src/app/titulation/change-jury/change-jury.component';
import { DocumentReviewComponent } from 'src/app/titulation/document-review/document-review.component';
import { ExpedientComponent } from 'src/app/titulation/expedient/expedient.component';
import { ObservationsComponentComponent } from 'src/app/titulation/observations-component/observations-component.component';
import { ReleaseCheckComponent } from 'src/app/titulation/release-check/release-check.component';
import { ReleaseComponentComponent } from 'src/app/titulation/release-component/release-component.component';
import { RequestModalComponent } from 'src/app/titulation/request-modal/request-modal.component';
import { SteepComponentComponent } from 'src/app/titulation/steep-component/steep-component.component';
import { UploadDeliveredComponent } from 'src/app/titulation/upload-delivered/upload-delivered.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-titulation-progress',
  templateUrl: './titulation-progress.component.html',
  styleUrls: ['./titulation-progress.component.scss']
})
export class TitulationProgressComponent implements OnInit {
  // tslint:disable-next-line:no-input-rename
  @Input('tab') tabNumber: number;
  // tslint:disable-next-line:no-input-rename
  @Input('phases') tabPhases: string[];
  @Input() public data: { periods: IPeriod[], careers: ICareer[], requests: iRequest[] };
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }
  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild('periodInput') periodInput: ElementRef<HTMLInputElement>;
  @ViewChild('careerInput') careerInput: ElementRef<HTMLInputElement>;
  @ViewChild('phaseInput') phaseInput: ElementRef<HTMLInputElement>;

  public dataSource: MatTableDataSource<IRequestSource>;
  public displayedColumns: string[] = [];
  public usedPeriods: string[] = [];
  public usedCareers: string[] = [];
  public usedPhases: string[] = [];
  public role: string;
  public requestsCount = {
    pendientes: 0,
    proceso: 0,
    listas: 0,
    impresas: 0,
    entregadas: 0,
    aceptadas: 0,
    finalizadas: 0,
    actasPendientes: 0,
    actasEntregadas: 0,
  };
  public canExport = false;
  public periodCtrl = new FormControl();
  public careerCtrl = new FormControl();
  public phaseCtrl = new FormControl();
  public filteredPeriods: Observable<string[]>;
  public filteredCareers: Observable<string[]>;
  public filteredPhases: Observable<string[]>;

  private requestFilter: IRequestSource[] = [];
  private tabRequest: IRequestSource[] = [];
  private departmentCareers: ICareer[]; // Carreras del puesto
  private fases: string[] = [];
  private emptyoRequest: uRequest;
  private canAccess = true;

  constructor(
    private requestProvider: RequestProvider,
    private dialog: MatDialog,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private imageToBase64Service: ImageToBase64Service,
    private studentProvider: StudentProvider,
    private loadingBar: LoadingBarService,
    private firebaseService: FirebaseService,
    private bookProvider: BookProvider,
    private loadingService: LoadingService,
  ) {
    if (!this.cookiesService.isAllowed(this.activatedRoute.snapshot.url[0].path)) {
      this.canAccess = false;
      this.router.navigate(['/']);
    }

    this.dataSource = new MatTableDataSource();
    this.role = this.cookiesService.getData().user.rol.name.toLowerCase();
    this.canExport = [eRole.ADMINISTRATION.toLowerCase(), eRole.HEADSCHOOLSERVICE.toLowerCase(), eRole.STUDENTSERVICES.toLowerCase()]
      .includes(this.role as eRole);
    // Asigno las carreras asociadas al puesto
    this.departmentCareers = this.cookiesService.getPosition().ascription.careers;
    const tmpRequest: iRequest = {};
    this.emptyoRequest = new uRequest(tmpRequest, this.imageToBase64Service, this.cookiesService);
  }

  ngOnInit() {
    if (this.canAccess) {
      this._assignData();

      this.displayedColumns = ['controlNumber', 'fullName', 'career', 'phase', 'status',
        'lastModifiedLocal', 'applicationDateLocal'];
      if (this.tabNumber >= 4 && this.tabNumber < 7) {
        this.displayedColumns.push(...['titulationDate', 'optionTitled']);
      }
      if (this.tabNumber >= 7) {
        this.displayedColumns.push('statusExamAct');
      }
      this.displayedColumns.push('action');
    }
  }

  // Inicializa variables y los observables para los filtros de periodo, carrera y fase
  private async _assignData() {
    this.fases = Object.values(EPhase as any) as string[];
    this.usedPhases = this.tabPhases;

    const activePeriod = this.data.periods.filter(per => per.active === true)[0];
    this.usedPeriods.push(`${activePeriod.periodName}-${activePeriod.year}`);

    this.filteredPeriods = this.periodCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => value
        ? this._filterPeriods(value)
        : this.data.periods.map((period: IPeriod) => `${period.periodName}-${period.year}`).slice()));

    this.filteredCareers = this.careerCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => value
        ? this._filterCareers(value)
        : this.data.careers.map((career: ICareer) => career.acronym).slice()));

    this.filteredPhases = this.phaseCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => value
        ? this._filterPhases(value)
        : this.fases.slice()));

    this.reload(true);
  }

  // Obtiene el nombre a mostrar para la fase solicitada
  public getPhaseNameToShow(phase: string) {
    return ((EPhaseToShow as any)[phase]).toUpperCase();
  }

  // Obtiene el nombre corto de una carrera en base a su acrónimo
  public getCareerShortName(acronymCareer: string): string {
    const career: ICareer = this.data.careers.filter((item: ICareer) => item.acronym === acronymCareer)[0];
    return (career && career.shortName) || '';
  }

  // Manda cargar las solicitudes y muestra el loader mientras se cargan
  public async reload(isInit: boolean = false) {
    this.loadingBar.start();
    await this.loadRequest(isInit);
    this.loadingBar.complete();
  }

  // Obtiene las solicitudes de acuerdo al rol del usuario y las transforma para la tabla
  private async loadRequest(isInit: boolean = false) {
    const filterRole = (ERoleToAcronym as any)[this.role];
    let requests: iRequest[];

    if (!isInit) {
      requests = await this._getRequestsByRole(filterRole) as iRequest[];
    } else {
      requests = this.data.requests;
    }

    if (!requests) {
      return this.notificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener solicitudes');
    }

    this.requestFilter = [];

    requests.forEach((element: iRequest) => {
      const isProcess = (this.tabNumber === 3)
        ? element.documents.filter(({ status }) => status === 'Process').length > 0
        : true;
      if (isProcess) {
        const tmpRequest: IRequestSource = this.castRequest(element);

        if (![eRole.CHIEFACADEMIC.toLowerCase(), eRole.SECRETARYACEDMIC.toLowerCase()].includes(this.role as eRole)) {
          this.requestFilter.push(tmpRequest);
        } else {
          // Verifico si la carrera de la solicitud pertenece a las carreras asociadas al departamento del empleado se asigna
          const index = this.departmentCareers
            .findIndex(({ _id }) => _id === tmpRequest.request.student.careerId._id);
          if (index >= 0) {
            this.requestFilter.push(tmpRequest);
          }
        }
      }
    });

    this.refresh(this.requestFilter);
  }

  // Transforma las solicitudes del tipo iRequest a IRequestSource
  private castRequest(request: iRequest): IRequestSource {
    const newRequest = JSON.parse(JSON.stringify(request));
    newRequest.student = request.studentId;
    newRequest.studentId = request.studentId._id;

    return {
      _id: newRequest._id,
      status: this.convertStatus(newRequest.status),
      controlNumber: newRequest.student.controlNumber,
      phase: newRequest.phase,
      careerAcronym: newRequest.student.careerId.acronym,
      fullName: newRequest.student.fullName,
      titulationOption: newRequest.titulationOption,
      proposedDateLocal: new Date(newRequest.proposedDate).toLocaleDateString(),
      applicationDateLocal: new Date(newRequest.applicationDate).toLocaleDateString(),
      lastModifiedLocal: new Date(newRequest.lastModified).toLocaleDateString(),
      examActStatus: typeof (newRequest.examActStatus) !== 'undefined' ? newRequest.examActStatus : false,
      request: newRequest,
    };
  }

  // Aplica los filtros a las solicitudes y las muestra en la tabla
  private refresh(data: IRequestSource[]) {
    data = this._filterRequestsByStatus(data);

    this.tabRequest = [...data];

    data = this._applyFilters(data);

    this.dataSource.data = data;
  }

  // Filtra las solicitudes por los estatus del tab actual
  private _filterRequestsByStatus(requests: IRequestSource[]): IRequestSource[] {
    if (requests && requests.length && this.tabNumber > 1) {
      if (this.tabNumber === 2) {
        return requests.filter(({ status }) => status.toLowerCase() === 'pendiente');
      }

      if (this.tabNumber === 3) {
        return requests.filter(({ status }) => status.toLowerCase() === 'proceso');
      }

      if (this.tabNumber === 4) {
        return requests.filter(({ status, request }) => {
          if (status.toLowerCase() === 'proceso') {
            const finalizedDate = new Date(request.proposedDate);
            const finalizedHour = request.proposedHour + request.duration;
            finalizedDate.setHours(finalizedHour / 60, finalizedHour % 60, 0, 0);

            return (finalizedDate <= new Date());
          }
          return false;
        });
      }

      if (this.tabNumber === 5) {
        this.requestsCount.pendientes = 0;
        this.requestsCount.impresas = 0;
        this.requestsCount.listas = 0;
        this.requestsCount.entregadas = 0;

        return requests.filter(({ phase, status }) => {
          if (phase === 'Generado' && status === 'Pendiente') {
            this.requestsCount.pendientes++;
            return true;
          }
          if (phase === 'Generado' && status === 'Impreso') {
            this.requestsCount.impresas++;
            return true;
          }
          if (phase === 'Generado' && status === 'Aceptado') {
            this.requestsCount.listas++;
            return true;
          }
          if (phase === 'Titulado' && status === 'Pendiente') {
            this.requestsCount.entregadas++;
            return true;
          }
          return false;
        });
      }

      if (this.tabNumber === 6) {
        this.requestsCount.listas = 0;
        this.requestsCount.entregadas = 0;
        this.requestsCount.proceso = 0;
        this.requestsCount.aceptadas = 0;
        this.requestsCount.finalizadas = 0;

        return requests.filter(({ phase, status }) => {
          if (phase === 'Generado' && status === 'Aceptado') {
            this.requestsCount.listas++;
            return true;
          }
          if (phase === 'Titulado' && status === 'Pendiente') {
            this.requestsCount.entregadas++;
            return true;
          }
          if (phase === 'Titulado' && status === 'Proceso') {
            this.requestsCount.proceso++;
            return true;
          }
          if (phase === 'Titulado' && status === 'Aceptado') {
            this.requestsCount.aceptadas++;
            return true;
          }
          if (phase === 'Titulado' && status === 'Finalizado') {
            this.requestsCount.finalizadas++;
            return true;
          }
        });
      }

      if (this.tabNumber === 7) {
        this.requestsCount.actasPendientes = 0;
        this.requestsCount.actasEntregadas = 0;

        return requests.filter(({ request }) => {
          if (request && typeof request.examActStatus !== 'undefined') {
            if (request.examActStatus) {
              this.requestsCount.actasEntregadas++;
            }
            this.requestsCount.actasPendientes++;
            return true;
          }
        });
      }
    }
    return requests;
  }

  private convertStatus(status: string): string {
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
        value = 'Pendiente';
    }
    return value;
  }

  // Abre modal con el expediente
  public seeRecord(requestId: string, request: iRequest): void {
    const dialogRef = this.dialog.open(ExpedientComponent, {
      data: { id: requestId, request },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
    });

    dialogRef
      .afterClosed()
      .subscribe((_) => {
        this.reload();
      });
  }

  // Abre modal con el historial de observaciones
  public viewHistory(requestId: string): void {
    const tmpRequest = this.getRequestById(requestId);
    this.dialog.open(ObservationsComponentComponent, {
      data: {
        phase: 'Solicitado',
        request: tmpRequest
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em',
    });
  }

  // Abre modal para aceptar / rechazar solicitud
  public checkRequest(requestId: string): void {
    const ref = this.dialog.open(RequestModalComponent, {
      data: {
        Id: requestId
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em'
    });

    ref
      .afterClosed()
      .subscribe((valor: any) => {
        if (valor) {
          this.reload();
        }
      }, (_) => {
        this.notificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
      });
  }

  // Abre modal con wizard para firmar registro de proyecto
  public verified(requestId: string): void {
    const ref = this.dialog.open(SteepComponentComponent, {
      data: {
        Request: this.getRequestById(requestId)
      },
      disableClose: true,
      hasBackdrop: true,
      width: '80vw'
    });

    ref
      .afterClosed()
      .subscribe((valor: any) => {
        if (valor) {
          this.reload();
        }
      }, (_) => {
        this.notificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
      });
  }

  // Abre modal para generar y subir liberación de proyecto
  public async releasedRequest(requestId: string) {
    let lJury: Array<string> = [];
    let lObservation: string;
    let lMinutes = 420;
    let lDuration = 60;

    const tmpRequest = this.getRequestById(requestId);
    if (tmpRequest.status === 'Rechazado' || tmpRequest.jury.length > 0) {
      const value = tmpRequest.history.filter(x => x.phase === 'Liberado').slice(0).sort(
        function (a, b) {
          const bDate: Date = new Date(b.achievementDate);
          const aDate: Date = new Date(a.achievementDate);
          return bDate.getTime() - aDate.getTime();
        }
      );
      lJury = tmpRequest.jury;
      lObservation = tmpRequest.status === 'Rechazado' ? value[0].observation : '';
      lMinutes = tmpRequest.proposedHour;
      lDuration = tmpRequest.duration;
    }

    const folder = await new Promise(resolve => {
      this.studentProvider
        .getDriveFolderId(tmpRequest.student.controlNumber, eFOLDER.TITULACION)
        .subscribe((folderData) => {
          if (folderData) {
            if (typeof (folderData.folderIdInDrive) !== 'undefined' || folderData.folderIdInDrive !== '') {
              resolve(folderData.folderIdInDrive);
            } else {
              this.notificationsServices
                .showNotification(eNotificationType.ERROR, 'Acto recepcional',
                  'No se pudo encontrar el folder del estudiante');
              resolve('');
            }
          } else {
            this.notificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional',
                'No se encontró el folder del estudiante');
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
          id: requestId,
          folder: folder,
          duration: lDuration,
          request: tmpRequest
        },
        disableClose: true,
        hasBackdrop: true,
        width: '70em'
      });

      ref.afterClosed().subscribe(result => {
        if (typeof (result) !== 'undefined') {
          this.requestProvider
            .releasedRequest(requestId, {
              email: tmpRequest.email,
              proposedHour: result.proposedHour,
              duration: result.duration,
              upload: result.upload,
              Doer: this.cookiesService.getData().user.name.fullName,
              jury: result.jury
            })
            .subscribe((_) => {
              this.reload();
            }, (_) => {
              this.notificationsServices
                .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error al liberar proyecto');
            });
        } else {
          this.reload();
        }
      });
    }
  }

  // Abre modal para validar liberación de proyecto
  public checkReleased(requestId: string) {
    const Request = this.getRequestById(requestId);
    this.notificationsServices
      .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Procesando liberación');
    this.loadingService.setLoading(true);
    this.requestProvider
      .getResource(requestId, eFILES.RELEASED)
      .subscribe((file) => {
        this.loadingService.setLoading(false);
        const dialogRef = this.dialog.open(ReleaseCheckComponent, {
          data: { file, jury: Request.jury },
          disableClose: true,
          hasBackdrop: true,
          width: '65em'
        });

        dialogRef.afterClosed()
          .subscribe((result) => {
            if (typeof (result) !== 'undefined') {
              let data;
              if (result) {
                data = {
                  doer: this.cookiesService.getData().user.name.fullName,
                  observation: '',
                  operation: eStatusRequest.ACCEPT,
                  phase: 'Liberado',
                };
                this.requestProvider
                  .updateRequest(Request._id, data)
                  .subscribe((_) => {
                    this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
                    this.reload();
                  }, (_) => {
                    this.notificationsServices
                      .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
                  });
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
                      return 'Motivo obligatorio';
                    }
                  }
                }).then((result1) => {
                  if (result1.value) {
                    data = {
                      doer: this.cookiesService.getData().user.name.fullName,
                      observation: result1.value,
                      operation: eStatusRequest.REJECT,
                      phase: Request.phase
                    };
                    this.requestProvider
                      .updateRequest(Request._id, data)
                      .subscribe((_) => {
                        this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
                        this.reload();
                      }, (_) => {
                        this.notificationsServices
                          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
                      });
                  }
                });
              }
            }
          }, (_) => {
            this.notificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error');
          });
      }, (_) => {
        this.loadingService.setLoading(false);
        this.notificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener archivo');
      });
  }

  // Abre modal para rivisar documentos
  public review(requestId: string, request: iRequest): void {
    const dialogRef = this.dialog.open(DocumentReviewComponent, {
      data: { id: requestId, isTitled: false, request },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
    });

    dialogRef
      .afterClosed()
      .subscribe((_) => {
        this.reload();
      });
  }

  // Abre modal para firmar constancia de no inconveniencia
  public async signProof(requestId: string) {
    const _request: iRequest = this.getRequestById(requestId);
    const oRequest: uRequest = new uRequest(_request, this.imageToBase64Service, this.cookiesService);
    const folderId = await this.getFolder(_request.student.controlNumber) as string;

    const ref = this.dialog.open(UploadDeliveredComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '50vw',
      data: { reqId: requestId, department: eRole.HEADSCHOOLSERVICE }
    });

    ref.afterClosed()
      .subscribe((valor: { response: boolean, data: { QR: any, ESTAMP: any, RESPONSE: boolean } }) => {
        if (typeof (valor) !== 'undefined' && valor.response) {
          this.loadingService.setLoading(true);
          const data = {
            doer: this.cookiesService.getData().user.name.fullName,
            observation: '',
            operation: eStatusRequest.ACCEPT,
            file: {
              mimetype: 'application/pdf',
              data: oRequest.documentSend(eFILES.INCONVENIENCE, valor.data.QR, valor.data.ESTAMP),
              name: eFILES.INCONVENIENCE + '.pdf'
            },
            folderId,
            phase: eRequest.VALIDATED
          };

          this.requestProvider
            .updateRequest(requestId, data)
            .subscribe((_) => {
              this.loadingService.setLoading(false);
              this.notificationsServices
                .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
              this.reload();
            }, (_) => {
              this.loadingService.setLoading(false);
              this.notificationsServices
                .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
            });
        }
      }, (_) => {
        this.notificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error');
      });
  }

  // Va a la agenda
  public openDiary(requestId: string) {
    const lRequest = this.getRequestById(requestId);
    if (typeof (lRequest.proposedDate) !== 'undefined') {
      localStorage.setItem('Appointment', new Date(lRequest.proposedDate).toDateString());
    }
    this.router.navigate(['titulation/diary/coordination']);
  }

  // Abre modal para firmar oficio de jurado
  public async jurySign(requestId: string) {
    const _request: iRequest = this.getRequestById(requestId);
    const juryGender = { president: 'MASCULINO', secretary: 'MASCULINO', };
    const studentGender = (await this._getStudentGender(_request.student._id) as string) || 'M';

    juryGender.president = await this._getEmployeeGender(_request.jury[0].email
      ? _request.jury[0].email : _request.jury[0].name) as string;

    juryGender.secretary = await this._getEmployeeGender(_request.jury[1].email
      ? _request.jury[1].email : _request.jury[1].name) as string;

    const oRequest: uRequest = new uRequest(_request, this.imageToBase64Service, this.cookiesService, juryGender, studentGender);

    const ref = this.dialog.open(UploadDeliveredComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '50vw',
      data: { reqId: requestId, department: eRole.DIVESTPROFCHIEF, departmentOut: _request.department.name }
    });

    ref.afterClosed()
      .subscribe(async (valor: { response: boolean, data: { QR: any, ESTAMP: any, RESPONSE: boolean } }) => {
        if (typeof (valor) !== 'undefined' && valor.response) {
          this.loadingService.setLoading(true);
          const folderId = await this.getFolder(_request.student.controlNumber) as string;
          const data = {
            doer: this.cookiesService.getData().user.name.fullName,
            observation: '',
            operation: eStatusRequest.PROCESS,
            file: {
              mimetype: 'application/pdf',
              data: oRequest.documentSend(eFILES.OFICIO, valor.data.QR, valor.data.ESTAMP),
              name: eFILES.OFICIO + '.pdf'
            },
            folderId,
            phase: eRequest.REALIZED
          };

          this.requestProvider.updateRequest(requestId, data).subscribe((_) => {
            this.loadingService.setLoading(false);
            this.notificationsServices
              .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
            window.open(oRequest.notificationOffice(valor.data.QR, valor.data.ESTAMP).output('bloburl'), '_blank');
            this.reload();
          }, (_) => {
            this.loadingService.setLoading(false);
            this.notificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
          });
        }
      }, (_) => {
        this.notificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error');
      });
  }

  // Genera documentación para titulación
  public async juryNotification(requestId: string) {
    this.notificationsServices
      .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Generando documentación');
    this.loadingService.setLoading(true);
    const _request = this.getRequestById(requestId);
    const oRequest = new uRequest(_request, this.imageToBase64Service, this.cookiesService);
    const folderId = await this.getFolder(_request.student.controlNumber) as string;

    await this.delay(2000);
    const fileData = {
      file: {
        mimetype: 'application/pdf',
        data: oRequest.documentSend(eFILES.JURAMENTO_ETICA),
        name: eFILES.JURAMENTO_ETICA + '.pdf',
      },
      folderId,
      isJsPdf: true,
      Document: eFILES.JURAMENTO_ETICA,
      phase: _request.phase,
      IsEdit: 'true'
    };
    this.notificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto Recepcional', 'Generando código de ética');
    this.requestProvider
      .uploadFile(requestId, fileData)
      .subscribe((_0) => {
        if (_request.status === 'Pendiente') {
          const data = {
            doer: this.cookiesService.getData().user.name.fullName,
            observation: '',
            phase: eRequest.REALIZED,
            operation: eStatusRequest.PROCESS
          };
          this.requestProvider.updateRequest(requestId, data).subscribe((_1) => {
            window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
            this.reload();
            this.loadingService.setLoading(false);
          }, (_2) => {
            this.loadingService.setLoading(false);
            this.notificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
          });
        } else {
          window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
          this.loadingService.setLoading(false);
        }
      }, (_1) => {
        this.loadingService.setLoading(false);
        this.notificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
      });
  }

  // Abre modal para generar oficios de comisión a los sinodales
  public generateTrades(requestId: string): void {
    this.dialog.open(ActNotificacionComponent, {
      data: {
        Appointment: {
          id: requestId
        }
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });
  }

  // Aprobar / reprobar acto recepcional y actualizar estatus en SII
  public approve(request: iRequest): void {
    const { _id, student, titulationOption } = request;
    const { controlNumber } = student;

    Swal.fire({
      title: 'Estatus del Acto Recepcional',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Reprobar',
      confirmButtonText: 'Aprobar',
      showCloseButton: true
    }).then(async (result) => {
      result.dismiss = result.dismiss ? result.dismiss : Swal.DismissReason.cancel;
      if (result.dismiss.toString() === 'cancel' || result.value) {
        const response = await Swal.fire({
          title: '¿Está seguro de confirmar esta operación?',
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
          const minuteBook = await this._getActiveBookByCareer(student.careerId._id, titulationOption);
          if (minuteBook) {
            const linkModal = this.dialog.open(BookComponent, {
              data: {
                operation: 'create',
                book: minuteBook
              },
              disableClose: true,
              hasBackdrop: true,
              width: '50em',
            });
            linkModal.afterClosed().subscribe(
              (book) => {
                const data = {
                  doer: this.cookiesService.getData().user.name.fullName,
                  observation: '',
                  operation: eStatusRequest.ACCEPT,
                  registry: {},
                  phase: eRequest.REALIZED,
                  controlNumber
                };
                if (typeof (result.value) !== 'undefined') {
                  data.observation = '';
                } else {
                  data.observation = 'Acto recepcional no aprobado';
                  data.operation = eStatusRequest.REJECT;
                }
                if (book.action === 'create') {
                  this.loadingService.setLoading(true);
                  data.registry = book.data;
                  this.requestProvider.updateRequest(_id, data).subscribe(_ => {
                    if (data.operation === eStatusRequest.ACCEPT) {
                      this.loadingService.setLoading(true);
                      const sub1 = this.firebaseService.getActivedEvent().subscribe(
                        (event) => {
                          this.loadingService.setLoading(false);
                          sub1.unsubscribe();
                          if (event[0]) {
                            this.loadingService.setLoading(true);
                            const collectionName = event[0].payload.doc.id;
                            const sub2 = this.firebaseService.getGraduateByControlNumber(controlNumber, collectionName).subscribe(
                              (studentData) => {
                                this.loadingService.setLoading(false);
                                sub2.unsubscribe();
                                if (studentData[0]) {
                                  this.loadingService.setLoading(true);
                                  this.firebaseService.updateFieldGraduate(studentData[0].id, { degree: true }, collectionName)
                                    .then((__) => {
                                      this.loadingService.setLoading(false);
                                      this.notificationsServices
                                        .showNotification(eNotificationType.SUCCESS,
                                          'Acto recepcional', 'Se actualizó el acrónimo del egresado para graduación');
                                    }, (__) => {
                                      this.loadingService.setLoading(false);
                                    });
                                }
                              }, (__) => {
                                this.loadingService.setLoading(false);
                              }
                            );
                          } else {
                            this.loadingService.setLoading(false);
                          }
                          this.uploadSummary();
                        }, (__) => {
                          this.loadingService.setLoading(false);
                        }
                      );
                    }
                    this.loadingService.setLoading(false);
                    if (data.operation === eStatusRequest.ACCEPT) {
                      this.notificationsServices
                        .showNotification(eNotificationType.SUCCESS,
                          'Acto recepcional', 'Se actualizó la solicitud y el estatus en el SII');
                    } else {
                      this.notificationsServices
                        .showNotification(eNotificationType.SUCCESS,
                          'Acto recepcional', 'Se actualizó la solicitud');
                    }
                    this.reload();
                  }, (error) => {
                    this.loadingService.setLoading(false);
                    const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
                    this.notificationsServices
                      .showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
                  });
                }
              }, err => console.log(err));
          } else {
            this.notificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional',
                'No existe libro activo para la carrera del alumno');
          }
        }
      }
    });
  }

  // Generar ficha de acto recepcional
  public uploadSummary() {
    this.loadingService.setLoading(true);
    this.requestProvider.getSummary().toPromise()
      .then((requests) => {
        const agrupSummary = [];
        requests.forEach((request) => {
          if (request) {
            agrupSummary.push(
              {
                file: {
                  mimetype: 'application/pdf',
                  data: this.emptyoRequest.bufferToBase64(this.emptyoRequest.requestSummary(request).output('arraybuffer')),
                  name: eFILES.SUMMARY + '.pdf'
                },
                Document: eFILES.SUMMARY,
                folderId: request.student.folderDriveIdRecAct,
                studentId: request.student._id
              }
            );
          }
        });

        this.requestProvider.uploadSummary(agrupSummary).toPromise()
          .then((_) => {
            this.loadingService.setLoading(false);
            this.notificationsServices.showNotification(
              eNotificationType.SUCCESS, 'Acto recepcional',
              'Se generó y subió a drive la ficha');
          })
          .catch((_) => {
            this.loadingService.setLoading(false);
            this.notificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional',
                'Algo salio mal al generar la ficha');
          });
      })
      .catch((err) => {
        this.loadingService.setLoading(false);
        const error = JSON.parse(err._body);

        if (error.err) {
          this.notificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional',
              'Algo salio mal al buscar la solicitud');
        } else {
          this.notificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional',
              'No se encontro la solicitud para generar la ficha');
        }
      });
  }

  // Generación de acta de examen
  public async generated(requestId: string, operation: string) {
    const eOperation = <eStatusRequest><keyof typeof eStatusRequest>operation;
    if (eOperation === eStatusRequest.PROCESS) {
      const response = await this.showAlert('¿Hubo un cambio de jurado?', { accept: 'Si', cancel: 'No' });
      if (response) {
        let _Request = this.getRequestById(requestId);
        const ref = this.dialog.open(ChangeJuryComponent, {
          data: {
            request: _Request
          },
          disableClose: true,
          hasBackdrop: true,
          width: '65vw'
        });

        ref.afterClosed().subscribe(async (result) => {
          if (typeof (result) !== 'undefined' && result.response) {
            this.loadingService.setLoading(true);
            this.notificationsServices
              .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Regenerando oficio de jurado');
            await this.reload();
            _Request = this.getRequestById(requestId);
            const oRequest = new uRequest(_Request, this.imageToBase64Service, this.cookiesService);
            const folderId = await this.getFolder(_Request.controlNumber) as string;

            await this.delay(2000);
            const data_oficio = {
              file: {
                mimetype: 'application/pdf',
                data: oRequest.documentSend(eFILES.OFICIO),
                name: eFILES.OFICIO + '.pdf',
              },
              folderId,
              isJsPdf: true,
              Document: eFILES.OFICIO,
              phase: _Request.phase,
              IsEdit: 'true'
            };
            const response1 = await new Promise((resolve) => {
              this.requestProvider
                .uploadFile(requestId, data_oficio)
                .subscribe((_) => {
                  window.open(oRequest.notificationOffice().output('bloburl'), '_blank');
                  resolve(true);
                }, (_) => {
                  this.notificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
                  resolve(false);
                });
            });
            this.loadingService.setLoading(false);
            if (response1) {
              await this.testReportGenerate(requestId, eOperation);
            } else {
              this.notificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Actualización del oficio fallida');
            }
          }
        });
      } else {
        const response2 = await this.showAlert('¿Está seguro de crear el Acta de Examen?', { accept: 'Si', cancel: 'No' });
        if (response2) {
          await this.testReportGenerate(requestId, eOperation);
        }
      }
    } else {
      const response = await this.showAlert('¿Está seguro de continuar con la operación?', { accept: 'Si', cancel: 'No' });
      if (response) {
        await this.testReportGenerate(requestId, eOperation);
      }
    }
  }

  // Continuación acta de examen
  private async testReportGenerate(requestId: string, eOperation: eStatusRequest) {
    const data = {
      doer: this.cookiesService.getData().user.name.fullName,
      observation: '',
      phase: eRequest.GENERATED,
      operation: eOperation,
    };

    let actaEntregada = false;
    if (eOperation === eStatusRequest.ACCEPT) {
      actaEntregada = await this.showAlert('¿Estatus del acta?', { accept: 'ENTREGADA', cancel: 'PENDIENTE' });
    }

    this.requestProvider
      .updateRequest(requestId, data)
      .subscribe(async (_) => {
        if (eOperation === eStatusRequest.PROCESS) {
          this.notificationsServices
            .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Creando acta de examen');
          const _request: iRequest = this.getRequestById(requestId);
          let acta = true;
          let firma = false;
          const juryGender = { president: 'MASCULINO', secretary: 'MASCULINO' };
          const titleOption = _request.titulationOption;
          const studentGender = (await this._getStudentGender(_request.studentId) as string) || 'M';
          const activeBook = await this._getActiveBookByCareer(_request.student.careerId._id, titleOption) as any;
          const careerPerBook = (activeBook && activeBook.careers && activeBook.careers.length) || 1;

          juryGender.president = await this._getEmployeeGender(_request.jury[0].email
            ? _request.jury[0].email : _request.jury[0].name) as string;

          juryGender.secretary = await this._getEmployeeGender(_request.jury[1].email
            ? _request.jury[1].email : _request.jury[1].name) as string;

          const _Request = this.getRequestById(requestId);
          const oRequest: uRequest =
            new uRequest(_request, this.imageToBase64Service, this.cookiesService, juryGender, studentGender, careerPerBook);
          // const folderId = await this.getFolder(_Request.controlNumber) as string;

          if (_request.titulationOption.split('-')[0].trim() === 'XI') {
            acta = await this.showAlert('¿Usar formato de acta nuevo?', { accept: 'SI', cancel: 'USAR ANTIGUO' });
            firma = await this.showAlert('¿Acta Firmada?', { accept: 'SI', cancel: 'NO' });
            this.loadingService.setLoading(true);
            if (firma) {
              await this.delay(3000);
              window.open(oRequest.testReport(acta, firma).output('bloburl'), '_blank');
            } else {
              await this.delay(3000);
              window.open(oRequest.testReport(acta, firma).output('bloburl'), '_blank');
            }

          } else {
            await this.delay(3000);
            window.open(oRequest.testReportForTitulationNotIntegral().output('bloburl'), '_blank');
          }
          this.loadingService.setLoading(false);
        }
        this.notificationsServices
          .showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
            (eOperation === eStatusRequest.PROCESS
              ? 'Acta de examen generada'
              : (eOperation === eStatusRequest.PRINTED)
                ? 'Acta de examen impresa'
                : 'Acta de examen entregada'));

        if (eOperation === eStatusRequest.ACCEPT) {
          this.requestProvider
            .saveStatusExamAct(requestId, actaEntregada)
            .subscribe(async (_0) => {
              this.loadingService.setLoading(false);
              // Mandar correo con estatus de acta
              const _request: iRequest = await this.getRequestById(requestId);
              this.requestProvider.sendMailExamAct(_request.email, actaEntregada).subscribe(
                (_1) => {
                  this.reload();
                }, (_2) => {
                  this.notificationsServices
                    .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, no se pudo enviar notificación al alumno');
                });

            }, (_3) => {
              this.notificationsServices
                .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, No se pudo guardar estatus de acta');
              this.loadingService.setLoading(false);
            });
        }

        this.reload();
      }, (error) => {
        const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
        this.notificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
      });
  }

  // Reimprimir acta de examen
  public async reImprimir(requestId: string) {
    this.notificationsServices
      .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Reimprimiendo acta de examen');
    const _request: iRequest = this.getRequestById(requestId);
    let acta = true;
    const juryGender = { president: 'MASCULINO', secretary: 'MASCULINO' };
    const titleOption = _request.titulationOption;
    const studentGender = (await this._getStudentGender(_request.studentId) as string) || 'M';
    const activeBook = await this._getActiveBookByCareer(_request.student.careerId._id, titleOption) as any;
    const careerPerBook = (activeBook && activeBook.careers && activeBook.careers.length) || 1;
    let firma = false;

    juryGender.president = await this._getEmployeeGender(_request.jury[0].email
      ? _request.jury[0].email : _request.jury[0].name) as string;

    juryGender.secretary = await this._getEmployeeGender(_request.jury[1].email
      ? _request.jury[1].email : _request.jury[1].name) as string;

    const oRequest: uRequest =
      new uRequest(_request, this.imageToBase64Service, this.cookiesService, juryGender, studentGender, careerPerBook);
    if (_request.titulationOption.split('-')[0].trim() === 'XI') {
      acta = await this.showAlert('¿Usar formato de acta nuevo?', { accept: 'SI', cancel: 'USAR ANTIGUO' });
      firma = await this.showAlert('¿Acta Firmada?', { accept: 'SI', cancel: 'NO' });
      this.loadingService.setLoading(true);
      if (firma) {
        await this.delay(3000);
        window.open(oRequest.testReport(acta, firma).output('bloburl'), '_blank');
      } else {
        await this.delay(3000);
        window.open(oRequest.testReport(acta, firma).output('bloburl'), '_blank');
      }
    } else {
      await this.delay(3000);
      window.open(oRequest.testReportForTitulationNotIntegral().output('bloburl'), '_blank');
    }

    this.loadingService.setLoading(false);
  }

  // Gestión del título
  public titled(requestId: string, operation: string, request: iRequest): void {
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
            const data = {
              doer: this.cookiesService.getData().user.name.fullName,
              observation: '',
              phase: eRequest.TITLED,
              operation: eOperation,
            };
            this.requestProvider
              .updateRequest(requestId, data)
              .subscribe((_) => {
                this.notificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
                  (eOperation === eStatusRequest.PROCESS ? 'Alumno notificado' : 'Título profesional entregado'));
                this.reload();
              }, (error) => {
                const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
                this.notificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
              });
          }
        });
        break;
      }
      case eStatusRequest.ACCEPT: {
        const index = request.documents
          .findIndex(x => x.type === eFILES.XML || x.type === eFILES.INE || x.type === eFILES.CED_PROFESIONAL);
        if (index !== -1) {
          const dialogRef = this.dialog.open(DocumentReviewComponent, {
            data: { id: requestId, isTitled: true, request },
            disableClose: true,
            hasBackdrop: true,
            width: '90em',
          });
          dialogRef.afterClosed()
            .subscribe((_) => {
              this.reload();
            });
        } else {
          this.notificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'El estudiante no ha registrado ningún archivo');
        }
        break;
      }
    }
  }

  // Aplica filtro de texto al escribir
  public applySearchFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Generar reporte y exportar a excel
  public excelExport() {
    this.notificationsServices
      .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Los datos se exportaron con éxito');
    TableToExcel.convert(document.getElementById('table'), {
      name: 'Reporte acto recepcional.xlsx',
      sheet: {
        name: 'Egresados'
      }
    });
  }

  // Cambiar estatus de entrega de acta de examen
  public async changeStatusExamAct(requestId: string, status: boolean) {
    let notificacion = false;
    const mensaje = status ? 'acta entregada' : 'acta pendiente';
    this.loadingService.setLoading(true);
    this.requestProvider.changeStatusExamAct(requestId, status)
      .subscribe(async (_) => {
        this.loadingService.setLoading(false);
        this.notificationsServices
          .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Estatus de acta actualizado correctamente');

        // Preguntar si se desea nitificar al alumno el cambio de estatus
        notificacion = await this.showAlert('¿Enviar notificación de ' + mensaje + '?', { accept: 'SI', cancel: 'NO' });

        // Mandar notificación
        if (notificacion) {
          const _request: iRequest = await this.getRequestById(requestId);
          this.requestProvider.sendMailExamAct(_request.email, status)
            .subscribe(
              (_0) => {
                this.notificationsServices
                  .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Notificación enviada al alumno');
              }, (_1) => {
                this.notificationsServices
                  .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, no se pudo enviar notificación al alumno');
              });
        }
        this.reload();
      }, (_) => {
        this.notificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error, No se pudo actualizar el estatus de acta');
        this.loadingService.setLoading(false);
      });
  }

  // Obtener solicitud por id
  private getRequestById(requestId: string): iRequest {
    const indexRequest = this.requestFilter.findIndex((item: IRequestSource) => item.request._id === requestId);
    if (indexRequest >= 0) {
      return this.requestFilter[indexRequest].request;
    }
    return null;
  }

  // FILTRO PERÍODOS
  public slectedPeriod(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value as string;
    const index = this.usedPeriods.indexOf(value);
    if (index === -1) {
      this.usedPeriods.push(value);
      this._applyFilters(this.tabRequest);
    }
    this.periodInput.nativeElement.value = '';
    this.periodCtrl.setValue(null);
  }

  public removePeriod(period: string): void {
    const index = this.usedPeriods.indexOf(period);
    if (index >= 0) {
      this.usedPeriods.splice(index, 1);
      this._applyFilters(this.tabRequest);
    }
  }

  private _filterPeriods(value: string): string[] {
    const filterValue = (value || '').toLowerCase();
    return this.data.periods
      .filter((period: IPeriod) => (period.periodName + '-' + period.year).toLowerCase().includes(filterValue))
      .map((period: IPeriod) => `${period.periodName}-${period.year}`);
  }

  // FILTRO CARRERAS
  public slectedCareer(event: MatAutocompleteSelectedEvent) {
    const selectedCareer = event.option.value as string;
    const index = this.usedCareers.indexOf(selectedCareer);
    if (index === -1) {
      this.usedCareers.push(selectedCareer);
      this._applyFilters(this.tabRequest);
    }
    this.careerInput.nativeElement.value = '';
    this.careerCtrl.setValue(null);
  }

  public removeCareer(career: string): void {
    const index = this.usedCareers.indexOf(career);
    if (index >= 0) {
      this.usedCareers.splice(index, 1);
      this._applyFilters(this.tabRequest);
    }
  }

  private _filterCareers(value: string): string[] {
    const filterValue = (value || '').toLowerCase();
    return this.data.careers
      .filter((career: ICareer) => (career.shortName || '').toLowerCase().includes(filterValue))
      .map((career: ICareer) => career.acronym);
  }

  // FILTRO FASES
  public slectedPhase(event: MatAutocompleteSelectedEvent) {
    const selectedPhase = event.option.value as string;
    const index = this.usedPhases.indexOf(selectedPhase);
    if (index === -1) {
      this.usedPhases.push(selectedPhase);
      this._applyFilters(this.tabRequest);
    }
    this.phaseInput.nativeElement.value = '';
    this.phaseCtrl.setValue(null);
  }

  public removePhase(phase: string): void {
    const index = this.usedPhases.indexOf(phase);
    if (index >= 0) {
      this.usedPhases.splice(index, 1);
      this._applyFilters(this.tabRequest);
    }
  }

  private _filterPhases(value: string): string[] {
    const filterValue = (value || '').toLowerCase();
    return this.fases
      .filter((phase: string) => phase.toLowerCase().includes(filterValue));
  }

  /* Aplica filtros de periodo, carrera, fase y búsqueda de texto
  a las solicitudes y las muestra en la tabla */
  private _applyFilters(requests: IRequestSource[]): IRequestSource[] {
    if (requests && requests.length) {
      const periods = this.usedPeriods;
      const careers = this.usedCareers;
      const phases = this.usedPhases;
      const inputFilter = document.getElementById('myfilter') as any;
      let data = requests;

      data = periods.length > 0
        ? data.filter(({ request }) =>
          periods.includes((request.periodId.periodName + '-' + request.periodId.year)))
        : data;

      data = careers.length > 0
        ? data.filter(({ request }) =>
          careers.includes((request.student.careerId.acronym)))
        : data;

      data = phases.length > 0
        ? data.filter(({ request }) => phases.includes((request.phase)))
        : data;

      this.dataSource.filter = (inputFilter && inputFilter.value) ? inputFilter.value.trim().toLowerCase() : '';
      this.dataSource.data = data;
      return data;
    }
    return requests;
  }

  // Muestra alerta
  private showAlert(message: string,
    buttons: { accept: string, cancel: string } =
      { accept: 'Aceptar', cancel: 'Cancelar' }): any {
    return new Promise((resolve) => {
      Swal.fire({
        title: message,
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: buttons.cancel,
        confirmButtonText: buttons.accept
      }).then((result) => {
        if (result.value) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obtiene el folderId de drive de un estudiante
  private getFolder(controlNumber: string): Promise<string> {
    return new Promise((resolve) => {
      this.studentProvider
        .getDriveFolderId(controlNumber, eFOLDER.TITULACION)
        .subscribe(({ folderIdInDrive }) => resolve(folderIdInDrive),
          (_) => resolve(null));
    });
  }

  // Obtiene el libro activo de una carrera
  private _getActiveBookByCareer(careerId: string, titulationOption: string): Promise<any> {
    return new Promise((resolve) => {
      this.bookProvider.getActiveBookByCareer(careerId, titulationOption)
        .subscribe(
          (book) => resolve(book),
          (_) => resolve(null));
    });
  }

  // Obtiene las solicitudes en base al rol del usuario
  private _getRequestsByRole(role: string): Promise<iRequest[]> {
    return new Promise((resolve) => {
      this.requestProvider.getAllRequestByStatus(role)
        .subscribe(
          (data: { request: iRequest[] }) => resolve(data.request),
          (_) => resolve(null));
    });
  }

  // Obtiene el género de un empleado
  private _getEmployeeGender(data: string): Promise<string> {
    return new Promise((resolve) => {
      this.requestProvider
        .getEmployeeGender(data)
        .toPromise()
        .then(({ gender }) => resolve(gender))
        .catch((_) => resolve('MASCULINO'));
    });
  }

  // Obtiene el género de un estudiante
  private _getStudentGender(studentId: string): Promise<string> {
    return new Promise((resolve) => {
      this.studentProvider
        .getStudentById(studentId)
        .toPromise()
        .then(({ student }) => resolve(student[0].sex))
        .catch((_) => resolve(null));
    });
  }

}

interface IRequestSource {
  _id: string;
  controlNumber: string;
  fullName: string;
  careerAcronym: string;
  phase: string;
  status: string;
  proposedDateLocal: string;
  titulationOption: string;
  applicationDateLocal: string;
  lastModifiedLocal: string;
  examActStatus: boolean;
  request: iRequest;
}

enum EPhase {
  Enviado = 'Enviado',
  Verificado = 'Verificado',
  Registrado = 'Registrado',
  Liberado = 'Liberado',
  Entregado = 'Entregado',
  Validado = 'Validado',
  Asignado = 'Asignado',
  Realizado = 'Realizado',
  Generado = 'Generado',
  Titulado = 'Titulado',
}

enum EPhaseToShow {
  Enviado = 'ENVIADAS',
  Verificado = 'VERIFICADAS',
  Registrado = 'REGISTRADAS',
  Liberado = 'LIBERADAS',
  Entregado = 'ENTREGADAS',
  Validado = 'VALIDADAS',
  Asignado = 'ASIGNADAS',
  Realizado = 'TITULADOS',
  Generado = 'ACTAS GENERADAS',
  Titulado = 'TÍTULOS ENTREGADOS',
}
