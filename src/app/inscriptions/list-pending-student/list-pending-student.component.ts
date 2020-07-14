import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
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
import Swal from 'sweetalert2';
import { StudentsExpedient } from 'src/app/interfaces/inscriptions.interface';
import { uInscription } from 'src/app/entities/inscriptions/inscriptions';
import { LoadingBarService } from 'ngx-loading-bar';

@Component({
  selector: 'app-list-pending-student',
  templateUrl: './list-pending-student.component.html',
  styleUrls: ['./list-pending-student.component.scss']
})
export class ListPendingStudentComponent implements OnInit {
  @Output() countStudentsEmit = new EventEmitter();
  @Input('periods') periods: Array<any>;
  students;
  listStudentsPending;
  // periods = [];

  rolName;

  studentsForTable: Array<StudentsExpedient>;
  emptyUInscription: uInscription;
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
    this.inscriptionsProv.getStudentsPendant().subscribe(res => {
      this.students = res.students;

      // Ordenar Alumnos por Apellidos
      this.students.sort(function (a, b) {
        return a.fatherLastName.localeCompare(b.fatherLastName);
      });
      this.listStudentsPending = this.students;
      this.studentsForTable = this.listStudentsPending.map( st=>(
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

  


  getPeriods(){
    let sub = this.inscriptionsProv.getAllPeriods()
      .subscribe(periods => {
        // this.periods=periods.periods;
        // this.periods.reverse();
       
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
        // let document = doc.output('arraybuffer');
        // let binary = this.bufferToBase64(document);

        // this.updateDocument(binary,student);
        window.open(doc.output('bloburl'), '_blank');
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
  
  updateExpedientStatus(student){
    this.getStudents();
    this.countStudentsEmit.emit(true);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
