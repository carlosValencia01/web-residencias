import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { ControlStudentProv } from 'src/app/providers/social-service/control-student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-control-student-approved-requests',
  templateUrl: './control-student-approved-requests.component.html',
  styleUrls: ['./control-student-approved-requests.component.scss']
})
export class ControlStudentApprovedRequestsComponent implements OnInit {
  displayedColumns: string[];
  displayedColumnsName: string[];
  dataSource = new MatTableDataSource;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private loadingService: LoadingService,
              private controlStudentProv: ControlStudentProv,
              private notificationsService: NotificationsServices) { }

  ngOnInit() {
    this.displayedColumns = ['id', 'fullName', 'controlNumber', 'career', 'actions'];
    this.displayedColumnsName = ['No', 'Nombre', 'Nùmero de control', 'Carrera'];
    this.dataSource.paginator = this.paginator;
    this._getAllApprovedRequests();
  }

  _getAllApprovedRequests(){
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getRequests('approved').subscribe(res => {
      const approvedRequests = res.controlStudents.map(this._castToTable);
      this._refresh(approvedRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    }
    )
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
      career: data.studentId.career
    }; 
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
