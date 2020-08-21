import { Component, OnInit, Input } from '@angular/core';
import { IEnglishStudent } from '../../entities/english-student.model';
import { RequestCourseProvider } from '../../providers/request-course.prov';
import { DaysSchedule } from '../../enumerators/days-schedule.enum';

@Component({
  selector: 'app-studying-course-detail',
  templateUrl: './studying-course-detail.component.html',
  styleUrls: ['./studying-course-detail.component.scss']
})
export class StudyingCourseDetailComponent implements OnInit {

  @Input('englishStudent') englishStudent: IEnglishStudent;

  requestCourse;
  weekdays = [1,2,3,4,5,6]; //Dias de la semana
  dayschedule = DaysSchedule; //Enumerador de los dias de la semana
  
  constructor(
    private requestCourseProv: RequestCourseProvider,
  ) { }

  ngOnInit() {    
    this.requestCourseProv.getRequestCourseByEnglishStudentId(this.englishStudent._id).subscribe((data)=>{
      this.requestCourse = data.requestCourse[0];
      console.log(this.requestCourse);
         
    });
  }

  getHour(minutes):String{ //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh+':'+mm; //Retorna los minutos en tiempo Ej: "24:00"
  }

}
