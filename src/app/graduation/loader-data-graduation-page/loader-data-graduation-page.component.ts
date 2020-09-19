import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { GraduationProvider } from 'src/app/providers/graduation/graduation.prov';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { FirebaseService } from 'src/app/services/graduation/firebase.service';
import Swal from 'sweetalert2';

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
  collection = '';
  type = '';
  page = 1;
  pageSize = 10;
  students = [];
  displayStudents = [];
  careers = {
    'INGENIERÍA BIOQUÍMICA': 'IBQ',
    'INGENIERÍA EN GESTIÓN EMPRESARIAL': 'IGE',
    'INGENIERÍA CIVIL': 'IC ',
    'ARQUITECTURA': 'ARQ',
    'INGENIERÍA QUÍMICA': 'IQ',
    'INGENIERÍA MECATRÓNICA': 'IM',
    'INGENIERÍA ELÉCTRICA': 'IE',
    'LICENCIATURA EN ADMINISTRACIÓN': 'LA',
    'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES': 'ITIC',
    'INGENIERÍA EN SISTEMAS COMPUTACIONALES': 'ISC',
    'INGENIERÍA INDUSTRIAL': 'II',
    'MAESTRÍA EN CIENCIAS EN ALIMENTOS': 'MCA',
    'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN': 'MTI',
    'DOCTORADO EN CIENCIAS EN ALIMENTOS': 'DCA'
  };

  constructor(
    private firebaseService: FirebaseService,
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private graduationProv: GraduationProvider,
    private loadingService: LoadingService,
  ) {
    if (this.cookiesService.getData().user.role !== 0 &&
      this.cookiesService.getData().user.role !== 1 &&
      this.cookiesService.getData().user.role !== 9) {
        this.router.navigate(['/']);
      }
      const url = this.router.url.split('/');
      this.collection = url[3];
      this.type = url[4];
      if (this.type === '1') {
        const su = this.firebaseService.getGraduates(this.collection).subscribe(
          res => {
            su.unsubscribe();
            this.students = res.map( student => {
              return {
                id: student.payload.doc.id,
                data: student.payload.doc.data()
              };
            });
          }
        );
      }
  }

  ngOnInit() {

  }

  // para leer el archivo csv por carrera
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

  // genera un arreglo de estudiantes por carrera
  convertFileToObject(content) {
    this.cancel();
    this.csvContent = content;
    this.csvContent = this.csvContent.replace(/"/g, '');
    this.arrayCsvContent = this.csvContent.split('\n');
    this.arrayCsvContent.shift();
    this.arrayCsvContent.forEach(student => {
      // const indice = student.trim().toLowerCase().indexOf('calidad,');

      // if( indice >-1){
      //   const tmpStudent = student.split('CALIDAD,');


      // }else{


      //   }
      const tmpStudent = student.split(',');
        if (this.type === '0') {
          this.csvObjects.push({
            nc: tmpStudent[1],
            nombreApellidos: tmpStudent[2],
            nombre: tmpStudent[3],
            carreraCompleta: tmpStudent[4],
            carrera: this.careers[tmpStudent[4]] ? this.careers[tmpStudent[4].trim()] : '',
            especialidad: tmpStudent[5].replace('%20',','),
            promedio: tmpStudent[6],
            correo: tmpStudent[7],
            genero: tmpStudent[8],
            curp: tmpStudent[9],
            observations: '',
            degree: '',
            estatus: 'Registrado',
            documentationStatus: 'NO SOLICITADO',
            survey: false,
            mejorPromedio:false
          });
      }
      // if (this.type === '1') {
      //   if (tmpStudent[0] !== '') {
      //     const st = this.students.find( std => std.data.nc.trim() === tmpStudent[0].trim());
      //     this.csvObjects.push({
      //       id: st.id,
      //       nc: st.data.nc,
      //       nombreApellidos: st.data.nombreApellidos,
      //       nombre: st.data.nombre,
      //       carreraCompleta: st.data.carreraCompleta,
      //       carrera: st.data.carrera,
      //       correo: st.data.correo,
      //       estatus: st.data.estatus
      //     });
      //   }
      // }
    });
    const sub = this.firebaseService.getGraduates(this.collection).subscribe(
      (students)=>{
        sub.unsubscribe();
        const sts = students.map( (st)=> ({nc:st.payload.doc.get('nc'),id:st.payload.doc.id,genero:st.payload.doc.get('genero')}));

          if(sts.length>0){
            for (const student of this.csvObjects){
              const stu = sts.filter( st=> st.nc == student.nc)[0];
              if(!stu){
                this.displayStudents.push(student);
              }
            }
          }else{
            this.displayStudents = this.csvObjects;
          }
      }
    );
  }

  async sendData() {
    let i=0;
    this.loadingService.setLoading(true);
    if (this.type === '0') {
      let objects = this.csvObjects;
      const sub = this.firebaseService.getGraduates(this.collection).subscribe(
        async (students)=>{
          const sts = students.map( (st)=> ({nc:st.payload.doc.get('nc'),id:st.payload.doc.id,genero:st.payload.doc.get('genero')}));
          sub.unsubscribe();

          if(sts.length>0){
            for await (const student of objects){
              const stu = sts.filter( st=> st.nc == student.nc)[0];
              if(!stu){
                await this.firebaseService.loadCSV(student, this.collection).then(resp => {
                }).catch(err => {});
                await this.firebaseService.asignEvent(this.collection
                  ,student.nc).then((col=>{
                  })).catch(err=>{});
              }else{
                if(!stu.genero){
                  await this.firebaseService.updateFieldGraduate(stu.id,{genero:student.genero,curp:student.curp},this.collection).then(up=>{});
                }
              }
            }
          }else{
            for await (const student of objects){
              await this.firebaseService.loadCSV(student, this.collection).then(resp => {
              }).catch(err => {});
              await this.firebaseService.asignEvent(this.collection
                ,student.nc).then((col=>{
                })).catch(err=>{});
            }
          }
        }
      );
      if(this.displayStudents.length>=100){
        setTimeout(() => {
          setTimeout(() => {
            this.updateBestAvg();
          }, 70000);
          this.notificationsServices.showNotification(0, 'Exito',' Alumnos registrados');
          this.loadingService.setLoading(false);
          this.cancel();
        }, 30000);
      }else{
        setTimeout(() => {
          this.updateBestAvg();
        }, 70000);
        this.notificationsServices.showNotification(0, 'Exito',' Alumnos registrados');
        this.loadingService.setLoading(false);
        this.cancel();
      }
    }
    if (this.type === '1') {
      this.csvObjects.forEach( student => {
        this.firebaseService.updateFieldGraduate(student.id, {estatus: 'Verificado'}, this.collection).then(
          res => {
            this.sendOneMail(student);
          }
        );
      });
    }
    this.cancel();
  }

  updateBestAvg(){
    const sst =this.firebaseService.getGraduates(this.collection).subscribe(
      async (stds)=>{
        sst.unsubscribe();
          const students = stds.map( (std)=> ({id:std.payload.doc.id,promedio:std.payload.doc.get('promedio'), carrera:std.payload.doc.get('carrera'),mejorPromedio:std.payload.doc.get('mejorPromedio')}));
          const sb = this.firebaseService.getCareers().subscribe(
            async (careers :any)=>{
              sb.unsubscribe();
              for await (const career of careers){
                const prevBestAvg = students.filter(st=> st.mejorPromedio == true && st.carrera+'' == career.nombre+'')[0];
                const studentsCareer = students.filter( (st)=> st.carrera+'' == career.nombre+'').map( std=> std.promedio);
                const greaterAvg = studentsCareer.length > 0 ? Math.max(...studentsCareer) : false;

                const stGreaterAvg = greaterAvg > 0 ? students.filter( (st)=> st.carrera+'' == career.nombre+'').filter( (st)=> st.promedio == greaterAvg) : false;

                if(stGreaterAvg){
                  if(prevBestAvg){

                    const isBestAvg = stGreaterAvg.filter( st=> st.id == prevBestAvg.id).length === 1;
                    if(!isBestAvg){
                      const best = stGreaterAvg.filter( st=> st.promedio >= prevBestAvg.promedio);
                      if(best.length>0){
                        await this.firebaseService.updateFieldGraduate(prevBestAvg.id,{mejorPromedio:false},this.collection).then(up=>{});
                        for await (const bestAvg of best){
                          await this.firebaseService.updateFieldGraduate(bestAvg.id,{mejorPromedio:true},this.collection).then( up=>{}).catch(err=>{});
                        }
                      }
                    }
                  }else{
                    for await (const bestAvg of stGreaterAvg){
                      await this.firebaseService.updateFieldGraduate(bestAvg.id,{mejorPromedio:true},this.collection).then( up=>{}).catch(err=>{});
                    }
                  }
                }
              }
            }
          );
        }
    );
  }
  sendOneMail(item) {
      this.graduationProv.sendQR(item.correo, item.id, item.nombre).subscribe(
        res => {
          this.notificationsServices.showNotification(0, 'Invitación enviada a:', item.nc);
        },
        err => {this.notificationsServices.showNotification(1, 'No se pudo enviar el correo a:', item.nc);
        }
      );
  }

  // borrar los datos cuando se cancela
  cancel() {
    this.fileName = 'Seleccione un archivo';
    this.csvObjects = [];
    this.displayStudents = [];
  }

  // para cambiar el contador de las paginas
  pageChanged(ev) {
    this.page = ev;
  }
  // convertir un array de objetos en un objeto
  toObject(array) {
    const object = {};
    array.forEach( elem => {
      object[elem] = elem;
    });
    return object;
  }

  downloadTemplate(){
    Swal.fire({
      title: 'Atención',
      text: 'Recuerda que debes cambiar la "," por "%20" en la especialidad del alumno en caso de requerirlo.',
      imageUrl: 'assets/imgs/reemplazarComa.png',
      imageWidth: 500,
      imageHeight: 100,
      imageAlt: 'Custom image',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Descargar'
    }).then((result) => {
      if (result.value) {
        const ExampleStudents = [
          { no: 'No', nc: 'Número de Control', nombreApellidos: 'Nombre Apellido', nombre: 'Nombre del Alumno', carrera: 'Carrera', especialidad: 'Especialidad', calificacion: 'Calificacion', email: 'Email', genero: 'Genero', curp: 'Curp'},
          { no: '1', nc: '14400975', nombreApellidos: 'NAVA HERNANDEZ IRVING YAIR', nombre: 'IRVING YAIR NAVA HERNANDEZ', carrera: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES', especialidad: 'DESARROLLO WEB Y MULTIPLATAFORMAS', calificacion: '88.93', email: 'iryanavahe@ittepic.edu.mx', genero: 'M', curp: 'NAHI951122HNTVRR09' },
          { no: '2', nc: '15401011', nombreApellidos: 'JIMENEZ ESPERICUETA RICARDO', nombre: 'RICARDO JIMENEZ ESPERICUETA', carrera: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES', especialidad: 'DESARROLLO WEB Y MULTIPLATAFORMAS', calificacion: '93.13', email: 'rijimenezes@ittepic.edu.mx', genero: 'M', curp: 'JIER960211HNTVRR09' }
        ];
        new Angular5Csv(ExampleStudents, 'Ejemplo Estudiantes Graduación');
      }
    });
  }
}
