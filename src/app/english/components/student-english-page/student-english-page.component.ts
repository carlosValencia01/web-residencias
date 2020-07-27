import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { FormRequestCourseComponent } from 'src/app/english/components/student-english-page/form-request-course/form-request-course.component';

import { MatDialog } from '@angular/material/dialog';

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
    const _id = this.data._id;
    this.loadingService.setLoading(true);
    this.studentProv.getStudentById(_id)
      .subscribe(res => {
        this.currentStudent = JSON.parse(JSON.stringify(res.student[0]));
        console.log(this.currentStudent)
        this.verifyEnglishState(this.currentStudent._id);
      }, error => {
        console.log(error);
      }, () => this.loadingService.setLoading(false));
    
  }

  verifyEnglishState(studentId: string){
    this.englishStudentProv.getEnglishStudentByStudentId(studentId).subscribe(res => {
      console.log(res);
      if (typeof (res) !== 'undefined' && typeof (res.englishStudent) !== 'undefined' && res.englishStudent.length > 0) {
        this.englishStudent = JSON.parse(JSON.stringify(res.englishStudent[0]));
      }else{
         var englishSudent = {
           studentId: studentId,
           actualPhone: this.currentStudent.phone,
           status: 'Sin elección de Curso',
           totalHoursCoursed: 0
         };
        this.englishStudentProv.createEnglishStudent(englishSudent).subscribe(res => {
          console.log(res)
          this.englishStudent = JSON.parse(JSON.stringify(res));
        }, 
        error => {console.log(error)});
      }
    });
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
        actualPhone: this.englishStudent.actualPhone
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
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
          this.englishStudent.actualPhone = result.actualPhone;
          this.englishStudent.status = 'Solicitud de Curso enviada';
          this.englishStudentProv.updateEnglishStudent(this.englishStudent, this.englishStudent._id).subscribe(res2 => {
            console.log(res2);
          });
          /*
          const body = {status: "2"};
          this.englishStudentProv.updateStatus(this.englishStudent._id, body).subscribe(res2 => {console.log(res2)},error => {console.log(error)});
          this.verifyEnglishState(this.currentStudent._id);*/
        }
      });
    });
  }

}