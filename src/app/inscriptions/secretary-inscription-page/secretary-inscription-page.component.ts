import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTabChangeEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import 'jspdf-autotable';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import Swal from 'sweetalert2';
import { ReviewCredentialsComponent } from '../review-credentials/review-credentials.component';
import { IStudentExpedient } from 'src/app/entities/inscriptions/studentExpedient.model';
import { uInscription } from 'src/app/entities/inscriptions/inscriptions';
import { ListAceptStudentComponent } from '../list-acept-student/list-acept-student.component';
import { ListPendingStudentComponent } from '../list-pending-student/list-pending-student.component';
import { ListProcessStudentComponent } from '../list-process-student/list-process-student.component';
import { LoadingBarService } from 'ngx-loading-bar';
@Component({
  selector: 'app-secretary-inscription-page',
  templateUrl: './secretary-inscription-page.component.html',
  styleUrls: ['./secretary-inscription-page.component.scss']
})
export class SecretaryInscriptionPageComponent implements OnInit {

  @ViewChild(ListPendingStudentComponent) private pendingStudent: ListPendingStudentComponent;
  @ViewChild(ListProcessStudentComponent) private processStudent: ListProcessStudentComponent;
  @ViewChild(ListAceptStudentComponent) private aceptStudent: ListAceptStudentComponent;

  displayedColumns: string[] = ['controlNumber', 'fullName', 'career'];
  dataSource: MatTableDataSource<loggedStudents>;
  
  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator){
    this.dataSource.paginator = paginator;
  };
  @ViewChild(MatSort) set sort(sort: MatSort){
    this.dataSource.sort = sort;
  };
  showTable: boolean = false;
  students;
  listStudents;
  listStudentsLogged;
  cantListStudentsPendant = 0;
  cantListStudentsProcess = 0;
  cantListStudentsAcept = 0;
  cantListStudents = 0;
  cantListStudentsLogged = 0;
  cantIntegratedExpedient = 0;
  cantArchivedExpedient = 0;
  periods = [];
  activPeriod;
  listCovers;
  rolName;  
  credentialStudents;  
  searchCareer = '';
  searchControlNUmber = '';

  listStudentsDebts = [];
  studentsForTable: Array<IStudentExpedient>;
  emptyUInscription: uInscription;
  filteredStudents;
  readyToShowTable = {
    students: false,
    periods:false
  };
  usedPeriods=[];
  showTabs = false;
  version = 0; //variable para indicar si hubo cambio en el filtro del periodo
  constructor(
    private imageToBase64Serv: ImageToBase64Service,
    private inscriptionsProv: InscriptionsProvider,
    public dialog: MatDialog,
    private notificationService: NotificationsServices,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private router: Router,
    private studentProv: StudentProvider,
    private loadingService: LoadingService,
    private loadingBar: LoadingBarService,
  ) {
    this.rolName = this.cookiesService.getData().user.rol.name;
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }   
    this.dataSource = new MatTableDataSource();
    this.getPeriods();
    this.getActivePeriod();
    this.getStudents();
  }
  

  ngOnInit() {
    
    setTimeout(() => {      
      this.emptyUInscription = new uInscription(this.imageToBase64Serv,this.cookiesService,this.inscriptionsProv);
    }, 300);
  }

  getStudents(){
    this.loadingBar.start();
    this.inscriptionsProv.getStudents().subscribe(res => {
      this.students = res.students;

      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.fatherLastName.localeCompare(b.fatherLastName);
      });
      this.listStudents = this.students;
      this.studentsForTable = this.listStudents.map( st=>(
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
      this.listStudents.forEach(element => {
        if((this.filterDocuments('Comprobante',element) != 'EN PROCESO' && this.filterDocuments('Comprobante',element) != 'VALIDADO' && this.filterDocuments('Comprobante',element) != 'ACEPTADO') || (this.filterDocuments('Certificado',element) != 'EN PROCESO' && this.filterDocuments('Certificado',element) != 'VALIDADO' && this.filterDocuments('Certificado',element) != 'ACEPTADO')){
          this.listStudentsDebts.push(element);
        }
      });      
      this.listCovers = this.listStudents;
            
    });
    this.inscriptionsProv.getStudentsLogged().subscribe(res => {
      this.listStudentsLogged = res.students;      
      this.listStudentsLogged.sort(function (a, b) {
        return a.fatherLastName.localeCompare(b.fatherLastName);
      });      
      
      this.dataSource = new MatTableDataSource(this.listStudentsLogged);      
      
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.showTable = true;
    });

    this.countStudents(-1);

  }
  

  countStudents(index){
        
    this.inscriptionsProv.getNumberInscriptionStudentsByPeriod().subscribe(
      res=>{
        let numberStudentsByPeriod = res.studentsByPeriod;
        setTimeout(() => {
          this.processStudent.getStudents();
          this.pendingStudent.getStudents(); 
          this.aceptStudent.getStudents();
          this.cantListStudents = 0;
          this.cantListStudentsProcess = 0;
          this.cantListStudentsPendant = 0;
          this.cantListStudentsAcept = 0;
          this.cantListStudentsLogged = 0;
          this.cantIntegratedExpedient = 0;
          this.cantArchivedExpedient = 0;
          for(let i = 0; i<this.usedPeriods.length; i++){
            const students = numberStudentsByPeriod.filter( numS=> numS.periodId+'' == this.usedPeriods[i]._id+'')[0];
            this.cantListStudents += students ? students.allStudents : 0;
            this.cantListStudentsProcess += students ? students.processStudents : 0;
            this.cantListStudentsPendant += students ? students.pendantStudents : 0;
            this.cantListStudentsAcept += students ? students.acepStudents : 0;
            this.cantListStudentsLogged += students ? students.loggedStudents : 0;
            this.cantIntegratedExpedient += students ? students.expedientsIntegrated : 0;
            this.cantArchivedExpedient += students ? students.expedientsArchived : 0;
          }
        }, 200);
      }
    );
        
    
  }
 
  // FILTRADO POR CARRERA
  filterItemsCarreer(carreer) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1;
    });
  }

  filterItemsCovers(carreer,nc) {
    return this.students.filter(function (student) {
      return student.career.toLowerCase().indexOf(carreer.toLowerCase()) > -1 &&
        student.controlNumber.toLowerCase().indexOf(nc.toLowerCase()) > -1
      });
  }

  getPeriods(){
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {
        this.periods=periods.periods;
        this.periods.reverse();
        this.readyToShowTable.periods = true;
        sub.unsubscribe();
      });
  }

  getActivePeriod(){
    let sub = this.inscriptionsProv.getActivePeriod()
      .subscribe(period => {
        this.activPeriod = period.period.year;
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

  // Generar Carátulas
  generateCovers() {
    this.listCovers = this.filterItemsCovers(this.searchCareer,this.searchControlNUmber);    
    if(this.listCovers.length != 0){
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'GENERANDO CARÁTULAS', '');
      this.loadingService.setLoading(true);
      const doc = this.emptyUInscription.generateCovers(this.listCovers,this.activPeriod);
      this.loadingService.setLoading(false);
      window.open(doc.output('bloburl'), '_blank');
    }

  }

  // Generar Pestañas
  generateLabels() {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'GENERANDO PESTAÑAS', '');
    this.loadingService.setLoading(true);
    this.listCovers = this.filterItemsCovers(this.searchCareer,this.searchControlNUmber);
    const doc = this.emptyUInscription.generateLabels(this.listCovers,this.activPeriod);
    this.loadingService.setLoading(false);
    window.open(doc.output('bloburl'), '_blank');
  }

  viewAnalysis(student){
    this.getStudents();
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

  // Generar plantilla IMSS Excel
  async excelExportIMSS(students) {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    this.filteredStudents = students;
    await this.delay(200);
    TableToExcel.convert(document.getElementById('tableReportExcelIMSS'), {
      name: 'Plantilla Alumnos IMSS.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }

   // Generar plantilla CM Excel
   async excelExportCM(students) {
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    this.filteredStudents = students;
    await this.delay(200);
    TableToExcel.convert(document.getElementById('tableReportExcelCM'), {
      name: 'Reporte Consultorio Médico.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }  

  registerCredential(item){
    this.getStudents();
  }

  removeCredential(item){
    this.getStudents();
  }

  async generateCredentials(){
    this.credentialStudents = this.filterItemsCarreer(this.searchCareer);
    if(this.credentialStudents.length != 0){
      this.loadingService.setLoading(true);
      const cred = await this.emptyUInscription.generateCredentials(this.credentialStudents);
      this.loadingService.setLoading(false);
      if(cred.numCredentials != 0){
        var credentials = cred.doc.output('arraybuffer');
        // Abrir Modal para visualizar credenciales
        const linkModal = this.dialog.open(ReviewCredentialsComponent, {
          data: {
            operation: 'view',
            credentials,
            students:cred.tempStudents
          },
          disableClose: true,
          hasBackdrop: true,
          width: '90em',
          height: '800px'
        });
        let sub = linkModal.afterClosed().subscribe(
          credentials=>{
            this.getStudents();
          },
          err=>console.log(err), ()=> sub.unsubscribe()
        );
        
      } else {
        this.notificationService.showNotification(eNotificationType.INFORMATION, 'No Hay Credenciales Para Imprimir', '');
      }
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'No Hay Credenciales Para Imprimir', '');
    }
  }        

  updateSolicitud(student){
    Swal.fire({
      title: 'Actualizar Solicitud',
      text: 'Para ' + student.controlNumber,
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Confirmar'
    }).then((result) => {
      if (result.value) {
        this.loadingService.setLoading(true);
        const doc = this.emptyUInscription.generateSolicitud(student);
        this.loadingService.setLoading(false);
        let document = doc.output('arraybuffer');
        let binary = this.bufferToBase64(document);

        this.updateDocument(binary,student);
        // window.open(doc.output('bloburl'), '_blank');
      }
    });
  }

  bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  async updateDocument(document, student){

    const fileId = student.documents[0].fileIdInDrive;
    const folderId = await this.getFolderId(student._id);
    const documentInfo = {
      mimeType: "application/pdf",
      nameInDrive: student.controlNumber + '-SOLICITUD.pdf',
      bodyMedia: document,
      folderId: folderId,
      newF: false,
      fileId: fileId
    };
    this.inscriptionsProv.uploadFile2(documentInfo).subscribe(
      async updated => {
        const documentInfo2 = {
          doc: {
            filename: updated.filename,
            type: 'DRIVE',
            fileIdInDrive: updated.fileId
          },
          status: {
            name: 'EN PROCESO',
            active: true,
            message: 'Se envio por primera vez'
          }
        };
        await this.studentProv.uploadDocumentDrive(student._id, documentInfo2).subscribe(
          updated => {
            this.notificationService.showNotification(eNotificationType.SUCCESS, 'Exito', 'Solicitud actualizada correctamente.');
             this.loadingService.setLoading(false);
          },
          err => {
            console.log(err);
          }, () => this.loadingService.setLoading(false)
        );
      },
      err => {
        this.loadingService.setLoading(false);
        console.log(err);
      }
    );
  }

  async getFolderId(id){
    let folderId;
   await this.studentProv.getFolderId(id).toPromise().then(
      folder => {
        if (folder.folder) {// folder exists
          if (folder.folder.idFolderInDrive) {
            folderId = folder.folder.idFolderInDrive;
          }
        }
      });
    return folderId;
  }

  async generateCredential(student){
    var docFoto = student.documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] ? student.documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0] : '';
    if(docFoto != ''){
      if(docFoto.status[docFoto.status.length-1].name == "ACEPTADO" || docFoto.status[docFoto.status.length-1].name == "VALIDADO"){
        if(student.printCredential != true){
          this.loadingService.setLoading(true);
          const doc = await this.emptyUInscription.generateCredential(student,docFoto);
          this.loadingService.setLoading(false);
          var credentials = doc.output('arraybuffer');
          // Abrir Modal para visualizar credenciales
          const linkModal = this.dialog.open(ReviewCredentialsComponent, {
            data: {
              operation: 'view',
              credentials,
              students:student
            },
            disableClose: true,
            hasBackdrop: true,
            width: '90em',
            height: '800px'
          });
          let sub = linkModal.afterClosed().subscribe(
            credentials=>{
              this.getStudents();
            },
            err=>console.log(err), ()=> sub.unsubscribe()
          );
        } else {
          this.notificationService.showNotification(eNotificationType.INFORMATION, 'Credencial ya fue impresa', '');
        }
      } else{
        this.notificationService.showNotification(eNotificationType.INFORMATION, 'Foto no aceptada', '');
      }
    } else {
      this.notificationService.showNotification(eNotificationType.INFORMATION, 'No tiene foto', '');
    }
  }

  updateExpedientStatus(student){
    this.getStudents();
  }

  onTabChanged(event: MatTabChangeEvent){
    this.countStudents(event.index);
    
  }

  integratedExpedient(student){
    
    this.getStudents();
  }

  archivedExpedient(student){
    this.getStudents();
  }

  async excelExportDebts(students){
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    this.filteredStudents = students;
    await this.delay(200);
    TableToExcel.convert(document.getElementById('tableReportExcelDebts'), {
      name: 'Reporte Adeudos Alumnos Inscripcion.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }

  async getDebts(){
    var debtsStudents = [];
    this.listStudents.forEach((student) => {
      let debts = [];
      if(this.filterDocuments('Acta',student) !== 'ACEPTADO' && this.filterDocuments('Acta',student) !== 'VALIDADO'){
        debts.push('Acta de Nacimiento');
      }
      if(this.filterDocuments('Certificado',student) !== 'ACEPTADO' && this.filterDocuments('Certificado',student) !== 'VALIDADO'){
        debts.push('Certificado de Bachiller');
      }
      if(this.filterDocuments('Analisis',student) !== 'ACEPTADO' && this.filterDocuments('Analisis',student) !== 'VALIDADO'){
        debts.push('Análisis Clínicos');
      }
      if(this.filterDocuments('Comprobante',student) !== 'ACEPTADO' && this.filterDocuments('Comprobante',student) !== 'VALIDADO'){
        debts.push('Comprobante de Pago');
      }
      if(this.filterDocuments('Curp',student) !== 'ACEPTADO' && this.filterDocuments('Curp',student) !== 'VALIDADO'){
        debts.push('Curp');
      }
      if(this.filterDocuments('Nss',student) !== 'ACEPTADO' && this.filterDocuments('Nss',student) !== 'VALIDADO'){
        debts.push('Número de Seguro Social');
      }
      if(this.filterDocuments('Foto',student) !== 'ACEPTADO' && this.filterDocuments('Foto',student) !== 'VALIDADO'){
        debts.push('Fotografía');
      }
      if(debts.length !== 0){
        debtsStudents.push({
            alumno:{
              nombre:student.fullName,
              nc:student.controlNumber,
              carrera:student.career,
              correo:student.email
            },
            adeudos:debts
          });
      }
    });       
  }

  async getSchedule(students){
    
    
    this.loadingService.setLoading(true);
    this.filteredStudents = students;    
    const doc1 = this.emptyUInscription.generateScheduleStep1();
    await this.delay(200);
    doc1.autoTable({
      html: '#tableReportSchedule',
      theme: 'striped',
      margin: { top: 70 },
      headStyles: { fillColor: [24, 57, 105], halign: 'center' },
      columnStyles: {
          0: { cellWidth: 40, halign: 'center' },
          1: { cellWidth: 140, halign: 'center' },
          2: { cellWidth: 70, halign: 'center' },
          3: { cellWidth: 70, halign: 'center' },
          4: { cellWidth: 70, halign: 'center' },
          5: { cellWidth: 80, halign: 'center' },
          6: { cellWidth: 60, halign: 'center' }
      }
      });
    const doc = this.emptyUInscription.generateScheduleStep2(doc1);
    await this.delay(3000);
    this.loadingService.setLoading(false);
    window.open(doc.output('bloburl'), '_blank');
  }

  async getScheduleExcel(students){
    this.notificationService.showNotification(eNotificationType.INFORMATION, 'EXPORTANDO DATOS', '');
    this.loadingService.setLoading(true);
    this.filteredStudents = students;
    await this.delay(200);
    TableToExcel.convert(document.getElementById('tableReportSchedule'), {
      name: 'Reporte Alumnos Derecho Horario.xlsx',
      sheet: {
        name: 'Alumnos'
      }
    });
    this.loadingService.setLoading(false);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  setSearchCareer(career: string){
    this.searchCareer = career;
  }
  setSearchControlNumber(controlNumber: string){
    this.searchControlNUmber = controlNumber;
  }
  getUsedPeriods(periods){
    this.usedPeriods = periods;
    this.version+=0.0001;
    this.usedPeriods = this.usedPeriods.map((per)=>({      
      code: per.code,      
      periodName: per.periodName,
      year: per.year,      
      _id: per._id,
      version:this.version
    }));
    if(this.version !== 0.0001){
      this.filterLoggedStudents();
    }else{
      setTimeout(() => {
        this.filterLoggedStudents();        
      }, 1500);
    }
    setTimeout(() => {      
      this.showTabs = true;
    }, 500);
    this.countStudents(-1);
  }

  filterLoggedStudents(){          
      this.dataSource.data = this.listStudentsLogged;      
      if(this.usedPeriods){
        if (this.usedPeriods.length > 0) {
          this.dataSource.data = this.dataSource.data.filter(
            (req: any) => this.usedPeriods.map( per => (per._id)).includes((req.idPeriodInscription))
          );            
        } else {
          this.dataSource.data = this.dataSource.data;
        }
      }else {
        this.dataSource.data = this.dataSource.data;
      }
    
  }
  
}
interface loggedStudents{
  fullName: string;
  controlNumber: string;
  career: string;
}
