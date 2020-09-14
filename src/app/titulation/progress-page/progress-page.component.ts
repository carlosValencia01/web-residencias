import { Component, OnInit, OnDestroy } from '@angular/core';
import { eRole, ERoleToAcronym } from 'src/app/enumerators/app/role.enum';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { iRequest } from '../../entities/reception-act/request.model';
import { ICareer } from '../../entities/shared/career.model';
import { IPeriod } from '../../entities/shared/period.model';
import { RequestProvider } from '../../providers/reception-act/request.prov';
import { CareerProvider } from '../../providers/shared/career.prov';
import { EmployeeProvider } from '../../providers/shared/employee.prov';
import { IEmployee } from '../../entities/shared/employee.model';
import { WebSocketService } from 'src/app/services/app/web-socket.service';
import { Subscription } from 'rxjs';
import { eRecActEvents } from 'src/app/enumerators/shared/sockets.enum';
@Component({
  selector: 'app-progress-page',
  templateUrl: './progress-page.component.html',
  styleUrls: ['./progress-page.component.scss']
})
export class ProgressPageComponent implements OnInit, OnDestroy {
  public phasesLiberation = ['Liberado'];
  public phasesDocuments = ['Entregado'];
  public phasesApprove = ['Realizado'];
  public phasesExamAct = ['Generado', 'Titulado'];
  public phasesContinue = ['Generado', 'Titulado'];
  public phasesAcademicBoss = ['Verificado', 'Validado'];
  public phasesDivEstBoss = ['Realizado'];
  public data: { periods: IPeriod[], careers: ICareer[], requests: iRequest[] };
  public role: string;
  public boss: string;

  private subscriptions: Array<Subscription> = [];
  constructor(
    private cookiesService: CookiesService,
    private careerProv: CareerProvider,
    private employeeProvider: EmployeeProvider,
    private requestProvider: RequestProvider,
    private webSocketService: WebSocketService
  ) {
    this.role = this.cookiesService.getData().user.rol.name.toLowerCase();
    this.boss = this.role;
  }

  ngOnInit() {
    this.role = (ERoleToAcronym as any)[this.role];

    this._assignData();
  }

  ngOnDestroy(){
    this.subscriptions.forEach((subscription: Subscription) => {
      if(!subscription.closed)
        subscription.unsubscribe();
    });
  }
  // Valida que existan los datos necesarios para mostrar la página titulation-progress
  public canSeeTitulationProgress() {    
    return this.data && this.data.periods && this.data.careers && this.data.requests &&
      this.data.periods.length && this.data.careers.length && this.data.requests.length;
  }

  // Valida si el usuario puede ver los tabs
  public canSeeTabGroup() {
    return [ERoleToAcronym[eRole.ADMINISTRATION.toLowerCase()], ERoleToAcronym[eRole.STUDENTSERVICES.toLowerCase()]]
      .includes(this.role as ERoleToAcronym);
  }

  // Valida si el usuario pude ver solo la página sin tabs
  public canSeeOnlyTitulationProgress() {
    return !this.canSeeTabGroup();
  }

  private async _assignData() {
    await this._getBosses();   
    this.data = {
      periods:null,
      careers:null,
      requests:null
    };
    this.data.periods =  await this._getAllPeriods() as IPeriod[];
    this.data.careers = await this._getAllCarrers() as ICareer[];    
    this.webSocketService.listen(eRecActEvents.REQUEST_BY_ROLE).subscribe(requests=>{      
      this.data.requests = requests.request;           
    });
    this.webSocketService.listen(eRecActEvents.CREATE_OR_CANCEL_TITULATION).subscribe(data=>{
      this._getRequestsByStatus(this.role);
    });
    this._getRequestsByStatus(this.role);
  }

  // Guarda los datos de los jefes
  private async _getBosses() {
    const jDeptoDiv = await this._getBoss({
      Department: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES',
      Position: 'JEFE DE DEPARTAMENTO'
    });
    const cDeptoDiv = await this._getBoss({
      Department: 'DEPARTAMENTO DE DIVISIÓN DE ESTUDIOS PROFESIONALES',
      Position: 'COORDINADOR DE TITULACIÓN'
    });
    const jDeptoEsc = await this._getBoss({
      Department: 'DEPARTAMENTO DE SERVICIOS ESCOLARES',
      Position: 'JEFE DE DEPARTAMENTO'
    });
    const director = await this._getBoss({ Department: 'DIRECCIÓN', Position: 'DIRECTOR' });

    const bosses = {
      JDeptoDiv: jDeptoDiv,
      CDeptoDiv: cDeptoDiv,
      JDeptoEsc: jDeptoEsc,
      Director: director,
    };
    this.cookiesService.saveBosses(bosses);
  }

  // Obtiene los datos del empleado por el puesto
  private _getBoss(search: { Department: string, Position: string }): Promise<IEmployee> {
    return new Promise(resolve => {
      this.employeeProvider
        .searchEmployee(search)
        .subscribe(
          ({ Employee }) => resolve(Employee),
          (_) => resolve(null));
    });
  }

  // Obtiene los periodos
  private _getAllPeriods(): Promise<IPeriod[]> {
    return new Promise((resolve) => {
      this.requestProvider.getPeriods()
        .subscribe(
          ({ periods }) => resolve(periods),
          (_) => resolve([]));
    });
  }

  // Obtiene las carreras
  private _getAllCarrers(): Promise<ICareer[]> {
    return new Promise((resolve) => {
      this.careerProv
        .getAllCareers()
        .subscribe(
          ({ careers }) => resolve(careers),
          (_) => resolve([]));
    });
  }

  // Obtiene las solicitudes de acuerdo al rol del usuario
  private _getRequestsByStatus(role: string) {
    this.requestProvider
      .getAllRequestByStatus(role,this.cookiesService.getClientId())
      .subscribe(
        (request ) => {},
        (_) => console.log(_)
        );
    
  }

}
