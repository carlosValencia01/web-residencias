import { Component, OnInit } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { NotificationsServices } from '../../services/notifications.service';

import { StudentProvider } from '../../providers/student.prov';
import { EmployeeProvider } from '../../providers/employee.prov';
import { CookiesService } from 'src/services/cookie.service';
import { ActivatedRoute, Router } from '@angular/router';
import { eNotificationType } from 'src/enumerators/notificationType.enum';

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
  copyArrayCsvContent: Array<any>;
  changeString = false;
  showControls = false;
  showInfo = false;
  fileName = '';
  testVAriable: any;
  typeOfFile: number;

  radioButtonResponse = 1;

  dataStundets = [];
  dataEmployees = [];

  constructor(
    private studenProv: StudentProvider,
    private employeerProv: EmployeeProvider,
    private notificationServ: NotificationsServices,
    private router: Router,
    private cookiesService: CookiesService,
    private routeActive: ActivatedRoute,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
   }

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



  onFileSelect(input: HTMLInputElement, type: number) {


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
        this.typeOfFile = type;
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
      this.copyArrayCsvContent = this.arrayCsvContent.slice(0);
    }

  }

  analyzeArray() {
    const localArrayCsvContent = this.arrayCsvContent.slice(0);

    // console.log(localArrayCsvContent);


    if (this.radioButtonResponse === 1) {
      localArrayCsvContent.shift();
    }

    if (this.typeOfFile === 1) {
      this.dataStundets = [];

      localArrayCsvContent.forEach(element => {
        const oneRow = element.split(',');
        this.dataStundets.push(
          {
            controlNumber: oneRow[0].toUpperCase(), fullName: oneRow[1].toUpperCase(),
            career: oneRow[2].toUpperCase(), nss: oneRow[3].toUpperCase()
          }
        );
      });
    } else {
      this.dataEmployees = [];

      localArrayCsvContent.forEach(element => {
        const oneRow = element.split(',');
        this.dataEmployees.push(
          {
            rfc: oneRow[0].toUpperCase(),
            name: {
              firstName: oneRow[1].toUpperCase(),
              lastName: oneRow[2].toUpperCase(),
              fullName: oneRow[1].toUpperCase() + ' ' + oneRow[2].toUpperCase()
            },
            area: oneRow[3].toUpperCase(),
            position: oneRow[4].toUpperCase()
          }
        );
      });

    }

    this.showInfo = true;

  }

  sendData(type: number) {
    if (type === 1) {
      this.studenProv.newStudent(this.dataStundets).subscribe(res => {
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Importación finalizada correctamente',
          `Importado ${this.dataStundets.length} de ${this.dataStundets.length}`);
        this.showControls = false;
        this.showInfo = false;
        this.fileName = 'Seleccione un archivo';
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Hubo un error, intente de nuevo.', error);
      });
    } else {
      this.employeerProv.newEmployee(this.dataEmployees).subscribe(res => {
        this.notificationServ.showNotification(eNotificationType.SUCCESS, 'Importación finalizada correctamente',
          `Importado ${this.dataEmployees.length} de ${this.dataEmployees.length}`);
        this.showControls = false;
        this.showInfo = false;
        this.fileName = 'Seleccione un archivo';
      }, error => {
        this.notificationServ.showNotification(eNotificationType.ERROR, 'Hubo un error, intente de nuevo.', error);
      });
    }
  }

  beforeChange(event) {
    // console.log(event);
    this.showControls = false;
    this.showInfo = false;
    this.fileName = 'Seleccione un archivo';
  }

}
