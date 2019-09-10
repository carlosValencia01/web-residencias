import { Component, OnInit, ViewChild, ElementRef, ApplicationRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RequestComponentComponent } from 'src/components/request-component/request-component.component';
import { ContextState } from 'src/providers/State/ContextState';
import { eRequest } from 'src/enumerators/request.enum';
import { CookiesService } from 'src/services/cookie.service';
import { StudentProvider } from 'src/providers/student.prov';
import { MatStepper } from '@angular/material';
import { iRequest } from 'src/entities/request.model';
import { eStatusRequest } from 'src/enumerators/statusRequest.enum';
import * as jsPDF from 'jspdf';
import { uRequest } from 'src/entities/request';
import { ImageToBase64Service } from 'src/services/img.to.base63.service';
import { IStudent } from 'src/entities/student.model';
import { ViewerComponentComponent } from 'src/components/viewer-component/viewer-component.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsServices } from 'src/services/notifications.service';
import { eNotificationType } from 'src/enumerators/notificationType.enum';
@Component({
  selector: 'app-titulacion-page',
  templateUrl: './titulacion-page.component.html',
  styleUrls: ['./titulacion-page.component.scss']
})
export class TitulacionPageComponent implements OnInit {
  //Componentes
  @ViewChild('Request') stepOneComponent: RequestComponentComponent;
  @ViewChild('Viewer') viewComponent: ViewerComponentComponent;
  @ViewChild('stepper') stepperComponent: MatStepper;

  //Variables de visibilización de componentes
  SteepOneCompleted: boolean;
  SteepTwoCompleted: boolean;
  SteepThreeCompleted: boolean;
  SteepFourCompleted: boolean;
  SteepFiveCompleted: boolean;
  SteepSixCompleted: boolean;
  SteepSevenCompleted: boolean;

  //Variables globales
  Steeps: ContextState; //Estado donde se encuentra la solicitud
  Request: iRequest;  //Objeto Solicitud
  StatusComponent: eStatusRequest; //Status del proceso actual
  oRequest: uRequest;

  //Mensajes
  ProcessSentMessage: String = 'En espera de que tú solicitud sea aceptada';
  CompletedSentMessage: String = 'Tú solicitud ha sido aceptada';
  ProcessVerifiedMessage: String = 'En espera del registro de tu proyecto';
  CompletedVerifiedMessage: String = 'Tú proyecto ha sido registrado';
  ProcessReleasedMessage: String = 'En espera de la liberación del proyecto';
  get frmStepOne() {
    return this.stepOneComponent ? this.stepOneComponent.frmRequest : null;
  }

  constructor(private studentProv: StudentProvider,
    private _formBuilder: FormBuilder,
    private cookiesService: CookiesService,
    private imgService: ImageToBase64Service,
    private router: Router,
    private routeActive: ActivatedRoute,
    private srvNotifications: NotificationsServices) {

    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    //Obtengo la información de la solicitud del estudiante
    //Si tiene información realizo un casteo de la información a un IRequest
    //Caso contrario genero una peticion de inicio (con solo phase y status)
    //this.loadRequest();
  }
  ngAfterContentInit() {
    //Obtengo el indice de mi estado y le indico que me posicione en ese Step
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
          }
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
    this.Steeps = new ContextState(phase, status);
    //this.stepperComponent.selectedIndex = this.Steeps.getIndex();
    this.StatusComponent = this.Steeps.state.status;
    this.enableSteps(phase);
  }


  //Visualiza el componente donde colocarse
  onReload(): void {
    //Obtengo el estatus de ese componente
    this.StatusComponent = this.Steeps.state.status;
    this.enableSteps(this.Steeps.getPhase());
  }

  enableSteps(phase: eRequest): void {
    this.resetSteep();
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

      }
      case eRequest.RELEASED: {
        this.SteepFourCompleted = (phase === eRequest.RELEASED ? this.Steeps.state.status === eStatusRequest.NONE : true);
      }
      case eRequest.REGISTERED: {
        this.SteepFourCompleted = (phase === eRequest.REGISTERED ? this.Steeps.state.status === eStatusRequest.NONE : true);
      }
      case eRequest.VERIFIED: {
        this.SteepThreeCompleted = (phase === eRequest.VERIFIED ? this.Steeps.state.status === eStatusRequest.NONE : true);
      }
      case eRequest.SENT: {
        this.SteepTwoCompleted = (phase === eRequest.SENT ? this.Steeps.state.status === eStatusRequest.NONE : true);
      }
      case eRequest.CAPTURED: {
        this.SteepOneCompleted = (phase === eRequest.CAPTURED ? this.Steeps.state.status === eStatusRequest.NONE : true);
      }
      case eRequest.NONE: {

      }
    }
    (async () => {
      await this.delay(100);
      this.stepperComponent.selectedIndex = this.Steeps.getIndex();
    })();
  }



  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  resetSteep(): void {
    this.SteepOneCompleted = this.SteepTwoCompleted = this.SteepThreeCompleted = this.SteepFourCompleted = false;
  }
  valores() {
    console.log(this.stepperComponent);
    console.log("STEP INDEX", this.stepperComponent.selectedIndex);
    //this.stepperComponent.next();
    console.log("STEP INDEX", this.stepperComponent.selectedIndex = 2);
    console.log("values", this.SteepOneCompleted, this.SteepTwoCompleted, this.SteepThreeCompleted)
  }

}
