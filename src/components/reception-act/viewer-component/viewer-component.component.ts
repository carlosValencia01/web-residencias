import { Component, OnInit, Input } from '@angular/core';
import { iRequest } from 'src/entities/reception-act/request.model';
import { eRequest } from 'src/enumerators/reception-act/request.enum';
import { eFILES } from 'src/enumerators/reception-act/document.enum';
import { uRequest } from 'src/entities/reception-act/request';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { RequestService } from 'src/services/reception-act/request.service';
import { RequestProvider } from 'src/providers/reception-act/request.prov';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';

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
  // tslint:disable-next-line: no-input-rename
  @Input('QR') QR: String;
  // tslint:disable-next-line: no-input-rename
  @Input('EStamp') EStamp: String;
  public message: string;
  public Title: String;
  public existTitle: boolean;
  public showLoading: boolean;
  private oRequest: uRequest;
  private PHASE: eRequest;

  constructor(
    private imgService: ImageToBase64Service,
    private _RequestService: RequestService,
    private requestProvider: RequestProvider,
    private _CookiesService: CookiesService
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
    this.oRequest = new uRequest(this._Request, this.imgService, this._CookiesService);
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
    this.showLoading = true;
    switch (this.PHASE) {
      case eRequest.GENERATED: {
        this.showLoading = false;
        break;
      }
      case eRequest.REALIZED: {
        this.showLoading = false;
        break;
      }
      case eRequest.ASSIGNED: {
        this.showLoading = false;
        break;
      }
      case eRequest.VALIDATED: {
        this.oRequest.setRequest(this._Request);
        this.requestProvider.getResource(this._Request._id, eFILES.INCONVENIENCE).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.showLoading = false;
        }, error => {
          this.showLoading = false;
          window.open(this.oRequest.noInconvenience().output('bloburl'), '_blank');
        });
        break;
      }
      case eRequest.RELEASED: {
        // window.open(`${this.requestProvider.getApiURL()}/request/${this._Request._id}/file/${eFILES.RELEASED}`, '_blank');        
        this.requestProvider.getResource(this._Request._id, eFILES.RELEASED).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.showLoading = false;
        }, error => {
          this.showLoading = false;
          console.log("Error de archivo", error);
        });
        break;
      }
      case eRequest.REGISTERED: {
        // window.open(this.oRequest.projectRegistrationOffice(this.QR, this.EStamp).output('bloburl'), '_blank');
        this.requestProvider.getResource(this._Request._id, eFILES.REGISTRO).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.showLoading = false;
        }, error => {
          this.showLoading = false;
          window.open(this.oRequest.projectRegistrationOffice(this.QR, this.EStamp).output('bloburl'), '_blank');
        });
        break;
      }
      case eRequest.VERIFIED: {
        this.oRequest.setRequest(this._Request);
        this.oRequest.setCode(this.QR, this.EStamp);
        this.requestProvider.getResource(this._Request._id, eFILES.REGISTRO).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.showLoading = false;
        }, error => {
          this.showLoading = false;
          window.open(this.oRequest.projectRegistrationOffice(this.QR, this.EStamp).output('bloburl'), '_blank');
        });
        break;
      }
      case eRequest.SENT: {
        this.showLoading = false;
        window.open('https://drive.google.com/open?id=1fOItfyeVGiItdDHXvSNifvtABt6goe3I', '_blank');
        break;
      }
      case eRequest.CAPTURED: {
        this.requestProvider.getResource(this._Request._id, eFILES.SOLICITUD).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.showLoading = false;
        }, error => {
          console.log("Error de Viewer", error);
          this.showLoading = false;
          window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
        });
        break;
      }
      default: { }
    }
  }
}
