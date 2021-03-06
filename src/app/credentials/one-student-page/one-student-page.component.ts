import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { eFOLDER } from 'src/app/enumerators/shared/folder.enum';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { CareerProvider } from 'src/app/providers/shared/career.prov';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';

@Component({
  selector: 'app-one-student-page',
  templateUrl: './one-student-page.component.html',
  styleUrls: ['./one-student-page.component.scss']
})
export class OneStudentPageComponent implements OnInit {
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
  careers=[];

  active: boolean;
  student;

  constructor(
    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private router: Router,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
    private inscriptionProv : InscriptionsProvider,
    private careerProv: CareerProvider,
    private loadingService: LoadingService,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }

    this.getBase64ForStaticImages();
    this.data = this.cookiesService.getData().user;

    this.careerProv.getAllCareers().subscribe(
      (careers)=>{
        this.careers =careers.careers;

        this.init();
      }
    );

  }

  async init(){
    await this.studentProv.searchStudents(this.data.email+'').toPromise().then(
      (students)=>{
        this.student = students.students[0];
      }
    );

    this.inscriptionProv.getActivePeriod().subscribe(
      period=>{
        if(period.period){
          this.getDocuments();
          this.activePeriod = period.period;
          this.studentProv.getPeriodId(this.data._id.toString()).subscribe(
            per=>{
              if(!per.student.idPeriodInscription){
                this.studentProv.updateStudent(this.data._id,{idPeriodInscription:this.activePeriod._id}).subscribe(
                  f=>{}
                );
              }
            }
          );
          if(this.student.careerId){
            const career = this.careers.filter( career=> career._id == this.student.careerId)[0];
            this.data.career = career.fullName;
          }else if(this.student.career){
            const career = this.careers.filter( career=> career.fullName.indexOf(this.student.career) > -1 )[0];
            if(career){
              this.studentProv.updateStudent(this.data._id,{careerId:career._id}).subscribe(up=>{},err=>{});
            }else{ // error en la carrera
              return;
            }
          }

          //first check folderId on Student model
          this.studentProv.getDriveFolderId(this.data.email,eFOLDER.INSCRIPCIONES).toPromise().then(
            (folder)=>{
              this.folderId = folder.folderIdInDrive;
             });
        }
        else{ // no hay período activo

        }
      }
    );

  }
  ngOnInit() {
    const _id = this.data._id;
    this.loadingService.setLoading(true);
    this.studentProv.getStudentById(_id)
      .subscribe(res => {
        this.showImg = false;
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0]));
        this.imgForSend = false;
        this.active = true;
        // this.studentProv.verifyStatus(this.currentStudent.controlNumber).subscribe(res => {
        //   this.active =  res.status === 1 ? true : false;
        // }, err=>{this.active=false;});

        // this.getImageFromService(res.student[0]._id);
      }, error => {
        console.log(error);
      }, () => this.loadingService.setLoading(false));
  }

  // Generacion de PDF *************************************************************************************//#endregion

  getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/front45A.jpg').then(res1 => {
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
      case 'DOCTORADO EN CIENCIAS EN ALIMENTOS':
        return 'DOC. EN CIENCIAS EN ALIMENTOS';

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

  uploadFile() {
    this.loadingService.setLoading(true);
    const red = new FileReader;

    if(this.folderId){
      red.addEventListener('load', () => {
        let file = { mimeType: this.selectedFile.type, nameInDrive: this.data.email + '-FOTO.jpg', bodyMedia: red.result.toString().split(',')[1], folderId: this.folderId, newF: this.imageDoc ? false : true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive : '' };

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

                }, () => this.loadingService.setLoading(false)
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
            this.loadingService.setLoading(false);
          },
          err => {
            console.log(err);
            this.loadingService.setLoading(false);
          }
        )
      }, false);
      red.readAsDataURL(this.croppedImage);
    }



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
    this.loadingService.setLoading(true);
    this.studentProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);

    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.photoStudent = 'assets/imgs/studentAvatar.png';
        this.showImg = true;
      }
    }, () => this.loadingService.setLoading(false));
  }
  getDocuments(){
    this.showImg=false;
    this.studentProv.getDriveDocuments(this.data._id).subscribe(
      docs=>{
        let documents = docs.documents;
        if(documents){

          this.imageDoc = documents.filter(docc => docc.filename.indexOf('png') !== -1 || docc.filename.indexOf('jpg') !== -1 ||  docc.filename.indexOf('PNG') !== -1 || docc.filename.indexOf('JPG') !== -1 ||  docc.filename.indexOf('jpeg') !== -1 || docc.filename.indexOf('JPEG') !== -1)[0];
          if(this.imageDoc){

            this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive,this.imageDoc.filename).subscribe(
              succss=>{
                this.showImg=true;
                const extension = this.imageDoc.filename.substr(this.imageDoc.filename.length-3,this.imageDoc.filename.length);
                this.photoStudent = "data:image/"+extension+";base64,"+succss.file;
              },
              err=>{this.photoStudent = 'assets/imgs/studentAvatar.png'; this.showImg=true;}
            );
          }else{
            this.loadingService.setLoading(false);
            this.photoStudent = 'assets/imgs/studentAvatar.png';
            this.showImg=true;
          }
        }else{
          this.loadingService.setLoading(false);
          this.photoStudent = 'assets/imgs/studentAvatar.png';
          this.showImg=true;
        }
      }
    );
  }

}
