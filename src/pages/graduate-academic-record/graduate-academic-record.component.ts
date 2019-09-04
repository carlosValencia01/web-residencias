import {Component, Input, OnInit} from '@angular/core';

import Swal from 'sweetalert2';

import {RequestStatus} from 'src/enumerators/request-status.enum';
import {RequestProvider} from 'src/providers/request.prov';
import {FirebaseStorageService} from 'src/services/firebase-storage.service';

@Component({
  selector: 'app-graduate-academic-record',
  templateUrl: './graduate-academic-record.component.html',
  styleUrls: ['./graduate-academic-record.component.scss']
})
export class GraduateAcademicRecordComponent implements OnInit {
  @Input() request;

  constructor(
    private requestProvider: RequestProvider,
    private firebaseStorageService: FirebaseStorageService,
  ) { }

  ngOnInit() {
  }

  openRequestPDF() {
    window.open(`http://localhost:3003/escolares/credenciales/graduate/request/generate/${this.request._id}`);
  }

  openProjectFile() {
    this.firebaseStorageService.getFileURL(this.request.graduate.controlNumber)
      .subscribe(url => {
        window.open(url);
      }, err => {
        Swal.fire(
          'Acto recepcional',
          'Ha ocurrido un error al descargar la carátula del proyecto',
          'error'
        );
      });
  }

  approveRequest() {
    Swal.fire({
      title: '¿Aprobar solicitud?',
      text: `Está por aprobar la solicitud del egresado\n${this.request.graduate.name.fullName}`,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Aprobar'
    }).then((result) => {
      if (result.value) {
        this.requestProvider.updateRequestStatus({newStatus: RequestStatus.VERIFIED}, this.request._id)
          .subscribe(res => {
            Swal.fire(
              'Acto recepcional',
              'La solicitud ha sido aprobada',
              'success'
            );
          }, error => {
            Swal.fire(
              'Acto recepcional',
              'Ocurrió un error al aprobar la solicitud',
              'error'
            );
          });
      }
    });
  }

  rejectRequest() {
    Swal.fire({
      title: '¿Rechazar solicitud?',
      text: `Está por rechazar la solicitud del egresado ${this.request.graduate.name.fullName}`,
      type: 'question',
      input: 'textarea',
      inputPlaceholder: 'Ingrese una observación',
      preConfirm: (observation) => {
        let message;
        if (observation) {
          if (observation.length >= 20) {
            return observation;
          }
          message = 'La observación debe tener por lo menos 20 caracteres';
        } else {
          message = 'Es obligatorio ingresar una observación';
        }
        return Swal.showValidationMessage(message);
      },
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Rechazar'
    }).then((result) => {
      if (result.value) {
        this.requestProvider.updateRequestStatus(
          {newStatus: RequestStatus.CAPTURED, observation: result.value}, this.request._id)
          .subscribe(res => {
            Swal.fire(
              'Acto recepcional',
              'La solicitud se ha rechazado',
              'success'
            );
          }, error => {
            Swal.fire(
              'Acto recepcional',
              'Ocurrió un error al rechazar la solicitud',
              'error'
            );
          });
      }
    });
  }
}
