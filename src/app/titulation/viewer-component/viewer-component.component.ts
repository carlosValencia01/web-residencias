import { Component, Input, OnInit } from '@angular/core';
import { uRequest } from 'src/app/entities/reception-act/request';
import { iRequest } from 'src/app/entities/reception-act/request.model';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';
import { eRequest } from 'src/app/enumerators/reception-act/request.enum';
import { RequestProvider } from 'src/app/providers/reception-act/request.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { RequestService } from 'src/app/services/reception-act/request.service';

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
  private oRequest: uRequest;
  private PHASE: eRequest;

  constructor(
    private imgService: ImageToBase64Service,
    private _RequestService: RequestService,
    private requestProvider: RequestProvider,
    private _CookiesService: CookiesService,
    private loadingService: LoadingService,
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
    this.loadingService.setLoading(true);
    switch (this.PHASE) {
      case eRequest.GENERATED: {
        this.loadingService.setLoading(false);
        break;
      }
      case eRequest.REALIZED: {
        this.loadingService.setLoading(false);
        break;
      }
      case eRequest.ASSIGNED: {
        this.loadingService.setLoading(false);
        break;
      }
      case eRequest.VALIDATED: {
        this.oRequest.setRequest(this._Request);
        this.requestProvider.getResource(this._Request._id, eFILES.INCONVENIENCE).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.loadingService.setLoading(false);
        }, error => {
          this.loadingService.setLoading(false);
          window.open(this.oRequest.noInconvenience().output('bloburl'), '_blank');
        });
        break;
      }
      case eRequest.RELEASED: {
        // window.open(`${this.requestProvider.getApiURL()}/request/${this._Request._id}/file/${eFILES.RELEASED}`, '_blank');
        this.requestProvider.getResource(this._Request._id, eFILES.RELEASED).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.loadingService.setLoading(false);
        }, error => {
          this.loadingService.setLoading(false);
          console.log("Error de archivo", error);
        });
        break;
      }
      case eRequest.REGISTERED: {
        // window.open(this.oRequest.projectRegistrationOffice(this.QR, this.EStamp).output('bloburl'), '_blank');
        this.requestProvider.getResource(this._Request._id, eFILES.REGISTRO).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.loadingService.setLoading(false);
        }, error => {
          this.loadingService.setLoading(false);
          window.open(this.oRequest.projectRegistrationOffice(this.QR, this.EStamp).output('bloburl'), '_blank');
        });
        break;
      }
      case eRequest.VERIFIED: {
        this.oRequest.setRequest(this._Request);
        this.oRequest.setCode(this.QR, this.EStamp);
        this.requestProvider.getResource(this._Request._id, eFILES.REGISTRO).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.loadingService.setLoading(false);
        }, error => {
          this.loadingService.setLoading(false);
          window.open(this.oRequest.projectRegistrationOffice(this.QR, this.EStamp).output('bloburl'), '_blank');
        });
        break;
      }
      case eRequest.SENT: {
        this.loadingService.setLoading(false);
        window.open('https://drive.google.com/open?id=1fOItfyeVGiItdDHXvSNifvtABt6goe3I', '_blank');
        break;
      }
      case eRequest.CAPTURED: {
        this.requestProvider.getResource(this._Request._id, eFILES.SOLICITUD).subscribe(data => {
          window.open(URL.createObjectURL(data), '_blank');
          this.loadingService.setLoading(false);
        }, error => {
          console.log("Error de Viewer", error);
          this.loadingService.setLoading(false);
          window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
        });
        break;
      }
      default: { }
    }
  }
}
