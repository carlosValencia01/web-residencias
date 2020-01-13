import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {IPosition} from '../../../entities/shared/position.model';

@Component({
  selector: 'app-select-position',
  templateUrl: './select-position.component.html',
  styleUrls: ['./select-position.component.scss']
})
export class SelectPositionComponent implements OnInit {
  public positions: Array<IPosition>

  constructor(public dialogRef: MatDialogRef<SelectPositionComponent>,
              @Inject(MAT_DIALOG_DATA) private data) {
    this.positions = data.positions;
  }

  ngOnInit() {
  }

  selectPosition(position): void {
    this.dialogRef.close(position);
  }

}
