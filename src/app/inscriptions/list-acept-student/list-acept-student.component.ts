import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import TableToExcel from '@linways/table-to-excel';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { ReviewCredentialsComponent } from '../review-credentials/review-credentials.component';
import { StudentsExpedient } from 'src/app/interfaces/inscriptions.interface';
import { uInscription } from 'src/app/entities/inscriptions/inscriptions';
import { LoadingBarService } from 'ngx-loading-bar';

@Component({
  selector: 'app-list-acept-student',
  templateUrl: './list-acept-student.component.html',
  styleUrls: ['./list-acept-student.component.scss']
})
export class ListAceptStudentComponent implements OnInit {
  @Input('periods') periods: Array<any>;
  // periods = [];
  activPeriod;  
  
  rolName;
  
  students;
  listStudentsAcept;
  listCovers;
  credentialStudents;
  
  studentsForTable: Array<StudentsExpedient>;
  emptyUInscription: uInscription;
  searchCareer = '';
  searchControlNUmber = '';
  filteredStudents;
  readyToShowTable = {
    students: false,
    periods:false
  };
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
    this.getStudents();
    this.getPeriods();
    // this.getActivePeriod();    

  }
  
  ngOnInit() {
    setTimeout(() => {      
      this.emptyUInscription = new uInscription(this.imageToBase64Serv,this.cookiesService,this.inscriptionsProv);
    }, 300);
  }
  ngOnChanges(changes: SimpleChanges) { // cuando se actualiza algo en el padre  
    
    if(changes.periods){
      this.periods = changes.periods.currentValue ? changes.periods.currentValue : this.periods;
    }    
    this.readyToShowTable.periods = true;    
  }

  getStudents(){
    this.loadingBar.start();
    this.inscriptionsProv.getStudentsAcept().subscribe(res => {
      this.students = res.students;

      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.fatherLastName.localeCompare(b.fatherLastName);
      });
      this.listStudentsAcept = this.students;
      this.studentsForTable = this.listStudentsAcept.map( st=>(
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
      this.listCovers = this.listStudentsAcept;        
    });

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
        // this.periods=periods.periods;
        // this.periods.reverse();
        
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

  complete10Dig(number){
    var num = number.toString();
    while (num.length<10){
      num = '0'+num;
    }
    return(num);
  }

  getDateMov(){
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    if(month < 10){
      if(day < 10){
        return (`0${day}0${month}${year}`)
      }
      else{
        return (`${day}0${month}${year}`)
      }
    }else{
      if(day < 10){
        return (`0${day}${month}${year}`)
      } else{
        return (`${day}${month}${year}`)
      }
    }
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
  

  bufferToBase64(buffer) {
    return btoa(new Uint8Array(buffer).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
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

  setSearchCareer(career: string){
    this.searchCareer = career;
  }
  setSearchControlNumber(controlNumber: string){
    this.searchControlNUmber = controlNumber;
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
