import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import * as moment from 'moment';

import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {IPosition} from 'src/entities/shared/position.model';
import {NotificationsServices} from 'src/services/app/notifications.service';

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
  private _employeeId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<PositionsHistoryComponent>,
    private employeeProv: EmployeeProvider,
    private notifications: NotificationsServices,
  ) {
    this.positions = data.positions.slice();
    this._employeeId = data.employeeId;
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
    if (position.name.toUpperCase() === 'JEFE DE DEPARTAMENTO' || position.name.toUpperCase() === 'DIRECTOR') {
      this.employeeProv.canReallocatePosition(this._employeeId, positionId).
      subscribe(_ => {
        this.dialogRef.close(position);
      }, err => {
        const message = JSON.parse(err._body).message;
        this.notifications.showNotification(eNotificationType.INFORMATION, 'El puesto no se puede reactivar', message);
      });
    } else {
      this.dialogRef.close(position);
    }
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
