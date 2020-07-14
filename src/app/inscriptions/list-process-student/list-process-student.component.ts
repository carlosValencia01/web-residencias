import { Component, OnInit, Output,EventEmitter, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { StudentsExpedient } from 'src/app/interfaces/inscriptions.interface';
import { LoadingBarService } from 'ngx-loading-bar';

@Component({
  selector: 'app-list-process-student',
  templateUrl: './list-process-student.component.html',
  styleUrls: ['./list-process-student.component.scss']
})
export class ListProcessStudentComponent implements OnInit {
  @Output() countStudentsEmit = new EventEmitter();
  @Input('periods') periods: Array<any>;
  students;
  listStudentsProcess;
  // periods = [];  
  rolName;      
  
  studentsForTable: Array<StudentsExpedient>;
  filteredStudents;
  readyToShowTable = {
    students: false,
    periods:false
  };
  constructor(
    private inscriptionsProv: InscriptionsProvider,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private router: Router,    
    private loadingService: LoadingService,
    private loadingBar: LoadingBarService,
  ) {
    this.rolName = this.cookiesService.getData().user.rol.name;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }    
    this.getStudents();
    this.getPeriods();
  }
  

  ngOnInit() {
    
  }
  ngOnChanges(changes: SimpleChanges) { // cuando se actualiza algo en el padre  
           
    if(changes.periods){
      this.periods = changes.periods.currentValue ? changes.periods.currentValue : this.periods;
    }    
    this.readyToShowTable.periods = true; 
  }

  getStudents(){
    this.loadingBar.start();
    this.inscriptionsProv.getStudentsProcess().subscribe(res => {
      this.students = res.students;

      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.fatherLastName.localeCompare(b.fatherLastName);
      });

      this.listStudentsProcess = this.students;
      this.studentsForTable = this.listStudentsProcess.map( st=>(
        {
          fullName: st.fullName,
          controlNumber: st.controlNumber,
          career: st.careerId.fullName,
          avance: st.documentsReviewNumber+'/'+st.totalDocumentsNumber,
          status: st.inscriptionStatus,
          exp: st.expStatus ? st.expStatus : '',
          medicDict:st.observationsAnalysis ? 'SI' : 'NO',
          medicWarn:st.warningAnalysis ? 'SI' : 'NO',
          actions: {
            inscriptionStatus: st.inscriptionStatus,
            printCredential: st.printCredential,
            photo: this.filterDocuments('Foto',st),
            pendientDocs: (st.totalDocumentsNumber-st.documentsReviewNumber)
          },
          student:st
        }));
        this.loadingBar.complete();
        this.readyToShowTable.students = true;
    });

  }
  filterDocuments(document,student){
    switch (document) {
      case "Acta": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ?docc.filename.indexOf('ACTA') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Certificado": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('CERTIFICADO') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Analisis": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('CLINICOS') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Comprobante": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('COMPROBANTE') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Curp": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('CURP') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Nss": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('NSS') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Foto": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('FOTO') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      case "Compromiso": {
        var doc = student.documents ? student.documents.filter(docc => docc.filename ? docc.filename.indexOf('COMPROMISO') !== -1 && docc.status.length>0: undefined)[0]:'';
        if(doc != undefined){
          return doc.status[doc.status.length-1].name;
        }
        else{
          return "SIN ENVÍO";
        }
      }
      default:{

      }
    }
  }
  getPeriods(){
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {
        // this.periods=periods.periods;
        // this.periods.reverse();
        // this.readyToShowTable.periods = true;
        sub.unsubscribe();
      });
  }

  updateGI(student){
    
      this.getStudents();
  }

  viewExpedient(student){
    
      this.getStudents();
  }

  // Exportar alumnos a excel
  async excelExport(students) {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    this.filteredStudents = students;        
    await this.delay(200);
    TableToExcel.convert(document.getElementById('tableReportExcel'), {
      name: 'Reporte Alumnos Inscripcion.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }   
  
  updateExpedientStatus(student){    
    this.getStudents();    
    this.countStudentsEmit.emit(true);    
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}