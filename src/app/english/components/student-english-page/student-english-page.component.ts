import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';
import { StudentProvider } from 'src/app/providers/shared/student.prov';
import { InscriptionsProvider } from 'src/app/providers/inscriptions/inscriptions.prov';

@Component({
  selector: 'app-student-english-page',
  templateUrl: './student-english-page.component.html',
  styleUrls: ['./student-english-page.component.scss']
})
export class StudentEnglishPageComponent implements OnInit {
  
  data;
  currentStudent: any;
  showImg = false;
  imageDoc;
  photoStudent = '';
  totalHoursCoursed = 90;
  actualState = "Sin elección de Curso";
  courseSelect = 0;
  courses = [

    {name:"Cool Tiger",
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
      }, error => {
        console.log(error);
      }, () => this.loadingService.setLoading(false));
    
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

}