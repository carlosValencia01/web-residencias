import { Component, OnInit, Input } from '@angular/core';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { RequestService } from 'src/services/reception-act/request.service';
import { RequestProvider } from 'src/providers/reception-act/request.prov';

@Component({
  selector: 'app-viewer-component',
  templateUrl: './viewer-component.component.html',
  styleUrls: ['./viewer-component.component.scss']
})
export class ViewerComponentComponent implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('Request') _Request?: iRequest;
  // tslint:disable-next-line: no-input-rename
  @Input('RequestId') RequestId?: String;
  // tslint:disable-next-line: no-input-rename
  @Input('Phase') _Phase: eRequest;
  // tslint:disable-next-line: no-input-rename
  @Input('Title') _Title: String;
  // tslint:disable-next-line: no-input-rename
  @Input('Type') Type: String;
  public message: string;
  public Title: String;
  public existTitle: boolean;
  private oRequest: uRequest;
  private PHASE: eRequest;

  constructor(
    private imgService: ImageToBase64Service,
    private _RequestService: RequestService,
    private requestProvider: RequestProvider,
  ) { }

  ngOnInit() {

  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterContentInit() {
    // this._RequestService.requestUpdate.subscribe(
    //   (response: any) => {
    //     this.oRequest = new uRequest(response.Request, this.imgService);
    //     this.PHASE = <eRequest>response.Phase;
    //     this.loadMessage(response.Phase);
    //   }
    // );
    // if (typeof (this.oRequest) !== 'undefined') {
    this.oRequest = new uRequest(this._Request, this.imgService);
    this.PHASE = <eRequest>this._Phase;
    this.loadMessage(<eRequest>this._Phase);
    this.existTitle = this._Title !== '';
    this.Title = this._Title;
    // }
  }

  loadMessage(phase: eRequest): void {
    switch (phase) {
      case eRequest.GENERATED: {
        this.message = 'Visualizar Petición';
        break;
      }
      case eRequest.REALIZED: {
        this.message = 'Visualizar Petición';
        break;
      }
      case eRequest.ASSIGNED: {
        this.message = 'Visualizar Petición';
        break;
      }
      case eRequest.VALIDATED: {
        this.message = 'Constancia de No Inconveniencia ';
        break;
      }
      case eRequest.RELEASED: {
        this.message = 'Hoja de Liberación';
        break;
      }
      case eRequest.REGISTERED: {
        this.message = 'Registro de Proyecto';
        break;
      }
      case eRequest.VERIFIED: {
        this.message = 'Registro de Proyecto';
        break;
      }
      case eRequest.SENT: {
        this.message = 'Hoja de Requisitos';
        break;
      }
      case eRequest.CAPTURED: {
        this.message = 'Descargar solicitud';
        break;
      }
      default: { }
    }
  }

  view(): void {
    console.log('registered', this.oRequest);
    switch (this.PHASE) {
      case eRequest.GENERATED: {
        break;
      }
      case eRequest.REALIZED: {
        break;
      }
      case eRequest.ASSIGNED: {
        break;
      }
      case eRequest.VALIDATED: {
        this.oRequest.setRequest(this._Request);
        window.open(this.oRequest.noInconvenience().output('bloburl'), '_blank');
        break;
      }
      case eRequest.RELEASED: {
        window.open(`${this.requestProvider.getApiURL()}/student/document/${eFILES.RELEASED}/${this._Request._id}`, '_blank');
        break;
      }
      case eRequest.REGISTERED: {
        window.open(this.oRequest.projectRegistrationOffice().output('bloburl'), '_blank');
        break;
      }
      case eRequest.VERIFIED: {
        window.open(this.oRequest.projectRegistrationOffice().output('bloburl'), '_blank');
        break;
      }
      case eRequest.SENT: {
        window.open('../../../assets/Requisitos.pdf', '_blank');
        break;
      }
      case eRequest.CAPTURED: {
        window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
        break;
      }
      default: { }
    }
  }
}
