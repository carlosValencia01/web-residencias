import {ActivatedRoute, Router} from '@angular/router';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Hotkey, HotkeysService} from 'angular2-hotkeys';
import {ImageCroppedEvent} from 'ngx-image-cropper/src/image-cropper.component';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as jsPDF from 'jspdf';

import {CookiesService} from 'src/services/app/cookie.service';
import {EmployeeProvider} from 'src/providers/shared/employee.prov';
import {eNotificationType} from 'src/enumerators/app/notificationType.enum';
import {FormErrorsService} from 'src/services/app/forms.errors.service';
import {IEmployee} from 'src/entities/shared/employee.model';
import {ImageToBase64Service} from 'src/services/app/img.to.base63.service';
import {IPosition} from 'src/entities/shared/position.model';
import {NotificationsServices} from 'src/services/app/notifications.service';

@Component({
  selector: 'app-card-employee-page',
  templateUrl: './card-employee-page.component.html',
  styleUrls: ['./card-employee-page.component.scss']
})
export class CardEmployeePageComponent implements OnInit {
  @ViewChild('searchinput') searchInput: ElementRef;
  public employee: IEmployee;
  public loading = false;
  public search: any;
  public showTable = false;
  public showNotFound = false;
  public showNotFoundPositions = false;
  public showForm = false;
  public isNewEmployee = false;
  public haveImage = false;
  public showImg = false;
  public formEmployee: FormGroup;
  public errorForm = false;
  public photoEmployee = '';
  public errorInputsTag = {
    errorEmployeeLastName: false,
    errorEmployeeFirstName: false,
    errorEmployeeRFC: false,
    errorEmployeeArea: false,
    errorEmployeeCareer: false,
    errorEmployeePosition: false,
  };
  public imageChangedEvent: any = '';
  private currentPosition: IPosition;
  private frontBase64: any;
  private backBase64: any;
  private imageProfileTest: any;
  private imageToShow: any;
  private croppedImage: any = '';
  private croppedImageBase64: any = '';
  private imgForSend: boolean;
  private closeResult: string;
  private selectedFile: File = null;

  constructor(
    private cookiesService: CookiesService,
    private employeeProv: EmployeeProvider,
    private formBuilder: FormBuilder,
    private formErrosrServ: FormErrorsService,
    private hotkeysService: HotkeysService,
    private imageToBase64Serv: ImageToBase64Service,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private routeActive: ActivatedRoute,
    private router: Router,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.getBase64ForStaticImages();

    this.hotkeysService.add(new Hotkey('f2', (event: KeyboardEvent): boolean => {
      this.hiddenFormDiv();
      return false; // Prevent bubbling
    }));
  }

  ngOnInit() {
    this.initializeForm();
  }

  // Formulario *************************************************************************************//#endregion
  private initializeForm() {
    this.formEmployee = this.formBuilder.group({
      'firstNameInput': [{value: '', disabled: true}, [Validators.required]],
      'lastNameInput': [{value: '', disabled: true}, [Validators.required]],
      'RFCInput': [{value: '', disabled: true}, [Validators.required]],
      'areaInput': [{value: '', disabled: true}, [Validators.required]],
      'positionInput': [{value: '', disabled: true}, [Validators.required]]
    });
    this.searchInput.nativeElement.focus();
  }

  public hiddenFormDiv() {
    this.formEmployee.reset();
    this.errorForm = false;
    this.errorInputsTag.errorEmployeeFirstName = false;
    this.errorInputsTag.errorEmployeeLastName = false;
    this.errorInputsTag.errorEmployeeRFC = false;
    this.errorInputsTag.errorEmployeeArea = false;
    this.errorInputsTag.errorEmployeeCareer = false;
    this.errorInputsTag.errorEmployeePosition = false;
    this.showForm = false;
  }

  public showFormValues(employee, position) {
    this.currentPosition = position;
    this.isNewEmployee = false;
    this.showImg = false;
    this.imgForSend = false;

    this.getImageFromService(employee._id);

    this.formEmployee.get('RFCInput').setValue(employee.rfc);
    this.formEmployee.get('firstNameInput').setValue(employee.name.firstName);
    this.formEmployee.get('lastNameInput').setValue(employee.name.lastName);
    this.formEmployee.get('positionInput').setValue(position.name);
    this.formEmployee.get('areaInput').setValue(position.ascription.name);

    this.showForm = true;
  }

  // Generacion de PDF *************************************************************************************//#endregion
  private getBase64ForStaticImages() {
    this.imageToBase64Serv.getBase64('assets/imgs/employeeFront1.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/employeeBack2.jpg').then(res2 => {
      this.backBase64 = res2;
    });
  }

  public generatePDF(employee, position?) { // 'p', 'mm', [68,20]
    this.currentPosition = position ? position : this.currentPosition;
    if (employee.filename) {
      this.loading = true;
      this.employeeProv.getImageTest(employee._id).subscribe(data => {

        const reader = new FileReader();
        reader.addEventListener('load', () => {
          this.imageToBase64Serv.getBase64(reader.result).then(res3 => {
            this.imageProfileTest = res3;
            const doc = new jsPDF({
              unit: 'mm',
              format: [251, 158], // Medidas correctas: [88.6, 56]
              orientation: 'landscape'
            });
            // cara frontal de la credencial
            doc.addImage(this.frontBase64, 'PNG', 0, 0, 88.6, 56);
            doc.addImage(this.imageProfileTest, 'JPEG', 3.6, 7.1, 25.8, 31);

            doc.setTextColor(27, 57, 106);
            doc.setFontSize(7);
            doc.setFont('helvetica');
            doc.setFontType('bold');
            doc.text(49, 23.9, doc.splitTextToSize(employee.name.fullName, 38));
            doc.text(49, 32.1, doc.splitTextToSize(this.currentPosition.ascription.name, 38));
            doc.text(49, 40.6, doc.splitTextToSize(this.currentPosition.name, 38));

            doc.addPage();
            // // cara trasera de la credencial
            doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

            // // foto del estudiante

            // // Numero de control con codigo de barra
            // doc.setTextColor(255, 255, 255);
            // doc.setFontSize(8);
            // doc.text(52, 45.5, doc.splitTextToSize('RFC: ' + employee.rfc, 35));
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
      this.notificationServ.showNotification(eNotificationType.ERROR, 'No cuenta con fotografía', '');
    }

  }

  // Búsqueda de empleado *************************************************************************************//#endregion
  public searchEmployee(showForm) {
    this.showForm = showForm;
    this.loading = true;
    if (this.search) {
      this.search = this.search.toUpperCase();
    }
    this.employeeProv.searchEmployeeRFC(this.search)
      .subscribe(employee => {
        this.employee = employee;

        if (this.employee) {
          if (!this.employee.positions.length) {
            this.showNotFoundPositions = true;
            this.showTable = false;
            this.showNotFound = false;
          } else {
            this.showTable = true;
            this.showNotFoundPositions = false;
            this.showNotFound = false;
          }
        } else {
          this.showTable = false;
          this.showNotFoundPositions = false;
          this.showNotFound = true;
        }
      }, err => {
        console.log('err', err);
        this.showTable = false;
        this.showNotFound = true;
        this.showNotFoundPositions = false;
        this.loading = false;
      }, () => this.loading = false);
  }

  // Cropper Image ***************************************************************************************************//#endregion
  public showSelectFileDialog() {
    const input = document.getElementById('fileButton');
    input.click();
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
    this.croppedImageBase64 = event.base64;
  }

  public imageLoaded() {
    // show cropper
  }

  public loadImageFailed() {
    // show message
  }

  /*Se lanza cuando se cambia la foto*/
  public fileChangeEvent(event: any, content) {
    if (event) {
      this.selectedFile = <File>event.target.files[0];

      this.imageChangedEvent = event;

      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;

        this.photoEmployee = this.croppedImageBase64;
        this.imgForSend = true;

        const showForm = this.isNewEmployee;

        this.uploadFile(this.employee._id, showForm);
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

  private uploadFile(id, showForm) {
    const fd = new FormData();
    fd.append('image', this.croppedImage);
    this.loading = true;
    this.employeeProv.updatePhoto(id, fd).subscribe(res => {
      const employee: any = res;
      this.employee.filename = employee.employee.filename;

      this.imgForSend = false;
      this.showForm = showForm;
      if (this.search) {
        this.searchEmployee(true);
      }
      this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Fotografía actualizada correctamente', '');
      this.haveImage = true;
    }, error => {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'Ocurrió un error, inténtalo nuevamente', '');
    }, () => this.loading = false);
  }

  // Zona de test :D *********************************************************************************************//#region
  private createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToShow = reader.result;
      this.photoEmployee = this.imageToShow;
      this.showImg = true;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  private getImageFromService(id) {
    this.loading = true;
    this.employeeProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);
      this.haveImage = true;
    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.haveImage = false;
        this.photoEmployee = 'assets/imgs/employeeAvatar.png';
        this.showImg = true;
        this.loading = false;
      }
    }, () => this.loading = false);
  }
}
