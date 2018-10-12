import { Component, OnInit } from '@angular/core';
import { StudentProvider } from '../../providers/student.prov';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageToBase64Service } from '../../services/img.to.base63.service';
import * as jsPDF from 'jspdf';

import * as JsBarcode from 'JsBarcode';


@Component({
  selector: 'app-student-page',
  templateUrl: './student-page.component.html',
  styleUrls: ['./student-page.component.scss']
})
export class StudentPageComponent implements OnInit {

  data: Array<any>;
  search: any;
  showTable = false;

  frontBase64: any;
  backBase64: any;

  imageProfileTest: any;

  constructor(
    private studentProv: StudentProvider,
    private imageToBase64Serv: ImageToBase64Service
  ) {
    this.getBase64ForStaticImages();
  }

  ngOnInit() {
    this.getAllStundets();
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

  searchStudent() {
    this.studentProv.searchStudents(this.search).subscribe(res => {
      console.log('res', res);
      this.data = res.students;

      if (this.data.length > 0) {
        this.showTable = true;
      } else {
        this.showTable = false;
      }

    }, err => {
      console.log('err', err);
    });
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
    doc.text(49, 38.4, doc.splitTextToSize('ING. EN SIST. COMPUTACIONALES', 35));
    doc.text(49, 46, doc.splitTextToSize('123456789', 35));

    doc.addPage();


    // // cara trasera de la credencial
    doc.addImage(this.backBase64, 'PNG', 0, 0, 88.6, 56);

    // // foto del estudiante

    // // Numero de control con codigo de barra
    doc.addImage(this.textToBase64Barcode('12400253'), 'PNG', 46, 43, 33, 11);



    doc.save('test.pdf');
  }



  // test() {
  //   const doc = new jsPDF({
  //     unit: 'mm',
  //     format: 'letter',
  //   });


  //   doc.addImage(this.imageToBase64Serv.getBase64('assets/imgs/front.png'), 'PNG', 10, 10, 88.6, 56);
  //   doc.addImage(back, 'PNG', 100, 10, 88.6, 56);
  //   doc.addImage(profile, 'JPEG', 13.4, 16.8, 28.1, 31);

  //   doc.addImage(imgData, 'PNG', 146, 53, 33, 11);


  //   doc.setTextColor(255, 255, 255);
  //   doc.setFontSize(6);
  //   doc.text(59, 40.75, 'VICTOR MANUEL CEBALLOS CRUZ');
  //   doc.text(59, 48.4, 'ING. EN SIST. COMPUTACIONALES');
  //   doc.text(59, 56, '123456789');

  //   doc.save('test2.pdf');


  // }








}
