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

  displayedColumns: string[] = ['no','controlNumber', 'fullName', 'career', 'semester','nss','status','insured'];
  dataSource: MatTableDataSource<ListData>;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator){
    this.dataSource.paginator = paginator;
  };
  @ViewChild(MatSort) set sort(sort: MatSort){
    this.dataSource.sort = sort;
  };

  loading: boolean = false;
  showTable: boolean = false;
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
    this.showTable = false;
    let localStudents,activeStudents;
    this.formatedStudents = [];
    await this.studentProv.getAllStudents().toPromise().then(
      sts=>{
        localStudents = sts.students.map(
          st=>({
            controlNumber:st.controlNumber,
            career: st.careerId ? st.careerId.acronym : st.career,
            fullName:st.fullName,
            semester:st.semester,
            nss: st.nss,
            insured: st.documents.filter( doc=> doc.type == 'IMSS' ).length > 0 ? true : false
          })
        );          
             
      }
    );    
    await this.studentProv.getAllActiveStudents().toPromise().then(
      sts=>{
        activeStudents = sts.activeStudents;              
          
      }
    );    
    
    if (event.target.files && event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        complete: (results) => {
          if (results.data.length > 0) {
            results.data.slice(1).forEach(async (st,index) => {
              const tmpSt = localStudents.filter( stu=> stu.controlNumber.trim() == st[0].trim())[0];
              const stStatus = activeStudents.filter(stu=>stu.controlNumber.trim() == st[0].trim())[0];
              if(tmpSt){              
                this.formatedStudents.push(
                  {
                    no:index+1,
                    fullName: tmpSt.fullName,
                    controlNumber: tmpSt.controlNumber,
                    career: tmpSt.career,
                    semester: tmpSt.semester,
                    nss: tmpSt.nss ? tmpSt.nss : '------',
                    status: stStatus ? 'ACTIVO' : 'INACTIVO',
                    insured: tmpSt.insured ? 'SI' : 'NO'
                  }
                );
              }else{
                this.formatedStudents.push(
                  {
                    no:index+1,
                    fullName: st[1],
                    controlNumber: st[0],
                    career: st[2] ? st[2] : '------',
                    semester: st[3] ? st[3] : '------',
                    nss: '------',
                    status:'------',
                    insured: '------'
                  }
                );
              }
            });            
            // Assign the data to the data source for the table to render            
            this.dataSource = new MatTableDataSource(this.formatedStudents);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;            
            this.loading = false;
            this.showTable = true;
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
  insured: string;
}
