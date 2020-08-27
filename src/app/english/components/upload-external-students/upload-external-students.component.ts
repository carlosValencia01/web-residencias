import { Component, OnInit, ViewChild } from '@angular/core';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import * as Papa from 'papaparse';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
@Component({
  selector: 'app-upload-external-students',
  templateUrl: './upload-external-students.component.html',
  styleUrls: ['./upload-external-students.component.scss']
})
export class UploadExternalStudentsComponent implements OnInit {

   // table sources
   displayedColumns: string[] = ['fullName','sex' ,'age', 'email','phone'];
   dataSource: MatTableDataSource<any>;
   @ViewChild('paginator') paginator: MatPaginator;
   @ViewChild(MatSort) sort: MatSort;
  constructor(
    private notificationService: NotificationsServices,
    private loadingService: LoadingService,
    private studentProv: StudentProvider
  ) { 
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
  }

  public async onUpload(event) {
    this.loadingService.setLoading(true);
    
    this.notificationService.showNotification(eNotificationType.INFORMATION,'ÍNGLES','Cargando datos');
    let csvData = [];// save the data of student
    
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: async (results) => {
          if (results.data.length > 0) {
            // date to calculate student age
            const today = new Date();
            // remove the header and get the rows of students
            results.data.slice(1).forEach((element: Array<any>) => {
              const isVerified = element.pop();              
              
              // save only students verified
              if(isVerified.toLowerCase() == 's'){ 
                // age only to show in table
                const age = parseInt((today.getFullYear() - parseInt(element[5].substr(4,2))).toString().substr(2,2));
                // get the student info
                const fatherLastName = element[2].toUpperCase();
                const motherLastName = element[3].toUpperCase();
                const firstName = element[4].toUpperCase();
                // complete the year with 19 or 20
                const studentBirthYear = element[5].substr(4,1) == '0' ? '20' : '19'; 
                // create the student birth date
                const dateBirth = new Date(`${studentBirthYear}${element[5].substr(4,2)}-${element[5].substr(6,2)}-${element[5].substr(8,2)}`);
                // push the student in the array
                csvData.push({
                  fullName:`${firstName} ${fatherLastName} ${motherLastName}`,
                  fatherLastName,
                  motherLastName,
                  firstName,
                  phone:element[8],
                  email:element[7],
                  curp:element[5],
                  sex:element[5].substr(10,1) == 'H' ? 'M' : 'F',
                  age: parseInt(element[5].substr(6,2)) < today.getMonth() ? age : parseInt(element[5].substr(6,2)) > today.getMonth() ? age-1 : element[5].substr(6,2) == today.getMonth() ? parseInt(element[5].substr(8,2)) <= today.getDate() ? age : age-1 : age,
                  cp:element[13],
                  street: element[9],
                  suburb:element[10],
                  city:element[11],
                  state:element[12],
                  dateBirth
                });
              }
            });
            // update the data of table
            this.dataSource = new MatTableDataSource(csvData);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.loadingService.setLoading(false);            
          }
        },
        encoding: 'utf8',
        skipEmptyLines: true
      });
            
    }else{
      this.notificationService.showNotification(eNotificationType.ERROR,'ÍNGLES','Ocurrió un error. Intentelo más tarde');
    }
  }

  sendExternalStudents(){
    this.notificationService.showNotification(eNotificationType.INFORMATION,'ÍNGLES','Registrando datos');
    this.loadingService.setLoading(true);
    this.studentProv.registerExternalStudents(this.dataSource.data).subscribe((res)=>{
      if(!res.error){
        this.notificationService.showNotification(eNotificationType.SUCCESS,'ÍNGLES','Datos registrados');
      }else{
        this.notificationService.showNotification(eNotificationType.ERROR,'ÍNGLES',res.error);        
      }
      this.loadingService.setLoading(false);
      // clear the data to upload new file     
      this.dataSource.data = [];
    });
  }

}
