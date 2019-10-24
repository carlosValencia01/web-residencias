import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirmation-student-page',
  templateUrl: './confirmation-student-page.component.html',
  styleUrls: ['./confirmation-student-page.component.scss']
})
export class ConfirmationStudentPageComponent implements OnInit {

  constructor(
  ) {
  }

  ngOnInit() {

  }

  mostrarAdvertencia() {
    Swal.fire({
      title: 'ATENCIÓN',
      text: 'Debes descargar la "Solicitud" y "Contrato", mismos que debes entregar en el Departamento de Servicios Escolares',
      type: 'info',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Regresar',
      confirmButtonText: 'Continuar'
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          type: 'success',
          title: 'Proceso Finalizado',
          showConfirmButton: false,
          timer: 2000
        })
      }
     });
  }


}
