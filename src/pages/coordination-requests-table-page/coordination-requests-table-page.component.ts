import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {RequestProvider} from '../../providers/request.prov';

export interface UserData {
  name: string;
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

  constructor(private requestProvider: RequestProvider) {
  }

  ngOnInit() {
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
}

function createNewUser(data): UserData {
  const name = data.graduate.name.fullName;

  return {
    name: name,
    career: data.graduate.career,
    date: data.editionDate.slice(0, 10),
    status: data.status
  };
}
