import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-loader-data-graduation-page',
  templateUrl: './loader-data-graduation-page.component.html',
  styleUrls: ['./loader-data-graduation-page.component.scss']
})
export class LoaderDataGraduationPageComponent implements OnInit {

  fileName = '';
  changeString = false;
  csvContent: string;
  arrayCsvContent: Array<any>;
  csvObjects = [];  

  page=1;
  pageSize = 10;
  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering  


  constructor(
    private firebaseService : FirebaseService,
    private notificationsServices : NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    ) {
      if (this.cookiesService.getData().user.role !== 0 &&
        this.cookiesService.getData().user.role !== 1) {
          this.router.navigate(['/']);
        }
    }

  ngOnInit() {    
  }

  //para leer el archivo csv por carrera
  onFileSelect(input: HTMLInputElement) {
    const files = input.files;

    if (files && files.length) {
        this.fileName = files[0].name;
        this.changeString = true;
  
        const fileToRead = files[0];
  
        const fileReader = new FileReader();
        fileReader.onload = () => {
            this.convertFileToObject(fileReader.result);
        };
  
        fileReader.readAsText(fileToRead, 'UTF-8');
        input.value = '';
    }
  }

  //genera un arreglo de estudiantes por carrera
  convertFileToObject(content) {
    this.csvContent = content;
    this.csvContent = this.csvContent.replace(/"/g, '');
    this.arrayCsvContent = this.csvContent.split('\n');
    
    this.arrayCsvContent.shift();
    this.arrayCsvContent.forEach( student =>{
      let tmpStudent = student.split(',');
      this.csvObjects.push({
        nc:tmpStudent[0],
        nombre:tmpStudent[1],
        carrera:tmpStudent[2],
        correo:'',
        estatus:' '
      })
    });
    console.log(this.csvObjects);
    
  }
  sendData(){
    this.csvObjects.forEach(async (student) =>{
      await this.firebaseService.loadCSV(student).then(resp =>{}).catch(err=>{});
    });
    this.notificationsServices.showNotification(1,'Exito','Alumnos registrados correctamente');
    this.cancel();
  }
  cancel(){
    this.fileName = 'Seleccione un archivo';
    this.csvObjects = [];
  }
}
