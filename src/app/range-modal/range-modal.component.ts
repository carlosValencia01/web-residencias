import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eOperation } from 'src/enumerators/reception-act/operation.enum';
import { IRange } from 'src/entities/reception-act/range.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { sourceDataProvider } from 'src/providers/reception-act/sourceData.prov';
import { eCAREER } from 'src/enumerators/shared/career.enum';

@Component({
  selector: 'app-range-modal',
  templateUrl: './range-modal.component.html',
  styleUrls: ['./range-modal.component.scss']
})
export class RangeModalComponent implements OnInit {
  Operation: eOperation;
  frmRange: FormGroup;
  title: string;
  grade: IRange;
  careers: Array<string>;
  constructor(public dialogRef: MatDialogRef<RangeModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = "Nuevo rango";
    this.Operation = this.data.Operation;
    if (this.Operation === eOperation.EDIT) {

    }
  }

  ngOnInit() {
    this.frmRange = new FormGroup({
      'start': new FormControl(
        (this.Operation === eOperation.EDIT ? new Date() : new Date()), Validators.required),
      'end': new FormControl((this.Operation === eOperation.EDIT ? new Date() : new Date()), Validators.required),
      'quantity': new FormControl((this.Operation === eOperation.EDIT ? "1" : "1"), Validators.required)
    });
    this.careers = [];
  }

  changed(event) {
    const key = <eCAREER><keyof typeof eCAREER>event.value;
    const value = eCAREER[key];
    const checked = event.event.checked;
    const index = this.careers.findIndex(x => x === value);
    if (index !== -1 && !checked) {
      this.careers.splice(index, 1);
    }
    if (index == -1 && checked) {
      this.careers.push(value);
    }
  }

  onSubmit(): void {
    const tmpRange: IRange = {      
      start: this.frmRange.get("start").value,
      end: this.frmRange.get("end").value,
      quantity: this.frmRange.get("quantity").value,
      careers: this.careers
    };
    this.dialogRef.close(tmpRange);
  }
}

