import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesService } from 'src/app/services/app/cookie.service';
import { LoadingService } from 'src/app/services/app/loading.service';

import { ClassroomProvider } from 'src/app/english/providers/classroom.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';
import { GroupProvider } from 'src/app/english/providers/group.prov';

import { StudentRequestsComponent } from 'src/app/english/components/english-courses-page/student-requests/student-requests.component';
import { ConfigureCourseComponent } from 'src/app/english/components/english-courses-page/configure-course/configure-course.component';

import { FormCreateCourseComponent } from 'src/app/english/components/english-courses-page/form-create-course/form-create-course.component';
import { FormGroupComponent } from 'src/app/english/components/english-courses-page/form-group/form-group.component';

import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-english-courses-page',
  templateUrl: './english-courses-page.component.html',
  styleUrls: ['./english-courses-page.component.scss']
})
export class EnglishCoursesPageComponent implements OnInit {

  classrooms: any;
  classroomForm;

  englishCourses: any;
  activePeriod: any;
  groups: any;

  requests: Array<any>;

  constructor(
    private _CookiesService: CookiesService,
    private _ActivatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private requestCourseProv : RequestCourseProvider,
    private classroomProv: ClassroomProvider,
    private englishCourseProv: EnglishCourseProvider,
    private groupProv: GroupProvider,
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
    this.createEnglishCourseActive();
    this.createClassrooms();
    this.createEnglishCourses();
    this.createGroups();
    this.getActivePeriod();
  }

  // Solicitudes

  createEnglishCourseActive(){
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourseActive().subscribe(res => {

      res.englishCourses.forEach(course => {
        this.requests = []; 
        this.getOpenGroupsByLevel(course);
      });
      console.log(this.requests);

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  async getOpenGroupsByLevel(course) {

    const x = [];

    for (let i = 1; i <= course.totalSemesters; i++) {

      let data = {
        courseId: course._id,
        level: i,
      };
  
      this.loadingService.setLoading(true);
      await this.groupProv.getAllGroupOpenedByCourseAndLevel(data).subscribe(res => {
  
        if(res.groups.length>0){
          x.push({level: i, haveGroups: true, groups: res.groups});
        }else{  
          x.push({level: i, haveGroups: false, groups: res.groups});
        }
  
      },error => {
  
      }, () => this.loadingService.setLoading(false));
      
    }
    x.sort((a, b) => a.level.localeCompare(b.level));
    this.requests.push({course: course, data:x});
  }

  /*
  deleteRequestForHour(requestCourseId,dayId,hourId){
    console.log(requestCourseId);
    console.log(dayId);
    console.log(hourId);
  }
  */

  openDialogTableStudents(group): void {

    const dialogRef = this.dialog.open(StudentRequestsComponent, {
      data: {
        group: group
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

  //Grupos

  createGroups(){
    this.loadingService.setLoading(true);
    this.groupProv.getAllGroup().subscribe(res => {

      this.groups = res.groups;

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  openDialogFormCreateGroup(): void {
    const dialogRef = this.dialog.open(FormGroupComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        console.log(result);
        var data={
          name: result.a.nameCtrl,
          schedule: [],
          level: result.a.levelCtrl,
          period: this.activePeriod._id,
          status: 'opened',
          course: result.a.courseCtrl._id,
        };

        switch (result.a.scheduleCtrl) {
          case "1":
            for (let index = 1; index <= 5; index++) {
              data.schedule.push(
                {
                  day: index, 
                  startHour: this.getMinutes(result.b.x), 
                  endDate: this.getMinutes(result.b.y),
                });
              
            }
            
            break;
          case "2":
            data.schedule.push(
              {
                day: 6, 
                startHour: this.getMinutes(result.b.x), 
                endDate: this.getMinutes(result.b.y),
              });
            break;
          case "3":
            result.c.forEach(element => {
              if (element.active) {
                data.schedule.push(
                  {
                    day: element.day, 
                    startHour: this.getMinutes(element.startHour), 
                    endDate: this.getMinutes(element.endDate),
                  });
              }
            });
            break;
          default:
            return;
            break;
        };

        this.groupProv.createGroup(data).subscribe(res => {
          this.ngOnInit()
        }, 
        error => {console.log(error)});
      };
    });
  }

  getMinutes(hour):Number{
    var hh = parseFloat(hour.split(":",2)[0])
    var mm = parseFloat(hour.split(":",2)[1])
    var time = mm + (hh*60);
    return time;
  }
  
  // Cursos

  createEnglishCourses(){
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourse().subscribe(res => {

      this.englishCourses = res.englishCourses;
      console.log(res);

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

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

    //this.openDialog(data);

  }

  openDialogFormCreateCourse(): void {
    const dialogRef = this.dialog.open(FormCreateCourseComponent, {
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result){
        let data = {
          name: result.nameCtrl,
          dailyHours: result.dailyHoursCtrl,
          semesterHours: result.semesterHoursCtrl,
          totalSemesters: result.totalSemestersCtrl,
          totalHours: result.totalHoursCtrl,
          startPeriod: this.activePeriod._id,
          status: 'active',
        };
        this.englishCourseProv.createEnglishCourse(data).subscribe(res => {
          this.ngOnInit()
        }, 
        error => {console.log(error)});

      };
    });
  }

  getActivePeriod(){

    this.loadingService.setLoading(true);
    this.englishCourseProv.getActivePeriod().subscribe(res => {

      if(res.period){
        this.activePeriod = res.period;
      }

    },error => {

    }, () => this.loadingService.setLoading(false));

  }

}
