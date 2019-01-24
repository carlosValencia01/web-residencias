import { Component, OnInit } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';

@Component({
  selector: 'app-loader-data-credentials-page',
  templateUrl: './loader-data-credentials-page.component.html',
  styleUrls: ['./loader-data-credentials-page.component.scss']
})
export class LoaderDataCredentialsPageComponent implements OnInit {

  ExampleStudents = [
    { controlNumber: 'Numero de Control', fullName: 'Nombre Completo', career: 'Carrera', nss: 'NSS' },
    { controlNumber: '18400814', fullName: 'KAREN PAOLA GUZMÁN IBARRA', career: 'INGENIERÍA QUÍMICA', nss: '0123456789' },
    { controlNumber: '18400808', fullName: 'LUIS GERARDO GALLARDO GARCIA', career: 'NGENIERÍA QUÍMICA', nss: '0123456789' },
    {
      controlNumber: '18400231', fullName: 'JESÚS ALDAHIR ALVAREZ GALAVIZ',
      career: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES', nss: '0123456789'
    },
  ];

  ExampleEmployees = [
    { rfc: 'RFC', firstName: 'Nombre(s)', lastName: 'Apellidos', area: 'Área de Adscripciòn', position: 'Puesto' },
    {
      rfc: 'LOLR891212DG3', firstName: 'RAUL', lastName: 'LOPEZ LOPEZ',
      area: 'DEPARTAMENTO DE INGENIERÍA EN SISTEMAS Y COMPUTACIÓN', position: 'DOCENTE'
    },
    {
      rfc: 'SALO711010E4R', firstName: 'OCTAVIO ', lastName: 'SANCHEZ LOPEZ',
      area: 'DEPARTAMENTO DE INGENIERÍA EN SISTEMAS Y COMPUTACIÓN', position: 'DOCENTE'
    },
  ];

  csvContent: string;
  arrayCsvContent: Array<any>;
  changeString = false;
  showControls = false;
  showInfo = false;
  fileName = '';
  testVAriable: any;

  radioButtonResponse = 1;

  dataStundets = [];

  constructor() { }

  ngOnInit() {
  }

  downloadExampleCSV(type: number) {
    if (type === 1) {
      // tslint:disable-next-line:no-unused-expression
      new Angular5Csv(this.ExampleStudents, 'EjemploEstudiantes');
    } else {
      // tslint:disable-next-line:no-unused-expression
      new Angular5Csv(this.ExampleEmployees, 'EjemploTrabajadores');
    }
  }



  onFileSelect(input: HTMLInputElement) {


    const files = input.files;

    if (files && files.length) {
      /*
       console.log("Filename: " + files[0].name);
       console.log("Type: " + files[0].type);
       console.log("Size: " + files[0].size + " bytes");
       */

      this.fileName = files[0].name;
      this.changeString = true;
      this.showControls = true;

      const fileToRead = files[0];

      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.convertFileToObject(fileReader.result);
      };

      fileReader.readAsText(fileToRead, 'UTF-8');
      input.value = '';

    }

  }

  convertFileToObject(content) {
    this.csvContent = content;
    this.csvContent = this.csvContent.replace(/"/g, '');
    this.arrayCsvContent = this.csvContent.split('\n');

    if (this.arrayCsvContent[this.arrayCsvContent.length - 1].length === 0) {
      this.arrayCsvContent.pop();
    }

  }

  analyzeArray() {
    if (this.radioButtonResponse === 1) {
      this.arrayCsvContent.shift();
    }
    console.log(this.arrayCsvContent);



    this.arrayCsvContent.forEach(element => {
      const oneRow = element.split(',');
      this.dataStundets.push({ controlNumber: oneRow[0], fullName: oneRow[1], career: oneRow[2], nss: oneRow[3] });
    });
    this.showInfo = true;

    console.log(this.dataStundets.length);
  }







}
