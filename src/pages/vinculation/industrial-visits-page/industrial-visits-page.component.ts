import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import * as Papa from 'papaparse';
import { StudentProvider } from 'src/providers/shared/student.prov';
import TableToExcel from '@linways/table-to-excel';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
@Component({
  selector: 'app-industrial-visits-page',
  templateUrl: './industrial-visits-page.component.html',
  styleUrls: ['./industrial-visits-page.component.scss']
})
export class IndustrialVisitsPageComponent implements OnInit {

  displayedColumns: string[] = ['no','controlNumber', 'fullName', 'career', 'semester','nss','status'];
  dataSource: MatTableDataSource<ListData>;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator){
    this.dataSource.paginator = paginator;
  };
  @ViewChild(MatSort) set sort(sort: MatSort){
    this.dataSource.sort = sort;
  };

  loading: boolean = false;
  formatedStudents: Array<ListData>  = [];

  plantilla = [
    {controlNumber:'Número de control',fullName:'Nombre',career:'Carrera',semester:'Semestre'},
    {controlNumber:'15401011',fullName:'RICARDO JIMENEZ ESPERICUETA',career:'ISC',semester:'10'}
  ];
  constructor(
    private studentProv: StudentProvider,
    private notificationSrv: NotificationsServices
  ) {      
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public async onUpload(event) {
    this.loading=true;    
    let localStudents;
    this.formatedStudents = [];
    await this.studentProv.getAllStudents().toPromise().then(
      sts=>{
        localStudents = sts.students;        
      }
    );    
    
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (results) => {
          if (results.data.length > 0) {
            results.data.slice(1).forEach((st,index) => {
              const tmpSt = localStudents.filter( stu=> stu.controlNumber == st[0])[0];
              if(tmpSt){
                if(tmpSt.careerId){
                  this.formatedStudents.push(
                    {
                      no:index+1,
                      fullName: tmpSt.fullName,
                      controlNumber: tmpSt.controlNumber,
                      career: tmpSt.careerId.acronym,
                      semester: tmpSt.semester,
                      nss: tmpSt.nss ? tmpSt.nss : '------',
                      status:'-------'
                    }
                  );
                }else{
                  this.formatedStudents.push(
                    {
                      no:index+1,
                      fullName: tmpSt.fullName,
                      controlNumber: tmpSt.controlNumber,
                      career: tmpSt.career,
                      semester: tmpSt.semester,
                      nss: tmpSt.nss ? tmpSt.nss : '------',
                      status:'-------'
                    }
                  );
                }
              }else{
                this.formatedStudents.push(
                  {
                    no:index+1,
                    fullName: st[1],
                    controlNumber: st[0],
                    career: st[2],
                    semester: st[3],
                    nss: '------',
                    status:'-------'
                  }
                );
              }
            });            
            // Assign the data to the data source for the table to render            
            this.dataSource = new MatTableDataSource(this.formatedStudents);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            
            
            this.loading = false;
          }
        }
      });
    }
  }
   // Exportar alumnos a excel
   excelExport() {
    this.notificationSrv.showNotification(eNotificationType.SUCCESS, 'Datos Exportados', 'Los datos se exportaron con éxito');
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Visita industrial.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
  }

  downloadPlantilla(){
    new Angular5Csv(this.plantilla, 'EjemploVisitaIndustrial');
  }
}

interface ListData {
  no: string;
  fullName: string;
  controlNumber: string;
  career: string;
  semester: string;
  nss: string;
  status: string;
}
