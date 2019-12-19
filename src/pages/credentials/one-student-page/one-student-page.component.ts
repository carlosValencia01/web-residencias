import { Component, OnInit } from '@angular/core';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { ActivatedRoute, Router } from '@angular/router';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';

@Component({
  selector: 'app-one-student-page',
  templateUrl: './one-student-page.component.html',
  styleUrls: ['./one-student-page.component.scss']
})
export class OneStudentPageComponent implements OnInit {

  loading = false;
  showNotFound = false;
  showImg = false;
  frontBase64: any;
  backBase64: any;
  imageProfileTest: any;
  currentStudent: any;
  errorForm = false;
  photoStudent = '';
  imageToShow: any;
  errorInputsTag = {
    errorStudentFullName: false,
    errorStudentNumberControl: false,
    errorStudentNSS: false,
    errorStudentCareer: false,
  };
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBase64: any = '';
  imgForSend: boolean;
  closeResult: string;
  haveSubjects: boolean;
  selectedFile: File = null;
  imageDoc;
  data;

  activePeriod;
  folderId;
  foldersByPeriod = [];

  constructor(
    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private router: Router,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private inscriptionProv : InscriptionsProvider
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.getBase64ForStaticImages();
    this.data = this.cookiesService.getData().user;
    
    this.inscriptionProv.getActivePeriod().subscribe(
      period=>{
        if(period.period){
          this.getDocuments();
          this.activePeriod = period.period;                      
          this.studentProv.getPeriodId(this.data._id.toString()).subscribe(
            per=>{
              // console.log(per.student.idPeriodInscription, 'idperrrrr');              
              
              if(!per.student.idPeriodInscription){
                this.studentProv.updateStudent(this.data._id,{idPeriodInscription:this.activePeriod._id});
              }
            }
          );
          //first check folderId on Student model
          this.studentProv.getFolderId(this.data._id).subscribe(
            student=>{
              if(student.folder){// folder exists
                if(student.folder.idFolderInDrive){
                  this.folderId = student.folder.idFolderInDrive;
                  // console.log(this.folderId,'folder student exists');                     
                }
                else{ //folder doesn't exists then create it
                // console.log('222');
                
                  this.createFolder();
                }         
              } else{
                // console.log('333');
               this.createFolder();}
                
            });
        }
        else{ // no hay periodo activo
          // console.log('444');
          
        }    
      }  
    );
  }

  ngOnInit() {
    const _id = this.data._id;
    this.loading = true;
    this.studentProv.getStudentById(_id)
      .subscribe(res => {
        this.showImg = false;
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0]));
        this.imgForSend = false;
        // this.getImageFromService(res.student[0]._id);
      }, error => {
        console.log(error);
      }, () => this.loading = false);
  }

  // Generacion de PDF *************************************************************************************//#endregion

  getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/front.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back.jpg').then(res2 => {
      this.backBase64 = res2;
    });
  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128', displayValue: false });
    return canvas.toDataURL('image/png');
  }

  reduceCareerString(career: string): string {
    if (career.length < 33) {
      return career;
    }
    switch (career) {
      case 'DOCTORADO EN CIENCIAS DE ALIMENTOS':
        return 'DOC. EN CIENCIAS DE ALIMENTOS';

      case 'INGENIERÍA EN GESTIÓN EMPRESARIAL':
        return 'ING. EN GESTION EMPRESARIAL';

      case 'INGENIERÍA EN SISTEMAS COMPUTACIONALES':
        return 'ING. EN SISTEMAS COMPUTACIONALES';

      default:
        return 'ING. EN TEC. DE LA INF. Y COM.';
    }
  }

  // Cropper Image ***************************************************************************************************//#endregion

  showSelectFileDialog() {
    const input = document.getElementById('fileButton');
    input.click();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
    this.croppedImageBase64 = event.base64;
  }

  imageLoaded() {
    // show cropper
  }

  loadImageFailed() {
    // show message
  }

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

  getImage() {
    this.loading = true;
    this.studentProv.getProfileImage(this.currentStudent._id).subscribe(res => {
    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.photoStudent = 'assets/imgs/imgNotFound.png';
      }
    }, () => this.loading = false);
  }

  uploadFile() {
    this.loading = true;
    // console.log('upload');
    const red = new FileReader;
    

   
            // console.log(this.folderId,'folder student exists');
            red.addEventListener('load', () => {
              // console.log(red.result);
              let file = { mimeType: this.selectedFile.type, nameInDrive: this.data.email + '-FOTO.' + this.selectedFile.type.substr(6, this.selectedFile.type.length - 1), bodyMedia: red.result.toString().split(',')[1], folderId: this.folderId, newF: this.imageDoc ? false : true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive : '' };
        
              this.inscriptionProv.uploadFile2(file).subscribe(
                resp => {
                  if (resp.action == 'create file') {
        
                    const documentInfo = {
        
                      doc: {
                        filename: resp.name,
                        type: 'DRIVE',
                        fileIdInDrive: resp.fileId
                      },
                      status: {
                        name: 'EN PROCESO',
                        active: true,
                        message: 'Se subio foto de credencial por primera vez'
                      }
                    };
                    this.studentProv.uploadDocumentDrive(this.data._id, documentInfo).subscribe(
                      updated => {
                        this.notificationServ.showNotification(eNotificationType.SUCCESS,
                          'Exito', 'Foto cargada correctamente.');
        
                      },
                      err => {
                        console.log(err);
        
                      }, () => this.loading = false
                    );
                  } else {
        
                    const documentInfo = {
                      filename: resp.filename,
                      status: {
                        name: 'EN PROCESO',
                        active: true,
                        message: 'Se actualizo foto de credencial'
                      }
                    };
                    this.studentProv.updateDocumentStatus(this.data._id, documentInfo).subscribe(
                      res => {
                        this.notificationServ.showNotification(eNotificationType.SUCCESS,
                          'Exito', 'Foto actualizada correctamente.');
                      },
                      err => console.log(err)
                    );
                  }
                  this.loading = false;
                },
                err => {
                  console.log(err); this.loading = false;
                }
              )
            }, false);
            red.readAsDataURL(this.croppedImage);
         
    
  }

  // Zona de test :D *********************************************************************************************//#region

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToShow = reader.result;
      this.photoStudent = this.imageToShow;
      this.showImg = true;

    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImageFromService(id) {
    this.loading = true;
    this.studentProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);

    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.photoStudent = 'assets/imgs/imgNotFound.png';
        this.showImg = true;
      }
    }, () => this.loading = false);
  }
  getDocuments(){
    this.showImg=false;
    this.studentProv.getDriveDocuments(this.data._id).subscribe(
      docs=>{
        let documents = docs.documents;              
        this.imageDoc = documents.filter( docc => docc.filename.indexOf('FOTO') !== -1)[0];     
        console.log(
          '2'
        );
        this.showImg=true;
        if(this.imageDoc){

          this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive,this.imageDoc.filename).subscribe(
            succss=>{
              this.showImg=true;
              this.photoStudent = 'data:image/png;base64,' + succss.file;
            },
            err=>{this.photoStudent = 'assets/imgs/imgNotFound.png'; this.showImg=true;}
          );
        }else{
          console.log('1');
          
          this.loading = false
          this.photoStudent = 'assets/imgs/imgNotFound.png';
          this.showImg=true;
        }
      }
    );  
  }

  createFolder(){
    let folderStudentName = this.data.email+' - '+ this.data.name.fullName;
  
    this.inscriptionProv.getFoldersByPeriod(this.activePeriod._id,1).subscribe(
      (folders)=>{
        // console.log(folders,'folderss');
        
        this.foldersByPeriod=folders.folders;                                     
        let folderPeriod = this.foldersByPeriod.filter( folder=> folder.name.indexOf(this.activePeriod.periodName) !==-1);

        // 1 check career folder
        let folderCareer = this.foldersByPeriod.filter( folder=> folder.name === this.data.career);
        let folderStudent = this.foldersByPeriod.filter( folder=> folder.name === folderStudentName)[0];

        if(folderCareer.length===0){
          // console.log('1');
          
          this.inscriptionProv.createSubFolder(this.data.career,this.activePeriod._id,folderPeriod[0].idFolderInDrive,1).subscribe(
            career=>{
              // console.log('2');
              
              // student folder doesn't exists then create new folder
              this.inscriptionProv.createSubFolder(folderStudentName,this.activePeriod._id,career.folder.idFolderInDrive,1).subscribe(
                studentF=>{
                  this.folderId = studentF.folder.idFolderInDrive;                 
                  // console.log('3');
                  
                  this.studentProv.updateStudent(this.data._id,{folderId:studentF.folder._id});
                },
                err=>{console.log(err);
                }
              );
            },
            err=>{console.log(err);
            }
          );
        }else{
            this.inscriptionProv.createSubFolder(folderStudentName,this.activePeriod._id,folderCareer[0].idFolderInDrive,1).subscribe(
              studentF=>{
                this.folderId = studentF.folder.idFolderInDrive;   
                // console.log('3.1');
                
                this.studentProv.updateStudent(this.data._id,{folderId:studentF.folder._id}).subscribe(
                  upd=>{
                    
                    
                  },
                  err=>{
                  }
                );
                
              },
              err=>{console.log(err);
              }
            );         
        }
      },
      err=>{console.log(err,'==============error');
      }
    );
  }
}
