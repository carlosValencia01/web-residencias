import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import * as moment from 'moment';

import {IPosition} from 'src/entities/shared/position.model';

moment.locale('es');

@Component({
  selector: 'app-positions-history',
  templateUrl: './positions-history.component.html',
  styleUrls: ['./positions-history.component.scss']
})
export class PositionsHistoryComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public positions: Array<any>;
  public dataSource: MatTableDataSource<IPositionsHistoryTable>;
  public displayedColumns: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<PositionsHistoryComponent>,
  ) {
    this.positions = data.positions.slice();
  }

  ngOnInit() {
    this.displayedColumns = ['ascription', 'position', 'canSign', 'status', 'activateDate', 'deactivateDate', 'actions'];
    const data = this.positions.map(pos => this._castPositionToRow(pos));
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public reallocatePosition(positionId: string) {
    const position = this._getPositionById(positionId);
    this.dialogRef.close(position);
  }

  private _castPositionToRow(data: any): IPositionsHistoryTable {
    return {
      _id: data.position._id,
      ascription: data.position.ascription.name,
      position: data.position.name,
      canSign: data.position.canSign ? 'SI' : 'NO',
      status: data.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO',
      activateDate: data.activateDate ? moment(data.activateDate).format('LL') : '-----',
      deactivateDate: data.deactivateDate ? moment(data.deactivateDate).format('LL') : '-----'
    };
  }

  private _getPositionById(positionId: string): IPosition {
    return this.positions.find(item => item.position._id === positionId).position;
  }
}

interface IPositionsHistoryTable {
  _id?: string;
  ascription?: string;
  position?: string;
  canSign?: string;
  status?: string;
  activateDate?: string;
  deactivateDate?: string;
}
