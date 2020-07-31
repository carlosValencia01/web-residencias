import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface DialogData {
  englishCourse: any;
  courseSchedule: any;
  newCourse: boolean;
}

@Component({
  selector: 'app-configure-course',
  templateUrl: './configure-course.component.html',
  styleUrls: ['./configure-course.component.scss']
})

export class ConfigureCourseComponent implements OnInit {

  courseFormGroup: FormGroup;
  daysFormGroup: FormGroup;
  weekdays = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];
  hours = [7,8,9,10,11,12,13,14,15,16,17,18,19,20]

  constructor(
    public dialogRef: MatDialogRef<ConfigureCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, 
    private _formBuilder: FormBuilder
    ) {
      console.log(data);
     }

  ngOnInit() {

    this.courseFormGroup = this._formBuilder.group({
      nameCtrl: ['', Validators.required],
      dailyHoursCtrl: ['', [Validators.required, Validators.min(1)]],
      totalHoursCtrl: ['', [Validators.required, Validators.min(1)]],
      totalSemestersCtrl: ['', [Validators.required, Validators.min(1)]],
      finalHoursCtrl: ['', [Validators.required, Validators.min(1)]],
    });

    this.daysFormGroup = this._formBuilder.group({
      days: ['', Validators.required],
    });

  }

  addDays(){
    var day = {
      desc: [false, false, false, false, false, false, false],
      enable: false,
      hours: []
    }
    this.data.courseSchedule.days.push(day);
  }

  dropDays(i){
    this.data.courseSchedule.days.splice(i,1);
  }

  addHour(startHour, i){
    var endHour = "";
    var hh = parseFloat(startHour.split(":",2)[0])
    var mm = parseFloat(startHour.split(":",2)[1])
    var time = hh + (mm/60);
    time = time + parseFloat(this.data.englishCourse.dailyHours);
    console.log(time);

    if(!Number.isInteger(time)){
      hh = parseInt(time.toString());
      mm = (time-hh)*60;
      var h = "";
      if(hh.toString().length==1){
        h = "0" + hh.toString();
      }else{
        h = hh.toString();
      }
      if(mm.toFixed(0).toString().length==1){
        endHour = h+":0"+mm.toFixed(0);
      }else{
        endHour = h+":"+mm.toFixed(0);
      }
      
    }else{
      var h = "";
      if(time.toString().length==1){
        h = "0" + time.toString();
      }else{
        h = time.toString();
      }
      endHour = h+":00"
    }
    this.data.courseSchedule.days[i].hours.push({desc: startHour+" - "+endHour, active: false});
    this.data.courseSchedule.days[i].hours.sort((a, b) => a.desc.localeCompare(b.desc));
  }

  dropHour(j,i){
    this.data.courseSchedule.days[i].hours.splice(j,1);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
