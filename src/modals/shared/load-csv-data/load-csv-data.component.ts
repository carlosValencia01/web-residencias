import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import Swal from 'sweetalert2';
import * as moment from 'moment';

moment.locale('es');

@Component({
  selector: 'app-load-csv-data',
  templateUrl: './load-csv-data.component.html',
  styleUrls: ['./load-csv-data.component.scss']
})
export class LoadCsvDataComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public title: string;
  public displayedColumns: string[];
  public displayedColumnsName: string[];
  public dataSource: MatTableDataSource<any>;
  public componentData: any;
  private readonly config: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<LoadCsvDataComponent>,
  ) {
    this.config = data.config;
    this.componentData = data.componentData;
    this.config.displayedColumns.push('actions');
  }

  ngOnInit() {
    this.title = this.config.title;
    this.displayedColumns = this.config.displayedColumns.slice();
    this.displayedColumnsName = this.config.displayedColumnsName.slice();
    this._loadTableData(this.componentData);
  }

  public displayData(property: any): string {
    const type = typeof property;
    switch (type) {
      case 'undefined': return '';
      case 'boolean': return property ? 'Si' : 'No';
      case 'object': return property instanceof Date ? moment(new Date(property)).format('LL') : '';
      default: return property;
    }
  }

  public saveData() {
    this.dialogRef.close(this.componentData);
  }

  public onRowRemove(row: any) {
    Swal.fire({
      title: 'Descartar datos',
      text: `Los datos de la fila seleccionada van a ser descartados. ¿Desea continuar?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.componentData.splice(this.componentData.indexOf(row), 1);
        this._loadTableData(this.componentData);
      }
    });
  }

  private _loadTableData(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
