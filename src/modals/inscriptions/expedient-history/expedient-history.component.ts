import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import Swal from 'sweetalert2';
@Component({
  selector: 'app-expedient-history',
  templateUrl: './expedient-history.component.html',
  styleUrls: ['./expedient-history.component.scss']
})
export class ExpedientHistoryComponent implements OnInit {
  
  title = 'HISTORIAL DEL DOCUMENTO: ';
  status = [];
  constructor(
    public dialogRef: MatDialogRef<ExpedientHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any   
  ) {
    
    this.title+=this.data.filename;
    this.status = this.data.status;
   }

  ngOnInit() {
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  swalDialog(msg,){
    return Swal.fire({
      title: 'Motivo del rechazo',
      text: msg,
      type: 'info',
      showCancelButton: false,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      // cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.value)  return true;      
      else return false;
    });
  }

}
