import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RequestComponentComponent } from 'src/components/reception-act/request-component/request-component.component';
import { ContextState } from 'src/providers/reception-act/State/ContextState';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { CookiesService } from 'src/services/app/cookie.service';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { MatStepper } from '@angular/material';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eStatusRequest } from 'src/enumerators/reception-act/statusRequest.enum';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { IStudent } from 'src/entities/shared/student.model';
import { ViewerComponentComponent } from 'src/components/reception-act/viewer-component/viewer-component.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { RequestService } from 'src/services/reception-act/request.service';
import { RequestProvider } from 'src/providers/reception-act/request.prov';

@Component({
  selector: 'app-titulacion-page',
  templateUrl: './titulacion-page.component.html',
  styleUrls: ['./titulacion-page.component.scss']
})
export class TitulacionPageComponent implements OnInit {
  // Componentes
  @ViewChild('Request') stepOneComponent: RequestComponentComponent;
  @ViewChild('Viewer') viewComponent: ViewerComponentComponent;
  @ViewChild('stepper') stepperComponent: MatStepper;

  // Variables de visibilización de componentes
  SteepOneCompleted: boolean;
  SteepTwoCompleted: boolean;
  SteepThreeCompleted: boolean;
  SteepFourCompleted: boolean;
  SteepFiveCompleted: boolean;
  SteepSixCompleted: boolean;
  SteepSevenCompleted: boolean;
  SteepEightCompleted: boolean;
  SteepNineCompleted: boolean;
  // Variables globales
  Steeps: ContextState; // Estado donde se encuentra la solicitud
  Request: iRequest;  // Objeto Solicitud
  StatusComponent: eStatusRequest; // Status del proceso actual
  oRequest: uRequest;

  // Mensajes
  ProcessSentMessage: String = 'En espera de que tú solicitud sea aceptada';
  CompletedSentMessage: String = 'Tú solicitud ha sido aceptada';
  ProcessVerifiedMessage: String = 'En espera del registro de tu proyecto';
  CompletedVerifiedMessage: String = 'Tú proyecto ha sido registrado';
  ProcessReleasedMessage: String = 'En espera de la liberación del proyecto';
  CompletedReleasedMessage: String = 'Tú proyecto ha sido liberado';

  get frmStepOne() {
    return this.stepOneComponent ? this.stepOneComponent.frmRequest : null;
  }

  constructor(private studentProv: StudentProvider,
    private _formBuilder: FormBuilder,
    private cookiesService: CookiesService,
    private imgService: ImageToBase64Service,
    private router: Router,
    private routeActive: ActivatedRoute,
    private srvNotifications: NotificationsServices,
    private requestService: RequestService,
    private requestProvider: RequestProvider) {

    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    // Obtengo la información de la solicitud del estudiante
    // Si tiene información realizo un casteo de la información a un IRequest
    // Caso contrario genero una peticion de inicio (con solo phase y status)
    // this.loadRequest();
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentInit() {
    // Obtengo el indice de mi estado y le indico que me posicione en ese Step
    this.loadRequest();
  }

  loadRequest() {
    this.studentProv.getRequest(this.cookiesService.getData().user._id)
      .subscribe(res => {
        if (res.request.length > 0) {
          this.Request = <iRequest>res.request[0];
          this.Request.student = <IStudent>res.request[0].studentId;
          this.Request.studentId = this.Request.student._id;
          this.oRequest = new uRequest(this.Request, this.imgService);
        } else {
          this.Request = {
            phase: eRequest.NONE,
            status: eStatusRequest.NONE
          };
        }
        this.SelectItem();
      }, error => {
        this.srvNotifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      });
  }

  RequestEvent($event) {
    if ($event) {
      this.loadRequest();
    }
  }

  SelectItem(): void {
    const phase = <eRequest><keyof typeof eRequest>this.Request.phase;
    const status = <eStatusRequest><keyof typeof eStatusRequest>this.Request.status;
    this.requestService.AddRequest(this.Request, phase);
    this.Steeps = new ContextState(phase, status);
    this.StatusComponent = this.Steeps.state.status;
    this.enableSteps(phase);
  }

  // Visualiza el componente donde colocarse
  onReload(): void {
    // Obtengo el estatus de ese componente
    this.StatusComponent = this.Steeps.state.status;
    this.enableSteps(this.Steeps.getPhase());
  }

  enableSteps(phase: eRequest): void {
    this.resetSteep();
    console.log('fase', phase);
    switch (phase) {
      case eRequest.GENERATED: {

      }
      case eRequest.REALIZED: {

      }
      case eRequest.ASSIGNED: {

      }
      case eRequest.VALIDATED: {

      }
      case eRequest.DELIVERED: {
        this.SteepSixCompleted = (phase === eRequest.DELIVERED ? false : true);
      }
      case eRequest.RELEASED: {
        this.SteepFiveCompleted = (phase === eRequest.RELEASED ? false : true);
      }
      case eRequest.REGISTERED: {
        this.SteepFourCompleted = (phase === eRequest.REGISTERED ? false : true);
      }
      case eRequest.VERIFIED: {
        this.SteepThreeCompleted = (phase === eRequest.VERIFIED ? false : true);
      }
      case eRequest.SENT: {
        this.SteepTwoCompleted = (phase === eRequest.SENT ? false : true);
      }
      case eRequest.CAPTURED: {
        this.SteepOneCompleted = (phase === eRequest.CAPTURED ? false : true);
      }
      case eRequest.NONE: {

      }
    }
    (async () => {
      await this.delay(100);
      console.log('index', this.Steeps.getIndex());
      this.stepperComponent.selectedIndex = this.Steeps.getIndex();
    })();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  resetSteep(): void {
    this.SteepOneCompleted = this.SteepTwoCompleted = this.SteepThreeCompleted = this.SteepFourCompleted = this.SteepFiveCompleted = this.SteepSixCompleted = false;
  }

  valores() {
    console.log(this.stepperComponent);
    console.log('STEP INDEX', this.stepperComponent.selectedIndex);
    console.log('STEP INDEX', this.stepperComponent.selectedIndex = 2);
    console.log('values', this.SteepOneCompleted, this.SteepTwoCompleted, this.SteepThreeCompleted);
  }

  viewRequeriments() {
    window.open('../../../assets/Requisitos.pdf', '_blank');
  }

  documentsLoad() {
    const data = {
      doer: this.cookiesService.getData().user.name.fullName,
      observation: '',
      operation: eStatusRequest.ACCEPT,
      phase: this.Request.phase
    };

    this.requestProvider.updateRequest(this.Request._id, data).subscribe(
      _ => {
        this.srvNotifications.showNotification(eNotificationType.SUCCESS, 'Titulación App', 'Solicitud Actualizada');
        this.loadRequest();
      },
      error => {
        this.srvNotifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      }
    );
  }
}
