import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { StudentProvider } from 'src/providers/shared/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrorsService } from 'src/services/app/forms.errors.service';
import { ImageToBase64Service } from 'src/services/app/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsServices } from 'src/services/app/notifications.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { ActivatedRoute, Router } from '@angular/router';
import * as jsPDF from 'jspdf';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { CookiesService } from 'src/services/app/cookie.service';
import { eNotificationType } from 'src/enumerators/app/notificationType.enum';
import { InscriptionsProvider } from 'src/providers/inscriptions/inscriptions.prov';

@Component({
  selector: 'app-student-page',
  templateUrl: './student-page.component.html',
  styleUrls: ['./student-page.component.scss']
})
export class StudentPageComponent implements OnInit {

  @ViewChild('searchinput') searchInput: ElementRef;

  loading = false;
  data: Array<any>;
  search: any;
  showTable = false;
  showNotFound = false;
  showForm = false;
  isNewStudent = false;
  haveImage = false;
  showImg = false;
  frontBase64: any;
  backBase64: any;
  imageProfileTest: any;
  currentStudent = {
    nss: '',
    fullName: '',
    career: '',
    _id: '',
    controlNumber: ''
  };
  formStudent: FormGroup;
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

  constructor(
    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    public formBuilder: FormBuilder,
    private formErrosrServ: FormErrorsService,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private hotkeysService: HotkeysService,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private inscriptionProv: InscriptionsProvider
  ) {
    this.getBase64ForStaticImages();
    this.cleanCurrentStudent();

    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }

    this.hotkeysService.add(new Hotkey('f1', (event: KeyboardEvent): boolean => {
      this.newStudent();
      return false; // Prevent bubbling
    }));
    this.hotkeysService.add(new Hotkey('f2', (event: KeyboardEvent): boolean => {
      this.hiddenFormDiv();
      return false; // Prevent bubbling
    }));
  }

  cleanCurrentStudent() {
    this.currentStudent = {
      nss: '',
      fullName: '',
      career: 'default',
      _id: '1',
      controlNumber: ''
    };
  }

  ngOnInit() {
    this.initializeForm();
  }

  // Formulario *************************************************************************************//#endregion
  initializeForm() {
    this.formStudent = this.formBuilder.group({
      'fullNameInput': ['', [Validators.required]],
      'numberControlInput': ['', [Validators.required]],
      'nssInput': ['', [Validators.required]]
    });
    this.searchInput.nativeElement.focus();
  }

  hiddenFormDiv() {
    this.formStudent.reset();
    this.errorForm = false;
    this.errorInputsTag.errorStudentFullName = false;
    this.errorInputsTag.errorStudentNumberControl = false;
    this.errorInputsTag.errorStudentNSS = false;
    this.errorInputsTag.errorStudentCareer = false;
    this.showForm = false;
  }

  newStudent() {
    this.isNewStudent = true;
    this.hiddenFormDiv();
    this.cleanCurrentStudent();
    this.photoStudent = 'assets/imgs/studentAvatar.png';
    this.showImg = true;
    this.imgForSend = false;
    this.showForm = true;
    this.haveImage = false;
  }

  newStudentData() {
    this.loading = true;

    const data = {
      controlNumber: this.formStudent.get('numberControlInput').value,
      fullName: this.formStudent.get('fullNameInput').value.toUpperCase(),
      career: this.currentStudent.career,
      nss: this.formStudent.get('nssInput').value
    };

    this.studentProv.newStudent(data).subscribe(res => {
      // if (this.imgForSend) {
      //   this.uploadFile(this.currentStudent._id, false);
      // } else {
      //   this.showForm = true;
      // }
      this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Alumno agregado correctamente', '');
      const student: any = res;

      this.currentStudent = student;
    }, error => {
      this.loading = false;
      this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error al guardar, intente nuevamente', '');
    }, () => this.loading = false);
  }

  showFormValues(student) {
    this.isNewStudent = false;
    this.showImg = false;
    this.currentStudent = JSON.parse(JSON.stringify(student));
    this.imgForSend = false;
    // console.log(student);
    this.getDocuments(student._id);

    // this.getImageFromService(student._id);

    this.formStudent.get('fullNameInput').setValue(student.fullName);
    this.formStudent.get('numberControlInput').setValue(student.controlNumber);
    this.formStudent.get('nssInput').setValue(student.nss);

    this.showForm = true;
  }

  // Generacion de PDF *************************************************************************************//#endregion

  getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/front.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back2.jpg').then(res2 => {
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

      case 'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN':
        return 'MAESTRÍA EN TEC. DE LA INFORMACIÓN';

      case 'MAESTRIA EN CIENCIAS DE ALIMENTOS':
        return 'MAEST. EN CIENCIAS DE ALIMENTOS';

      default:
        return 'ING. EN TEC. DE LA INF. Y COM.';
    }

  }

  generatePDF(student) { // 'p', 'mm', [68,20]

    if (student.nss) {
      this.loading = true;
      this.studentProv.verifyStatus(student.controlNumber)
        .subscribe(async res => {
          this.haveSubjects = res.status === 1 ? true : false;
          if (this.haveSubjects) {
            await this.getDocuments(student._id);

            if (this.photoStudent !== '' && this.photoStudent !== 'assets/imgs/studentAvatar.png') {
              const doc = new jsPDF({
                unit: 'mm',
                format: [251, 158], // Medidas correctas: [88.6, 56]
                orientation: 'landscape'
              });

              // cara frontal de la credencial
              doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);
              doc.addImage(this.photoStudent, 'PNG', 3.6, 7.1, 25.8, 31);

              doc.setTextColor(255, 255, 255);
              doc.setFontSize(7);
              doc.setFont('helvetica');
              doc.setFontType('bold');
              doc.text(49, 30.75, doc.splitTextToSize(student.fullName, 35));
              doc.text(49, 38.6, doc.splitTextToSize(this.reduceCareerString(student.career), 35));
              doc.text(49, 46.5, doc.splitTextToSize(student.nss, 35));

              doc.addPage();
              // // cara trasera de la credencial
              doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

              // // foto del estudiante

              // // Numero de control con codigo de barra
              doc.addImage(this.textToBase64Barcode(student.controlNumber), 'PNG', 46.8, 39.2, 33, 12);
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(8);
              doc.text(57, 53.5, doc.splitTextToSize(student.controlNumber, 35));
              // this.loading=false;
              window.open(doc.output('bloburl'), '_blank');
            } else {
              this.notificationServ.showNotification(eNotificationType.ERROR, 'No cuenta con fotografía', '');
            }
          } else {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'No tiene materias cargadas', '');
          }

        }, error => {
          if (error.status === 401) {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'No tiene materias cargadas', '');
          } else {
            this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error, intente nuevamente', '');
          }
          this.loading = false;
        }, () => this.loading = false);
    } else {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'No tiene NSS asignado', '');
    }
  }

  // Busqueda de estudiantes *************************************************************************************//#endregion

  searchStudent(showForm) {
    this.showForm = showForm;
    this.loading = true;
    this.studentProv.searchStudents(this.search).subscribe(res => {
      // console.log('res', res);
      this.data = res.students;

      if (this.data.length > 0) {
        this.showTable = true;
        this.showNotFound = false;
      } else {
        this.showTable = false;
        this.showNotFound = true;
      }

    }, err => {
    }, () => this.loading = false);
  }

  // Actualizacion de información basica (sin imagen) ************************************************************//#endregion

  formValidation(): boolean {
    let invalid = false;

    if (this.formStudent.invalid) {
      this.errorForm = true;
      this.formErrosrServ.getErros(this.formStudent).forEach(key => {
        switch (key.keyControl) {
          case 'fullNameInput':
            this.errorInputsTag.errorStudentFullName = true;
            break;

          case 'numberControlInput':
            this.errorInputsTag.errorStudentNumberControl = true;
            break;

          default:
            this.errorInputsTag.errorStudentNSS = true;
            break;
        }
      });
      invalid = true;
    }
    if (this.currentStudent.career === 'default') {
      this.errorInputsTag.errorStudentCareer = true;
      invalid = true;
    }

    return invalid;
  }

  updateStudentData() {
    this.isNewStudent = false;
    if (!this.formValidation()) {
      this.currentStudent.fullName = this.formStudent.get('fullNameInput').value.toUpperCase();
      this.currentStudent.controlNumber = this.formStudent.get('numberControlInput').value;
      this.currentStudent.career = this.currentStudent.career;
      this.currentStudent.nss = this.formStudent.get('nssInput').value;

      this.loading = true;
      this.studentProv.updateStudent(this.currentStudent._id, this.currentStudent).subscribe(res => {
        // if (this.imgForSend) {
        //   this.uploadFile(this.currentStudent._id, false);
        // } else {
        //   this.showForm = true;
        //   if (this.search) {
        //     this.searchStudent(true);
        //   }
        // }
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Alumno actualizado correctamente', '');
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error, inténtalo nuevamente', '');
      }, () => this.loading = false);
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

  getImage() {
    this.studentProv.getProfileImage(this.currentStudent._id).subscribe(res => {
      this.haveImage = true;
    }, error => {
      if (error.status === 404) {
        this.haveImage = false;
        this.photoStudent = 'assets/imgs/studentAvatar.png';
        this.showImg = true;
      }
    });
  }

  async uploadFile() {      
    this.loading = true;
    var folderId = await this.getFolderId(this.currentStudent._id);    
    
    // console.log('upload');
    const red = new FileReader;
       
            // console.log(this.folderId,'folder student exists');
            red.addEventListener('load', () => {
              // console.log(red.result);
              let file = { mimeType: this.selectedFile.type, nameInDrive: this.currentStudent.controlNumber + '-FOTO.jpg', bodyMedia: red.result.toString().split(',')[1], folderId: folderId, newF: this.imageDoc ? false : true, fileId: this.imageDoc ? this.imageDoc.fileIdInDrive : '' };
        
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
                    this.studentProv.uploadDocumentDrive(this.currentStudent._id, documentInfo).subscribe(
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
                    this.studentProv.updateDocumentStatus(this.currentStudent._id, documentInfo).subscribe(
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

  // Zona de test *********************************************************************************************//#region

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
      this.haveImage = true;
    }, error => {
      if (error.status === 404) {
        this.haveImage = false;
        this.photoStudent = 'assets/imgs/studentAvatar.png';
        this.showImg = true;
        this.loading = false;
      }
    }, () => this.loading = false);
  }

  async getDocuments(id) {
    this.photoStudent = '';
    this.imageDoc = null;
    this.showImg = false;

    // console.log('1')
    await this.studentProv.getDriveDocuments(id).toPromise().then(
      async docs => {
        let documents = docs.documents;
        if (documents) {

          this.imageDoc = documents.filter(docc => docc.filename.indexOf('png') !== -1 || docc.filename.indexOf('jpg') !== -1 ||  docc.filename.indexOf('PNG') !== -1 || docc.filename.indexOf('JPG') !== -1 ||  docc.filename.indexOf('jpeg') !== -1 || docc.filename.indexOf('JPEG') !== -1)[0];
          this.showImg = true;
          //console.log(this.imageDoc);
          //console.log(this.imageDoc.filename.substr(this.imageDoc.filename.length-3,this.imageDoc.filename.length));
          
          if (this.imageDoc) {
            // console.log('2');

            await this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive, this.imageDoc.filename).toPromise().then(
              succss => {
                this.showImg = true;
                // console.log('3');
                const extension = this.imageDoc.filename.substr(this.imageDoc.filename.length-3,this.imageDoc.filename.length);
                this.photoStudent = "data:image/"+extension+";base64,"+succss.file;
              },
              err => { this.photoStudent = 'assets/imgs/studentAvatar.png'; this.showImg = true; }
            );
          }
        } else {
          // console.log('1');

          // this.loading = false
          this.photoStudent = 'assets/imgs/studentAvatar.png';
          this.showImg = true;
        }
      }
    );
    // console.log('4');

  }

  async getFolderId(id){  
    
    var folderId='';
    await this.inscriptionProv.getActivePeriod().toPromise().then(
     async period=>{
        if(period.period){          
        
          this.studentProv.getPeriodId(id).toPromise().then(
            per=>{
              // console.log(per.student.idPeriodInscription, 'idperrrrr');              
              if(!per.student.idPeriodInscription){
                this.studentProv.updateStudent(id,{idPeriodInscription:period.period._id});
              }
            }
          );
          //first check folderId on Student model
         await this.studentProv.getFolderId(id).toPromise().then(
           async student=>{
              if(student.folder){// folder exists
                if(student.folder.idFolderInDrive){
                  folderId = student.folder.idFolderInDrive;
                  // console.log(this.folderId,'folder student exists');                     
                }                       
              } else{
                // console.log('333');
             folderId = await  this.createFolder(period.period);}
                
            });
        }
        else{ // no hay periodo activo
          // console.log('444');
          
        }    
      }  
    );
    return folderId;
  }
  async createFolder(period){
    let folderStudentName = this.currentStudent.controlNumber +' - '+ this.currentStudent.fullName;
    var foldersByPeriod,folderId;
    await this.inscriptionProv.getFoldersByPeriod(period._id,1).toPromise().then(
      async (folders)=>{
        // console.log(folders,'folderss');
        
        foldersByPeriod=folders.folders;                                     
        let folderPeriod = foldersByPeriod.filter( folder=> folder.name.indexOf(period.periodName) !==-1);

        // 1 check career folder
        let folderCareer = foldersByPeriod.filter( folder=> folder.name === this.currentStudent.career);
        // let folderStudent = this.foldersByPeriod.filter( folder=> folder.name === folderStudentName)[0];

        if(folderCareer.length===0){
          // console.log('1');
          
         await this.inscriptionProv.createSubFolder(this.currentStudent.career,period._id,folderPeriod[0].idFolderInDrive,1).toPromise().then(
           async career=>{
              // console.log('2');
              
              // student folder doesn't exists then create new folder
             await this.inscriptionProv.createSubFolder(folderStudentName,period._id,career.folder.idFolderInDrive,1).toPromise().then(
                studentF=>{
                  folderId = studentF.folder.idFolderInDrive;                 
                  // console.log('3');
                  
                  this.studentProv.updateStudent(this.currentStudent._id,{folderId:studentF.folder._id}).toPromise().then(res=>{},err=>{});
                },
                err=>{
                }
              );
            },
            err=>{
            }
          );
        }else{
           await this.inscriptionProv.createSubFolder(folderStudentName,period._id,folderCareer[0].idFolderInDrive,1).toPromise().then(
              studentF=>{
                folderId = studentF.folder.idFolderInDrive;   
                // console.log('3.1');
                
                this.studentProv.updateStudent(this.currentStudent._id,{folderId:studentF.folder._id}).toPromise().then(
                  upd=>{
                    
                    
                  },
                  err=>{
                  }
                );
                
              },
              err=>{
              }
            );         
        }
      },
      err=>{
      }
    );
    return folderId;
  }
}
