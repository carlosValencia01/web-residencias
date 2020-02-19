import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-view-more',
  templateUrl: './view-more.component.html',
  styleUrls: ['./view-more.component.scss']
})
export class ViewMoreComponent implements OnInit {
  public Appointment: iAppointment;
  public _Date: string;

  constructor(
    public dialogRef: MatDialogRef<ViewMoreComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.Appointment = data.Appointment;
    const proposedHour = this.Appointment.proposedHour;
    const proposedDate = new Date(this.Appointment.proposedDate);
    proposedDate.setHours(proposedHour / 60, proposedHour % 60, 0, 0);
    this._Date = moment(proposedDate).format('LLL');
  }

  ngOnInit() {
  }

}

interface iAppointment {
  id: string;
  student: string[];
  project: string;
  proposedDate: Date;
  proposedHour: number;
  phase: string;
  jury: Array<any>;
  place: string;
  option: string;
  product: string;
  duration: string;
}
