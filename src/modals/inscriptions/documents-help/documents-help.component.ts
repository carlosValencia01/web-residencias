import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-documents-help',
  templateUrl: './documents-help.component.html',
  styleUrls: ['./documents-help.component.scss']
})
export class DocumentsHelpComponent implements OnInit {

  title = 'FORMATO DE ENTREGA PARA ';

  constructor(
    public dialogRef: MatDialogRef<DocumentsHelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title+=this.data.document;
   }

  ngOnInit() {
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }
  
}
