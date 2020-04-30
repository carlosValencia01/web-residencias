import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-release-check',
  templateUrl: './release-check.component.html',
  styleUrls: ['./release-check.component.scss']
})
export class ReleaseCheckComponent implements OnInit {

  public pdf: any;
  public jury: Array<any>;
  constructor(public dialogRef: MatDialogRef<ReleaseCheckComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: any, jury: any }) {
    this.pdf = data.file;
    this.jury = data.jury;
  }

  ngOnInit() {
  }

  onSave() {
    this.dialogRef.close(true);
  }
}
