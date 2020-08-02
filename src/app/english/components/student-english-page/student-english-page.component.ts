import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { FormRequestCourseComponent } from 'src/app/english/components/student-english-page/form-request-course/form-request-course.component';

import { StatusEnglishStudent } from 'src/app/english/enumerators/status-english-student.enum';

import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-english-page',
  templateUrl: './student-english-page.component.html',
  styleUrls: ['./student-english-page.component.scss']
})
export class StudentEnglishPageComponent implements OnInit {

  data;
  currentStudent: any;
  englishStudent: any;
  showImg = false;
  imageDoc;
  photoStudent = '';

  statusEnglishStudent = StatusEnglishStudent;
  courses = [

    {
      name:"Cool Tiger",
      days:[
      {
        desc:"Lunes a Viernes",
        schedule:[
          "07:00 a.m. - 09:00 a.m.",
          "08:00 a.m. - 10:00 a.m.",
          "09:00 a.m. - 11:00 a.m.",
          "10:00 a.m. - 12:00 p.m.",
          "02:00 p.m. - 04:00 p.m.",
          "03:00 p.m. - 05:00 p.m.",
          "04:00 p.m. - 06:00 p.m.",
          "05:00 p.m. - 07:00 p.m.",
          "06:00 p.m. - 08:00 p.m."
        ]
      }
    ],
    dailyHours:2,
    totalHours:150,
    totalSemesters:3,
    finalHours:450},

    {name:"Super Tiger",
    days:[
      {
        desc:"Lunes a Viernes",
        schedule:[
          "07:00 a.m. - 10:00 a.m.",
          "08:00 a.m. - 11:00 a.m.",
          "09:00 a.m. - 12:00 p.m.",
          "10:00 a.m. - 01:00 p.m.",
          "02:00 p.m. - 05:00 p.m.",
          "04:00 p.m. - 07:00 p.m.",
          "05:00 p.m. - 08:00 p.m.",
          "06:00 p.m. - 09:00 p.m."
        ]
      }
    ],
    dailyHours:3,
    totalHours:225,
    totalSemesters:2,
    finalHours:450},

    {name:"Practical Tiger",
    days:[
      {
        desc:"Sábados",
        schedule:[
          "08:00 a.m. - 01:00 p.m."
        ]
      }
    ],
    dailyHours:5,
    totalHours:90,
    totalSemesters:5,
    finalHours:450},

    {name:"Friendly Tiger",
    days:[
      {
        desc:"Martes y Jueves",
        schedule:[
          "08:00 a.m. - 10:30 a.m.",
          "02:00 p.m. - 04:30 a.m.",
          "04:00 p.m. - 06:30 p.m.",
          "05:00 p.m. - 07:30 p.m."
        ]
      }
    ],
    dailyHours:2.5,
    totalHours:90,
    totalSemesters:5,
    finalHours:450}
  ];

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private studentProv: StudentProvider,
    private inscriptionProv : InscriptionsProvider,
    private englishStudentProv : EnglishStudentProvider,
    private requestCourseProv : RequestCourseProvider,
    public dialog: MatDialog,
  ) { 
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.data = _CookiesService.getData().user;
    this.getDocuments();
  }

  ngOnInit() {
    const _id = this.data._id; // ID del Estudiante

    this.loadingService.setLoading(true);

    //Obtener el estudiante con la ID
    this.studentProv.getStudentById(_id).subscribe(res => {
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0])); //Guardar al estudiante
        console.log(this.currentStudent);
        this.verifyEnglishState(this.currentStudent._id); //Verificar el perfil de ingles del estudiante
      }, error => {
        console.log(error);
      }, () => this.loadingService.setLoading(false));
    
  }


  verifyEnglishState(studentId: string){ //Verificar el perfil del estudiante.

    //Obtener el perfil de acuerdo al ID del estudiante.
    this.englishStudentProv.getEnglishStudentByStudentId(studentId).subscribe(res => {

      if (typeof (res) !== 'undefined' && typeof (res.englishStudent) !== 'undefined' && res.englishStudent.length > 0) {

        //Obtener el perfil si existe.
        this.englishStudent = JSON.parse(JSON.stringify(res.englishStudent[0]));

        //Verificar si existen notificación a mostrar.
        this.verifyNotification();

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

  getDocuments(){
    this.showImg=false;
    this.studentProv.getDriveDocuments(this.data._id).subscribe(
      docs=>{
        let documents = docs.documents;
        if(documents){

          this.imageDoc = documents.filter(docc => docc.filename.indexOf('png') !== -1 || docc.filename.indexOf('jpg') !== -1 ||  docc.filename.indexOf('PNG') !== -1 || docc.filename.indexOf('JPG') !== -1 ||  docc.filename.indexOf('jpeg') !== -1 || docc.filename.indexOf('JPEG') !== -1)[0];
          if(this.imageDoc){

            this.inscriptionProv.getFile(this.imageDoc.fileIdInDrive,this.imageDoc.filename).subscribe(
              succss=>{
                this.showImg=true;
                const extension = this.imageDoc.filename.substr(this.imageDoc.filename.length-3,this.imageDoc.filename.length);
                this.photoStudent = "data:image/"+extension+";base64,"+succss.file;
              },
              err=>{this.photoStudent = 'assets/imgs/studentAvatar.png'; this.showImg=true;}
            );
          }else{
            this.loadingService.setLoading(false);
            this.photoStudent = 'assets/imgs/studentAvatar.png';
            this.showImg=true;
          }
        }else{
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
        nameCourseSelected: courseSelected.name,
        period: "2020-3",
        scheduleSelected: "", 
        currentPhone: this.englishStudent.actualPhone
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        
      console.log('The dialog was closed');
      const request = {
        name: result.nameCourseSelected,
        period: result.period,
        days: result.scheduleSelected.split("@@@",2)[0],
        hours: result.scheduleSelected.split("@@@",2)[1],
        studentId: this.englishStudent._id
      };
      
      this.requestCourseProv.updateRequestCourse(request).subscribe(res => {
        if(res.requestCourse.ok == 1){
          this.englishStudent.currentPhone = result.currentPhone;
          this.englishStudent.status = 'selected';
          this.englishStudentProv.updateEnglishStudent(this.englishStudent, this.englishStudent._id).subscribe(res2 => {
            console.log(res2);
            Swal.fire({
              title: 'Solicitud enviada!',
              showConfirmButton: false,
              timer: 1500,
              type: 'success'
            })
          });
        }
      });
      }
    });
  }

}