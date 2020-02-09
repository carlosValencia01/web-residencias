import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { iRequest } from 'src/entities/reception-act/request.model';
import { iObservation } from 'src/entities/reception-act/observations.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-observations-component',
  templateUrl: './observations-component.component.html',
  styleUrls: ['./observations-component.component.scss']
})
export class ObservationsComponentComponent implements OnInit {
  public title = 'Observaciones';
  private filter: string;
  private request: iRequest;
  private observations: iObservation[] = [];
  public dataSource: MatTableDataSource<IObservationTable>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public displayedColumns: string[];
  private STATUS: string = 'Accept Reject Process Error None';
  constructor(
    public dialogRef: MatDialogRef<ObservationsComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.filter = this.data.phase;
    this.request = this.data.request;
    this.observations = <iObservation[]>this.request.history.slice();
    this.observations.forEach(e => {
      e.status = this.STATUS.includes(e.status) ? this.convertStatus(e.status) : e.status;
      const date = new Date(e.achievementDate);
      e.achievementDateString = date.toLocaleDateString();
    });    
    this.observations = this.observations.reverse();    
  }

  ngOnInit() {
    this.displayedColumns = ['phase', 'status', 'observation', 'achievementDateString', 'doer'];
    this.dataSource = new MatTableDataSource(this.observations);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  convertStatus(status: string): string {
    let value = '';
    switch (status) {
      case 'None': {
        value = 'Pendiente';
        break;
      }
      case 'Process':
        {
          value = 'Process';
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
