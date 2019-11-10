import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { StudentProvider } from 'src/providers/shared/student.prov';

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
        this.status = documents.filter( docc => docc.filename.indexOf(this.data.filename) !== -1)[0].status;          
      }
    );
  }

}
