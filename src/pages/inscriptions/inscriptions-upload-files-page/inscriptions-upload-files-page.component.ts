import { Component, OnInit, ViewChild} from '@angular/core';
import { DropzoneComponent , DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Router, ActivatedRoute } from '@angular/router';

import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { DocumentsHelpComponent } from 'src/modals/inscriptions/documents-help/documents-help.component';

import { MatStepper } from '@angular/material/stepper';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-inscriptions-upload-files-page',
  templateUrl: './inscriptions-upload-files-page.component.html',
  styleUrls: ['./inscriptions-upload-files-page.component.scss']  
})
export class InscriptionsUploadFilesPageComponent implements OnInit {
  _idStudent: String;
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
  pdfSrc;
  pub;
  image;

  selectedFile: File = null;
  imageChangedEvent: any = '';
  closeResult: string;
  photoStudent = '';
  imgForSend: boolean;
  croppedImage: any = '';
  croppedImageBase64: any = '';
  loading: boolean;
  currentStudent = {
    nss: '',
    fullName: '',
    career: '',
    _id: '',
    controlNumber: ''
  };
  search: any;
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
    private stepper: MatStepper,
    private modalService: NgbModal,
    private dialog : MatDialog
   
    ) {
      this.data = this.cookiesService.getData().user;
      if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
        this.router.navigate(['/']);
      }
      this.studentProv.refreshNeeded$.subscribe(
        ()=>{
          this.getDocuments();
        }
      );
      this.getDocuments();     
      this.getIdStudent();      
  }
  ngOnInit() {        
       
  }

  getIdStudent() {
    this.data = this.cookiesService.getData().user;
    this._idStudent = this.data._id;
  }


  getDocuments(){
    this.studentProv.getDriveDocuments(this.data._id).subscribe(
      docs=>{
        let documents = docs.documents;
        // console.log(documents);
       
        this.curpDoc = documents.filter( docc => docc.filename.indexOf('CURP') !== -1)[0];
        this.nssDoc = documents.filter( docc => docc.filename.indexOf('NSS') !== -1)[0];
        this.imageDoc = documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0];
        this.payDoc = documents.filter( docc => docc.filename.indexOf('COMPROBANTE') !== -1)[0];
        this.certificateDoc = documents.filter( docc => docc.filename.indexOf('CERTIFICADO') !== -1)[0];
        this.actaDoc = documents.filter( docc => docc.filename.indexOf('ACTA') !== -1)[0];
        this.clinicDoc = documents.filter( docc => docc.filename.indexOf('CLINICOS') !== -1)[0];
      
        if(this.imageDoc) this.imageDoc.status = this.imageDoc ? this.imageDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.curpDoc) this.curpDoc.status = this.curpDoc ? this.curpDoc.status.filter( st=> st.active===true)[0].name : '';
        
       if(this.actaDoc) this.actaDoc.status = this.actaDoc ? this.actaDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.clinicDoc) this.clinicDoc.status = this.clinicDoc ? this.clinicDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.certificateDoc) this.certificateDoc.status = this.certificateDoc ? this.certificateDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.payDoc) this.payDoc.status = this.payDoc ? this.payDoc.status.filter( st=> st.active===true)[0].name : '';

       if(this.nssDoc) this.nssDoc.status = this.nssDoc ? this.nssDoc.status.filter( st=> st.active===true)[0].name : '';
      
        this.checkFolders();
                
        if(this.imageDoc){
          this.inscriptionsProv.getFile(this.imageDoc.fileIdInDrive,this.imageDoc.filename).subscribe(
            succss=>{              
              this.photoStudent = 'data:image/png;base64,' + succss.file;
            },
            err=>{this.photoStudent = 'assets/imgs/imgNotFound.png';}
          )
        }else{
          this.photoStudent = 'assets/imgs/imgNotFound.png';
        }
      }
    );
  }
  checkFolders(){
    console.log(this._idStudent
      );
    
    this.studentProv.getFolderId(this._idStudent).subscribe(
      folder=>{
        // console.log(folder,'asldaosfhasjfnksjdfnlkasnfjnk');
        
        if(folder.folder){// folder exists
          if(folder.folder.idFolderInDrive){
            this.folderId = folder.folder.idFolderInDrive;
            // console.log(this.folderId,'folder student exists');
            this.assingConfigForDropzone();          
          }
        }
      });
  }

  assingConfigForDropzone(){        
        
    /*Dropzone*/
    this.config = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-CERTIFICADO.pdf', 'mimeType': 'application/pdf',newF: this.certificateDoc ? false : true, fileId: this.certificateDoc ? this.certificateDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNameCERTIFICADO = file.name; done(); },
      acceptedFiles:'application/pdf',
         
    };

    this.config1 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-ACTA.pdf', 'mimeType': 'application/pdf', newF: this.actaDoc ? false:true, fileId: this.actaDoc ? this.actaDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNameACTA = file.name; done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config2 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-CURP.pdf', 'mimeType': 'application/pdf', newF: this.curpDoc ? false:true, fileId: this.curpDoc ? this.curpDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNameCURP = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config3 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-COMPROBANTE.pdf', 'mimeType': 'application/pdf', newF: this.payDoc ? false:true, fileId: this.payDoc ? this.payDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNameCOMPROBANTE = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config4 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-CLINICOS.pdf', 'mimeType': 'application/pdf', newF: this.clinicDoc ? false:true, fileId: this.clinicDoc ? this.clinicDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNameANALISIS = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config5 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-FOTO', 'mimeType': 'image/png,image/jpg', newF: this.imageDoc ? false:true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNamePhoto = file.name;done(); },      
      acceptedFiles: '.png,.jpg'
    };

    this.config6 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.name.fullName,folderId:this.folderId, 'filename': this.data.email+'-NSS.pdf','mimeType': 'application/pdf', newF: this.nssDoc ? false:true,fileId: this.nssDoc ? this.nssDoc.fileIdInDrive:''},
      accept: (file, done) => {this.dropzoneFileNameNSS = file.name;done(); },
        acceptedFiles:'application/pdf',        
    };
  }

  

  


  /*  DROPZONE 1 METHODS  */
  public resetDropzoneUploads(): void {
    this.componentRef.directiveRef.reset();    
  }

  public onUploadSuccess(args: any): void {

    // console.log(args);
    if(args[1].action == 'create file'){

      const documentInfo = {      
        doc:{
          filename:args[1].name,
          type:'DRIVE',      
          fileIdInDrive:args[1].fileId,
        },
          status : {
          name:'EN PROCESO',
          active:true,
          message:'Se envio por primera vez'
        }
      };
      // console.log(documentInfo);
      
      this.studentProv.uploadDocumentDrive(this.data._id,documentInfo).subscribe(
        updated=>{
              
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
            'Exito', 'Documento cargado correctamente.');
            
        },
        err=>{
          console.log(err);
          
        }
      );
    }else{
      const documentInfo = {      
          filename:args[1].name,        
          status : {
          name:'EN PROCESO',
          active:true,
          message:'Se actualizo el documento'
        }
      };
      this.studentProv.updateDocumentStatus(this.data._id,documentInfo).subscribe(
        res=>{
          this.notificationsServices.showNotification(eNotificationType.SUCCESS,
          'Exito', 'Documento actualizado correctamente.');
        },
        err=>console.log(err)
      );
    }
    this.resetDropzoneUploads();
  
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

  

  collapse(ev,disabled){
        
    let coll = document.getElementById(ev);        
    if (coll.style.maxHeight){
      coll.style.maxHeight = null;
      coll.style.padding = null;
    } else {
      coll.style.maxHeight = coll.scrollHeight+80 + "px";
      coll.style.padding = '10px';
    }
    // if(!disabled){
    // }else{
    //   coll.style.maxHeight = null;
    //   coll.style.padding = null;
    // }
  }

  

  async continue() {
    var newStep = { stepWizard: 3 }
    this.loading=true;
    await this.inscriptionsProv.updateStudent(newStep, this._idStudent.toString()).subscribe(res => {
      this.loading=false;
      this.stepper.next();
      //window.location.assign("/wizardInscription");

    });
  }

  onErrored(error: any) {
    // do anything
    // console.log(error);    
  }

  /*Se lanza cuando se cambia la foto*/
  fileChangeEvent(event: any, content) {
    if (event) {
      this.selectedFile = <File>event.target.files[0];
            
      this.imageChangedEvent = event;

      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;

        this.photoStudent = this.croppedImageBase64;
        this.imgForSend = true;        

        this.uploadFile();
        event.target.value = '';
      }, (reason) => {
        event.target.value = '';
        this.imgForSend = false;
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  showSelectFileDialog() {
    const input = document.getElementById('fileButton');
    input.click();
  }
  uploadFile() {
    this.loading = true; 
    // console.log('upload');
    const red = new FileReader;
    red.addEventListener('load', () => {      
      // console.log(red.result);
      let file = { mimeType:this.selectedFile.type, nameInDrive:this.data.email+'-FOTO.'+this.selectedFile.type.substr(6,this.selectedFile.type.length-1), bodyMedia:red.result.toString().split(',')[1], folderId:this.folderId, newF: this.imageDoc ? false:true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive:''};
      
      this.inscriptionsProv.uploadFile2(file).subscribe(
        resp=>{
          if(resp.action == 'create file'){
            
            const documentInfo = {
              
              doc:{
                filename:resp.name,
                type:'DRIVE',                
                fileIdInDrive:resp.fileId
              },
              status : {
                name:'EN PROCESO',
                active:true,
                message:'Se envio por primera vez'
              }            
            };
            this.studentProv.uploadDocumentDrive(this.data._id,documentInfo).subscribe(
              updated=>{                
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,
                  'Exito', 'Documento cargado correctamente.');
                        
              },
              err=>{
                console.log(err);
                
              },()=>this.loading=false
            );
          }else{            
            
            const documentInfo = {      
                filename:resp.filename,        
                status : {
                name:'EN PROCESO',
                active:true,
                message:'Se actualizo el documento'
              }
            };
            this.studentProv.updateDocumentStatus(this.data._id,documentInfo).subscribe(
              res=>{
                this.notificationsServices.showNotification(eNotificationType.SUCCESS,
                'Exito', 'Documento actualizado correctamente.');
              },
              err=>console.log(err)
            );            
          }
          this.loading = false; 
        },
        err=>{console.log(err); this.loading = false; 
        }
      )
    }, false);
    red.readAsDataURL(this.croppedImage);    
    
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
    this.croppedImageBase64 = event.base64;
    // console.log('crop');
    
  }
  imageLoaded() {
    // show cropper
  }
  help(document : string){
    const linkModal = this.dialog.open(DocumentsHelpComponent, {
      data: {
        document: document
      },
      disableClose: true,
      hasBackdrop: true,
      width: '60em',
      height: '500px'
    });
  }
}
