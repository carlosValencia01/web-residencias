import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
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

  dtOptions: DataTables.Settings = {};
  pageSize = 10;
  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering  


  constructor(
    private firebaseService : FirebaseService,
    private notificationsServices : NotificationsServices
    ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageSize,      
      responsive: true,      
      
      /* below is the relevant part, e.g. translated to spanish */ 
      language: {
        processing: "Procesando...",
        search: "Buscar: ",
        searchPlaceholder:"Nombre, NC, carrera, estatus, email",        
        lengthMenu: "",
        info: "",
        infoEmpty: "",
        infoFiltered: "",
        infoPostFix: "",
        loadingRecords: "Cargando registros...",
        zeroRecords: "No se encontraron registros",
        emptyTable: "No hay datos disponibles",
        paginate: {
          first: "Primero",
          previous: "Anterior",
          next: "Siguiente",
          last: "Último"
        },
        aria: {
          sortAscending: ": Activar para ordenar la tabla en orden ascendente",
          sortDescending: ": Activar para ordenar la tabla en orden descendente"
        }
      }      
    };
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
        nc:tmpStudent[1],
        nombre:tmpStudent[2],
        carrera:tmpStudent[4],
        especialidad:tmpStudent[5]
      })
    });
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
