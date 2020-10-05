import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { ControlStudentProv } from 'src/app/providers/social-service/control-student.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

@Component({
  selector: 'app-control-students-requests',
  templateUrl: './control-students-requests.component.html',
  styleUrls: ['./control-students-requests.component.scss']
})
export class ControlStudentsRequestsComponent implements OnInit {
  public selectedSubTab: FormControl;
  public search: string;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matPaginatorSend') paginatorSend: MatPaginator;
  @ViewChild('matPaginatorApproved') paginatorApproved: MatPaginator;
  @ViewChild('matPaginatorAllRequests') paginatorAllRequests: MatPaginator;

  public displayedColumnsSend: string[];
  public displayedColumnsSendName: string[];
  public displayedColumnsApproved: string[];
  public displayedColumnsApprovedName: string[];
  public displayedColumnsAllRequests: string[];
  public displayedColumnsAllRequestsName: string[];

  public dataSourceSend: MatTableDataSource<any>;
  public dataSourceApproved: MatTableDataSource<any>;
  public dataSourceAllRequests: MatTableDataSource<any>;

  constructor( private controlStudentProv: ControlStudentProv,
              private loadingService: LoadingService,
              private dialog: MatDialog,
              private notificationsService: NotificationsServices ) {
            this.selectedSubTab = new FormControl(0);
  }

  ngOnInit() {
    this.displayedColumnsSend = ['id', 'fullName', 'controlNumber', 'career', 'actions'];
    this.displayedColumnsSendName = ['No', 'Nombre', 'Nùmero de control', 'Carrera'];
    this.displayedColumnsApproved = ['id', 'fullName', 'controlNumber', 'career', 'actions'];
    this.displayedColumnsApprovedName = ['No', 'Nombre', 'Nùmero de control', 'Carrera'];
    this.displayedColumnsAllRequests = ['id', 'fullName', 'controlNumber', 'career', 'status', 'actions'];
    this.displayedColumnsAllRequestsName = ['No', 'Nombre', 'Nùmero de control', 'Carrera', 'Estatus'];
    this._getAllSendRequests();
  }

  public changeSubTab(event) {
    this.selectedSubTab.setValue(event);
    switch (event) {
      case 0: return this._getAllSendRequests();
      case 1: return this._getAllApprovedRequests();
      case 2: return this._getAllRequests();
    }
  }

  public applyFilter(filterValue: string) {
    switch (this.selectedSubTab.value) {
      case 0:
        this.dataSourceSend.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceSend.paginator) {
          this.dataSourceSend.paginator.firstPage();
        }
        break;
      case 1:
        this.dataSourceApproved.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceApproved.paginator) {
          this.dataSourceApproved.paginator.firstPage();
        }
        break;
      case 2:
        this.dataSourceAllRequests.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceAllRequests.paginator) {
          this.dataSourceAllRequests.paginator.firstPage();
        }
        break;
    }
  }

  public refreshSend() {
    this._getAllSendRequests();
  }

  public refreshApproved() {
    this._getAllApprovedRequests();
  }

  public refreshAllRequests() {
    this._getAllRequests();
  }

  _getAllSendRequests() {
    this.loadingService.setLoading(true);
    // Obtención de todas las solicitudes
    this.controlStudentProv.getRequests('send').subscribe( res => {
      const signedRequests = res.controlStudents.map(this._castToTableSend);
      this._refreshSend(signedRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
  }

  _getAllApprovedRequests() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getRequests('approved').subscribe(res => {
      const approvedRequests = res.controlStudents.map(this._castToTableApproved);
      this._refreshApproved(approvedRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    });
  }

  _getAllRequests() {
    this.loadingService.setLoading(true);
    // Obtener las solicitudes aprovadas
    this.controlStudentProv.getRequests('all').subscribe(res => {
      const allRequests = res.controlStudents.map(this._castToTableAllRequests);
      this._refreshAllRequests(allRequests);
    }, () => {
      this.notificationsService.showNotification(eNotificationType.ERROR,
        'Error', 'Ha sucedido un error en la descarga de la información');
      this.loadingService.setLoading(false);
    }, () => {
      this.loadingService.setLoading(false);
    }
    );
  }

  private _refreshSend(data: Array<any>): void {
    this.dataSourceSend = new MatTableDataSource(data);
    this.dataSourceSend.paginator = this.paginatorSend;
    this.dataSourceSend.sort = this.sort;
  }


  private _refreshApproved(data: Array<any>): void {
    this.dataSourceApproved = new MatTableDataSource(data);
    this.dataSourceApproved.paginator = this.paginatorSend;
    this.dataSourceApproved.sort = this.sort;
  }

  private _refreshAllRequests(data: Array<any>): void {
    this.dataSourceAllRequests = new MatTableDataSource(data);
    this.dataSourceAllRequests.paginator = this.paginatorSend;
    this.dataSourceAllRequests.sort = this.sort;
  }


  _castToTableSend(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career
    };
  }

  _castToTableApproved(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career
    };
  }

  _castToTableAllRequests(data) {
    return {
      id: data._id,
      fullName: data.studentId.fullName,
      controlNumber: data.controlNumber,
      career: data.studentId.career,
      status: data.verification.solicitude
    };
  }

}
