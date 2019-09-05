import { Component, OnInit, Input } from '@angular/core';
import { iRequest } from 'src/entities/request.model';
import { eRequest } from 'src/enumerators/request.enum';
import { uRequest } from 'src/entities/request';
import { ImageToBase64Service } from 'src/services/img.to.base63.service';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-viewer-component',
  templateUrl: './viewer-component.component.html',
  styleUrls: ['./viewer-component.component.scss']
})
export class ViewerComponentComponent implements OnInit {

  @Input('Request') _Request: iRequest;
  @Input('Phase') _Phase: eRequest;
  private message: string;
  private oRequest: uRequest;
  private file: jsPDF;
  private PHASE: eRequest;
  constructor(private imgService: ImageToBase64Service) { }

  ngOnInit() {
    this.oRequest = new uRequest(this._Request, this.imgService);    
    this.PHASE = <eRequest>this._Phase;
    switch (this.PHASE) {
      case eRequest.APPROVED: {
        this.message = "Visualizar Petición";
        break;
      }
      case eRequest.REALIZED: {
        this.message = "Visualizar Petición";
        break;
      }
      case eRequest.SCHEDULED: {
        this.message = "Visualizar Petición";
        break;
      }
      case eRequest.VALIDATED: {
        this.message = "Visualizar Petición";
        break;

      }
      case eRequest.RELEASED: {
        this.message = "Hoja de Liberación";
        break;
      }
      case eRequest.REGISTERED: {
        this.message = "Registro de Proyecto";
        break;
      }
      case eRequest.VERIFIED: {
        this.message = "Hoja de Requisitos";
        break;
      }
      case eRequest.REQUEST: {
        this.message = "Visualizar Petición";
        break;
      }
      default: {

      }
    }
  }

  view(): void {    
    switch (this.PHASE) {
      case eRequest.APPROVED: {
        break;
      }
      case eRequest.REALIZED: {
        break;
      }
      case eRequest.SCHEDULED: {
        break;
      }
      case eRequest.VALIDATED: {
        break;

      }
      case eRequest.RELEASED: {
        window.open(this.oRequest.projectRelease().output('bloburl'), '_blank');
        break;
      }
      case eRequest.REGISTERED: {
        window.open(this.oRequest.projectRegistrationOffice().output('bloburl'), '_blank');
        break;
      }
      case eRequest.VERIFIED: {
        window.open('..\\..\\assets\\imgs\\requirementsSheet.pdf', '_blank');
        break;
      }
      case eRequest.REQUEST: {
        window.open(this.oRequest.protocolActRequest().output('bloburl'), '_blank');
        break;
      }
      default: {

      }
    }
  }
}

