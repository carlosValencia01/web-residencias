import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import Swal from 'sweetalert2';

//Importar Servicios
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

//Importar Proveedores
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';

//Importar Componentes
import { FormRequestCourseComponent } from 'src/app/english/components/student-english-page/form-request-course/form-request-course.component';

//Importar Enumeradores
import { StatusEnglishStudent } from 'src/app/english/enumerators/status-english-student.enum';
import { resolve } from 'url';

@Component({
  selector: 'app-student-english-page',
  templateUrl: './student-english-page.component.html',
  styleUrls: ['./student-english-page.component.scss']
})
export class StudentEnglishPageComponent implements OnInit {

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  data; //Datos del usuario
  currentStudent: any; //Datos del estuduante
  englishStudent: any; //Perfil de ingles del estudiante
  showImg = false; //Mostrar Foto
  imageDoc; //Imagen del Drive
  photoStudent = ''; //Foto a mostrar

  statusEnglishStudent = StatusEnglishStudent; //Enumerador del estatus del perfil de ingles del estudiante

  englishCourses: any; //Cursos de ingles activos

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private studentProv: StudentProvider,
    private inscriptionProv : InscriptionsProvider,
    private englishStudentProv : EnglishStudentProvider,
    private englishCourseProv: EnglishCourseProvider,
    private requestCourseProv : RequestCourseProvider,
    public dialog: MatDialog,
  ) { 
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.data = _CookiesService.getData().user; //Obtener los datos del usuario

    this.getDocuments(); //Obtener la Foto de perfil
  }

  ngOnInit() {
    const _id = this.data._id; // ID del Estudiante

    this.loadingService.setLoading(true);

    this.createEnglishCourses(); //Obtener los cursos activos para mostrar

    //Obtener el estudiante con la ID
    this.studentProv.getStudentById(_id).subscribe(res => {
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0])); //Guardar al estudiante
        this.verifyEnglishState(this.currentStudent._id); //Verificar el perfil de ingles del estudiante
      }, error => {
        console.log(error);
      }, () => this.loadingService.setLoading(false));
    
  }

  createEnglishCourses(){ //Obtener los cursos activos para mostrar
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourseActive().subscribe(res => { //Obtener los cursos de la API      
      this.englishCourses = res.englishCourses; //Guardar los cursos activos

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  verifyEnglishState(studentId: string){ //Verificar el perfil del estudiante.

    //Obtener el perfil de acuerdo al ID del estudiante.
    this.englishStudentProv.getEnglishStudentByStudentId(studentId).subscribe(res => {

      if (typeof (res) !== 'undefined' && typeof (res.englishStudent) !== 'undefined' && res.englishStudent.length > 0) {

        //Obtener el perfil si existe.
        this.englishStudent = JSON.parse(JSON.stringify(res.englishStudent[0]));
        
        if(this.englishStudent.courseType){
          this.englishCourses = this.englishCourses.filter( course => course._id == this.englishStudent.courseType);
        }

        //Verificar si existen notificación a mostrar.
        //this.verifyNotification();

      }else{

        //Crear el perfil en caso de no existir.
        
        var englishSudent = { //Perfil a crear.
          studentId: studentId,
          currentPhone: this.currentStudent.phone,
          status: 'no_choice',
          totalHoursCoursed: 0,
          level: 0
        };

        //Mandar el perfil a la API para agregarlo a la BD.
        this.englishStudentProv.createEnglishStudent(englishSudent).subscribe(res => {
          //Obtener el perfil creado.
          this.englishStudent = JSON.parse(JSON.stringify(res));
          if(this.englishStudent.courseType){
            this.englishCourses = this.englishCourses.filter( course => course._id == this.englishStudent.courseType);
          }
        }, 
        error => {console.log(error)});
      };      
    });
  }

  verifyNotification(){ //Verificar si existe notificación a mostrar

    if(this.englishStudent.status == 'rejected'){ //En caso de que se haya rechazado la solicitud
      Swal.fire({
        title: 'Atención',
        text: 'El curso en el horario solicitado no fue aperturado, seleccione otra opción',
        type: 'warning',
      }).then((result) => {

        const englishStudent = {
          $set: {status: 'no_choice'} //Cambiar el estatus
        };

        this.loadingService.setLoading(true);

        // Canbiar el estatus en la BD.
        this.englishStudentProv.updateEnglishStudent(englishStudent, this.englishStudent._id).subscribe(res => {
          this.englishStudent.status = 'no_choice'; // Cambiar el estatus en la variable local
        },error => {}, () => this.loadingService.setLoading(false));
      });
    }
  }

  getDocuments(){ //Obtener la Foto de perfil
    this.showImg=false;
    this.studentProv.getDriveDocuments(this.data._id).subscribe( //Obtener documentos del Drive
      docs=>{
        let documents = docs.documents;
        if(documents){ //Si existen documentos en el Drive

          //Obtener Foto del Drive
          this.imageDoc = documents.filter(docc => docc.filename.indexOf('png') !== -1 || docc.filename.indexOf('jpg') !== -1 ||  docc.filename.indexOf('PNG') !== -1 || docc.filename.indexOf('JPG') !== -1 ||  docc.filename.indexOf('jpeg') !== -1 || docc.filename.indexOf('JPEG') !== -1)[0];
          if(this.imageDoc){

            this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive,this.imageDoc.filename).subscribe(
              succss=>{ //Si existe Foto en el Drive
                this.showImg=true;
                const extension = this.imageDoc.filename.substr(this.imageDoc.filename.length-3,this.imageDoc.filename.length);
                this.photoStudent = "data:image/"+extension+";base64,"+succss.file;
              },
              err=>{this.photoStudent = 'assets/imgs/studentAvatar.png'; this.showImg=true;}
            );
          }else{ //Si no existe Foto en el Drive
            this.loadingService.setLoading(false);
            this.photoStudent = 'assets/imgs/studentAvatar.png';
            this.showImg=true;
          }
        }else{ //Si no existen documentos en el Drive
          this.loadingService.setLoading(false);
          this.photoStudent = 'assets/imgs/studentAvatar.png';
          this.showImg=true;
        }
      }
    );
  }

  openDialog(courseSelected : any): void {
    console.log(courseSelected);
    const dialogRef = this.dialog.open(FormRequestCourseComponent, {
      data: {
        courseSelected: courseSelected,
        level: this.englishStudent.level,
        groupId: "",
        currentPhone: this.englishStudent.currentPhone
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if(result){
        const activePeriod: any = await new Promise((resolve)=>{
          this.englishCourseProv.getActivePeriod().subscribe(data=>resolve(data.period));
        });
        console.log('The dialog was closed');
        const data = {
          englishStudent: this.englishStudent._id,
          group: result.groupId,
          status: 'requested',
          requestDate: new Date(),
          level: this.englishStudent.level + 1,
          period: activePeriod._id
        };
        
        this.requestCourseProv.createRequestCourse(data).subscribe(res => {
          if(res){
            this.englishStudent.currentPhone = result.currentPhone;
            this.englishStudent.status = 'selected';
            this.englishStudentProv.updateEnglishStudent(this.englishStudent, this.englishStudent._id).subscribe(res2 => {
              console.log(res2);
              Swal.fire({
                title: 'Solicitud enviada!',
                showConfirmButton: false,
                timer: 1500,
                type: 'success'
              });
              this.tabGroup.selectedIndex = 0;
            });
          }
        });
      }
    });
  }

  openDialogRejectRequest(englishStudentId){
    Swal.fire({
      title: 'Cancelar Solicitud',
      text: `Está por cancelar la solicitud enviada. ¿Desea continuar?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      focusCancel: true
    }).then((result) => {
      if (result.value) {

        const data={
          status: 'cancelled'
        };

        this.loadingService.setLoading(true);
        this.requestCourseProv.updateRequestByStudentId(englishStudentId, data).subscribe(res => {

          console.log(res);

          const englishStudent = {
            $set: {status: 'cancelled'}
          }
          this.englishStudentProv.updateEnglishStudent(englishStudent, englishStudentId).subscribe(res2 => {
            console.log(res2);
            this.englishStudent.status = 'cancelled';

            this.loadingService.setLoading(false);
            Swal.fire(
              'Solicitud Cancelada',
              'La solicitud al curso ha sido cancelada.',
              'success'
            );
   
          }, () => {
            this.loadingService.setLoading(false);
          });

        }, () => {
          this.loadingService.setLoading(false);
        });

      }
    });
      
  }

  selectNewCourse(){
    this.tabGroup.selectedIndex = 1;
  }

}