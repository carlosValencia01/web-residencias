import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { DialogVerificationComponent } from '../dialog-verification/dialog-verification.component';

@Component({
  selector: 'app-dialog-accept-commitment',
  templateUrl: './dialog-accept-commitment.component.html',
  styleUrls: ['./dialog-accept-commitment.component.scss']
})
export class DialogAcceptCommitmentComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DialogVerificationComponent>,) { }

  ngOnInit() {
  }

  acept(){
    this.dialogRef.close(true);
  }

}
