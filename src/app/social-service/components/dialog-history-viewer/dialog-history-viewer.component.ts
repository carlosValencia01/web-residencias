import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-dialog-history-viewer',
  templateUrl: './dialog-history-viewer.component.html',
  styleUrls: ['./dialog-history-viewer.component.scss']
})
export class DialogHistoryViewerComponent implements OnInit {
  public historyStudent;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public displayedColumns: string[];
  public displayedColumnsName: string[];
  public dataSource: MatTableDataSource<any>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<DialogHistoryViewerComponent>) {
    this.historyStudent = data;
  }

  ngOnInit() {
    this.displayedColumns = ['no', 'name', 'message', 'responsible', 'date'];
    this.displayedColumnsName = ['Acción', 'Mensaje', 'Responsable', 'Fecha'];
    const data = this.historyStudent.status.map(this._castToTable);
    this._refresh(data);
  }

  dialogResult() {
    this.dialogRef.close();
  }

  private _refresh(data: Array<any>): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  _castToTable(data) {
    return {
      name: data.name,
      message: data.message,
      responsible: data.responsible,
      date: data.date
    };
  }

}
