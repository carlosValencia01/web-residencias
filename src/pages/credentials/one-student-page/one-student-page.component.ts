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

  constructor(
    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private router: Router,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.getBase64ForStaticImages();
  }

  ngOnInit() {
    const _id = this.cookiesService.getData().user._id;
    this.loading = true;
    this.studentProv.getStudentById(_id)
      .subscribe(res => {
        this.showImg = false;
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0]));
        this.imgForSend = false;
        this.getImageFromService(res.student[0]._id);
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
    const id = this.currentStudent._id;
    const fd = new FormData();
    fd.append('image', this.croppedImage);

    this.loading = true;
    this.studentProv.updatePhoto(id, fd).subscribe((res) => {
      const data: any = res;
      this.currentStudent = data.student;
      this.imgForSend = false;
      this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Fotografía actualizada correctamente', '');

    }, error => {
      console.log(error);
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

    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.photoStudent = 'assets/imgs/imgNotFound.png';
        this.showImg = true;
      }
    }, () => this.loading = false);
  }

}
