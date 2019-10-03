import { Component, OnInit, Inject } from '@angular/core';
import { iRequest } from 'src/entities/request.model';
import { iObservation } from 'src/entities/observations.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
@Component({
  selector: 'app-observations-component',
  templateUrl: './observations-component.component.html',
  styleUrls: ['./observations-component.component.scss']
})
export class ObservationsComponentComponent implements OnInit {
  private filter: string;
  private request: iRequest;
  private columns: any[];
  private observations: iObservation[] = [];
  public dataSource: MatTableDataSource<IObservationTable>;
  public displayedColumns: string[];

  constructor(
    public dialogRef: MatDialogRef<ObservationsComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log("vire", data);
    this.filter = this.data.phase;
    this.request = this.data.request;
    this.observations = <iObservation[]>this.request.history.slice();
    this.observations.forEach(e => {
      e.status = this.convertStatus(e.status);
      const date = new Date(e.achievementDate);
      e.achievementDateString = date.toLocaleDateString();
    });

    this.dataSource = new MatTableDataSource(this.observations);
  }

  ngOnInit() {
    this.displayedColumns = ['phase', 'status', 'observation', 'achievementDateString', 'doer'];
  }
  convertStatus(status: string): string {
    let value = '';
    switch (status) {
      case 'Process':
        {
          value = 'Pendiente';
          break;
        }
      case 'Error':
        {
          value = 'Rechazado';
          break;
        }
      case 'Accept':
        {
          value = 'Aceptado';
          break;
        }
      case 'Reject':
        {
          value = 'Rechazado';
          break;
        }
      default:
        value = 'Ninguno';
    }
    return value;
  }
}

interface IObservationTable {
  phase?: string; status?: string; observation?: string; achievementDateString?: string; doer?: string;
}
