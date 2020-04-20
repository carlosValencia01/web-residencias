import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { IStudent } from 'src/entities/shared/student.model';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { iRequest } from 'src/entities/reception-act/request.model';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/services/app/cookie.service';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { MatTableDataSource, MatPaginator, MatSort, MatChipInputEvent } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { RequestModalComponent } from 'src/modals/reception-act/request-modal/request-modal.component';
import { eRole } from 'src/enumerators/app/role.enum';
import { SteepComponentComponent } from 'src/modals/reception-act/steep-component/steep-component.component';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { ReleaseComponentComponent } from 'src/modals/reception-act/release-component/release-component.component';
import { RequestService } from 'src/services/reception-act/request.service';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { DocumentReviewComponent } from 'src/modals/reception-act/document-review/document-review.component';
import { ObservationsComponentComponent } from 'src/modals/reception-act/observations-component/observations-component.component';
import { ReleaseCheckComponent } from 'src/modals/reception-act/release-check/release-check.component';
import { eCAREER } from 'src/enumerators/shared/career.enum';
import { UploadDeliveredComponent } from 'src/modals/reception-act/upload-delivered/upload-delivered.component';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { ICareer } from 'src/entities/shared/career.model';
import { BookComponent } from 'src/modals/reception-act/book/book.component';
import { eFOLDER } from 'src/enumerators/shared/folder.enum';
import { ChangeJuryComponent } from 'src/modals/reception-act/change-jury/change-jury.component';
import { ActNotificacionComponent } from 'src/modals/reception-act/act-notificacion/act-notificacion.component';
import { ExpedientComponent } from 'src/modals/reception-act/expedient/expedient.component';
import { LoadingBarService } from 'ngx-loading-bar';
import { FirebaseService } from 'src/services/graduation/firebase.service';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { BookProvider } from 'src/providers/reception-act/book.prov';
import Swal from 'sweetalert2';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { CareerProvider } from 'src/providers/shared/career.prov';


@Component({
  selector: 'app-titulation-progress',
  templateUrl: './titulation-progress.component.html',
  styleUrls: ['./titulation-progress.component.scss']
})
export class TitulationProgressComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('tab') tabNumber: number;
  // tslint:disable-next-line: no-input-rename
  @Input('phases') tabPhases: Array<string>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  columns: any[];
  students: IStudent[];
  request: iRequest[];
  requestFilter: iRequest[];
  displayedColumns: string[];
  displayedColumnsGestionTitled: string[];
  statusOptions: { icon: string, option: string }[];
  dataSource: MatTableDataSource<iRequestSource>;
  careers: Array<string>;
  allCarrers: Array<string>;
  allPhases: Array<string>;
  isAllCarrers: boolean; // Variable para indicar que se marco el toggle de Todas las carreras
  isAllPhases: boolean; // Variable para indicar que se marco el toggle de Todas las fases
  reset: boolean;
  phases: Array<string>;
  search: string;
  role: string;
  cantPendientes = 0;
  cantImpresos = 0;
  cantListos = 0;
  cantEntregados = 0;
  cantProceso = 0;
  cantAceptados = 0;
  cantFinalizados = 0;
  public showLoading: boolean;
  departmentCareers: Array<ICareer>; // Carreras del puesto
  private folderId: string;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('periodInput') periodInput: ElementRef<HTMLInputElement>;
  @ViewChild('careerInput') careerInput: ElementRef<HTMLInputElement>;
  @ViewChild('phaseInput') phaseInput: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  periods;
  carreras;
  fases;
  periodCtrl = new FormControl();
  careerCtrl = new FormControl();
  phaseCtrl = new FormControl();
  filteredPeriods;
  usedPeriods = [];
  filteredCareers;
  usedCareers = [];
  allStatus;
  filteredPhases;
  usedPhases = [];

  constructor(
    private requestProvider: RequestProvider,
    public dialog: MatDialog,
    private _NotificationsServices: NotificationsServices,
    private _CookiesService: CookiesService,
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _ImageToBase64Service: ImageToBase64Service,
    private _StudentProvider: StudentProvider,
    public _RequestService: RequestService,
    private loadingBar: LoadingBarService,
    private firebaseService: FirebaseService,
    private _bookProvider: BookProvider,
    private careerProv: CareerProvider,        
  ) {
    this.careers = [];
    this.phases = [];
    this.allCarrers = ['ARQUITECTURA', 'INGENIERÍA CIVIL', 'INGENIERÍA ELÉCTRICA', 'INGENIERÍA INDUSTRIAL',
      'INGENIERÍA EN SISTEMAS COMPUTACIONALES', 'INGENIERÍA BIOQUÍMICA', 'INGENIERÍA QUÍMICA',
      'LICENCIATURA EN ADMINISTRACIÓN', 'INGENIERÍA EN GESTIÓN EMPRESARIAL', 'INGENIERÍA MECATRÓNICA',
      'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES'];
    this.allPhases = ['Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado', 'Validado', 'Asignado',
      'Realizado', 'Generado', 'Finalized', 'Titulado'];
    this.allStatus = [{phase:'Enviado',status:'ENVIADAS'}, {phase:'Verificado',status:'VERIFICADAS'}, {phase:'Registrado',status:'REGISTRADAS'}, {phase:'Liberado',status:'LIBERADAS'}, {phase:'Entregado',status:'ENTREGADAS'}, {phase:'Validado',status:'VALIDADAS'}, {phase:'Asignado',status:'ASIGNADAS'},
      {phase:'Realizado',status:'TITULADOS'}, {phase:'Generado',status:'ACTAS GENERADAS'},{phase:'Titulado',status:'TÍTULOS ENTREGADOS'}];
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.role = this._CookiesService.getData().user.rol.name.toLowerCase();
    // Asigno las carreras asociadas al puesto
    this.departmentCareers = this._CookiesService.getPosition().ascription.careers;
  }

  ngOnInit() {
    this.loadRequest(true);
    this.displayedColumns = ['controlNumber', 'fullName', 'career', 'phase', 'status',
      'applicationDateLocal', 'lastModifiedLocal', 'action'];
    this.displayedColumnsGestionTitled = ['controlNumber', 'fullName', 'career', 'phase', 'status',
    'titulationDate', 'optionTitled', 'applicationDateLocal', 'lastModifiedLocal', 'action'];
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
    this.requestProvider.getPeriods().subscribe(
      (periods) => {
        this.periods = periods.periods;
        this.filteredPeriods = periods.periods;
        this.updatePeriods(this.filteredPeriods.filter(per => per.active === true)[0], 'insert');
      }
    );
    this.careerProv.getAllCareers().subscribe(
      (careers) => {
        this.carreras = careers.careers;
        this.filteredCareers = careers.careers;
      });
    this.fases = this.allStatus;
    this.filteredPhases = this.allStatus;
  }

  reload(): void {
    this.loadingBar.start();
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
          const isProcess = (this.tabNumber === 3)
            ? element.documents.filter(doc => doc.status === 'Process').length > 0
            : true;
          if (isProcess) {
            const tmpRequest: iRequest = this.castRequest(element);
            if (this.role !== 'jefe académico' && this.role !== 'secretaria académica') {
              this.request.push(tmpRequest);
            } else {
              // Verifico si la carrera de la solicitud pertenece a las carreras asociadas al departamento del empleado se asigna
              const index = this.departmentCareers.findIndex(x => x.fullName === tmpRequest.career);
              if (index !== -1) {
                this.request.push(tmpRequest);
              }
            }
          }
        });

        this.requestFilter = this.request.slice(0);
        if (isInit) {
          this.careers = this.allCarrers.slice(0);
          this.phases = this.allPhases.slice(0);
          this.isAllCarrers = true;
          this.isAllPhases = true;
        }
        if (this.tabNumber !== 1) {
          this.phases = this.tabPhases;
        }
        this.reset = true;
        this.requestFilter = this.filter(this.careers, this.phases).slice(0);
        this.refresh();
      }, _ => {
        this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener solicitudes');
      });


  }

  public castRequest(element: any): iRequest {
    const tmp: iRequest = new Object(); // <iRequest>element;
    tmp._id = element._id;
    tmp.period = element.periodId;
    tmp.status = this.convertStatus(element.status);
    tmp.controlNumber = element.studentId.controlNumber;
    tmp.phase = element.phase;
    tmp.career = element.studentId.career;
    tmp.careerAcronym = element.studentId.careerId.acronym;
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
    tmp.proposedDateLocal = new Date(element.proposedDate).toLocaleDateString();
    tmp.applicationDateLocal = new Date(element.applicationDate).toLocaleDateString();
    tmp.lastModifiedLocal = new Date(element.lastModified).toLocaleDateString();
    tmp.registry = element.registry;
    tmp.documents = element.documents;
    tmp.isIntegral = typeof (element.isIntegral) !== 'undefined' ? element.isIntegral : true;
    return tmp;
  }

  refresh() {
    this.dataSource = new MatTableDataSource(this.requestFilter);
    this.filterRequests(this.usedPeriods, this.usedCareers, this.usedPhases);
  }

  filterRequests(periods: Array<any>, careers: Array<any>, phases: Array<any>) {
    if (this.dataSource) {
      if (periods.length > 0) {
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => periods.map( per => (per.periodName + '-' + per.year)).includes((req.period.periodName + '-' + req.period.year))
        );
      } else {
        this.dataSource.data = this.dataSource.data;
      }

      if(careers.length > 0){
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => careers.map( car => (car.acronym)).includes((req.careerAcronym))
        );
      } else if (periods.length === 0) {
        this.dataSource.data = this.dataSource.data;
      }

    
      if(phases.length > 0){
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => phases.map( p => (p.phase)).includes((req.phase))
        );
      } else if (periods.length === 0 && careers.length == 0){
          this.dataSource.data = this.dataSource.data;
      } 

    

      const inputFilter: any = document.getElementById('myfilter');
      this.dataSource.filter = inputFilter ?  inputFilter.value !== '' ? inputFilter.value.trim().toLowerCase() : '' : '';
      if (this.tabNumber === 2) {
        this.dataSource.filter = 'pendiente';
      }

      if (this.tabNumber === 3) {
        this.dataSource.filter = 'proceso';
      }

      if(this.tabNumber === 4) {
        this.dataSource.filter = 'proceso';
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => {
            const finalizedDate = new Date(req.proposedDate);
            const finalizedHour = req.proposedHour+req.duration;
            finalizedDate.setHours(finalizedHour/60,finalizedHour%60,0,0);
            if(finalizedDate <= new Date()){
              return true;
            }
            return false;
          }
        );
      }

      if (this.tabNumber === 5) {
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => {
            if((req.phase === 'Generado' && req.status === 'Pendiente') || (req.phase === 'Generado' && req.status === 'Impreso') || (req.phase === 'Generado' && req.status === 'Aceptado') || (req.phase === 'Titulado' && req.status === 'Pendiente')){
              return true;
            }
            return false;
          }
        );
        let cantPendientes = 0;
        let cantImpresos = 0;
        let cantListos = 0;
        let cantEntregados = 0;

        this.dataSource.data.forEach( (element,index) => {
          if (this.dataSource.data[index].phase === 'Generado' && this.dataSource.data[index].status === 'Pendiente') cantPendientes++;
          if (this.dataSource.data[index].phase === 'Generado' && this.dataSource.data[index].status === 'Impreso') cantImpresos++;
          if (this.dataSource.data[index].phase === 'Generado' && this.dataSource.data[index].status === 'Aceptado') cantListos++;
          if (this.dataSource.data[index].phase === 'Titulado' && this.dataSource.data[index].status === 'Pendiente') cantEntregados++;
        });

        this.cantPendientes = cantPendientes;
        this.cantImpresos = cantImpresos;
        this.cantListos = cantListos;
        this.cantEntregados = cantEntregados;
      }

      if (this.tabNumber === 6) {
        this.dataSource.data = this.dataSource.data.filter(
          (req: any) => {
            if((req.phase === 'Generado' && req.status === 'Aceptado') || (req.phase === 'Titulado' && req.status === 'Pendiente') || (req.phase === 'Titulado' && req.status === 'Proceso') || (req.phase === 'Titulado' && req.status === 'Aceptado') || (req.phase === 'Titulado' && req.status === 'Finalizado')){
              return true;
            }
            return false;
          }
        );

        let cantListos = 0;
        let cantEntregados = 0;
        let cantProceso = 0;
        let cantAceptados = 0;
        let cantFinalizados = 0;

        this.dataSource.data.forEach( (element,index) => {
          if (this.dataSource.data[index].phase === 'Generado' && this.dataSource.data[index].status === 'Aceptado') cantListos++;
          if (this.dataSource.data[index].phase === 'Titulado' && this.dataSource.data[index].status === 'Pendiente') cantEntregados++;
          if (this.dataSource.data[index].phase === 'Titulado' && this.dataSource.data[index].status === 'Proceso') cantProceso++;
          if (this.dataSource.data[index].phase === 'Titulado' && this.dataSource.data[index].status === 'Aceptado') cantAceptados++;
          if (this.dataSource.data[index].phase === 'Titulado' && this.dataSource.data[index].status === 'Finalizado') cantFinalizados++;
        });

        this.cantListos = cantListos;
        this.cantEntregados = cantEntregados;
        this.cantProceso = cantProceso;
        this.cantAceptados = cantAceptados;
        this.cantFinalizados = cantFinalizados;
      }

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.loadingBar.complete();
  }

  filter(carrers: string[], phases: string[]): Array<iRequest> {
    // Filtro las solicitudes de acuerdo a los filtros de los toggle button
    return this.request.filter(function (element) {
      if (phases.length === 0) {
        // Si no hay una fase
        return carrers.findIndex(x => x === element.career) !== -1;
      } else {
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
      width: '50vw',
      data: { reqId: Identificador }
    });

    ref.afterClosed().subscribe((valor: { response: boolean, data: { QR: any, ESTAMP: any, RESPONSE: boolean } }) => {
      if (typeof (valor) !== 'undefined' && valor.response) {
        this.showLoading = true;
        const data = {
          doer: this._CookiesService.getData().user.name.fullName,
          observation: '',
          operation: eStatusRequest.ACCEPT,
          file: {
            mimetype: 'application/pdf',
            data: oRequest.documentSend(eFILES.INCONVENIENCE, valor.data.QR, valor.data.ESTAMP),
            name: eFILES.INCONVENIENCE + '.pdf'
          },
          folderId: this.folderId,
          phase: eRequest.VALIDATED
        };

        this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
          this.showLoading = false;
          this._NotificationsServices
            .showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
          this.loadRequest();
        }, _ => {
          this.showLoading = false;
          this._NotificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
        });
      }
    }, _ => {
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error');
    });
  }

  changedPhase(event) {
    if (event.value === 'ALL') {
      this.isAllPhases = event.event.checked;
      this.phases = this.isAllPhases ? this.allPhases.slice(0) : [];
      this.requestFilter = this.filter(this.careers, this.phases).slice(0);
    } else {
      const key = <eRequest><keyof typeof eRequest>event.value;
      const value = eRequest[key];
      const isCedula = eRequest[key] === eRequest.CEDULA;
      const checked = event.event.checked;
      const index = this.phases.findIndex(x => x === value);
      if (index !== -1 && !checked) {
        this.phases.splice(index, 1);
      }
      if (index === -1 && checked) {
        this.phases.push(value);
      }
      const tmpRequest = this.requestFilter = this.filter(this.careers, this.phases).slice(0);
      this.requestFilter = tmpRequest; // (value === eRequest.TITLED) ? this.filterCedula(tmpRequest, isCedula) : tmpRequest;
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
      if (index === -1 && checked) {
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
      localStorage.setItem('Appointment', new Date(lRequest.proposedDate).toDateString());
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
    }, _ => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
    });
  }

  Verified(Identificador): void {
    const ref = this.dialog.open(SteepComponentComponent, {
      data: {
        Request: this.getRequestById(Identificador)
      },
      disableClose: true,
      hasBackdrop: true,
      width: '80vw'
    });

    ref.afterClosed().subscribe((valor: any) => {
      if (valor) {
        this.loadRequest();
      }
    }, _ => {
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un problema');
    });
  }

  async releasedRequest(Identificador) {
    let lJury: Array<string> = [];
    let lObservation: string;
    let lMinutes = 420;
    let lDuration = 60;

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
      lObservation = tmpRequest.status === 'Rechazado' ? value[0].observation : '';
      lMinutes = tmpRequest.proposedHour;
      lDuration = tmpRequest.duration;
    }

    const folder = await new Promise(resolve => {
      this._StudentProvider.getDriveFolderId(tmpRequest.controlNumber, eFOLDER.TITULACION).subscribe(folderData => {
        if (folderData) {
          if (typeof (folderData.folderIdInDrive) !== 'undefined' || folderData.folderIdInDrive !== '') {
            resolve(folderData.folderIdInDrive);
          } else {
            this._NotificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'No se pudo encontrar el folder del estudiante');
            resolve('');
          }
        } else {
          this._NotificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'No se encontró el folder del estudiante');
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
        width: '70em'
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
          }).subscribe(_ => {
            this.loadRequest();
          }, _ => {
            this._NotificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error al liberar proyecto');
          });
        } else {
          this.loadRequest();
        }
      });
    }
  }

  approve(row): void {
    const {_id, controlNumber, student, titulationOption} = row;
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
          const minuteBook = await this._getActiveBookByCareer(student.careerId._id,titulationOption);
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
                  doer: this._CookiesService.getData().user.name.fullName,
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
                  this.showLoading = true;
                  data.registry = book.data;
                  this.requestProvider.updateRequest(_id, data).subscribe(_ => {
                    if (data.operation === eStatusRequest.ACCEPT) {
                      this.showLoading = true;
                      const sub1 = this.firebaseService.getActivedEvent().subscribe(
                        (event) => {
                          this.showLoading = false;
                          sub1.unsubscribe();
                          if (event[0]) {
                            this.showLoading = true;
                            const collectionName = event[0].payload.doc.id;
                            const sub2 = this.firebaseService.getGraduateByControlNumber(controlNumber, collectionName).subscribe(
                              (studentData) => {
                                this.showLoading = false;
                                sub2.unsubscribe();
                                if (studentData[0]) {
                                  this.showLoading = true;
                                  this.firebaseService.updateFieldGraduate(studentData[0].id, {degree: true}, collectionName)
                                    .then(__ => {
                                      this.showLoading = false;
                                      this._NotificationsServices
                                        .showNotification(eNotificationType.SUCCESS,
                                          'Acto recepcional', 'Se actualizó el acrónimo del egresado para graduación');
                                    }, __ => {
                                      this.showLoading = false;
                                    });
                                }
                              }, __ => {
                                this.showLoading = false;
                              }
                            );
                          } else {
                            this.showLoading = false;
                          }
                        }, __ => {
                          this.showLoading = false;
                        }
                      );
                    }
                    this.showLoading = false;
                    if(data.operation === eStatusRequest.ACCEPT){
                      this._NotificationsServices
                        .showNotification(eNotificationType.SUCCESS,
                          'Acto recepcional', 'Se actualizó la solicitud y el estatus en el SII');
                    }else{
                        this._NotificationsServices
                          .showNotification(eNotificationType.SUCCESS,
                            'Acto recepcional', 'Se actualizó la solicitud');
                    }
                    this.loadRequest();
                  }, error => {
                    this.showLoading = false;
                    const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
                    this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
                  });
                }
              }, err => console.log(err));
          } else {
            this._NotificationsServices
              .showNotification(eNotificationType.ERROR,
                'Acto recepcional', 'No existe libro activo para la carrera del alumno');
          }
        }
      }
    });
  }  

  async reImprimir(Identificador: string) {
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Reimprimiendo acta de examen');
    this.showLoading = true;
    const _request: iRequest = this.getRequestById(Identificador);
    let acta = true;
    let juryGender = {president:'MASCULINO',secretary:'MASCULINO'};
    let studentGender = 'M';
    let careerPerBook = 1;    
    // console.log(_request);
    
    const titleOption = _request.titulationOption.split('-')[1].trim();
    await this._StudentProvider.getStudentById(_request.studentId).toPromise().then(
      st=> {studentGender = st.student[0].sex;}
    ).catch(err=>{});
    await this._bookProvider.getActiveBookByCareer(_request.student.careerId._id,titleOption).toPromise().then(
      (book)=>careerPerBook = book.careers.length
    ).catch(err=>console.log(err)
    );         
    await this.requestProvider.getEmployeeGender(_request.jury[0].email ? _request.jury[0].email : _request.jury[0].name).toPromise().then(
        (em)=>juryGender.president = em.gender           
    ).catch( err=> juryGender.president = 'MASCULINO');
    await this.requestProvider.getEmployeeGender(_request.jury[1].email ? _request.jury[1].email : _request.jury[1].name).toPromise().then(
        (em)=>juryGender.secretary = em.gender           
    ).catch( err=> juryGender.secretary = 'MASCULINO');

    const oRequest: uRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService,juryGender,studentGender,careerPerBook);
    if(_request.titulationOption.split('-')[0].trim() === 'XI'){
      acta = await this.showAlert('¿Usar formato de acta nuevo?',{accept:'SI',cancel:'USAR ANTIGUO'});
      await this.delay(3000);
      window.open(oRequest.testReport(acta).output('bloburl'), '_blank');
    }else{
      await this.delay(3000);
      window.open(oRequest.testReportForTitulationNotIntegral().output('bloburl'), '_blank');
    }
    
    this.showLoading = false;
  }

  async generated(Identificador: string, operation: string) {
    const eOperation = <eStatusRequest><keyof typeof eStatusRequest>operation;
    if (eOperation === eStatusRequest.PROCESS) {
      const response = await this.showAlert('¿Hubo un cambio de jurado?', { accept: 'Si', cancel: 'No' });
      if (response) {
        const _Request = this.getRequestById(Identificador);
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
            this.showLoading = true;
            this._NotificationsServices
              .showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Regenerando oficio de jurado');
            this.loadRequest();
            const _Request = this.getRequestById(Identificador);
            const oRequest = new uRequest(_Request, this._ImageToBase64Service, this._CookiesService);
            this.getFolder(_Request.controlNumber);
            await this.delay(2000);
            const data_oficio = {
              file: {
                mimetype: 'application/pdf',
                data: oRequest.documentSend(eFILES.OFICIO),
                name: eFILES.OFICIO + '.pdf',
              },
              folderId: this.folderId,
              isJsPdf: true,
              Document: eFILES.OFICIO,
              phase: _Request.phase,
              IsEdit: 'true'
            };
            const response = await new Promise(resolve => {
              this.requestProvider.uploadFile(Identificador, data_oficio).subscribe(_ => {
                window.open(oRequest.notificationOffice().output('bloburl'), '_blank');
                resolve(true);
              }, _ => {
                this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
                resolve(false);
              });
            });
            this.showLoading = false;
            if (response) {
              this.testReportGenerate(Identificador, eOperation);
            } else {
              this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Actualización del oficio fallida');
            }
          }
        });
      } else {
        const response = await this.showAlert('¿Está seguro de crear el Acta de Examen?', { accept: 'Si', cancel: 'No' });
        if (response) {
          this.testReportGenerate(Identificador, eOperation);
        }
      }
    } else {
      const response = await this.showAlert('¿Está seguro de continuar con la operación?', { accept: 'Si', cancel: 'No' });
      if (response) {
        this.testReportGenerate(Identificador, eOperation);
      }
    }
  }

  showAlert(message: string, buttons: { accept: string, cancel: string } = { accept: 'Aceptar', cancel: 'Cancelar' }):any {
    return new Promise((resolve) => {
      Swal.fire({
        title: message,
        type: 'question',
        showCancelButton: true,
        allowOutsideClick: false,
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

  testReportGenerate(Identificador: string, eOperation: eStatusRequest): void {
    const data = {
      doer: this._CookiesService.getData().user.name.fullName,
      observation: '',
      phase: eRequest.GENERATED,
      operation: eOperation // eStatusRequest.PROCESS
    };

    this.requestProvider.updateRequest(Identificador, data).subscribe(async (_) => {
      if (eOperation === eStatusRequest.PROCESS) {
        this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Creando acta de examen');
        this.showLoading = true;
        const _request: iRequest = this.getRequestById(Identificador);
        let acta = true;
        
        let juryGender = {president:'MASCULINO',secretary:'MASCULINO'};
        let studentGender = 'M';
        let careerPerBook = 1;
        const titleOption = _request.titulationOption.split('-')[1].trim();
        await this._StudentProvider.getStudentById(_request.studentId).toPromise().then(
          st=> studentGender = st.student[0].sex
        ).catch(err=>{});
        await this._bookProvider.getActiveBookByCareer(_request.student.careerId._id,titleOption).toPromise().then(
          (book)=>careerPerBook = book.careers.length
        ).catch(err=>console.log(err)
        ); 
        await this.requestProvider.getEmployeeGender(_request.jury[0].email ? _request.jury[0].email : _request.jury[0].name).toPromise().then(
            (em)=>juryGender.president = em.gender           
        ).catch( err=> juryGender.president = 'MASCULINO');
        await this.requestProvider.getEmployeeGender(_request.jury[1].email ? _request.jury[1].email : _request.jury[1].name).toPromise().then(
            (em)=>juryGender.secretary = em.gender           
        ).catch( err=> juryGender.secretary = 'MASCULINO');

        const oRequest: uRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService,juryGender,studentGender,careerPerBook);
        if(_request.titulationOption.split('-')[0].trim() === 'XI'){
          acta = await this.showAlert('¿Usar formato de acta nuevo?',{accept:'SI',cancel:'USAR ANTIGUO'});
          await this.delay(3000);
          window.open(oRequest.testReport(acta).output('bloburl'), '_blank');
        }else{
          await this.delay(3000);
          window.open(oRequest.testReportForTitulationNotIntegral().output('bloburl'), '_blank');
        }
        this.showLoading = false;
      }
      this._NotificationsServices
        .showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
          (eOperation === eStatusRequest.PROCESS
            ? 'Acta de examen generada'
            : (eOperation === eStatusRequest.PRINTED)
            ? 'Acta de examen impresa'
            : 'Acta de examen entregada'));
      this.loadRequest();
    }, error => {
      const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
      this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
    });
  }

  titled(Identificador: string, operation: string, request): void {
    const eOperation = <eStatusRequest><keyof typeof eStatusRequest>operation;
    const tmpRequest: iRequest = this.getRequestById(Identificador);
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
              doer: this._CookiesService.getData().user.name.fullName,
              observation: '',
              phase: eRequest.TITLED,
              operation: eOperation // eStatusRequest.PROCESS
            };
            this.requestProvider.updateRequest(Identificador, data).subscribe(_ => {
              this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional',
                (eOperation === eStatusRequest.PROCESS ? 'Alumno notificado' : 'Título profesional entregado'));
              this.loadRequest();
            }, error => {
              const message = JSON.parse(error._body).message || 'Error al actualizar solicitud';
              this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', message);
            });
          }
        });
        break;
      }
      case eStatusRequest.ACCEPT: {
        const index = tmpRequest.documents
          .findIndex(x => x.type === eFILES.XML || x.type === eFILES.INE || x.type === eFILES.CED_PROFESIONAL);
        if (index !== -1) {
          const dialogRef = this.dialog.open(DocumentReviewComponent, {
            data: { id: Identificador, isTitled: true, request },
            disableClose: true,
            hasBackdrop: true,
            width: '90em',
          });
          dialogRef.afterClosed()
            .subscribe(_ => {
              this.reload();
            });
        } else {
          this._NotificationsServices
            .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'El estudiante no ha registrado ningún archivo');
        }
        break;
      }
    }
  }

  Review(Identificador, request): void {
    const dialogRef = this.dialog.open(DocumentReviewComponent, {
      data: { id: Identificador, isTitled: false, request },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
    });
    dialogRef.afterClosed()
      .subscribe(_ => {
        this.reload();
      });
  }

  seeRecord(Identificador, request): void {
    const dialogRef = this.dialog.open(ExpedientComponent, {
      data: { id: Identificador, request },
      disableClose: true,
      hasBackdrop: true,
      width: '90em',
    });
    dialogRef.afterClosed()
      .subscribe(_ => {
        this.reload();
      }
    );
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
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Procesando liberación');
    this.showLoading = true;
    this.requestProvider.getResource(_id, eFILES.RELEASED).subscribe(data => {
      this.showLoading = false;
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
              phase: 'Liberado' // Request.phase
            };
            this.requestProvider.updateRequest(Request._id, data).subscribe(
              _ => {
                this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
                this.loadRequest();
              }, _ => {
                this._NotificationsServices.showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
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
                  return 'Motivo obligatorio';
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
                  _ => {
                    this._NotificationsServices.showNotification(eNotificationType.SUCCESS, 'Acto recepcional', 'Solicitud actualizada');
                    this.loadRequest();
                  }, _ => {
                    this._NotificationsServices
                      .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
                  });
              }
            });
          }
        }
      }, _ => {
        this._NotificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Ocurrió un error');
      });
    }, _ => {
      this.showLoading = false;
      this._NotificationsServices
        .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al obtener archivo');
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
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Generando documentación');
    this.showLoading = true;
    const _request = this.getRequestById(_id);
    const oRequest = new uRequest(_request, this._ImageToBase64Service, this._CookiesService);
    this.getFolder(_request.controlNumber);

    await this.delay(2000);
    this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto recepcional', 'Generando oficio de jurado');
    const data_oficio = {
      file: {
        mimetype: 'application/pdf',
        data: oRequest.documentSend(eFILES.OFICIO),
        name: eFILES.OFICIO + '.pdf',
      },
      folderId: this.folderId,
      isJsPdf: true,
      Document: eFILES.OFICIO,
      phase: _request.phase,
      IsEdit: 'true'
    };

    const response = await new Promise(resolve => {
      this.requestProvider.uploadFile(_id, data_oficio).subscribe(_ => {
        if (_request.status === 'Pendiente') {
          window.open(oRequest.notificationOffice().output('bloburl'), '_blank');
          resolve(true);
        } else {
          window.open(oRequest.notificationOffice().output('bloburl'), '_blank');
          resolve(true);
        }
      }, _ => {
        this._NotificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
        resolve(false);
      });
    });

    if (response) {
      const fileData = {
        file: {
          mimetype: 'application/pdf',
          data: oRequest.documentSend(eFILES.JURAMENTO_ETICA),
          name: eFILES.JURAMENTO_ETICA + '.pdf',
        },
        folderId: this.folderId,
        isJsPdf: true,
        Document: eFILES.JURAMENTO_ETICA,
        phase: _request.phase,
        IsEdit: 'true'
      };
      this._NotificationsServices.showNotification(eNotificationType.INFORMATION, 'Acto Recepcional', 'Generando código de ética');
      this.requestProvider.uploadFile(_id, fileData).subscribe(_ => {
        if (_request.status === 'Pendiente') {
          const data = {
            doer: this._CookiesService.getData().user.name.fullName,
            observation: '',
            phase: eRequest.REALIZED,
            operation: eStatusRequest.PROCESS
          };
          this.requestProvider.updateRequest(_id, data).subscribe(__ => {
            window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
            this.loadRequest();
            this.showLoading = false;
          }, __ => {
            this.showLoading = false;
            this._NotificationsServices
              .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al actualizar solicitud');
          });
        } else {
          window.open(oRequest.professionalEthicsAndCode().output('bloburl'), '_blank');
          this.showLoading = false;
        }
      }, _ => {
        this.showLoading = false;
        this._NotificationsServices
          .showNotification(eNotificationType.ERROR, 'Acto recepcional', 'Error al subir archivo');
      });
    } else {
      this.showLoading = false;
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getFolder(controlNumber: string): void {
    this._StudentProvider.getDriveFolderId(controlNumber, eFOLDER.TITULACION).subscribe(folder => {
      this.folderId = folder.folderIdInDrive;
    });
  }

  generateTrades(Identificador: string): void {
    const dialogRef = this.dialog.open(ActNotificacionComponent, {
      data: {
        Appointment: {
          id: Identificador
        }
      },
      disableClose: true,
      hasBackdrop: true,
      width: '45em'
    });
  }
  
  // FILTRO PERIODOS
  slectedPeriod(period){    
    this.updatePeriods(period,'insert'); 
  }

  addPeriod(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if (input) {
        input.value = '';
      }
      this.periodCtrl.setValue(null);
    }
  }

  updatePeriods(period, action) {
  if (action === 'delete') {
      this.filteredPeriods.push(period);
      this.usedPeriods = this.usedPeriods.filter( per => per._id !== period._id);
    }
    if (action === 'insert') {
      this.usedPeriods.push(period);
      this.filteredPeriods = this.filteredPeriods.filter(per => per._id !== period._id);
     }
     this.periods = this.filteredPeriods;
     if(this.periodInput) this.periodInput.nativeElement.blur();
     this.refresh();
  }

  remove(period): void {
    this.updatePeriods(period, 'delete');
  }

  filterPeriod(value) {
    if (value) {
      this.periods = this.periods.filter( period => (period.periodName + '-' + period.year).toLowerCase().trim().indexOf(value) !== -1);
    }
  }

  // FILTRO CARRERAS
  slectedCareer(career){    
    this.updateCareers(career,'insert'); 
  }

  removeCareer(career): void {
    this.updateCareers(career, 'delete');
  }

  addCareer(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if (input) {
        input.value = '';
      }

      this.careerCtrl.setValue(null);
    }
  }

  updateCareers(career, action) {
     if (action === 'delete') {
      this.filteredCareers.push(career);
      this.usedCareers = this.usedCareers.filter( car => car._id !== career._id);
     }
     if (action === 'insert') {
      this.usedCareers.push(career);
      this.filteredCareers = this.filteredCareers.filter(car => car._id !== career._id);
     }
     this.carreras = this.filteredCareers;
     if(this.careerInput) this.careerInput.nativeElement.blur();
     this.refresh();
  }

  filterCareer(value) {
    if (value) {
      this.carreras = this.carreras.filter( carrera => (carrera.shortName).toLowerCase().trim().indexOf(value) !== -1);
    }
  }

  // FILTRO FASES
  slectedPhase(phase){    
    this.updatePhases(phase,'insert'); 
  }

  removePhase(phase): void {
    this.updatePhases(phase, 'delete');
  }

  addPhase(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      if (input) {
        input.value = '';
      }
      this.phaseCtrl.setValue(null);
    }
  }

  updatePhases(phase, action) {
     if (action === 'delete') {
      this.filteredPhases.push(phase);
      this.usedPhases = this.usedPhases.filter( p => p.phase !== phase.phase);
     }
     if (action === 'insert') {
      this.usedPhases.push(phase);
      this.filteredPhases = this.filteredPhases.filter(p => p.phase !== phase.phase);
     }
     this.fases = this.filteredPhases;
     if(this.phaseInput) this.phaseInput.nativeElement.blur();
     this.refresh();
  }

  filterPhase(value) {
    if (value) {
      this.fases = this.fases.filter( p => (p.phase).toLowerCase().trim().indexOf(value) !== -1);
    }
  }

  private _getActiveBookByCareer(careerId: string,titulationOption: string) {
    return new Promise(resolve => {
      this._bookProvider.getActiveBookByCareer(careerId, titulationOption)
        .subscribe(
          book => resolve(book),
          _ => resolve(null));
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
  isIntegral?: boolean;
  action?: string;
}
