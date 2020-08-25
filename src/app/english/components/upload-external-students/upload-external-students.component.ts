import { Component, OnInit, ViewChild } from '@angular/core';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import * as Papa from 'papaparse';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
@Component({
  selector: 'app-upload-external-students',
  templateUrl: './upload-external-students.component.html',
  styleUrls: ['./upload-external-students.component.scss']
})
export class UploadExternalStudentsComponent implements OnInit {

   // table sources
   displayedColumns: string[] = ['fullName','sex' ,'age','address', 'phone', 'email', 'curp'];
   dataSource: MatTableDataSource<any>;
   @ViewChild('paginator') paginator: MatPaginator;
   @ViewChild(MatSort) sort: MatSort;
  constructor(
    private notificationService: NotificationsServices,
    private loadingService: LoadingService,
  ) { 
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
  }

  public async onUpload(event) {
    this.loadingService.setLoading(true);
    
    let csvData = [];// save the data of student
    if (event.target.files && event.target.files[0]) {

      Papa.parse(event.target.files[0], {
        complete: async (results) => {
          if (results.data.length > 0) {
            const today = new Date();
            results.data.slice(1).forEach(element => {
              const age = parseInt((today.getFullYear() - parseInt(element[4].substr(4,2))).toString().substr(2,2));
              csvData.push({
                fullName:element[0],
                address:element[1],
                phone:element[2],
                email:element[3],
                curp:element[4],
                sex:element[4].substr(10,1) == 'H' ? 'M' : 'F',
                age: parseInt(element[4].substr(6,2)) < today.getMonth() ? age : parseInt(element[4].substr(6,2)) > today.getMonth() ? age-1 : element[4].substr(6,2) == today.getMonth() ? parseInt(element[4].substr(6,2)) <= today.getDate() ? age : age-1 : age 
              });
            });
            this.dataSource = new MatTableDataSource(csvData);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.loadingService.setLoading(false);
            
          }
        },
        encoding: 'utf8',
        skipEmptyLines: true
      });
      
      
    }
  }

}
