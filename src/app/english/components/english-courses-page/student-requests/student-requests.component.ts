import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { LoadingService } from 'src/app/services/app/loading.service';
import { EnglishStudentProvider } from 'src/app/english/providers/english-student.prov';
import { RequestCourseProvider } from 'src/app/english/providers/request-course.prov';

export interface DialogData {
  requestCourseId: string, 
  requestCourseName: string,
  dayId: string,
  dayDesc: string,
  hourId: string,
  hourDesc: string,
  studentsId: any;
}

@Component({
  selector: 'app-student-requests',
  templateUrl: './student-requests.component.html',
  styleUrls: ['./student-requests.component.scss']
})
export class StudentRequestsComponent implements OnInit {

  englishStudents: any;
  creado = false;

  constructor(
    public dialogRef: MatDialogRef<StudentRequestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private englishStudentProv: EnglishStudentProvider,
    private requestCourseProv: RequestCourseProvider,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.createDataSource();
  }

  createDataSource(){
    
    this.englishStudents = [];

    this.data.studentsId.forEach(id => {
      
      this.loadingService.setLoading(true);
      this.englishStudentProv.getEnglishStudentById(id).subscribe(res => {

        var englishStudent = JSON.parse(JSON.stringify(res.englishStudent[0]));
        this.englishStudents.push(englishStudent);
        console.log(this.englishStudents);
        this.creado = true;

      },error => {

        console.log(error);

      }, () => this.loadingService.setLoading(false));
    
    });
  }

  deleteStudentRequest(studentId){
    const data = {
      dayId: this.data.dayId,
      hourId: this.data.hourId,
      studentId: studentId
    }
    console.log(data);
    this.loadingService.setLoading(true);
    this.requestCourseProv.deleteRequestStudent(this.data.requestCourseId, data).subscribe(res => {

      if(res.nModified>0){
        for (var i =0; i < this.data.studentsId.length; i++){
          if (this.data.studentsId[i] === studentId) {
            this.englishStudents.splice(i, 1);
          }
       }
       const englishStudent = {
         $set: {status: 'Sin elección de Curso'}
       }

       this.englishStudentProv.updateEnglishStudent(englishStudent, studentId).subscribe(res2 => {
        console.log(res2);
      });
       /*
       this.englishStudentProv.updateStatus(studentId, {status: "2"}).subscribe(res2 => {console.log(res2)},error => {console.log(error)});
       */
      }

      console.log(res);

    },error => {

      console.log(error);

    }, () => {
      this.loadingService.setLoading(false);
      this.ngOnInit();
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
