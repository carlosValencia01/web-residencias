import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { StudentRequestsComponent } from 'src/app/english/components/english-courses-page/student-requests/student-requests.component';
import { ConfigureCourseComponent } from 'src/app/english/components/english-courses-page/configure-course/configure-course.component';

import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-english-courses-page',
  templateUrl: './english-courses-page.component.html',
  styleUrls: ['./english-courses-page.component.scss']
})
export class EnglishCoursesPageComponent implements OnInit {

  requestsCourses: any;
  classrooms: any;
  classroomForm;

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private requestCourseProv : RequestCourseProvider,
    private classroomProv: ClassroomProvider,
    public dialog: MatDialog,
  ) { 
    if (!this._CookiesService.isAllowed(this._ActivatedRoute.snapshot.url[0].path)) {
      this.router.navigate(['/']);
    }
    this.classroomForm = this.formBuilder.group({
      name: ['', Validators.required],
      schedule: ['', Validators.required],
      capacity: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.createRequestsCourses();
    this.createClassrooms();
  }

  // Solicitudes

  createRequestsCourses(){
    this.loadingService.setLoading(true);
    this.requestCourseProv.getAllRequestCourse().subscribe(res => {

      this.requestsCourses = res.requestCourses;

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  deleteRequestForHour(requestCourseId,dayId,hourId){
    console.log(requestCourseId);
    console.log(dayId);
    console.log(hourId);
  }

  openDialogTableStudents(requestCourseId, requestCourseName, dayId, dayDesc, hour): void {

    const dialogRef = this.dialog.open(StudentRequestsComponent, {
      data: {
        requestCourseId: requestCourseId, 
        requestCourseName: requestCourseName,
        dayId: dayId,
        dayDesc: dayDesc,
        hourId: hour._id,
        hourDesc: hour.desc,
        studentsId: hour.students
      },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        const request = {
          name: result.nameCourseSelected,
          period: result.period
        };
      }
      this.ngOnInit();
    });

  }

  // Aulas

  createClassrooms(){
    this.loadingService.setLoading(true);
    this.classroomProv.getAllClassroom().subscribe(res => {

      this.classrooms = res.classrooms;

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  onCreateClassroom(){
    var classromm = {
      name: this.classroomForm.get('name').value,
      schedule: this.classroomForm.get('schedule').value,
      capacity: this.classroomForm.get('capacity').value
    };
   this.classroomProv.createClassroom(classromm).subscribe(res => {
     this.ngOnInit()
   }, 
   error => {console.log(error)});
  }

  deleteClassroom(classroomId){
    this.loadingService.setLoading(true);
    this.classroomProv.deleteClassroom(classroomId).subscribe(res => {
      this.ngOnInit();
    },error => {

    }, () => this.loadingService.setLoading(false));
  }
  
  // Cursos

  createCourse(){
    var data = {
      englishCourse: {
        name: "",
        dailyHours: "",
        totalHours: "",
        totalSemesters: "",
        finalHours: "",
        //status: ""
      },
      courseSchedule: {
        days: [
          {
            desc: [false, false, false, false, false, false, false],
            enable: false,
            hours: []
          }
        ]
      },
      newCourse: true
    }

    this.openDialog(data);

  }

  openDialog(data): void {
    const dialogRef = this.dialog.open(ConfigureCourseComponent, {
      data: data,
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        if(result.newCourse){
          
        }
      };
    });
  }

}
