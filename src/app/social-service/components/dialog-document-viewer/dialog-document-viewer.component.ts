import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-dialog-document-viewer',
  templateUrl: './dialog-document-viewer.component.html',
  styleUrls: ['./dialog-document-viewer.component.scss']
})
export class DialogDocumentViewerComponent implements OnInit {
  public pdf: any;
  public title: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<DialogDocumentViewerComponent>) {
    this.pdf = data.document;
    this.title = data.title;
  }

  ngOnInit() {
  }

  dialogResult(value) {
    this.dialogRef.close(value);
  }

}
