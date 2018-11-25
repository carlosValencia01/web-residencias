import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { StudentProvider } from '../../providers/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrorsService } from '../../services/forms.errors.service';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsServices } from '../../services/notifications.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

import * as jsPDF from 'jspdf';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';

@Component({
  selector: 'app-student-page',
  templateUrl: './student-page.component.html',
  styleUrls: ['./student-page.component.scss']
})
export class StudentPageComponent implements OnInit {

  @ViewChild("searchinput") searchInput: ElementRef;

  loading: boolean = false;
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

  selectedFile: File = null;

  constructor(
    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    public formBuilder: FormBuilder,
    private formErrosrServ: FormErrorsService,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private hotkeysService: HotkeysService
  ) {
    this.getBase64ForStaticImages();
    this.cleanCurrentStudent();

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
    // console.log('Current Student' + this.currentStudent);
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
      if (this.imgForSend) {
        this.uploadFile(this.currentStudent._id, false);
      } else {
        this.showForm = true;
        this.notificationServ.showNotification(1, 'Alumno agregado correctamente', '');
      }
      const student: any = res;

      this.currentStudent = student;
    }, error => {
      console.log(error);
      this.loading = false;
      this.notificationServ.showNotification(2, "Ocurrió un error al guardar, intente nuevamente", '');
    }, () => this.loading = false);
  }

  showFormValues(student) {
    this.isNewStudent = false;
    this.showImg = false;
    this.currentStudent = JSON.parse(JSON.stringify(student));
    this.imgForSend = false;

    this.getImageFromService(student._id);

    this.formStudent.get('fullNameInput').setValue(student.fullName);
    this.formStudent.get('numberControlInput').setValue(student.controlNumber);
    this.formStudent.get('nssInput').setValue(student.nss);

    this.showForm = true;
  }

  // Generacion de PDF *************************************************************************************//#endregion

  getBase64ForStaticImages() {
    // console.log(this.studentProv.getApiURL());

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

  generatePDF(student) { // 'p', 'mm', [68,20]
    // console.log(student);
    if (student.filename) {
      this.loading = true;
      this.studentProv.getImageTest(student._id).subscribe(data => {

        const reader = new FileReader();
        reader.addEventListener('load', () => {
          // this.imageToShow = reader.result;

          this.imageToBase64Serv.getBase64(reader.result).then(res3 => {
            this.imageProfileTest = res3;
            // console.log(this.imageProfileTest);

            const doc = new jsPDF({
              unit: 'mm',
              format: [88.6, 56],
              orientation: 'landscape'
            });
            // cara frontal de la credencial
            doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);
            doc.addImage(this.imageProfileTest, 'JPEG', 3.6, 7.1, 25.8, 31);

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
            window.open(doc.output('bloburl'), '_blank');
          });
        }, false);
        if (data) {
          reader.readAsDataURL(data);
        }
      }, error => {
        console.log(error);
      }, () => this.loading = false);
    } else {
      this.notificationServ.showNotification(2, 'No cuenta con fotografía', '');
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
      console.log('err', err);
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
        if (this.imgForSend) {
          // console.log('Hay una foto que enviar');
          this.uploadFile(this.currentStudent._id, false);
        } else {
          // console.log('No hay foto que enviar');
          this.showForm = true;
          if (this.search)
            this.searchStudent(true);
          this.notificationServ.showNotification(1, 'Alumno actualizado correctamente', '');
        }
      }, error => {
        // console.log(error);
        this.notificationServ.showNotification(2, 'Ocurrió un error, inténtalo nuevamente', '');
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
    // console.log('Event', event.file);
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

        const showForm = this.isNewStudent;

        this.uploadFile(this.currentStudent._id, showForm);
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
      // console.log(res);
      this.haveImage = true;
    }, error => {
      // console.log(error);
      if (error.status === 404) {
        // console.log('No tiene imagen');
        this.haveImage = false;
        this.photoStudent = 'assets/imgs/studentAvatar.png';
        this.showImg = true;
      }
    });
  }

  uploadFile(id, showForm) {
    const fd = new FormData();
    fd.append('image', this.croppedImage);
    this.loading = true;
    this.studentProv.updatePhoto(id, fd).subscribe(res => {
      // console.log(res);
      const student: any = res;
      this.currentStudent = student.student;

      this.imgForSend = false;
      this.showForm = showForm;
      if (this.search)
        this.searchStudent(true);
      this.notificationServ.showNotification(1, 'Fotografía actualizada correctamente', '');
      this.haveImage = true;
    }, error => {
      // console.log(error);
      this.notificationServ.showNotification(2, 'Ocurrió un error, inténtalo nuevamente', '');
    }, () => this.loading = false);
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
      this.haveImage = true;
    }, error => {
      console.log(error);
      if (error.status === 404) {
        // console.log('No tiene imagen');
        this.haveImage = false;
        this.photoStudent = 'assets/imgs/studentAvatar.png';
        this.showImg = true;
        this.loading = false;
      }
    }, () => this.loading = false);
  }
}
