import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { StudentProvider } from 'src/providers/shared/student.prov';

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
    @Inject(MAT_DIALOG_DATA) public data: any,
    private studentProv: StudentProvider,    
  ) {
    
    this.title+=this.data.filename;
    this.getDocuments();
   }

  ngOnInit() {
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }
  getDocuments(){
    this.studentProv.getDriveDocuments(this.data.student).subscribe(
      docs=>{
        let documents = docs.documents;
        this.status = documents.filter( docc => docc.filename.indexOf(this.data.filename === 'NÚMERO DE SEGURO SOCIAL' ? 'NSS' : this.data.filename === 'CARTA COMPROMISO' ? 'COMPROMISO' : this.data.filename) !== -1)[0].status;          
      }
    );
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
