import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-release-check',
  templateUrl: './release-check.component.html',
  styleUrls: ['./release-check.component.scss']
})
export class ReleaseCheckComponent implements OnInit {

  public pdf: any;
  constructor(public dialogRef: MatDialogRef<ReleaseCheckComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.pdf = data;
  }

  ngOnInit() {
  }

  onSave() {
    this.dialogRef.close(true);
  }
}
