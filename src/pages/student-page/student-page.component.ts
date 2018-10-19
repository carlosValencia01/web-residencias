import { Component, OnInit } from '@angular/core';
import { StudentProvider } from '../../providers/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrorsService } from '../../services/forms.errors.service';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsServices } from '../../services/notifications.service';


import * as jsPDF from 'jspdf';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';





@Component({
  selector: 'app-student-page',
  templateUrl: './student-page.component.html',
  styleUrls: ['./student-page.component.scss']
})
export class StudentPageComponent implements OnInit {

  data: Array<any>;
  search: any;
  showTable = false;
  showNotFound = false;
  showForm = false;

  showImg = false;

  frontBase64: any;
  backBase64: any;

  imageProfileTest: any;

  currentStudent: any;

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
    private notificationServ: NotificationsServices
  ) {
    this.getBase64ForStaticImages();
  }

  ngOnInit() {
    // this.getAllStundets();
    this.initializeForm();
  }

  // Formulario *************************************************************************************//#endregion

  initializeForm() {
    this.formStudent = this.formBuilder.group({
      'fullNameInput': ['', [Validators.required]],
      'numberControlInput': ['', [Validators.required]],
      'nssInput': ['', [Validators.required]]
    });
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

  showFormValues(student) {
    // this.dataPresentation = JSON.parse(JSON.stringify(this.navParams.data));

    this.showImg = false;

    this.currentStudent = JSON.parse(JSON.stringify(student));

    this.imgForSend = false;

    // this.getImage();
    this.getImageFromService(student._id);

    this.formStudent.get('fullNameInput').setValue(student.fullName);
    this.formStudent.get('numberControlInput').setValue(student.controlNumber);
    this.formStudent.get('nssInput').setValue(student.nss);

    this.showForm = true;
  }

  // Generacion de PDF *************************************************************************************//#endregion

  getBase64ForStaticImages() {
    console.log(this.studentProv.getApiURL());

    this.imageToBase64Serv.getBase64('assets/imgs/front.png').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back.png').then(res2 => {
      this.backBase64 = res2;
    });

    // tslint:disable-next-line:max-line-length
    // this.imageToBase64Serv.getBase64('https://scontent.fmex5-1.fna.fbcdn.net/v/t1.0-9/1422436_10208416015382578_1208990774892394279_n.jpg?_nc_cat=103&oh=4dcba2f2a85aebc412aa74819eb1b8f0&oe=5C5A26F9').then(res3 => {
    //   this.imageProfileTest = res3;
    // });
  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE39' });
    return canvas.toDataURL('image/png');
  }

  reduceCareerString(career: string): string {
    if (career.length < 33) {
      return career;
    }

    switch (career) {
      case 'DOCTORADO EN CIENCIAS DE ALIMENTOS':
        return 'DOC. EN CIENCIAS DE ALIMENTOS';

      case 'INGENIERIA EN GESTION EMPRESARIAL':
        return 'ING. EN GESTION EMPRESARIAL';


      case 'INGENIERIA EN SISTEMAS COMPUTACIONALES':
        return 'ING. EN SISTEMAS COMPUTACIONALES';

      default:
        return 'ING. EN TEC. DE LA INF. Y COM.';
    }

  }

  generatePDF(student) { // 'p', 'mm', [68,20]

    if (student.filename) {
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
            doc.addImage(this.imageProfileTest, 'JPEG', 3.4, 6.8, 28.1, 31);

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text(49, 30.75, doc.splitTextToSize(student.fullName, 35));
            doc.text(49, 38.4, doc.splitTextToSize(this.reduceCareerString(student.career), 35));
            doc.text(49, 46, doc.splitTextToSize(student.nss, 35));

            doc.addPage();
            // // cara trasera de la credencial
            doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

            // // foto del estudiante

            // // Numero de control con codigo de barra
            doc.addImage(this.textToBase64Barcode(student.controlNumber), 'PNG', 46, 43, 33, 11);

            // doc.save(`${student._id}.pdf`);

            // doc.output('dataurlnewwindow');

            // const stringPDF = doc.output('datauristring');

            // console.log(encodeURI(stringPDF));

            // window.open('data:application/pdf;base64, ' + stringPDF);

            // this.notificationServ.showNotification(1, 'Credencial creada correctamente', '');

            // const blob = doc.output('blob');
            // window.open(URL.createObjectURL(blob));

            window.open(doc.output('bloburl'), '_blank');


          });
        }, false);

        if (data) {
          reader.readAsDataURL(data);
        }


      }, error => {
        console.log(error);
      });
    } else {
      console.log('tal parece que no tiene foto este registro');
      this.notificationServ.showNotification(2, 'No cuenta con fotografia', '');

    }


  }

  // Busqueda de estudiantes *************************************************************************************//#endregion

  searchStudent() {
    this.studentProv.searchStudents(this.search).subscribe(res => {
      console.log('res', res);
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
    });
  }

  // Actualizacion de información basica (sin imagen) ************************************************************//#endregion

  formValidation(): boolean {
    let invalid = false;

    console.log('Se esta ejecutando formValidation');


    if (this.formStudent.invalid) {
      // console.log('formStuden es invalido');
      this.errorForm = true;
      this.formErrosrServ.getErros(this.formStudent).forEach(key => {
        // console.log(key);

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
      console.log('entro a la carrera', this.currentStudent.career);

      this.errorInputsTag.errorStudentCareer = true;
      invalid = true;
    }

    return invalid;
  }

  updateStudentData() {
    console.log('Estoy ejecutando la funcion');
    if (!this.formValidation()) {
      console.log('Entro al IF');
      const data = {
        controlNumber: this.formStudent.get('numberControlInput').value,
        fullName: this.formStudent.get('fullNameInput').value,
        career: this.currentStudent.career,
        nss: this.formStudent.get('nssInput').value
      };

      this.studentProv.updateStudent(this.currentStudent._id, data).subscribe(res => {
        console.log(res);

        if (this.imgForSend) {
          console.log('Hay una foto que enviar');
          this.uploadFile(this.currentStudent._id);
        } else {
          console.log('No hay foto que enviar');
          this.showForm = false;
          this.searchStudent();
          this.notificationServ.showNotification(1, 'Alumno actualizado correctamente', '');
        }


      }, error => {
        console.log(error);
      });

    }


  }

  // Cropper Image ***************************************************************************************************//#endregion

  showSelectFileDialog() {
    console.log('Click detectado');
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





























  fileChangeEvent(event: any, content) {
    console.log(event);

    if (event) {
      this.selectedFile = <File>event.target.files[0];

      this.imageChangedEvent = event;

      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;

        this.photoStudent = this.croppedImageBase64;
        this.imgForSend = true;

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
      console.log(res);
    }, error => {
      console.log(error);
      if (error.status === 404) {
        console.log('No tiene imagen');
        this.photoStudent = 'assets/imgs/imgNotFound.png';
      }
    });
  }



  uploadFile(id) {
    // const blob = new Blob([this.photoStudent], { type: 'image/jpg' });
    // const file = new File([blob], 'test.jpg');

    // const file = new File([this.croppedImage], 'test.jpg');

    const fd = new FormData();
    fd.append('image', this.croppedImage);

    this.studentProv.updatePhoto(id, fd).subscribe(res => {
      console.log(res);
      this.imgForSend = false;
      this.showForm = false;
      this.searchStudent();
      this.notificationServ.showNotification(1, 'Alumno actualizado correctamente', '');

    }, error => {
      console.log(error);
    });
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
    this.studentProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);

    }, error => {
      console.log(error);
      if (error.status === 404) {
        console.log('No tiene imagen');
        this.photoStudent = 'assets/imgs/imgNotFound.png';
        this.showImg = true;
      }
    });
  }



}
