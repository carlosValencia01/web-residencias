import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { ControlStudentProv } from 'src/app/providers/social-service/control-student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { Router } from '@angular/router';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-control-students-all-requests',
  templateUrl: './control-students-all-requests.component.html',
  styleUrls: ['./control-students-all-requests.component.scss']
})
export class ControlStudentsAllRequestsComponent implements OnInit {
  displayedColumns: string[];
  displayedColumnsName: string[];
  dataSource = new MatTableDataSource;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private loadingService: LoadingService,
              private controlStudentProv: ControlStudentProv,
              private notificationsService: NotificationsServices,
              private router: Router) { }

  ngOnInit() {
    this.displayedColumns = ['id', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsName = ['No', 'Nombre', 'Nùmero de control', 'Carrera', 'Estatus'];
    this.dataSource.paginator = this.paginator;
    this._getAllRequests();
  }

  _getAllRequests() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getRequests('all').subscribe(res => {
      const allRequests = res.controlStudents.map(this._castToTable);
      this._refresh(allRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    }
    );
  }

  public refresh() {
    this._getAllRequests();
  }

  private _refresh(data: Array<any>): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  _castToTable(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.verification.solicitude
    };
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
