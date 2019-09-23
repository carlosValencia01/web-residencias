import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router, ActivatedRoute} from '@angular/router';

import * as moment from 'moment';

import {GraduateAcademicRecordComponent} from 'src/pages/graduate-academic-record/graduate-academic-record.component';
import {RequestProvider} from 'src/providers/request.prov';
import {CookiesService} from 'src/services/cookie.service';
import {SidebarService} from 'src/services/sidebar.service';

export interface UserData {
  name: string;
  controlNumber: string;
  career: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-coordination-requests-table-page',
  templateUrl: './coordination-requests-table-page.component.html',
  styleUrls: ['./coordination-requests-table-page.component.scss']
})
export class CoordinationRequestsTablePageComponent implements OnInit {
  displayedColumns: string[] = ['name', 'career', 'date', 'status'];
  dataSource: MatTableDataSource<UserData>;
  data: any;
  arr = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private cookiesService: CookiesService,
    private dialog: MatDialog,
    private requestProvider: RequestProvider,
    private router: Router,
    private sidebarService: SidebarService,
    private routeActive: ActivatedRoute,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    moment.locale('es');
  }

  ngOnInit() {
    this.loadDataTable();
  }

  loadDataTable() {
    this.requestProvider.getAllRequests().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.arr.push(createNewUser(data[i]));
      }
      // const requests = Array.from({length: 100}, (_, k) => createNewUser(data));

      this.dataSource = new MatTableDataSource(this.arr);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(row: any) {
    this.requestProvider.getRequestByControlNumber(row.controlNumber)
      .subscribe(request => {
        const dialogRef = this.dialog.open(GraduateAcademicRecordComponent, {
          width: '90%',
          disableClose: true
        });
        dialogRef.componentInstance.request = request;
        this.sidebarService.openedModal();

        dialogRef.afterClosed().subscribe(result => {
          this.arr = [];
          this.loadDataTable();
          this.sidebarService.closedModal();
        });
      });
  }
}

function createNewUser(data): UserData {
  const name = data.graduate.name.fullName;

  return {
    name: name,
    controlNumber: data.graduate.controlNumber,
    career: data.graduate.career,
    date: moment(data.editionDate.slice(0, 10)).format('LL'),
    status: data.status
  };
}
