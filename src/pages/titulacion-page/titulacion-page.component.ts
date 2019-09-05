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
    //Obtengo la información de la solicitud del estudiante
    //Si tiene información realizo un casteo de la información a un IRequest
    //Caso contrario genero una peticion de inicio (con solo phase y status)
    this.studentProv.getRequest(this.cookiesService.getData().user._id)
      .subscribe(res => {
        if (res.request.length > 0) {
          this.Request = <iRequest>res.request[0];
          this.Request.student = <IStudent>res.request[0].studentId;
          this.Request.studentId = this.Request.student._id;
          this.oRequest = new uRequest(this.Request, imgService);
        } else {
          this.Request = {
            phase: eRequest.NONE,
            status: eStatusRequest.NONE
          }
        }
        this.SelectItem();
      }, error => {
        this.srvNotifications.showNotification(eNotificationType.ERROR, 'Titulación App', error);
      })
  }

  ngOnInit() {
    
  }

  RequestEvent($event) {
    //Si la petición fue exitosa cambio el estatus de mi fase a "EN PROCESO"
    if ($event) {     
      this.Steeps.next();
      this.Steeps.state.status = eStatusRequest.PROCESS;
      this.onReload();
    }    
  }

  SelectItem(): void {
    const phase = <eRequest><keyof typeof eRequest>this.Request.phase;
    const status = <eStatusRequest><keyof typeof eStatusRequest>this.Request.status;
    this.Steeps = new ContextState(phase, status);
    if (<String>eStatusRequest.ACCEPT === status) {
      this.Steeps.next();
    }    
    this.stepperComponent.selectedIndex = this.Steeps.getIndex();
    this.StatusComponent = this.Steeps.state.status;    
    this.enableSteps(phase);
  }


  //Visualiza el componente donde colocarse
  onReload(): void {
    //Obtengo el indice de mi estado y le indico que me posicione en ese Step
    this.stepperComponent.selectedIndex = this.Steeps.getIndex();
    //Obtengo el estatus de ese componente
    this.StatusComponent = this.Steeps.state.status;
    this.enableSteps(this.Steeps.getPhase());
  }

  enableSteps(phase: eRequest): void {
    this.resetSteep();    
    switch (phase) {
      case eRequest.APPROVED: {

      }
      case eRequest.REALIZED: {

      }
      case eRequest.SCHEDULED: {

      }
      case eRequest.VALIDATED: {

      }
      case eRequest.RELEASED: {
        this.SteepFourCompleted = (phase === eRequest.VALIDATED ? this.Steeps.state.status === eStatusRequest.NONE : true);
      }
      case eRequest.REGISTERED: {        
        this.SteepThreeCompleted = (phase === eRequest.REGISTERED ? this.Steeps.state.status === eStatusRequest.NONE : true);        
      }
      case eRequest.VERIFIED: {        
        this.SteepTwoCompleted = (phase === eRequest.VERIFIED ? this.Steeps.state.status === eStatusRequest.NONE : true);        
      }
      case eRequest.REQUEST: {                
        this.SteepOneCompleted = (phase === eRequest.REQUEST ? this.Steeps.state.status === eStatusRequest.NONE : true);        
      }
      case eRequest.NONE: {

      }
    }
    this.stepperComponent.selectedIndex = this.Steeps.getIndex();
  }

  resetSteep() {
    this.SteepOneCompleted = this.SteepTwoCompleted = this.SteepThreeCompleted = false;
  }
  valores() {  
    console.log(this.stepperComponent);
    console.log("STEP INDEX",   this.stepperComponent.selectedIndex);
    this.stepperComponent.next();
    console.log("STEP INDEX",   this.stepperComponent.selectedIndex=2);
    console.log("values", this.SteepOneCompleted, this.SteepTwoCompleted, this.SteepThreeCompleted)
  }

}
