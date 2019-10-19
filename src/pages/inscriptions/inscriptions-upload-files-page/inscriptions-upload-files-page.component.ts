import { Component, OnInit, ViewChild } from '@angular/core';
import { WizardService } from 'src/services/inscriptions/wizard.service';
import { UploadFilesService } from 'src/services/inscriptions/upload-files.service';
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

  files: File[] = [];

  /* Dropzone conf */
  public type = 'component';
  public config: DropzoneConfigInterface;
  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;

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
      if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
        this.router.navigate(['/']);
      }
      
  }

  ngOnInit() {
    this.data = this.cookiesService.getData();
        
    /*Dropzone*/
    this.config = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'CERTIFICADO.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameCERTIFICADO = file.name; done(); },
      acceptedFiles:'application/pdf',
         
    };

    this.config1 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'-ACTA.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameACTA = file.name; done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config2 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'-CURP.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameCURP = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config3 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'-COMPROBANTE.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameCOMPROBANTE = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config4 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'-CLINICOS.pdf', 'mimeType': 'application/pdf'},
      accept: (file, done) => {this.dropzoneFileNameANALISIS = file.name;done(); },
        acceptedFiles:'application/pdf',
        
    };

    this.config5 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'-FOTO', 'mimeType': 'image/png,image/jpg'},
      accept: (file, done) => {this.dropzoneFileNamePhoto = file.name;done(); },      
      acceptedFiles: '.png,.jpg'
    };

    this.config6 = {
      clickable: true, maxFiles: 2,
      params: {'usuario': this.data.user.name.fullName,folderId:'1c4yRsfS6zYphqDWuIHHHDNzPlI5bJPyL', 'filename': this.data.user.email+'-NSS.pdf','mimeType': 'application/pdf'},
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
      filename:args.name,
      type:'DRIVE',
      status:'En proceso',
      fileIdInDrive:args.fileId
    };
    this.studentProv.uploadDocumentDrive(this.data.user._id,documentInfo).subscribe(
      updated=>{
        console.log(updated);        
        this.notificationsServices.showNotification(eNotificationType.SUCCESS,
          'Exito', 'Documento cargado correctamente.');
                
      },
      err=>{
        console.log(err);
        
      }
    );
  
  }

  createFolder(){
    this.inscriptionsProv.createFolder('test2').subscribe(
      res=>{
        console.log(res);
        
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

}
