import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { ControlStudentProv } from 'src/app/providers/social-service/control-student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import {eNotificationType} from '../../../enumerators/app/notificationType.enum';
import { Router } from '@angular/router';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-control-students-signed-requests',
  templateUrl: './control-students-signed-requests.component.html',
  styleUrls: ['./control-students-signed-requests.component.scss']
})
export class ControlStudentsSignedRequestsComponent implements OnInit {
  displayedColumns: string[];
  displayedColumnsName: string[];
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private controlStudentProv: ControlStudentProv,
              private loadingService: LoadingService,
              private notificationsService: NotificationsServices,
              private router: Router) { }

  ngOnInit() {
    this.displayedColumns = ['id', 'fullName', 'controlNumber', 'career', 'actions'];
    this.displayedColumnsName = ['No', 'Nombre', 'Nùmero de control', 'Carrera'];
    this.dataSource.paginator = this.paginator;
    this._getAllSignedRequests();
  }
  _getAllSignedRequests() {
    this.loadingService.setLoading(true);
    // Obtención de todas las solicitudes
    this.controlStudentProv.getRequests('send').subscribe( res => {
      const signedRequests = res.controlStudents.map(this._castToTable);
      this._refresh(signedRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
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
