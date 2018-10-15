import { Component, OnInit } from '@angular/core';
import { StudentProvider } from '../../providers/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormErrorsService } from '../../services/forms.errors.service';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


import * as jsPDF from 'jspdf';
import * as JsBarcode from 'JsBarcode';
import { ImageCroppedEvent } from 'ngx-image-cropper/src/image-cropper.component';
import { HttpClient } from '@angular/common/http';



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

  frontBase64: any;
  backBase64: any;

  imageProfileTest: any;

  currentStudent: any;

  formStudent: FormGroup;
  errorForm = false;
  photoStudent = '';

  errorInputsTag = {
    errorStudentFullName: false,
    errorStudentNumberControl: false,
    errorStudentNSS: false,
    errorStudentCareer: false,
  };

  imageChangedEvent: any = '';
  croppedImage: any = '';
  closeResult: string;

  selectedFile: File = null;

  constructor(
    private http: HttpClient,

    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service,
    public formBuilder: FormBuilder,
    private formErrosrServ: FormErrorsService,
    private modalService: NgbModal
  ) {
    this.getBase64ForStaticImages();
  }

  initializeForm() {
    this.formStudent = this.formBuilder.group({
      'fullNameInput': ['', [Validators.required]],
      'numberControlInput': ['', [Validators.required]],
      'nssInput': ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // this.getAllStundets();
    this.initializeForm();
  }

  showSelectFileDialog() {
    console.log('Click detectado');
    const input = document.getElementById('fileButton');
    input.click();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.file;
    console.log('El evebt,', event);
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
      this.selectedFile = <File> event.target.files[0];

      this.imageChangedEvent = event;

      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        const file = new File([this.croppedImage], 'test.jpg');
        // this.photoStudent = file;

        event.target.value = '';
      }, (reason) => {
        event.target.value = '';
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

  getBase64ForStaticImages() {
    console.log(this.studentProv.getApiURL());

    this.imageToBase64Serv.getBase64('assets/imgs/front.png').then(res1 => {
      this.frontBase64 = res1;
    });

    this.imageToBase64Serv.getBase64('assets/imgs/back.png').then(res2 => {
      this.backBase64 = res2;
    });

    // tslint:disable-next-line:max-line-length
    this.imageToBase64Serv.getBase64('https://scontent.fmex5-1.fna.fbcdn.net/v/t1.0-9/1422436_10208416015382578_1208990774892394279_n.jpg?_nc_cat=103&oh=4dcba2f2a85aebc412aa74819eb1b8f0&oe=5C5A26F9').then(res3 => {
      this.imageProfileTest = res3;
    });
  }

  textToBase64Barcode(text) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, { format: 'CODE39' });
    return canvas.toDataURL('image/png');
  }

  getAllStundets() {
    this.studentProv.getAllStudents().subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
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

  updateStudentData() {
    const data = {
      controlNumber: this.formStudent.get('numberControlInput').value,
      fullName: this.formStudent.get('fullNameInput').value,
      career: this.currentStudent.career,
      nss: this.formStudent.get('nssInput').value
    };

    this.studentProv.updateStudent(this.currentStudent._id, data).subscribe(res => {
      console.log(res);

      if (this.croppedImage !== '') {
        console.log('Hay una foto que enviar');
        this.uploadFile(this.currentStudent._id);
      } else {
        console.log('No hay foto que enviar');
      }

      this.showForm = false;
      this.searchStudent();
    }, error => {
      console.log(error);
    });
  }

  uploadFile(id) {
    // const blob = new Blob([this.photoStudent], { type: 'image/jpg' });
    // const file = new File([blob], 'test.jpg');

    // const file = new File([this.croppedImage], 'test.jpg');

    const fd = new FormData();
    fd.append('image', this.selectedFile, this.selectedFile.name);

    this.http.put(`http://localhost:3003/escolares/credenciales/student/image/${id}`, fd)
      .subscribe(res => {
        console.log(res);
      });
  }

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

  showFormValues(student) {
    this.currentStudent = student;

    this.getImage();

    this.formStudent.get('fullNameInput').setValue(student.fullName);
    this.formStudent.get('numberControlInput').setValue(student.controlNumber);
    this.formStudent.get('nssInput').setValue(student.nss);

    this.showForm = true;
  }

  generatePDF() { // 'p', 'mm', [68,20]
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
    doc.text(49, 30.75, doc.splitTextToSize('VICTOR MANUEL CEBALLOS CRUZ', 35));
    doc.text(49, 38.4, doc.splitTextToSize('ING. EN SISTEMAS COMPUTACIONALES', 35));
    doc.text(49, 46, doc.splitTextToSize('123456789', 35));

    doc.addPage();


    // // cara trasera de la credencial
    doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

    // // foto del estudiante

    // // Numero de control con codigo de barra
    doc.addImage(this.textToBase64Barcode('00000000'), 'PNG', 46, 43, 33, 11);



    doc.save('test.pdf');
  }








}
