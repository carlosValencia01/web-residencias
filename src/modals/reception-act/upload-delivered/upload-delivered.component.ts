import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-upload-delivered',
  templateUrl: './upload-delivered.component.html',
  styleUrls: ['./upload-delivered.component.scss']
})
export class UploadDeliveredComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UploadDeliveredComponent>) { }

  ngOnInit() {
  }

}
