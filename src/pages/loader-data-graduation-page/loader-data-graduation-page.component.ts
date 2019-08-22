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
  collection="";
  page=1;
  pageSize = 10;
  careers = {
    "INGENIERÍA BIOQUÍMICA":"IBQ",
    "INGENIERÍA EN GESTIÓN EMPRESARIAL":"IGE",
    "INGENIERÍA CIVIL":"IC ",
    "ARQUITECTURA":"ARQ",
    "INGENIERÍA QUÍMICA":"IQ",
    "INGENIERÍA MECATRÓNICA":"IM",
    "INGENIERÍA ELÉCTRICA":"IE",
    "LICENCIATURA EN ADMINISTRACIÓN":"LA",
    "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES":"ITIC",
    "INGENIERÍA EN SISTEMAS COMPUTACIONALES":"ISC",
    "INGENIERÍA INDUSTRIAL":"II",
    "MAESTRÍA EN CIENCIAS EN ALIMENTOS":"MCA"
  };


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
        // console.log(this.router.url.split("/"));
        
        this.collection=this.router.url.split('/')[2];
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
    this.cancel();
    this.csvContent = content;
    this.csvContent = this.csvContent.replace(/"/g, '');
    this.arrayCsvContent = this.csvContent.split('\n');
    
    console.log(this.arrayCsvContent[0]);
    this.arrayCsvContent.shift();
    this.arrayCsvContent.forEach( student =>{
      let tmpStudent = student.split(',');
      this.csvObjects.push({
        nc:tmpStudent[0],
        nombre:tmpStudent[1],
        carrera:this.careers[tmpStudent[3].trim()],
        correo:tmpStudent[2],
        estatus:'Registrado'?tmpStudent[2]!== "  ":' '
      })
    });
    
  }
  sendData(){

    // console.log(this.collection, this.csvObjects);
    
    this.csvObjects.forEach(async (student) =>{
      await this.firebaseService.loadCSV(student,this.collection).then(resp =>{}).catch(err=>{});
    });
    this.notificationsServices.showNotification(1,'Exito','Alumnos registrados correctamente');
    this.cancel();
  }
  cancel(){
    this.fileName = 'Seleccione un archivo';
    this.csvObjects = [];
  }
  pageChanged(ev){
    this.page=ev;    
  } 
}
