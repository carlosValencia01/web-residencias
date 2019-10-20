import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { DropzoneComponent , DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

import { Router, ActivatedRoute } from '@angular/router';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/providers/shared/student.prov';


@Component({
  selector: 'app-inscriptions-upload-files-page',
  templateUrl: './inscriptions-upload-files-page.component.html',
  styleUrls: ['./inscriptions-upload-files-page.component.scss']  
})
export class InscriptionsUploadFilesPageComponent implements OnInit {

  data;

  activePeriod;
  folderId;
  foldersByPeriod=[];

  curpDoc;
  nssDoc;
  imageDoc;
  payDoc;
  certificateDoc;
  actaDoc;
  clinicDoc;
  
  /* Dropzone conf */
  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
  
  public config: DropzoneConfigInterface;
  public config1: DropzoneConfigInterface;
  public config2: DropzoneConfigInterface;
  public config3: DropzoneConfigInterface;
  public config4: DropzoneConfigInterface;
  public config5: DropzoneConfigInterface;
  public config6: DropzoneConfigInterface;

  dropzoneFileNameCERTIFICADO: any;
  dropzoneFileNameACTA: any;
  dropzoneFileNameCURP: any;
  dropzoneFileNameCOMPROBANTE: any;
  dropzoneFileNameANALISIS: any;
  dropzoneFileNamePhoto: any;
  dropzoneFileNameNSS: any;

  constructor(      
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionsProv: InscriptionsProvider,
    private studentProv: StudentProvider,
   
    ) {
      this.data = this.cookiesService.getData().user;
      if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
        this.router.navigate(['/']);
      }
      this.studentProv.refreshNeeded$.subscribe(
        ()=>{
          this.getDocuments();
        }
      )

      this.inscriptionsProv.getAllPeriods().subscribe(
        periods=>{
          this.activePeriod = periods.periods.filter( period=> period.active===true)[0];
          
          
          if(this.activePeriod){
            
            this.inscriptionsProv.getFoldersByPeriod(this.activePeriod._id).subscribe(
              folders=>{
                this.foldersByPeriod=folders.folders;
                if(this.foldersByPeriod.length>0){
                  this.checkFolders();
                  this.getDocuments();
                }
                
              },
              err=>{console.log(err,'==============error');
              }
            );
          }
        }
      )
      
  }
  ngOnInit() {            
  }

  getDocuments(){
    this.studentProv.getDriveDocuments(this.data._id).subscribe(
      docs=>{
        let documents = docs.documents;
       
        this.curpDoc = documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0];
        this.nssDoc = documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0];
        this.imageDoc = documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0];
        this.payDoc = documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0];
        this.certificateDoc = documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0];
        this.actaDoc = documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0];
        this.clinicDoc = documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0];
        
      }
    );
  }
  checkFolders(){
    let folderPeriod = this.foldersByPeriod.filter( folder=> folder.idPeriod.name.indexOf(this.activePeriod.name) !==-1 );
    //1 search career folder
    let folderCareer = this.foldersByPeriod.filter( folder=> folder.name === this.data.career);
    
    let folderStudentName = this.data.email+' - '+ this.data.name.fullName;
    
    if(folderCareer.length>0){
      // folder exists
      // 2 search folder by student
      let folderStudent = this.foldersByPeriod.filter( folder=> folder.name === folderStudentName);
      if(folderStudent.length > 0){
        // folder exists
        this.folderId = folderStudent[0].idFolderInDrive;
        this.assingConfigForDropzone();
      }else{
        // student folder doesn't exists then create new folder
        this.inscriptionsProv.createSubFolder(folderStudentName,this.activePeriod._id,folderCareer[0].idFolderInDrive).subscribe(
          studentF=>{
            this.folderId = studentF.folder.idFolderInDrive;
            this.assingConfigForDropzone();
          },
          err=>{console.log(err);
          }
        );
      }
    }else{
      // career folder doesn't exist then create it
      this.inscriptionsProv.createSubFolder(this.data.career,this.activePeriod._id,folderPeriod[0].idFolderInDrive).subscribe(
        career=>{
          
          // student folder doesn't exists then create new folder
          this.inscriptionsProv.createSubFolder(folderStudentName,this.activePeriod._id,career.folder.idFolderInDrive).subscribe(
            studentF=>{
              this.folderId = studentF.folder.idFolderInDrive;       
              this.assingConfigForDropzone();                     
            },
            err=>{console.log(err);
            }
          );
        },
        err=>{console.log(err);
        }
      );
    }
  }

  assingConfigForDropzone(){
    
    
    /*Dropzone*/
    this.config = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'CERTIFICADO.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameCERTIFICADO = file.name; done(); },
      acceptedFiles:'application/pdf',
         
    };

    this.config1 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-ACTA.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameACTA = file.name; done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config2 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-CURP.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameCURP = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config3 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-COMPROBANTE.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameCOMPROBANTE = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config4 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-CLINICOS.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameANALISIS = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config5 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-FOTO', 'mimeType': 'image/png,image/jpg'},
      accept: (file, done) => {this.dropzoneFileNamePhoto = file.name;done(); },      
      acceptedFiles: '.png,.jpg'
    };

    this.config6 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-NSS.pdf','mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameNSS = file.name;done(); },
        acceptedFiles:'application/pdf',        
    };
  }

  

  


  /*  DROPZONE 1 METHODS  */
  public resetDropzoneUploads(): void {
    this.componentRef.directiveRef.reset();
  }

  public onUploadSuccess(args: any): void {
    console.log(args);
    
    const documentInfo = {
      filename:args[1].name,
      type:'DRIVE',
      status:'EN PROCESO',
      fileIdInDrive:args[1].fileId
    };
    console.log(documentInfo);
    
    this.studentProv.uploadDocumentDrive(this.data._id,documentInfo).subscribe(
      updated=>{
            
        this.notificationsServices.showNotification(eNotificationType.SUCCESS,
          'Exito', 'Documento cargado correctamente.');
                
      },
      err=>{
        console.log(err);
        
      }
    );
  
  }  

  onDrop(event: DragEvent) {
    this.resetDropzoneUploads();
  }

  onError(args: any) {
    if (args[1] === `You can't upload files of this type.`) {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos con esa extensión! \nLas extensiones permitidas son .png y .jpeg");
    } else {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos tan pesados!\nEl límite es 3MB");      
    }
  }

  onErrorCommon(args: any) {
    this.resetDropzoneUploads();
    if (args[1] === `You can't upload files of this type.`) {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos con esa extensión!\n Las extensiones permitidas son .pdf");
     
    } else {
      this.notificationsServices.showNotification(eNotificationType.ERROR,
        '!ERROR!', "No se pueden subir archivos tan pesados!\nEl límite es 3MB");
    }
  }

  dropzoneClicked() {
    this.resetDropzoneUploads();
  }

  collapse(ev,disabled){
        
    let coll = document.getElementById(ev);        
    if(!disabled){
      if (coll.style.maxHeight){
        coll.style.maxHeight = null;
        coll.style.padding = null;
      } else {
        coll.style.maxHeight = (coll.scrollHeight +25)+ "px";
        coll.style.padding = '10px';
      }
    }else{
      coll.style.maxHeight = null;
      coll.style.padding = null;
    }
  }
}
