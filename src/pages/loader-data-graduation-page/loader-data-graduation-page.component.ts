import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { NotificationsServices } from '../../services/notifications.service';
import { CookiesService } from 'src/services/cookie.service';
import { Router } from '@angular/router';
import { GraduationProvider } from '../../providers/graduation.prov';
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
  type="";
  page=1;
  pageSize = 10;
  students=[];

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
    private graduationProv : GraduationProvider
    ) {
      if (this.cookiesService.getData().user.role !== 0 &&
        this.cookiesService.getData().user.role !== 1 &&
        this.cookiesService.getData().user.role !== 9) {
          this.router.navigate(['/']);
        }
        let url = this.router.url.split('/'); 
        this.collection=url[2];
        this.type = url[3];
        if(this.type === '1'){

          this.firebaseService.getGraduates(this.collection).subscribe(
            res=>{
              this.students = res.map( student => {
                return {
                  id:student.payload.doc.id,
                  data:student.payload.doc.data()
                }
              });        
              
            }
          );
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
    this.cancel();
    this.csvContent = content;
    this.csvContent = this.csvContent.replace(/"/g, '');
    this.arrayCsvContent = this.csvContent.split('\n');
        
    this.arrayCsvContent.shift();
    this.arrayCsvContent.forEach(student =>{
      let tmpStudent = student.split(',');
      if(this.type === "0"){

        this.csvObjects.push({
          nc:tmpStudent[1],
          nombreApellidos:tmpStudent[2],
          nombre:tmpStudent[3],
          carreraCompleta:tmpStudent[4],
          carrera:this.careers[tmpStudent[4].trim()],
          correo:tmpStudent[5],
          observations:'',
          degree:'',
          estatus:'Registrado',
          survey:false
        });
      }
      if(this.type === "1"){
       
        if(tmpStudent[0]!==""){
          let st = this.students.find( std=> std.data.nc.trim() == tmpStudent[0].trim());
          
          this.csvObjects.push({
            id:st.id,
            nc:st.data.nc,
            nombreApellidos:st.data.nombreApellidos,
            nombre:st.data.nombre,
            carreraCompleta:st.data.carreraCompleta,
            carrera:st.data.carrera,
            correo:st.data.correo,
            estatus:st.data.estatus
          });
        }
      }
    });    
    
    
  }

 

  sendData(){

    // console.log(this.collection, this.csvObjects);
    if(this.type=="0"){
      this.csvObjects.forEach(async (student) =>{
        await this.firebaseService.loadCSV(student,this.collection).then(resp =>{}).catch(err=>{});
      });
      this.notificationsServices.showNotification(1,'Exito','Alumnos registrados correctamente');
    }
    if(this.type == "1"){
      this.csvObjects.forEach( student=>{
        
        
        this.firebaseService.updateFieldGraduate(student.id,{estatus:"Verificado"},this.collection).then(
          res=>{
            this.sendOneMailSurvey(student);
          }
        );
      });
    }
    this.cancel();
  }

  sendOneMail(item) {
      this.graduationProv.sendQR(item.correo,item.id,item.nombre).subscribe(
        res=>{
          this.notificationsServices.showNotification(1, 'Invitación enviada a:',item.nc);
        },
        err =>{this.notificationsServices.showNotification(2, 'No se pudo enviar el correo a:',item.nc);
        }
      );
  }

  sendOneMailSurvey(item) {
      this.graduationProv.sendSurvey(item.correo,item.id,item.nombre,item.nc).subscribe(
        res=>{
          this.notificationsServices.showNotification(1, 'Encuesta enviada a:',item.nc);
        },
        err =>{this.notificationsServices.showNotification(2, 'No se pudo enviar el correo a:',item.nc);
        }
      );
  }

  //borrar los datos cuando se cancela
  cancel(){
    this.fileName = 'Seleccione un archivo';
    this.csvObjects = [];
  }

  //para cambiar el contador de las paginas
  pageChanged(ev){
    this.page=ev;    
  } 
  //convertir un array de objetos en un objeto
  toObject(array){
    let object={};
    array.forEach( elem=>{
      object[elem]=elem;
    });
    return object;
  }
}
