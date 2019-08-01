import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EmployeeProvider } from '../../providers/employee.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrorsService } from '../../services/forms.errors.service';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsServices } from '../../services/notifications.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { CookiesService } from 'src/services/cookie.service';


import * as jsPDF from 'jspdf';
import * as JsBarcode from 'jsbarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-employee-page',
  templateUrl: './card-employee-page.component.html',
  styleUrls: ['./card-employee-page.component.scss']
})
export class CardEmployeePageComponent implements OnInit {

  @ViewChild('searchinput') searchInput: ElementRef;

  loading = false;
  data: Array<any>;
  search: any;
  showTable = false;
  showNotFound = false;
  showForm = false;
  isNewEmployee = false;
  haveImage = false;

  showImg = false;

  frontBase64: any;
  backBase64: any;

  imageProfileTest: any;

  currentEmployee = {
    name: {
      lastName: '',
      firstName: '',
      fullName: ''
    },
    area: 'default',
    _id: '1',
    rfc: '',
    position: ''
  };

  formEmployee: FormGroup;
  errorForm = false;
  photoEmployee = '';

  imageToShow: any;

  errorInputsTag = {
    errorEmployeeLastName: false,
    errorEmployeeFirstName: false,
    errorEmployeeRFC: false,
    errorEmployeeArea: false,
    errorEmployeeCareer: false,
    errorEmployeePosition: false,
  };

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBase64: any = '';
  imgForSend: boolean;
  closeResult: string;

  selectedFile: File = null;

  constructor(
    private employeeProv: EmployeeProvider,
    private imageToBase64Serv: ImageToBase64Service,
    public formBuilder: FormBuilder,
    private formErrosrServ: FormErrorsService,
    private modalService: NgbModal,
    private notificationServ: NotificationsServices,
    private hotkeysService: HotkeysService,
    private router: Router,
    private cookiesServ: CookiesService
  ) {

    if (this.cookiesServ.getData().user.role !== 1 &&
      this.cookiesServ.getData().user.role !== 0 && this.cookiesServ.getData().user.role !== 4) {
      this.router.navigate(['/']);
    }

    this.getBase64ForStaticImages();
    this.cleanCurrentEmployee();

    this.hotkeysService.add(new Hotkey('f1', (event: KeyboardEvent): boolean => {
      this.newEmployee();
      return false; // Prevent bubbling
    }));
    this.hotkeysService.add(new Hotkey('f2', (event: KeyboardEvent): boolean => {
      this.hiddenFormDiv();
      return false; // Prevent bubbling
    }));
  }

  cleanCurrentEmployee() {
    this.currentEmployee = {
      name: {
        lastName: '',
        firstName: '',
        fullName: ''
      },
      area: '',
      _id: '1',
      rfc: '',
      position: ''
    };
  }

  ngOnInit() {
    this.initializeForm();
  }

  // Formulario *************************************************************************************//#endregion
  initializeForm() {
    this.formEmployee = this.formBuilder.group({
      'firstNameInput': ['', [Validators.required]],
      'lastNameInput': ['', [Validators.required]],
      'RFCInput': ['', [Validators.required]],
      'areaInput': ['', [Validators.required]],
      'positionInput': ['', [Validators.required]]
    });
    this.searchInput.nativeElement.focus();
  }

  hiddenFormDiv() {
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

  newEmployee() {
    // console.log('Current Employee' + this.currentEmployee);
    this.isNewEmployee = true;
    this.hiddenFormDiv();
    this.cleanCurrentEmployee();
    this.photoEmployee = 'assets/imgs/employeeAvatar.png';
    this.showImg = true;
    this.imgForSend = false;
    this.showForm = true;
    this.haveImage = false;
  }

  newEmployeeData() {
    this.loading = true;
    // if (!this.formValidation()) {
    const data = {
      rfc: this.formEmployee.get('RFCInput').value.toUpperCase(),
      name: {
        firstName: this.formEmployee.get('firstNameInput').value.toUpperCase(),
        lastName: this.formEmployee.get('lastNameInput').value.toUpperCase(),
        fullName: (this.formEmployee.get('firstNameInput').value + ' ' + this.formEmployee.get('lastNameInput').value).toUpperCase()
      },
      position: this.formEmployee.get('positionInput').value.toUpperCase(),
      area: this.formEmployee.get('areaInput').value.toUpperCase()
    };

    this.employeeProv.newEmployee(data).subscribe(res => {
      if (this.imgForSend) {
        // console.log('Hay una foto que enviar');
        this.uploadFile(this.currentEmployee._id, false);
      } else {
        // console.log('No hay foto que enviar');
        this.showForm = true;
        // this.searchEmployee(true);
        this.notificationServ.showNotification(1, 'Trabajador agregado correctamente', '');
      }
      const employee: any = res;

      this.currentEmployee = employee;
    }, error => {
      // console.log("ERROR");
      // console.log(error._body);
      this.loading = false;
      this.notificationServ.showNotification(2, 'Ocurrió un error al guardar, intente nuevamente', '');
    }, () => this.loading = false);
    // }
  }

  showFormValues(employee) {
    this.isNewEmployee = false;
    this.showImg = false;
    this.currentEmployee = JSON.parse(JSON.stringify(employee));
    this.imgForSend = false;

    this.getImageFromService(employee._id);

    this.formEmployee.get('RFCInput').setValue(employee.rfc);
    this.formEmployee.get('firstNameInput').setValue(employee.name.firstName);
    this.formEmployee.get('lastNameInput').setValue(employee.name.lastName);
    this.formEmployee.get('positionInput').setValue(employee.position);
    this.formEmployee.get('areaInput').setValue(employee.area);

    this.showForm = true;
  }

  // Generacion de PDF *************************************************************************************//#endregion

  getBase64ForStaticImages() {
    // console.log(this.employeeProv.getApiURL());

    this.imageToBase64Serv.getBase64('assets/imgs/employeeFront1.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/employeeBack2.jpg').then(res2 => {
      this.backBase64 = res2;
    });

  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE128', displayValue: false });
    return canvas.toDataURL('image/png');
  }

  generatePDF(employee) { // 'p', 'mm', [68,20]

    if (employee.filename) {
      this.loading = true;
      this.employeeProv.getImageTest(employee._id).subscribe(data => {

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

            doc.setTextColor(27, 57, 106);
            doc.setFontSize(8);
            doc.setFont('helvetica');
            doc.setFontType('bold');
            doc.text(49, 23.9, doc.splitTextToSize(employee.name.fullName, 38));
            doc.text(49, 32.1, doc.splitTextToSize(employee.area, 38));
            doc.text(49, 40.6, doc.splitTextToSize(employee.position, 38));

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
      this.notificationServ.showNotification(2, 'No cuenta con fotografía', '');
    }

  }

  // Busqueda de estudiantes *************************************************************************************//#endregion

  searchEmployee(showForm) {
    this.showForm = showForm;
    this.loading = true;
    if (this.search) {
      this.search = this.search.toUpperCase();
    }
    this.employeeProv.searchEmployeeRFC(this.search).subscribe(res => {
      // console.log('res', res);
      this.data = res.employees;

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

    if (this.formEmployee.invalid) {
      this.errorForm = true;
      this.formErrosrServ.getErros(this.formEmployee).forEach(key => {
        switch (key.keyControl) {
          case 'RFCInput':
            this.errorInputsTag.errorEmployeeRFC = true;
            break;
          case 'firstNameInput':
            this.errorInputsTag.errorEmployeeFirstName = true;
            break;
          case 'lastNameInput':
            this.errorInputsTag.errorEmployeeLastName = true;
            break;
          case 'positionInput':
            this.errorInputsTag.errorEmployeePosition = true;
            break;
          case 'areaInput':
            this.errorInputsTag.errorEmployeeArea = true;
            break;
        }
      });
      invalid = true;
    }

    return invalid;
  }

  updateEmployeeData() {
    this.isNewEmployee = false;
    if (!this.formValidation()) {
      this.currentEmployee.rfc = this.formEmployee.get('RFCInput').value.toUpperCase();
      this.currentEmployee.name.firstName = this.formEmployee.get('firstNameInput').value.toUpperCase();
      this.currentEmployee.name.lastName = this.formEmployee.get('lastNameInput').value.toUpperCase();
      // tslint:disable-next-line:max-line-length
      this.currentEmployee.name.fullName = (this.formEmployee.get('firstNameInput').value + ' ' + this.formEmployee.get('lastNameInput').value).toUpperCase();
      this.currentEmployee.position = this.formEmployee.get('positionInput').value.toUpperCase();
      this.currentEmployee.area = this.formEmployee.get('areaInput').value.toUpperCase();

      this.loading = true;
      this.employeeProv.updateEmployee(this.currentEmployee._id, this.currentEmployee).subscribe(res => {
        if (this.imgForSend) {
          // console.log('Hay una foto que enviar');
          this.uploadFile(this.currentEmployee._id, false);
        } else {
          // console.log('No hay foto que enviar');
          this.showForm = true;
          if (this.search) {
            this.searchEmployee(true);
          }
          this.notificationServ.showNotification(1, 'Trabajador actualizado correctamente', '');
        }
      }, error => {
        // console.log(error);
        this.notificationServ.showNotification(2, 'Ocurrió un error, inténtalo nuevamente', '');
      }, () => this.loading = false);
    }
  }

  // Cropper Image ***************************************************************************************************//#endregion

  showSelectFileDialog() {
    // console.log('Click detectado');
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

        this.photoEmployee = this.croppedImageBase64;
        this.imgForSend = true;

        const showForm = this.isNewEmployee;

        this.uploadFile(this.currentEmployee._id, showForm);
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
    this.employeeProv.getProfileImage(this.currentEmployee._id).subscribe(res => {
      // console.log(res);
      this.haveImage = true;

    }, error => {
      // console.log(error);
      if (error.status === 404) {
        // console.log('No tiene imagen');
        this.haveImage = false;
        this.photoEmployee = 'assets/imgs/employeeAvatar.png';
        this.showImg = true;
      }
    });
  }

  uploadFile(id, showForm) {
    const fd = new FormData();
    fd.append('image', this.croppedImage);
    this.loading = true;
    this.employeeProv.updatePhoto(id, fd).subscribe(res => {
      // console.log(res);
      const employee: any = res;
      this.currentEmployee = employee.employee;

      this.imgForSend = false;
      this.showForm = showForm;
      if (this.search) {
        this.searchEmployee(true);
      }
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
      this.photoEmployee = this.imageToShow;
      this.showImg = true;

    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getImageFromService(id) {
    this.loading = true;
    this.employeeProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);
      this.haveImage = true;
    }, error => {
      console.log(error);
      if (error.status === 404) {
        // console.log('No tiene imagen');
        this.haveImage = false;
        this.photoEmployee = 'assets/imgs/employeeAvatar.png';
        this.showImg = true;
        this.loading = false;
      }
    }, () => this.loading = false);
  }
}
