import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-extend-viewer',
  templateUrl: './extend-viewer.component.html',
  styleUrls: ['./extend-viewer.component.scss']
})
export class ExtendViewerComponent implements OnInit {
  public pdf: any;
  public title: string;
  constructor(
    public dialogRef: MatDialogRef<ExtendViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.pdf = data.isBase64 ? data.source : URL.createObjectURL(data.source);
    this.title = data.title;    
  }

  ngOnInit() {
  }

}
