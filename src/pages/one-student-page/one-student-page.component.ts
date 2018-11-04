import { Component, OnInit } from '@angular/core';
import { StudentProvider } from '../../providers/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrorsService } from '../../services/forms.errors.service';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsServices } from '../../services/notifications.service';
import { CookiesService } from '../../services/cookie.service';

import * as jsPDF from 'jspdf';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';


@Component({
  selector: 'app-one-student-page',
  templateUrl: './one-student-page.component.html',
  styleUrls: ['./one-student-page.component.scss']
})
export class OneStudentPageComponent implements OnInit {

  loading: boolean = false;

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

  selectedFile: File = null;

  constructor(

    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    private modalService: NgbModal,
    private cookiesServ: CookiesService,
    private notificationServ: NotificationsServices
  ) {
    this.getBase64ForStaticImages();
  }

  ngOnInit() {
    const _id = this.cookiesServ.getData().user._id;
    this.loading=true;
    this.studentProv.getStudentById(_id)
      .subscribe(res => {
        this.showImg = false;
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0]));
        this.imgForSend = false;
        this.getImageFromService(res.student[0]._id);
      }, error => {
        console.log(error);
      }, ()=> this.loading=false);
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

  generatePDF() { // 'p', 'mm', [68,20]

    const student = this.currentStudent;

    if (student.filename) {
      this.loading=true;
      this.studentProv.getImageTest(student._id).subscribe(data => {

        const reader = new FileReader();
        reader.addEventListener('load', () => {
          // this.imageToShow = reader.result;

          this.imageToBase64Serv.getBase64(reader.result).then(res3 => {
            this.imageProfileTest = res3;

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

            doc.setFontSize(20);
            doc.setTextColor(255,255,255);
            doc.text(5,30, 'Muestra No Imprimible');

            doc.addPage();
            // // cara trasera de la credencial
            doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

            // // foto del estudiante

            // // Numero de control con codigo de barra
            doc.addImage(this.textToBase64Barcode(student.controlNumber), 'PNG', 46.8, 39.2, 33, 12);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(8);
            doc.text(57, 53.5, doc.splitTextToSize(student.controlNumber, 35));
            
            doc.setFontSize(20);
            doc.setTextColor(255,255,255);
            doc.text(5,30, 'Muestra No Imprimible');

            window.open(doc.output('bloburl'), '_blank');
          });
        }, false);

        if (data) {
          reader.readAsDataURL(data);
        }
      }, error => {
        console.log(error);
      }, ()=>this.loading=false);
    } else {
      this.notificationServ.showNotification(2, 'No cuenta con fotografía', '');
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
    }, ()=>this.loading=false);
  }

  uploadFile() {
    const id = this.currentStudent._id;
    const fd = new FormData();
    fd.append('image', this.croppedImage);

    this.loading=true;
    this.studentProv.updatePhoto(id, fd).subscribe(res => {
      this.currentStudent = res.student;
      this.imgForSend = false;
      this.notificationServ.showNotification(1, 'Fotografía actualizada correctamente', '');

    }, error => {
      console.log(error);
    }, () => this.loading=false);
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
    this.loading=true;
    this.studentProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);

    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.photoStudent = 'assets/imgs/imgNotFound.png';
        this.showImg = true;
      }
    },()=>this.loading=false);
  }

}
