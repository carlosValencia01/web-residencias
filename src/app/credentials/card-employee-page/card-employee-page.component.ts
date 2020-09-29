import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import * as jsPDF from 'jspdf';
import { IEmployee } from 'src/app/entities/shared/employee.model';
import { IPosition } from 'src/app/entities/shared/position.model';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';
import { EmployeeProvider } from 'src/app/providers/shared/employee.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { FormErrorsService } from 'src/app/services/app/forms.errors.service';
import { ImageToBase64Service } from 'src/app/services/app/img.to.base63.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';

@Component({
  selector: 'app-card-employee-page',
  templateUrl: './card-employee-page.component.html',
  styleUrls: ['./card-employee-page.component.scss']
})
export class CardEmployeePageComponent implements OnInit {
  @ViewChild('searchinput') searchInput: ElementRef;
  public employee: IEmployee;
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
    private loadingService: LoadingService,
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
    this.imageToBase64Serv.getBase64('assets/imgs/employeeFront145A.jpg').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/employeeBack3.jpg').then(res2 => {
      this.backBase64 = res2;
    });
  }

  public generatePDF(employee, position?) { // 'p', 'mm', [68,20]
    this.currentPosition = position ? position : this.currentPosition;
    if (employee.filename) {
      this.loadingService.setLoading(true);
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

            // Agregar años a la credencial
            const year = new Date();
            doc.setTextColor(37, 54, 102);
            doc.setFontSize(9);
            doc.setFont('helvetica');
            doc.setFontType('bold');
            doc.text(2.7, 51.3,year.getFullYear()+'');
            doc.text(12.7, 51.3,(year.getFullYear()+1)+'');
            doc.text(22.7, 51.3,(year.getFullYear()+2)+'');
            doc.text(32.7, 51.3,(year.getFullYear()+3)+'');
            doc.text(42.7, 51.3,(year.getFullYear()+4)+'');

            // // foto del estudiante

            // // Numero de control con codigo de barra
            // doc.setTextColor(255, 255, 255);
            // doc.setFontSize(8);
            // doc.text(52, 45.5, doc.splitTextToSize('RFC: ' + employee.rfc, 35));
            this.loadingService.setLoading(false);
            window.open(doc.output('bloburl'), '_blank');
          });
        }, false);
        if (data) {
          reader.readAsDataURL(data);
        }
      }, error => {
        console.log(error);
      },);
    } else {
      this.notificationServ.showNotification(eNotificationType.ERROR, 'No cuenta con fotografía', '');
    }

  }

  // Búsqueda de empleado *************************************************************************************//#endregion
  public searchEmployee(showForm) {
    this.showForm = showForm;
    this.loadingService.setLoading(true);
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
        this.loadingService.setLoading(false);
      }, () => this.loadingService.setLoading(false));
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
    this.loadingService.setLoading(true);
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
    }, () => this.loadingService.setLoading(false));
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
    this.loadingService.setLoading(true);
    this.employeeProv.getImageTest(id).subscribe(data => {
      this.createImageFromBlob(data);
      this.haveImage = true;
    }, error => {
      console.log(error);
      if (error.status === 404) {
        this.haveImage = false;
        this.photoEmployee = 'assets/imgs/employeeAvatar.png';
        this.showImg = true;
        this.loadingService.setLoading(false);
      }
    }, () => this.loadingService.setLoading(false));
  }
}
